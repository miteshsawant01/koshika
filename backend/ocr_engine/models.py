from django.db import models


class MedicalReport(models.Model):
    id = models.AutoField(primary_key=True)
    file_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True, null=True)
    report_type = models.CharField(max_length=50, default='GENERAL')
    status = models.CharField(max_length=50, default='Analyzed')
    extracted_text = models.TextField(blank=True, default='')
    parsed_data = models.JSONField(default=dict, blank=True)
    is_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medical_reports'
        ordering = ['-id']

    def __str__(self):
        return f'{self.file_name} ({self.report_type})'
