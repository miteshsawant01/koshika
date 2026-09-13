from django.core.management.base import BaseCommand
from stemcell_core.models import Patient, Donor, Storage, Staff, Research, Inventory, StemCellBank
from stemcell_core.supabase_service import fetch_table, count_table

class Command(BaseCommand):
    help = 'Synchronizes data from Supabase Cloud (PostgreSQL) into the local Django database over HTTPS'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('=== KOSHIKA / STEMBRIDGE AI - SUPABASE CLOUD SYNC ==='))
        
        # 1. Sync Patients
        self.stdout.write('Syncing patients from Supabase...')
        patients_data = fetch_table('patients') or []
        for p in patients_data:
            Patient.objects.update_or_create(
                patient_id=p['patient_id'],
                defaults={
                    'name': p.get('name', ''),
                    'age': p.get('age', 0),
                    'blood_group': p.get('blood_group', 'O+'),
                    'contact': p.get('contact', ''),
                    'disease': p.get('disease', '')
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ? {len(patients_data)} patients synced.'))

        # 2. Sync Donors
        self.stdout.write('Syncing donors from Supabase...')
        donors_data = fetch_table('donors') or []
        for d in donors_data:
            Donor.objects.update_or_create(
                donor_id=d['donor_id'],
                defaults={
                    'name': d.get('name', ''),
                    'age': d.get('age', 0),
                    'blood_group': d.get('blood_group', 'O+'),
                    'contact': d.get('contact', ''),
                    'donation_date': d.get('donation_date'),
                    'notes': d.get('notes', ''),
                    'patient_id': d.get('patient_id')
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ? {len(donors_data)} donors synced.'))

        # 3. Sync Storage
        self.stdout.write('Syncing storage from Supabase...')
        storage_data = fetch_table('storage') or []
        for s in storage_data:
            Storage.objects.update_or_create(
                storage_id=s['storage_id'],
                defaults={
                    'donor_id': s.get('donor_id'),
                    'storage_location': s.get('storage_location', ''),
                    'collected_date': s.get('collected_date'),
                    'expiry_date': s.get('expiry_date'),
                    'units': s.get('units', 1)
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ? {len(storage_data)} storage records synced.'))

        # 4. Sync Inventory
        self.stdout.write('Syncing inventory from Supabase...')
        inventory_data = fetch_table('inventory') or []
        for i in inventory_data:
            Inventory.objects.update_or_create(
                item_id=i['item_id'],
                defaults={
                    'item_name': i.get('item_name', ''),
                    'quantity': i.get('quantity', 0),
                    'unit': i.get('unit', '')
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ? {len(inventory_data)} inventory items synced.'))

        # 5. Sync Research
        self.stdout.write('Syncing research from Supabase...')
        research_data = fetch_table('research') or []
        for r in research_data:
            Research.objects.update_or_create(
                research_id=r['research_id'],
                defaults={
                    'project_name': r.get('project_name', ''),
                    'lead_scientist': r.get('lead_scientist', ''),
                    'start_date': r.get('start_date'),
                    'status': r.get('status', 'Ongoing'),
                    'summary': r.get('summary', '')
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ? {len(research_data)} research projects synced.'))

        # 6. Sync Stem Cell Banks
        self.stdout.write('Syncing stem cell banks from Supabase...')
        banks_data = fetch_table('stem_cell_banks') or []
        for b in banks_data:
            StemCellBank.objects.update_or_create(
                id=b['id'],
                defaults={
                    'bank_name': b.get('bank_name', ''),
                    'location': b.get('location', '')
                }
            )
        self.stdout.write(self.style.SUCCESS(f'  ? {len(banks_data)} stem cell banks synced.'))

        self.stdout.write(self.style.SUCCESS('\n[SUCCESS] Supabase cloud synchronization complete!'))
