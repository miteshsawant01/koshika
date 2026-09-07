import os
import sys
import django
import random
from datetime import datetime, timedelta, date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from stemcell_core.models import Patient, Donor, Storage, Staff, Research, Inventory, AuditLog

FIRST_NAMES_MALE = [
    'Aarav', 'Rajesh', 'Vikram', 'Rohan', 'Arjun', 'Suresh', 'Amit', 'Anand', 'Karthik', 'Nikhil',
    'Aditya', 'Manoj', 'Deepak', 'Pranav', 'Gaurav', 'Ravi', 'Sanjay', 'Rahul', 'Vivek', 'Harish',
    'Manish', 'Dev', 'Sameer', 'Ashok', 'Prakash', 'Sunil', 'Kunal', 'Abhishek', 'Varun', 'Hemant',
    'Mohan', 'Vinay', 'Girish', 'Akash', 'Suraj', 'Chetan', 'Tushar', 'Kishore', 'Naveen', 'Ramesh'
]

FIRST_NAMES_FEMALE = [
    'Priya', 'Anita', 'Sunita', 'Sneha', 'Ananya', 'Kavita', 'Deepa', 'Swati', 'Pooja', 'Meera',
    'Ritu', 'Shreya', 'Divya', 'Neha', 'Payal', 'Aarti', 'Rekha', 'Geeta', 'Sita', 'Radha',
    'Tanvi', 'Isha', 'Bhavna', 'Komal', 'Pallavi', 'Sangeeta', 'Nandini', 'Shruti', 'Archana', 'Jyoti',
    'Preeti', 'Rashmi', 'Malini', 'Smita', 'Vidya', 'Sarita', 'Aparna', 'Usha', 'Namrata', 'Shalini'
]

LAST_NAMES = [
    'Sharma', 'Verma', 'Patel', 'Reddy', 'Iyer', 'Joshi', 'Kulkarni', 'Deshmukh', 'Nair', 'Gupta',
    'Singh', 'Bhatt', 'Sen', 'Chopra', 'Malhotra', 'Mukherjee', 'Banerjee', 'Rao', 'Pandey', 'Mishra',
    'Das', 'Saxena', 'Mehta', 'Shah', 'Agarwal', 'Chatterjee', 'Bose', 'Thakur', 'Yadav', 'Gowda',
    'Pillai', 'Menon', 'Bhardwaj', 'Dubey', 'Trivedi', 'Jain', 'Kapoor', 'Bhatia', 'Shukla', 'Patil'
]

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
BLOOD_GROUP_WEIGHTS = [0.30, 0.05, 0.32, 0.05, 0.20, 0.03, 0.04, 0.01]

DISEASES = [
    'Acute Myeloid Leukemia (AML)',
    'Acute Lymphoblastic Leukemia (ALL)',
    'Severe Aplastic Anemia',
    'Beta Thalassemia Major',
    'Sickle Cell Anemia',
    'Multiple Myeloma',
    'Non-Hodgkin Lymphoma',
    'Hodgkin Lymphoma',
    'Chronic Myeloid Leukemia (CML)',
    'Severe Combined Immunodeficiency (SCID)',
    'Fanconi Anemia',
    'Myelodysplastic Syndrome (MDS)',
    'Wiskott-Aldrich Syndrome',
    'Paroxysmal Nocturnal Hemoglobinuria (PNH)',
    'Hemophagocytic Lymphohistiocytosis (HLH)',
    'Juvenile Myelomonocytic Leukemia',
    'Pure Red Cell Aplasia',
    'Primary Myelofibrosis'
]

def generate_full_name():
    first = random.choice(FIRST_NAMES_MALE + FIRST_NAMES_FEMALE)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"

def generate_phone():
    prefix = random.choice(['98', '97', '99', '91', '90', '93', '94', '96', '88', '87', '70', '80'])
    rest = ''.join([str(random.randint(0, 9)) for _ in range(8)])
    return f"+91 {prefix}{rest[:4]} {rest[4:]}"

def generate_bg():
    return random.choices(BLOOD_GROUPS, weights=BLOOD_GROUP_WEIGHTS, k=1)[0]

def seed_patients():
    print("Seeding Patients to 100...")
    current_count = Patient.objects.count()
    needed = max(0, 100 - current_count)
    created = []
    
    for i in range(needed):
        p = Patient(
            name=generate_full_name(),
            age=random.randint(4, 72),
            blood_group=generate_bg(),
            contact=generate_phone(),
            disease=random.choice(DISEASES)
        )
        created.append(p)
    
    if created:
        Patient.objects.bulk_create(created)
    print(f"Total Patients now: {Patient.objects.count()}")

def seed_donors():
    print("Seeding Donors to 100...")
    current_count = Donor.objects.count()
    needed = max(0, 100 - current_count)
    patients = list(Patient.objects.all())
    created = []
    
    hla_sample_notes = [
        "HLA-A*02:01, B*44:02, C*05:01, DRB1*04:01 verified. 10/10 High Resolution Match.",
        "Repeat voluntary donor. PBSC mobilization completed with excellent tolerability.",
        "Cord blood donor unit. Total Nucleated Cell Count: 1.8 x 10^9, Sterility Neg.",
        "CMV Negative, EBV Negative, Hepatitis Panel Clear. Prime candidate for pediatric graft.",
        "High CD34+ cell count: 7.4 x 10^6 cells/kg. Excellent candidate for AML recipient.",
        "Peripheral Blood Stem Cell (PBSC) registry member. Ready for apheresis collection.",
        "Young healthy donor. 9/10 HLA match recorded. Fully screened for infectious disease markers.",
        "Bone Marrow donor volunteer. Complete health clearance from hematology panel.",
        "Cord tissue MSC donor candidate. Verified sterile collection with 98.5% post-thaw viability.",
        "Active voluntary donor. Weight 68kg, hemoglobin 14.8 g/dL. Ready on 48hr notice."
    ]
    
    base_date = date.today() - timedelta(days=500)
    
    for i in range(needed):
        donation_days_ago = random.randint(5, 450)
        donation_d = date.today() - timedelta(days=donation_days_ago)
        linked_patient = random.choice(patients) if random.random() < 0.4 else None
        
        d = Donor(
            name=generate_full_name(),
            age=random.randint(19, 49),
            blood_group=generate_bg(),
            contact=generate_phone(),
            donation_date=donation_d,
            notes=random.choice(hla_sample_notes),
            patient=linked_patient
        )
        created.append(d)
        
    if created:
        Donor.objects.bulk_create(created)
    print(f"Total Donors now: {Donor.objects.count()}")

def seed_storage():
    print("Seeding Storage to 100...")
    current_count = Storage.objects.count()
    needed = max(0, 100 - current_count)
    donors = list(Donor.objects.all())
    created = []
    
    tank_prefixes = [
        'CryoTank-A', 'CryoTank-B', 'CryoTank-C', 'CryoTank-D', 'CryoTank-E',
        'BioVault-Alpha-', 'BioVault-Beta-', 'BioVault-Gamma-', 'LN2-VaporTank-'
    ]
    
    for i in range(needed):
        donor = random.choice(donors)
        prefix = random.choice(tank_prefixes)
        slot_num = random.randint(1, 25)
        rack = random.choice(['R1', 'R2', 'R3', 'R4'])
        box = random.choice(['B1', 'B2', 'B3', 'B4', 'B5'])
        loc = f"{prefix}{slot_num:02d}-{rack}:{box}"
        
        coll_days_ago = random.randint(30, 700)
        coll_date = date.today() - timedelta(days=coll_days_ago)
        # 10 year cryo expiry
        exp_date = date(coll_date.year + 10, coll_date.month, coll_date.day)
        
        s = Storage(
            donor=donor,
            storage_location=loc,
            collected_date=coll_date,
            expiry_date=exp_date,
            units=random.randint(1, 6)
        )
        created.append(s)
        
    if created:
        Storage.objects.bulk_create(created)
    print(f"Total Storage units now: {Storage.objects.count()}")

def seed_inventory():
    print("Seeding Inventory to 100 items...")
    current_count = Inventory.objects.count()
    needed = max(0, 100 - current_count)
    
    SUPPLY_CATALOG = [
        ("Cryogenic Vials 1.8 mL (Internal Thread)", 850, "vials"),
        ("Cryogenic Vials 4.5 mL (External Thread)", 420, "vials"),
        ("Liquid Nitrogen (Medical Grade)", 450, "litres"),
        ("DMSO 99.9% USP Grade Cryoprotectant", 80, "bottles"),
        ("RPMI-1640 Medium w/ L-Glutamine (500 mL)", 120, "bottles"),
        ("Fetal Bovine Serum (Stem Cell Certified)", 45, "bottles"),
        ("Ficoll-Paque PLUS Density Gradient Media", 60, "bottles"),
        ("Apheresis Collection Kits (Single-Use Sterile)", 110, "kits"),
        ("CD34+ MicroBead Cell Separation Kits", 35, "kits"),
        ("StemSpan SFEM II Expansion Medium", 50, "bottles"),
        ("Cryo-Preservation Cassettes 25 mL", 320, "pcs"),
        ("Cryo-Preservation Cassettes 50 mL", 280, "pcs"),
        ("Liquid Nitrogen Cryo Gloves (Mid-Arm)", 24, "pairs"),
        ("Cryo Face Shields (UV & Splash Rated)", 18, "pcs"),
        ("Cryogenic Barcode Labels (Low-Temp Resistant)", 2500, "labels"),
        ("Thermal Transfer Ribbon for Cryo Printers", 15, "rolls"),
        ("Automated Cell Counter Chamber Slides", 340, "slides"),
        ("Trypan Blue Stain 0.4% Solution (100 mL)", 40, "bottles"),
        ("Sterile Filter Pipette Tips 1000 uL", 1800, "tips"),
        ("Sterile Filter Pipette Tips 200 uL", 2200, "tips"),
        ("Sterile Filter Pipette Tips 10 uL", 1900, "tips"),
        ("Conical Centrifuge Tubes 50 mL Sterile", 950, "tubes"),
        ("Conical Centrifuge Tubes 15 mL Sterile", 1100, "tubes"),
        ("Umbilical Cord Blood Collection Bags (CPD)", 140, "bags"),
        ("Bone Marrow Harvest Needles 11G Jamshidi", 65, "needles"),
        ("Heparin Sodium 5000 IU/mL Injection", 90, "vials"),
        ("Phosphate Buffered Saline (PBS 1X, pH 7.4)", 130, "bottles"),
        ("Flow Cytometry 7-Color Calibration Beads", 22, "kits"),
        ("CD45-FITC / CD34-PE Dual Antibody Cocktail", 28, "vials"),
        ("7-AAD Cell Viability Dye Solution", 32, "vials"),
        ("Cryogenic Freezer Racks (100-Place Stainless)", 45, "racks"),
        ("LN2 Level Monitoring Wireless Sensors", 16, "units"),
        ("Oxygen Deficiency Room Safety Monitors", 8, "units"),
        ("Thermal Paper Rolls for Controlled Freezers", 65, "rolls"),
        ("CryoMACS 250 Stem Cell Freezing Bags", 180, "bags"),
        ("CryoMACS 50 Stem Cell Freezing Bags", 210, "bags"),
        ("Syringes 20 mL Luer-Lock Sterile", 650, "pcs"),
        ("Syringes 10 mL Luer-Lock Sterile", 750, "pcs"),
        ("Syringes 5 mL Luer-Lock Sterile", 900, "pcs"),
        ("Microcentrifuge Tubes 1.5 mL Safe-Lock", 2400, "tubes"),
        ("Petri Dishes 100 mm (TC Treated)", 450, "dishes"),
        ("6-Well Tissue Culture Plates", 240, "plates"),
        ("96-Well Flat-Bottom Microplates", 320, "plates"),
        ("Serological Pipettes 25 mL Sterile", 600, "pipettes"),
        ("Serological Pipettes 10 mL Sterile", 850, "pipettes"),
        ("Serological Pipettes 5 mL Sterile", 700, "pipettes"),
        ("Polycarbonate Cryo Boxes (81-Well 2-inch)", 120, "boxes"),
        ("LN2 Transfer Hose 6ft Vacuum Insulated", 6, "hoses"),
        ("Biohazard Autoclave Bags Heavy Duty", 350, "bags"),
        ("Nitrile Gloves Powder-Free Medium", 1200, "pairs"),
        ("Nitrile Gloves Powder-Free Large", 1100, "pairs"),
        ("Isopropanol 70% Disinfection Wipes Canister", 85, "tubs"),
        ("Ethanol 100% Molecular Biology Grade (4L)", 25, "bottles"),
        ("Parafilm M Sealing Film (4 in x 125 ft)", 30, "rolls"),
        ("Electronic Pipette Controllers (Cordless)", 12, "units"),
        ("Vortex Mixer Rubber Cup Replacements", 14, "caps"),
        ("Centrifuge Bucket Adapters 50 mL", 20, "adapters"),
        ("Cryo Marker Pens (Resistant to -196C)", 75, "pens"),
        ("Cryogenic Long Tongs Stainless Steel 45cm", 15, "pcs"),
        ("Dry Ice Vapor Shippers (IATA Compliant)", 10, "shippers"),
        ("NIST Traceable Ultra-Low Temp Loggers", 18, "loggers"),
        ("StemPro MSC SFM Medium (500 mL)", 35, "bottles"),
        ("Recombinant Human G-CSF (Filgrastim 300mcg)", 70, "vials"),
        ("MACS Separation Columns (Large Scale LS)", 160, "columns"),
        ("Pre-Separation Filters 30 um", 220, "filters"),
        ("Sterile Biopsy Punches 4 mm", 95, "punches"),
        ("Cryo-Sleeve Protective Shrink Wrap Rolls", 40, "rolls"),
        ("Cell Strainer 70 um Nylon Mesh", 380, "strainers"),
        ("Cell Strainer 40 um Nylon Mesh", 410, "strainers"),
        ("Cryopreservation Solution CS10 (100 mL)", 55, "bottles"),
        ("Cryopreservation Solution CS5 (100 mL)", 48, "bottles"),
        ("Methylcellulose Complete Media with Cytokines", 65, "tubes"),
        ("HSA 20% Human Serum Albumin Solution", 80, "vials"),
        ("Gentamicin Sulfate Reagent Solution (50 mg/mL)", 45, "vials"),
        ("Penicillin-Streptomycin Solution 100X", 60, "bottles"),
        ("Sterile Drape Sheets for Bone Marrow Harvest", 150, "sheets"),
        ("Bone Marrow Filter Units 200 um", 85, "units"),
        ("Sterile Tubing Welding Wafers (Terumo TSCD)", 500, "wafers"),
        ("Sterile Connection Devices Tubing Cartridges", 120, "cartridges"),
        ("LN2 Dipsticks for Liquid Level Measurement", 12, "sticks"),
        ("Cryo-Aprons (Waterproof Low-Temp Safe)", 10, "aprons"),
        ("Sterile Syringe Filters 0.22 um PES Membrane", 450, "filters"),
        ("Sterile Syringe Filters 0.45 um PES Membrane", 400, "filters"),
        ("Cryo-Vial Color Coders (Assorted Insert Caps)", 1500, "caps"),
        ("Specimen Transport Bags (95 kPa Certified)", 600, "bags"),
        ("Bleach 10% Hospital Grade Surface Cleaner", 50, "bottles"),
        ("Sterile Surgical Scalpels #11", 300, "blades"),
        ("Sterile Surgical Scalpels #15", 300, "blades"),
        ("ELISA Wash Buffer 10X Concentrate (1L)", 35, "bottles"),
        ("TMB Substrate Reagent Set for ELISA", 25, "sets"),
        ("Cryo-Grip Forceps 25 cm Insulated", 16, "forceps"),
        ("Sterile Gauze Swabs 10x10 cm (Pack of 5)", 800, "packs"),
        ("Chlorhexidine Gluconate 2% Skin Prep Swabs", 650, "swabs"),
        ("Adhesive Wound Dressing Sterile (Tegaderm)", 550, "dressings"),
        ("Endotoxin Detection LAL Reagent Kits", 20, "kits"),
        ("Mycoplasma PCR Detection Primers Kit", 18, "kits"),
        ("Bactec Blood Culture Bottles (Aerobic)", 140, "bottles"),
        ("Bactec Blood Culture Bottles (Anaerobic)", 140, "bottles"),
        ("LN2 Exhaust Ventilation Filter Cartridges", 14, "cartridges"),
        ("HEPA Air Filters for Class 100 Cleanroom", 12, "filters")
    ]
    
    created = []
    for i in range(needed):
        idx = (current_count + i) % len(SUPPLY_CATALOG)
        item_name, default_qty, unit = SUPPLY_CATALOG[idx]
        # vary quantity slightly
        qty = int(default_qty * random.uniform(0.7, 1.4))
        inv = Inventory(
            item_name=item_name,
            quantity=qty,
            unit=unit
        )
        created.append(inv)
        
    if created:
        Inventory.objects.bulk_create(created)
    print(f"Total Inventory items now: {Inventory.objects.count()}")

def seed_staff():
    print("Seeding Staff to 100...")
    current_count = Staff.objects.count()
    needed = max(0, 100 - current_count)
    
    ROLES_DEPTS = [
        ("Chief Medical Officer", "Executive Leadership"),
        ("Medical Director - Hematology", "Hematology & Oncology"),
        ("Director of Biobanking & Cryogenics", "Cryo Preservation Vault"),
        ("Senior Hematologist & BMT Consultant", "Bone Marrow Transplant"),
        ("BMT Transplant Specialist Physician", "Bone Marrow Transplant"),
        ("Head of Molecular Genetics & HLA", "Molecular Genetics"),
        ("HLA Typing Laboratory Specialist", "HLA & Histocompatibility"),
        ("Senior Flow Cytometry Analyst", "Cellular Phenotyping"),
        ("Quality Assurance & Compliance Manager", "Quality Assurance"),
        ("Regulatory Affairs Officer", "Regulatory Compliance"),
        ("Lead Cryopreservation Scientist", "Cryo Preservation Vault"),
        ("Senior Cell Processing Technologist", "Cleanroom Cell Processing"),
        ("Stem Cell Processing Technician", "Cleanroom Cell Processing"),
        ("Cryogenic Facility Engineer", "Biomedical Engineering"),
        ("Senior Apheresis Specialist Nurse", "Apheresis & Cell Collection"),
        ("Apheresis Staff Nurse", "Apheresis & Cell Collection"),
        ("Donor Recruitment & Care Coordinator", "Donor Services"),
        ("Patient Care & BMT Coordinator", "Patient Advocacy"),
        ("Clinical Research Coordinator", "Research & Trials"),
        ("Senior Postdoctoral Research Fellow", "Cellular Biology Research"),
        ("Postdoctoral Fellow - iPSC Modeling", "Stem Cell Research"),
        ("Laboratory Safety & Biosafety Officer", "EHS & Safety"),
        ("Cleanroom Operations Supervisor", "Cleanroom Operations"),
        ("Sterility & Microbial Quality Analyst", "Microbiology QC"),
        ("Cryo Inventory & Distribution Lead", "Biobank Logistics"),
        ("Bioinformatics & HLA Matching Lead", "Computational Biology"),
        ("Senior Medical Laboratory Scientist", "Clinical Laboratory"),
        ("Clinical Data Specialist", "Health Informatics")
    ]
    
    created = []
    for i in range(needed):
        role, dept = random.choice(ROLES_DEPTS)
        prefix = "Dr. " if any(kw in role for kw in ["Medical", "Hematologist", "Physician", "Scientist", "Director", "Fellow", "Officer"]) else ""
        name = prefix + generate_full_name()
        
        st = Staff(
            name=name,
            role=role,
            department=dept,
            contact=generate_phone()
        )
        created.append(st)
        
    if created:
        Staff.objects.bulk_create(created)
    print(f"Total Staff now: {Staff.objects.count()}")

def seed_research():
    print("Seeding Research to 100...")
    current_count = Research.objects.count()
    needed = max(0, 100 - current_count)
    
    RESEARCH_TITLES = [
        ("Allogeneic HSC Engraftment Acceleration via Ex-Vivo Fucosylation", "Ongoing", "Investigating enzymatic cell surface fucosylation to improve bone marrow homing velocity in cord blood grafts."),
        ("CRISPR-Cas9 BCL11A Enhancer Editing for Sickle Cell Disease", "Active", "Autologous CD34+ editing inducing high fetal hemoglobin (HbF) expression to eliminate vaso-occlusive crises."),
        ("Mesenchymal Stem Cell Infusion for Steroid-Refractory Acute GVHD", "Ongoing", "Phase II trial evaluating third-party umbilical cord MSCs for suppressing gut and liver graft-versus-host disease."),
        ("Automated Closed-System Processing Protocol for Cord Blood Units", "Completed", "Validation of closed centrifuge-based RBC depletion and volume reduction yielding >92% nucleated cell recovery."),
        ("15-Year Cryopreservation Potency Evaluation of CD34+ Stem Cells", "Completed", "Long-term biobank stability study confirming cell membrane viability, colony forming units (CFU), and engraftment capacity."),
        ("Post-Transplant Cyclophosphamide in Haploidentical Stem Cell Transplants", "Active", "Evaluating high-dose PTCy on days +3 and +4 to mitigate severe GVHD in half-matched familial donor recipients."),
        ("Induced Pluripotent Stem Cell (iPSC) Disease Modeling in AML", "Ongoing", "Deriving patient-specific iPSC lines harboring FLT3-ITD and NPM1 mutations to screen targeted small-molecule inhibitors."),
        ("Cord Blood Derived Allogeneic CAR-NK Cell Therapy for CD19+ Lymphoma", "Active", "Off-the-shelf chimeric antigen receptor natural killer cells expanded from cryopreserved umbilical cord units."),
        ("Trehalose-Liposome Delivery as a Non-Toxic Alternative to DMSO", "In Review", "Engineering cryoprotectant formulations reducing post-thaw DMSO toxicity in pediatric autologous transplantations."),
        ("Cord Blood Regulatory T-Cells (Tregs) for Solid Organ Tolerance", "Ongoing", "Preclinical evaluation of ex-vivo expanded cord blood Tregs to prevent allograft rejection in pediatric kidney transplant."),
        ("Optimization of Granulocyte-Colony Stimulating Factor Mobilization Schedules", "Completed", "Prospective comparative study of 4-day vs 5-day G-CSF dosing regimens on total CD34+ apheresis collection efficiency."),
        ("Spatial Transcriptomics of Bone Marrow Niches Post-Engraftment", "Active", "Single-cell spatial profiling mapping donor cell reconstitution dynamics across osteoblast and vascular niches."),
        ("Mitochondrial Transfer from MSCs to Injured Endothelial Tissues", "Ongoing", "Investigating tunneling nanotube mediated organelle donation to reverse radiation-induced vascular damage."),
        ("Pre-Transplant NGS Chimerism Profiling for Minimal Residual Disease", "Ongoing", "Developing ultra-sensitive duplex sequencing tracking donor chimerism down to 0.001% sensitivity."),
        ("Hydrogel Scaffold 3D Culture of Wharton's Jelly Mesenchymal Progenitors", "Active", "Biomimetic biomaterial matrices augmenting paracrine vascular endothelial growth factor (VEGF) secretion."),
        ("Cryopreservation of Whole Umbilical Cord Tissue for Bio-Repository Storage", "In Review", "Standardizing slow-cooling protocols with programmable rate freezers to ensure multi-lineage differentiation."),
        ("Microfluidic Droplet Sorting of Rare Hematopoietic Stem Cell Subsets", "Ongoing", "Acoustic microfluidics isolating CD34+ CD38- CD90+ CD45RA- long-term repopulating stem cells."),
        ("Immune Reconstitution Following CD34+ Selected Autologous Transplants", "Completed", "Five-year longitudinal follow-up tracking thymic output and T-cell receptor repertoire diversification."),
        ("Targeting Senescence-Associated Secretory Phenotype in Aged Biobank Samples", "Active", "Senolytic clearance of senescent stromal populations to restore juvenile proliferative potential in stored grafts."),
        ("Cold-Chain Continuous Temperature Telemetry across Air Transits", "Completed", "Validating multi-sensor IoT cryogenic dry shipper telemetry during international stem cell courier transfers.")
    ]
    
    lead_scientists = [
        "Dr. Meera Joshi", "Dr. Arvind Swaminathan", "Dr. Priya Nambiar", "Dr. Rajesh Sengupta",
        "Dr. Elena Rostova", "Dr. Sanjay Verma", "Dr. Kavita Deshmukh", "Dr. Vikramaditya Roy",
        "Dr. Sunita Balasubramanian", "Dr. Rohan Bhattacharya", "Dr. Anita Nair", "Dr. Deepak Sharma"
    ]
    
    created = []
    for i in range(needed):
        idx = (current_count + i) % len(RESEARCH_TITLES)
        title, status, summary = RESEARCH_TITLES[idx]
        if i >= len(RESEARCH_TITLES):
            title = f"{title} (Cohort {i // len(RESEARCH_TITLES) + 1})"
            
        start_d = date.today() - timedelta(days=random.randint(60, 900))
        r = Research(
            project_name=title,
            lead_scientist=random.choice(lead_scientists),
            start_date=start_d,
            status=status,
            summary=summary
        )
        created.append(r)
        
    if created:
        Research.objects.bulk_create(created)
    print(f"Total Research studies now: {Research.objects.count()}")

def seed_audit_logs():
    print("Seeding Audit Logs to 100...")
    current_count = AuditLog.objects.count()
    needed = max(0, 100 - current_count)
    
    TABLES = ['patients', 'donors', 'storage', 'inventory', 'research', 'staff']
    OPS = ['INSERT', 'UPDATE', 'VERIFY', 'CRYO_CHECK']
    USERS = ['sysadmin', 'dr_sarah', 'lab_lead', 'auditor_qa', 'registry_nurse', 'cryo_eng']
    
    created = []
    for i in range(needed):
        tbl = random.choice(TABLES)
        op = random.choice(OPS)
        user = random.choice(USERS)
        rec_id = random.randint(1, 100)
        
        old_val = {"status": "Pending", "verified": False} if op != 'INSERT' else None
        new_val = {"status": "Active", "verified": True, "notes": "Approved by clinical team"}
        
        log = AuditLog(
            table_name=tbl,
            operation=op,
            record_id=rec_id,
            changed_by=user,
            old_values=old_val,
            new_values=new_val
        )
        created.append(log)
        
    if created:
        AuditLog.objects.bulk_create(created)
    print(f"Total Audit Logs now: {AuditLog.objects.count()}")

if __name__ == '__main__':
    seed_patients()
    seed_donors()
    seed_storage()
    seed_inventory()
    seed_staff()
    seed_research()
    seed_audit_logs()
    print("All tables successfully seeded to 100 entries!")
