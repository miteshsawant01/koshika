from django.http import FileResponse
from django.db.models import Count, Sum
from rest_framework.views import APIView
from rest_framework.response import Response
from stemcell_core.models import Patient, Donor, Storage, Staff, Research, Inventory, AuditLog
from .pdf_generator import generate_clinical_report_pdf

class DashboardStatsView(APIView):
    def get(self, request):
        total_patients = Patient.objects.count()
        total_donors = Donor.objects.count()
        total_storage_units = Storage.objects.aggregate(total=Sum('units'))['total'] or 0
        total_staff = Staff.objects.count()
        total_research = Research.objects.count()
        total_inventory = Inventory.objects.count()

        # Blood group breakdown
        patient_bg = list(Patient.objects.values('blood_group').annotate(count=Count('patient_id')).order_by('blood_group'))
        donor_bg = list(Donor.objects.values('blood_group').annotate(count=Count('donor_id')).order_by('blood_group'))

        # Inventory levels
        inventory_items = list(Inventory.objects.values('item_name', 'quantity', 'unit').order_by('-quantity')[:10])

        # Research status
        research_status = list(Research.objects.values('status').annotate(count=Count('research_id')).order_by('status'))

        # Recent records
        recent_patients = list(Patient.objects.values('patient_id', 'name', 'blood_group', 'disease', 'created_at')[:5])
        recent_donors = list(Donor.objects.values('donor_id', 'name', 'blood_group', 'contact', 'created_at')[:5])
        recent_storage = list(Storage.objects.select_related('donor').values(
            'storage_id', 'storage_location', 'units', 'donor__name', 'collected_date', 'expiry_date'
        )[:5])

        return Response({
            'totals': {
                'patients': total_patients,
                'donors': total_donors,
                'storage_units': total_storage_units,
                'staff': total_staff,
                'research': total_research,
                'inventory': total_inventory,
            },
            'charts': {
                'patients_by_blood_group': patient_bg,
                'donors_by_blood_group': donor_bg,
                'inventory_levels': inventory_items,
                'research_by_status': research_status,
            },
            'recents': {
                'patients': recent_patients,
                'donors': recent_donors,
                'storage': recent_storage,
            }
        })

class DownloadPDFReportView(APIView):
    def get(self, request):
        stats = {
            'total_patients': Patient.objects.count(),
            'total_donors': Donor.objects.count(),
            'total_storage_units': Storage.objects.aggregate(total=Sum('units'))['total'] or 0,
            'total_staff': Staff.objects.count(),
            'total_research': Research.objects.count(),
            'total_inventory': Inventory.objects.count(),
        }
        patients = list(Patient.objects.all()[:10])
        donors = list(Donor.objects.all()[:10])
        storage_items = list(Storage.objects.select_related('donor').all()[:10])
        inventory_items = list(Inventory.objects.all()[:10])

        pdf_buffer = generate_clinical_report_pdf(stats, patients, donors, storage_items, inventory_items)
        return FileResponse(pdf_buffer, as_attachment=True, filename='KOSHIKA_Clinical_Report.pdf')
