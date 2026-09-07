import os
from pathlib import Path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .ocr_service import extract_text_from_image, parse_medical_report

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

            # Perform OCR extraction
            extracted_text = extract_text_from_image(file_path)
            
            # If tesseract was not installed or image unreadable, allow text fallback if passed
            if ('Tesseract engine not found' in extracted_text or not extracted_text.strip()) and raw_text_input:
                extracted_text = raw_text_input
        else:
            extracted_text = raw_text_input

        # Parse medical entities
        parsed = parse_medical_report(extracted_text)

        return Response({
            'success': True,
            'extracted_text': extracted_text,
            'parsed_data': parsed,
            'file_name': uploaded_file.name if uploaded_file else 'manual_input.txt'
        })

class OCRSamplesView(APIView):
    def get(self, request):
        samples = [
            {
                'title': 'Leukemia Patient Lab Report',
                'text': 'STEM CELL TRANSPLANT LABORATORY\nPatient Name: Rajesh Sharma\nAge: 42 Years\nBlood Group: A Positive (A+)\nDiagnosis: Acute Myeloid Leukemia\nWBC Count: 3.2 x 10^3/uL\nStem Cell CD34+ Count: 6.8 x10^6 cells/kg\nCell Viability: 96.4%\nTest Date: 2026-08-15\nRecommendation: Cryopreservation approved for allogeneic graft.'
            },
            {
                'title': 'Healthy Donor Screening Report',
                'text': 'ADVANCED CELLULAR THERAPY CLINIC\nDonor Name: Ananya Sen\nAge: 29 Years\nBlood Group: O Negative (O-)\nStatus: Healthy Volunteer\nCell Viability: 98.1%\nStem Cell CD34+ Count: 8.2 x10^6 cells/kg\nDiagnosis: Healthy Donor'
            },
            {
                'title': 'Aplastic Anemia Pediatric Report',
                'text': 'CITY HEMATOLOGY CENTER\nPatient Name: Aarav Patel\nAge: 11 Years\nBlood Group: B Positive (B+)\nDiagnosis: Severe Aplastic Anemia\nStem Cell CD34+ Count: 4.1 x10^6 cells/kg\nCell Viability: 91.5%'
            }
        ]
        return Response(samples)
