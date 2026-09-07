from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet, DonorViewSet, StorageViewSet,
    StaffViewSet, ResearchViewSet, InventoryViewSet, AuditLogViewSet
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'donors', DonorViewSet)
router.register(r'storage', StorageViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'research', ResearchViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'audit-logs', AuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
