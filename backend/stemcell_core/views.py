from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Patient, Donor, Storage, Staff, Research, Inventory, AuditLog, StemCellBank
from .serializers import (
    PatientSerializer, DonorSerializer, StorageSerializer,
    StaffSerializer, ResearchSerializer, InventorySerializer, AuditLogSerializer,
    StemCellBankSerializer
)

class FlexiblePagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 2000


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    pagination_class = FlexiblePagination

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        blood_group = self.request.query_params.get('blood_group', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(disease__icontains=search) |
                Q(contact__icontains=search) |
                Q(blood_group__icontains=search)
            )
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)
        return qs


class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.select_related('patient').all()
    serializer_class = DonorSerializer
    pagination_class = FlexiblePagination

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        blood_group = self.request.query_params.get('blood_group', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(blood_group__icontains=search) |
                Q(contact__icontains=search) |
                Q(notes__icontains=search)
            )
        if blood_group:
            qs = qs.filter(blood_group__iexact=blood_group)
        return qs


class StorageViewSet(viewsets.ModelViewSet):
    queryset = Storage.objects.select_related('donor').all()
    serializer_class = StorageSerializer
    pagination_class = FlexiblePagination

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        location = self.request.query_params.get('location', '').strip()
        if search:
            qs = qs.filter(
                Q(storage_location__icontains=search) |
                Q(donor__name__icontains=search)
            )
        if location:
            qs = qs.filter(storage_location__icontains=location)
        return qs


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    pagination_class = FlexiblePagination


    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        department = self.request.query_params.get('department', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(role__icontains=search) |
                Q(department__icontains=search)
            )
        if department:
            qs = qs.filter(department__iexact=department)
        return qs


class ResearchViewSet(viewsets.ModelViewSet):
    queryset = Research.objects.all()
    serializer_class = ResearchSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        status = self.request.query_params.get('status', '').strip()
        if search:
            qs = qs.filter(
                Q(project_name__icontains=search) |
                Q(lead_scientist__icontains=search) |
                Q(summary__icontains=search)
            )
        if status:
            qs = qs.filter(status__iexact=status)
        return qs


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(item_name__icontains=search)
        return qs


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer


class StemCellBankViewSet(viewsets.ModelViewSet):
    queryset = StemCellBank.objects.all()
    serializer_class = StemCellBankSerializer
    pagination_class = FlexiblePagination

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '').strip()
        location = self.request.query_params.get('location', '').strip()
        if search:
            qs = qs.filter(
                Q(bank_name__icontains=search) |
                Q(location__icontains=search)
            )
        if location:
            qs = qs.filter(location__icontains=location)
        return qs
