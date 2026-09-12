from django.db import models


class Patient(models.Model):
    patient_id = models.AutoField(primary_key=True, db_column='patient_id')
    name = models.CharField(max_length=150)
    age = models.IntegerField(null=True, blank=True)
    blood_group = models.CharField(max_length=10, null=True, blank=True)
    contact = models.CharField(max_length=50, null=True, blank=True)
    disease = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patients'
        ordering = ['-patient_id']

    def __str__(self):
        return f'{self.name} ({self.blood_group})'


class Donor(models.Model):
    donor_id = models.AutoField(primary_key=True, db_column='donor_id')
    name = models.CharField(max_length=150)
    age = models.IntegerField(null=True, blank=True)
    blood_group = models.CharField(max_length=10, null=True, blank=True)
    contact = models.CharField(max_length=50, null=True, blank=True)
    donation_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, db_column='patient_id', related_name='donors')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'donors'
        ordering = ['-donor_id']

    def __str__(self):
        return f'{self.name} ({self.blood_group})'


class Storage(models.Model):
    storage_id = models.AutoField(primary_key=True, db_column='storage_id')
    donor = models.ForeignKey(Donor, on_delete=models.SET_NULL, null=True, blank=True, db_column='donor_id', related_name='storage_records')
    storage_location = models.CharField(max_length=100, null=True, blank=True)
    collected_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    units = models.IntegerField(default=1)

    class Meta:
        db_table = 'storage'
        ordering = ['-storage_id']

    def __str__(self):
        return f'{self.storage_location} ({self.units} units)'


class Staff(models.Model):
    staff_id = models.AutoField(primary_key=True, db_column='staff_id')
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'staff'
        ordering = ['staff_id']

    def __str__(self):
        return f'{self.name} - {self.role}'


class Research(models.Model):
    research_id = models.AutoField(primary_key=True, db_column='research_id')
    project_name = models.CharField(max_length=255)
    lead_scientist = models.CharField(max_length=150, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Active')
    summary = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'research'
        ordering = ['-research_id']

    def __str__(self):
        return self.project_name


class Inventory(models.Model):
    item_id = models.AutoField(primary_key=True, db_column='item_id')
    item_name = models.CharField(max_length=150)
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, default='pcs')
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory'
        ordering = ['-item_id']

    def __str__(self):
        return f'{self.item_name} ({self.quantity} {self.unit})'


class AuditLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    table_name = models.CharField(max_length=128)
    operation = models.CharField(max_length=10)
    record_id = models.BigIntegerField(null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.CharField(max_length=128, null=True, blank=True)
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-id']

    def __str__(self):
        return f'{self.table_name} {self.operation} #{self.record_id}'


class StemCellBank(models.Model):
    id = models.AutoField(primary_key=True)
    bank_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)

    class Meta:
        db_table = 'stem_cell_banks'
        ordering = ['id']

    def __str__(self):
        return f'{self.bank_name} ({self.location})'
