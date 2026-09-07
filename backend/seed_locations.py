import os, sys, django, random
from datetime import datetime, timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from stemcell_core.models import Patient, Donor, Storage, Staff, Research, Inventory, AuditLog

LOCATIONS = [
    'CryoTank-A',
    'CryoTank-B',
    'CryoTank-C',
    'CryoTank-D',
    'CryoTank-E',
    'BioVault-Alpha',
    'BioVault-Beta',
    'LN2-VaporTank-1'
]

donors = list(Donor.objects.all())
print(f"Starting with {len(donors)} donors")

for loc_name in LOCATIONS:
    current = Storage.objects.filter(storage_location__startswith=loc_name).count()
    needed = max(0, 100 - current)
    print(f"Location {loc_name}: has {current}, adding {needed}")
    new_items = []
    for i in range(needed):
        donor = random.choice(donors)
        rack = random.choice(['R1', 'R2', 'R3', 'R4'])
        box = random.choice(['B1', 'B2', 'B3', 'B4', 'B5'])
        slot = i + 1
        spec_loc = f"{loc_name}-{slot:02d}-{rack}:{box}"
        coll_days = random.randint(10, 500)
        coll_d = date.today() - timedelta(days=coll_days)
        exp_d = date(coll_d.year + 10, coll_d.month, coll_d.day)
        s = Storage(
            donor=donor,
            storage_location=spec_loc,
            collected_date=coll_d,
            expiry_date=exp_d,
            units=random.randint(1, 5)
        )
        new_items.append(s)
    if new_items:
        Storage.objects.bulk_create(new_items)
    tot = Storage.objects.filter(storage_location__startswith=loc_name).count()
    print(f"==> {loc_name} total now: {tot}")

print('Total Storage records in database:', Storage.objects.count())
