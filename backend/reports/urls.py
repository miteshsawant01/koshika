from django.urls import path
from .views import DashboardStatsView, DownloadPDFReportView

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/pdf/', DownloadPDFReportView.as_view(), name='reports-pdf'),
]
