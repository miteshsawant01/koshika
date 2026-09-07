from django.urls import path
from .views import ChatbotView, AIReportInterpretView

urlpatterns = [
    path('chat/', ChatbotView.as_view(), name='ai-chat'),
    path('interpret-report/', AIReportInterpretView.as_view(), name='ai-interpret-report'),
]
