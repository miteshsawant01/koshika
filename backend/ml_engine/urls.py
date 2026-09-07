from django.urls import path
from .views import CompatibilityPredictionView, ModelMetadataView

urlpatterns = [
    path('predict/', CompatibilityPredictionView.as_view(), name='ml-predict'),
    path('metadata/', ModelMetadataView.as_view(), name='ml-metadata'),
]
