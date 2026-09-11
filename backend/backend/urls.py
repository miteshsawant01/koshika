from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    try:
        from stemcell_core.models import Patient, Donor, Storage
        from django.db import connection
        p_count = Patient.objects.count()
        d_count = Donor.objects.count()
        s_count = Storage.objects.count()
        db_vendor = connection.vendor
        db_status = 'connected'
    except Exception as e:
        p_count = d_count = s_count = 0
        db_vendor = 'unknown'
        db_status = f'error: {str(e)}'

    return JsonResponse({
        'status': 'healthy',
        'database': db_status,
        'engine': db_vendor,
        'counts': {
            'patients': p_count,
            'donors': d_count,
            'storage': s_count
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/health/', health_check, name='api_health_check'),

    # Standard /api/ prefix routes
    path('api/', include('stemcell_core.urls')),
    path('api/ml/', include('ml_engine.urls')),
    path('api/ocr/', include('ocr_engine.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/', include('reports.urls')),

    # Fallback routes without /api/ prefix
    path('', include('stemcell_core.urls')),
    path('ml/', include('ml_engine.urls')),
    path('ocr/', include('ocr_engine.urls')),
    path('ai/', include('ai_assistant.urls')),
    path('', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
