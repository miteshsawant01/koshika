from django.urls import path
from .views import OCRAnalyzeView, OCRSamplesView

urlpatterns = [
    path('analyze/', OCRAnalyzeView.as_view(), name='ocr-analyze'),
    path('samples/', OCRSamplesView.as_view(), name='ocr-samples'),
]
