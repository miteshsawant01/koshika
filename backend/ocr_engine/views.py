import os
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .ocr_service import extract_text_from_image, parse_medical_report
from .models import MedicalReport

UPLOAD_DIR = settings.MEDIA_ROOT / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class OCRAnalyzeView(APIView):
    def post(self, request):
        uploaded_file = request.FILES.get('file')
        raw_text_input = request.data.get('raw_text', '')

        if not uploaded_file and not raw_text_input:
            return Response({'error': 'No report file or text provided'}, status=status.HTTP_400_BAD_REQUEST)

        extracted_text = ''
        file_path_str = ''

        if uploaded_file:
            file_path = UPLOAD_DIR / uploaded_file.name
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)
            file_path_str = str(file_path)

            # Check if PDF or plain text file or image
            file_ext = uploaded_file.name.lower().split('.')[-1]
            if file_ext == 'pdf':
                try:
                    import pypdf
                    reader = pypdf.PdfReader(str(file_path))
                    extracted_text = '\n'.join([page.extract_text() for page in reader.pages if page.extract_text()])
                except Exception:
                    extracted_text = ''
            elif file_ext in ['txt', 'csv', 'log', 'json']:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        extracted_text = f.read()
                except Exception:
                    extracted_text = ''
            else:
                # Perform OCR extraction
                extracted_text = extract_text_from_image(file_path)

            # If tesseract was not installed or image unreadable, allow text fallback if passed
            if ('Tesseract engine not found' in extracted_text or not extracted_text.strip()) and raw_text_input:
                extracted_text = raw_text_input
        else:
            extracted_text = raw_text_input

        # Parse medical entities
        parsed = parse_medical_report(extracted_text)
        is_valid = parsed.get('is_valid', True)
        report_type = parsed.get('report_type', 'GENERAL')
        status_label = 'Analyzed' if is_valid else 'Wrong Document'
        file_name = uploaded_file.name if uploaded_file else 'manual_input.txt'

        # PERSIST UPLOADED DOCUMENT TO BACKEND DATABASE
        try:
            report_obj = MedicalReport.objects.create(
                file_name=file_name,
                file_path=file_path_str,
                report_type=report_type,
                status=status_label,
                extracted_text=extracted_text,
                parsed_data=parsed,
                is_valid=is_valid
            )
            report_id = report_obj.id
            created_at_str = report_obj.created_at.strftime('%b %d, %Y, %I:%M %p')
        except Exception as db_err:
            report_id = 1
            created_at_str = 'Just now'

        return Response({
            'success': True,
            'id': report_id,
            'name': file_name,
            'file_name': file_name,
            'report_type': report_type,
            'status': status_label,
            'date': created_at_str,
            'extracted_text': extracted_text,
            'parsed_data': parsed,
            'is_valid': is_valid
        })


class OCRReportsListView(APIView):
    def get(self, request):
        reports = MedicalReport.objects.all().order_by('-id')
        data = []
        for r in reports:
            data.append({
                'id': r.id,
                'name': r.file_name,
                'file_name': r.file_name,
                'file_path': r.file_path,
                'report_type': r.report_type,
                'status': r.status,
                'is_valid': r.is_valid,
                'date': r.created_at.strftime('%b %d, %Y, %I:%M %p'),
                'created_at': r.created_at.isoformat(),
                'extracted_text': r.extracted_text,
                'parsed_data': r.parsed_data
            })
        return Response(data)


class OCRReportDetailView(APIView):
    def delete(self, request, pk):
        try:
            report = MedicalReport.objects.get(pk=pk)
            # Remove file on disk if exists
            if report.file_path and os.path.exists(report.file_path):
                try:
                    os.remove(report.file_path)
                except Exception:
                    pass
            report.delete()
            return Response({'success': True, 'message': f'Report {pk} removed successfully'})
        except MedicalReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
