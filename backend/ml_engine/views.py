from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from stemcell_core.models import Patient, Donor
from .predictor import predictor

class CompatibilityPredictionView(APIView):
    def post(self, request):
        data = request.data
        
        # Check if IDs were provided
        p_id = data.get('patient_id')
        d_id = data.get('donor_id')
        
        patient_age = data.get('patient_age')
        patient_bg = data.get('patient_blood_group')
        disease = data.get('disease', 'Leukemia')
        
        donor_age = data.get('donor_age')
        donor_bg = data.get('donor_blood_group')
        
        if p_id:
            try:
                p = Patient.objects.get(patient_id=p_id)
                patient_age = p.age or 35
                patient_bg = p.blood_group or 'A+'
                disease = p.disease or 'Leukemia'
            except Patient.DoesNotExist:
                return Response({'error': f'Patient #{p_id} not found'}, status=status.HTTP_404_NOT_FOUND)
                
        if d_id:
            try:
                d = Donor.objects.get(donor_id=d_id)
                donor_age = d.age or 30
                donor_bg = d.blood_group or 'A+'
            except Donor.DoesNotExist:
                return Response({'error': f'Donor #{d_id} not found'}, status=status.HTTP_404_NOT_FOUND)
                
        if not patient_age or not patient_bg or not donor_age or not donor_bg:
            return Response({'error': 'Missing required fields (patient_age, patient_blood_group, donor_age, donor_blood_group)'}, status=status.HTTP_400_BAD_REQUEST)
            
        hla_match = data.get('hla_match', 9)
        cd34_count = data.get('cd34_count', 5.5)
        viability = data.get('viability', 92.0)
        storage_months = data.get('storage_months', 6)
        
        try:
            result = predictor.predict(
                p_age=patient_age,
                d_age=donor_age,
                p_bg=patient_bg,
                d_bg=donor_bg,
                hla_match=hla_match,
                cd34_count=cd34_count,
                viability=viability,
                storage_months=storage_months,
                disease_str=disease
            )
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ModelMetadataView(APIView):
    def get(self, request):
        return Response(predictor.metadata)
