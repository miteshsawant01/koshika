from rest_framework import serializers
from .models import Patient, Donor, Storage, Staff, Research, Inventory, AuditLog, StemCellBank


class PatientSerializer(serializers.ModelSerializer):
    donor_count = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_donor_count(self, obj):
        return obj.donors.count()


class DonorSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)

    class Meta:
        model = Donor
        fields = '__all__'


class StorageSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.name', read_only=True)
    donor_blood_group = serializers.CharField(source='donor.blood_group', read_only=True)

    class Meta:
        model = Storage
        fields = '__all__'


class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'


class ResearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Research
        fields = '__all__'


class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'


class StemCellBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = StemCellBank
        fields = '__all__'
