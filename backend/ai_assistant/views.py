from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .gemini_service import ask_gemini, interpret_report_with_ai

class ChatbotView(APIView):
    def post(self, request):
        message = request.data.get('message', '').strip()
        custom_key = request.data.get('api_key', '').strip() or request.headers.get('X-Gemini-API-Key', '').strip()
        
        if not message:
            return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        result = ask_gemini(message, custom_key or None)
        return Response(result)

class AIReportInterpretView(APIView):
    def post(self, request):
        report_text = request.data.get('report_text', '').strip()
        custom_key = request.data.get('api_key', '').strip() or request.headers.get('X-Gemini-API-Key', '').strip()
        
        if not report_text:
            return Response({'error': 'Report text is required for AI interpretation'}, status=status.HTTP_400_BAD_REQUEST)
            
        result = interpret_report_with_ai(report_text, custom_key or None)
        return Response(result)
