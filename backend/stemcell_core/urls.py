from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet, DonorViewSet, StorageViewSet,
    StaffViewSet, ResearchViewSet, InventoryViewSet, AuditLogViewSet,
    StemCellBankViewSet
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'donors', DonorViewSet)
router.register(r'storage', StorageViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'research', ResearchViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'audit-logs', AuditLogViewSet)
router.register(r'stem-cell-banks', StemCellBankViewSet, basename='stem-cell-banks')
router.register(r'stem_cell_banks', StemCellBankViewSet, basename='stem_cell_banks')

urlpatterns = [
    path('', include(router.urls)),
]
