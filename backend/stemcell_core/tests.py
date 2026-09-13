from django.test import TestCase
from rest_framework.test import APIClient

from .models import AuditLog


class OperationalAuditTests(TestCase):
	def setUp(self):
		self.client = APIClient()

	def test_patient_mutations_create_audit_events(self):
		response = self.client.post('/api/patients/', {
			'name': 'Audit Test Patient',
			'age': 40,
			'blood_group': 'O+',
			'disease': 'AML',
		}, format='json')
		self.assertEqual(response.status_code, 201)
		patient_url = f"/api/patients/{response.data['patient_id']}/"

		self.client.patch(patient_url, {'disease': 'ALL'}, format='json')
		self.client.delete(patient_url)

		self.assertEqual(
			list(AuditLog.objects.values_list('operation', flat=True)),
			['DELETE', 'UPDATE', 'CREATE'],
		)
