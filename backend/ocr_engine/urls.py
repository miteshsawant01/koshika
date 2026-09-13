from django.urls import path
from .views import OCRAnalyzeView, OCRReportsListView, OCRReportDetailView

urlpatterns = [
    path('analyze/', OCRAnalyzeView.as_view(), name='ocr-analyze'),
    path('reports/', OCRReportsListView.as_view(), name='ocr-reports-list'),
    path('reports/<int:pk>/', OCRReportDetailView.as_view(), name='ocr-reports-detail'),
]
