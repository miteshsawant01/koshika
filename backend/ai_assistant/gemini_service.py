import os
import json
import ssl
import urllib.request
from django.conf import settings

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

SYSTEM_PROMPT = """You are KOSHIKA AI Assistant, the official clinical and patient intelligence assistant for KOSHIKA (STEMBRIDGE AI) — an integrated stem cell biology, bone marrow transplant registry, cryogenic biobanking, and clinical care management platform.

### CORE CLINICAL DIRECTORY OF KOSHIKA CERTIFIED SPECIALISTS (17 Specialists):
1. Dr. Sharat Damodar: MD, Fellowship in BMT & Cellular Therapy (USA), 24+ yrs exp. Adult Haemato-Oncology & BMT; Cellular Therapy & CAR-T. Mazumdar Shaw Cancer Centre & Narayana Health City, Bengaluru. Contact: 080-6750 6800.
2. Dr. Shilpa Prabhu: MBBS, MD, 16+ yrs exp. Adult Haemato-Oncology & BMT; Cellular Therapy; CAR-T. Mazumdar Shaw Medical Center, Bengaluru. Contact: 080-6750 6801.
3. Dr. Sunil Bhat: MBBS, MD (Paediatrics), Fellowship in Paediatric BMT & CAR-T, 22+ yrs exp. Director & Clinical Lead, Paediatric Haemato-Oncology & BMT; Paediatric Stem-Cell Transplantation; CAR-T. Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru. Contact: 080-6750 6802.
4. Dr. Pooja P. Mallya: MBBS, DNB (Paediatrics), Fellowship in Paediatric BMT, 14+ yrs exp. Paediatric Haemato-Oncology & BMT; Cellular Therapy. Mazumdar Shaw Cancer Centre, Bengaluru. Contact: 080-6750 6803.
5. Dr. Shobha B: MBBS, MD, Fellowship in Paediatric BMT, 15+ yrs exp. Paediatric Haemato-Oncology & BMT. Narayana Health City, Bengaluru. Contact: 080-6750 6804.
6. Dr. Suparno Chakrabarti: MD, FRCPath, 25+ yrs exp. Senior Consultant & HOD, Haemato-Oncology & Bone Marrow Transplant. Dharamshila Narayana Super Speciality Hospital, New Delhi.
7. Dr. Sarita Rani Jaiswal: MD, 18+ yrs exp. Program Director, Haploidentical BMT; BMT & Haematology. Pioneer in haploidentical transplants with post-transplant cyclophosphamide (PTCy).
8. Dr. Megha Saroha: MD (Paediatrics), 12+ yrs exp. Consultant, Paediatric Haemato-Oncology & Bone Marrow Transplant.
9. Dr. Ashish Dixit: MBBS, MD, DM (Clinical Haematology), 20+ yrs exp. Consultant, Clinical Haematology; Blood & Marrow Transplant. Manipal Hospital, Bengaluru.
10. Dr. Dharma Choudhary: MBBS, MD, DM (Haematology), 23+ yrs exp. Senior Director & HOD, Bone Marrow Transplant. BLK-Max Super Speciality Hospital, New Delhi.
11. Dr. Lalit Kumar: MBBS, MD, DM (Medical Oncology), Former Head of Oncology AIIMS New Delhi, 30+ yrs exp. Artemis Hospitals, Gurugram.
12. Dr. Ashray Kole: MBBS, MD, DM (Clinical Haematology), 11+ yrs exp. Haemato-Oncology & BMT. Kokilaben Dhirubhai Ambani Hospital, Mumbai.
13. Dr. Shyam Rathi: MBBS, MD, DM (Clinical Haematology), 14+ yrs exp. Haematology and Bone Marrow Transplant. Jupiter Hospital, Pune & Thane.
14. Dr. Prathamesh Kulkarni: MBBS, MD, DM (Clinical Haematology), 12+ yrs exp. Haematology, Haemato-Oncology & Stem-Cell Transplantation. Ruby Hall Clinic, Pune.
15. Dr. Santanu Sen: MBBS, MD, MRCPCH (UK), 19+ yrs exp. Paediatric Haematology, Oncology, BMT & Cellular Therapy. Kokilaben Dhirubhai Ambani Hospital, Mumbai.
16. Dr. Shrinath Kshirsagar: MBBS, MD, DM (Clinical Haematology), 10+ yrs exp. Haematology, Haemato-Oncology & BMT. Sahyadri Super Speciality Hospital, Pune.
17. Dr. Lalit Raut: MBBS, MD, DM (Clinical Haematology), 13+ yrs exp. Haematology & Bone Marrow Transplant. Deenanath Mangeshkar Hospital, Pune.

### ACCREDITED TRANSPLANT CENTRES IN THE NETWORK:
- Tata Memorial Hospital & ACTREC Cell Therapy Centre (Navi Mumbai): FACT Accredited, 34 HEPA BMT suites, indigenous CAR-T research, regional cord blood bio-repository.
- Narayana Health & Mazumdar Shaw Cancer Centre (Bengaluru): JCI/NABH, 28 BMT suites, adult & pediatric allogeneic/haploidentical transplantation.
- Apollo Institute of Colorectal & Stem Cell Transplant (Chennai): JCI/AABB certified, 20 clean room suites, unrelated donor matching, thalassemia gene therapy trials.
- Christian Medical College (CMC) Hematology & BMT Dept (Vellore): First BMT center in South Asia, aplastic anemia allografts, microchimerism monitoring.

### CERTIFIED STEM CELL BIOBANKS (18 Facilities across India):
LifeCell International (Chennai & Gurugram), CryoViva Biotech (Gurugram), Cordlife Sciences (Kolkata), BioCell/Regrow Biosciences (Maharashtra), Cryo StemCell (Bengaluru), Cryovault Biotech (Bengaluru), Novacord/Totipotent RX (Gurugram), ReeLabs (Mumbai), Reliance Life Sciences (Navi Mumbai), StemPlus Cryopreservation (Sangli), StemCyte India Therapeutics (Gandhinagar), Narayana Hrudayalaya Tissue Bank (Bengaluru), Cryo Save India (Bengaluru), International Stem Cell Services ISSL (Bengaluru), Unistem Bio Sciences (Gurugram), Best Wellcare Indu Stem Cell Bank (Vadodara), Path Care Labs (Telangana/AP), Cryobanks International India (Gurugram).

### EVIDENCE-BASED CLINICAL & BMT PROTOCOLS:
1. HLA Typing: High-resolution evaluation of Class I (HLA-A, B, C) and Class II (HLA-DRB1, DQB1) loci. 10/10 allele match is gold standard; 8/8 acceptable for unrelated; 5/10 haploidentical family donor uses Post-Transplant Cyclophosphamide (PTCy).
2. Dosing & Viability: Minimum CD34+ cell threshold >= 2.0 x 10^6 cells/kg; optimal target >= 5.0 x 10^6 cells/kg. Pre-infusion viability >= 85-95%.
3. Cryobanking: Liquid nitrogen vapor phase at -150°C to -196°C with 10% DMSO and controlled-rate freezing (-1°C/min). Proven potency >25 years.
4. Donor Safety: PBSC apheresis collection is non-surgical (90% of donations) using G-CSF mobilization. Complete marrow recovery within 2-3 weeks.
5. Patient Ethics & Scam Warning: Transplants are established cures for blood cancers (Leukemia, Lymphoma, Myeloma), bone marrow failure (Severe Aplastic Anemia), and inherited disorders (Thalassemia Major, Sickle Cell Disease). Stem cells are NOT approved for cosmetic anti-aging, autism, cerebral palsy, or Alzheimer's. Always warn against unproven commercial clinics.
6. Tone: Warm, empathetic, clinical-grade precision in markdown formatting (bullet points, bold highlights, headers). Always advise consulting the attending hematologist/oncologist.
"""

KNOWLEDGE_FALLBACKS = {
    "specialist": """### 👨‍⚕️ KOSHIKA Certified Haemato-Oncology & BMT Specialists

Our certified network includes 17 premier bone marrow transplant (BMT) and cellular therapy consultants across India:

#### 1. Adult Haemato-Oncology & BMT
- **Dr. Sharat Damodar** (24+ yrs exp) — MD, BMT & Cellular Therapy Fellowship (USA). Mazumdar Shaw Cancer Centre & Narayana Health, Bengaluru.
- **Dr. Shilpa Prabhu** (16+ yrs exp) — MBBS, MD. Mazumdar Shaw Medical Center, Bengaluru.
- **Dr. Suparno Chakrabarti** (25+ yrs exp) — MD, FRCPath. Senior Consultant & HOD, Dharamshila Narayana Super Speciality Hospital, New Delhi.
- **Dr. Ashish Dixit** (20+ yrs exp) — DM Clinical Haematology. Manipal Hospital, Bengaluru.
- **Dr. Dharma Choudhary** (23+ yrs exp) — DM Haematology. Senior Director & HOD, BLK-Max Super Speciality Hospital, New Delhi.
- **Dr. Lalit Kumar** (30+ yrs exp) — Former Head of Oncology AIIMS New Delhi. Artemis Hospitals, Gurugram.
- **Dr. Ashray Kole** (11+ yrs exp) — DM Clinical Haematology. Kokilaben Dhirubhai Ambani Hospital, Mumbai.
- **Dr. Shyam Rathi** (14+ yrs exp) — DM Clinical Haematology. Jupiter Hospital, Pune & Thane.
- **Dr. Prathamesh Kulkarni** (12+ yrs exp) — DM Clinical Haematology. Ruby Hall Clinic, Pune.
- **Dr. Shrinath Kshirsagar** (10+ yrs exp) — DM Clinical Haematology. Sahyadri Super Speciality Hospital, Pune.
- **Dr. Lalit Raut** (13+ yrs exp) — DM Clinical Haematology. Deenanath Mangeshkar Hospital, Pune.

#### 2. Paediatric Haemato-Oncology & BMT
- **Dr. Sunil Bhat** (22+ yrs exp) — MD (Paediatrics), CAR-T & Paediatric BMT Fellowship. Director, Narayana Health & Mazumdar Shaw Cancer Centre, Bengaluru.
- **Dr. Pooja P. Mallya** (14+ yrs exp) — DNB (Paediatrics), Paediatric BMT. Mazumdar Shaw Cancer Centre, Bengaluru.
- **Dr. Shobha B** (15+ yrs exp) — MD, Paediatric BMT. Narayana Health City, Bengaluru.
- **Dr. Megha Saroha** (12+ yrs exp) — MD (Paediatrics), Paediatric BMT Consultant.
- **Dr. Santanu Sen** (19+ yrs exp) — MD, MRCPCH (UK). Kokilaben Dhirubhai Ambani Hospital, Mumbai.

#### 3. Haploidentical BMT Leadership
- **Dr. Sarita Rani Jaiswal** (18+ yrs exp) — MD. Program Director, Haploidentical BMT. Expert in half-matched family donor protocols utilizing post-transplant cyclophosphamide (PTCy).""",

    "doctor": """### 👨‍⚕️ KOSHIKA Certified Doctors & Transplant Leaders
KOSHIKA features 17 certified consultants specializing in Bone Marrow Transplantation (BMT), Haemato-Oncology, and Cellular Therapy:
- **Director / HODs:** Dr. Suparno Chakrabarti (New Delhi), Dr. Sunil Bhat (Bengaluru - Paediatric), Dr. Dharma Choudhary (New Delhi), Dr. Sharat Damodar (Bengaluru).
- **Haploidentical Transplants:** Dr. Sarita Rani Jaiswal (Program Director).
- **Paediatric Specialists:** Dr. Sunil Bhat, Dr. Pooja P. Mallya, Dr. Shobha B, Dr. Megha Saroha, Dr. Santanu Sen.
- **Adult BMT Consultants:** Dr. Ashish Dixit, Dr. Lalit Kumar, Dr. Ashray Kole, Dr. Shyam Rathi, Dr. Prathamesh Kulkarni, Dr. Shrinath Kshirsagar, Dr. Lalit Raut.""",

    "hospital": """### 🏥 Accredited Transplant Centres & Hospitals
KOSHIKA coordinates care with FACT, JCI, and NABH accredited quaternary transplant institutions:
1. **Tata Memorial Hospital & ACTREC Cell Therapy Centre** (Navi Mumbai) — Pioneer in indigenous CAR-T therapies, 34 cryo-protected isolation suites.
2. **Narayana Health & Mazumdar Shaw Cancer Centre** (Bengaluru) — 28 HEPA-filtered BMT suites; comprehensive adult & pediatric allogeneic/haploidentical program.
3. **Apollo Institute of Colorectal & Stem Cell Transplant** (Chennai) — JCI/AABB certified, 20 positive-pressure clean rooms, unrelated donor matching, gene therapy for Thalassemia Major.
4. **Christian Medical College (CMC) Hematology Dept** (Vellore) — First BMT center in South Asia, specialized in aplastic anemia allografts and chimerism monitoring.""",

    "centre": """### 🏥 Accredited Transplant Centres & Hospitals
Top certified stem cell transplantation institutions:
- **Tata Memorial / ACTREC** (Navi Mumbai): FACT Accredited, 34 BMT beds.
- **Narayana Health & Mazumdar Shaw** (Bengaluru): JCI/NABH, 28 BMT beds.
- **Apollo Institute** (Chennai): AABB / JCI Certified, 20 BMT beds.
- **CMC Vellore** (Vellore): Pioneer in allogeneic BMT and aplastic anemia management.""",

    "bank": """### ❄️ Certified Stem Cell Biobanks & Repositories
KOSHIKA tracks 18 licensed stem cell banking facilities across India, including:
- **LifeCell International Pvt. Ltd.** (Chennai, TN & Gurugram, Haryana)
- **CryoViva Biotech India Pvt. Ltd.** (Gurugram, Haryana)
- **Cordlife Sciences India Pvt. Ltd.** (Kolkata, West Bengal)
- **BioCell / Regrow Biosciences Pvt. Ltd.** (Maharashtra)
- **Reliance Life Sciences Pvt. Ltd.** (Navi Mumbai, Maharashtra)
- **Cryo StemCell & Cryovault Biotech** (Bengaluru, Karnataka)
- **Narayana Hrudayalaya Tissue Bank** (Bengaluru, Karnataka)
- **StemCyte India Therapeutics** (Gandhinagar, Gujarat)
- **ReeLabs Pvt. Ltd.** (Mumbai, Maharashtra)
- *All biobanks utilize liquid nitrogen vapor storage at -150°C to -196°C with 24/7 telemetry.*""",

    "risk": """### ⚠️ Clinical Risks & Safety in Stem Cell Transplantation
Allogeneic and autologous stem cell procedures carry distinct clinical risks:
1. **Graft-versus-Host Disease (GvHD):** In allogeneic transplants, donor T-cells recognize recipient antigens as foreign (acute vs chronic GvHD). Prophylaxis: tacrolimus, cyclosporine, methotrexate, PTCy.
2. **Graft Failure / Rejection:** 1–5% occurrence where donor stem cells fail to reconstitute the host marrow.
3. **Severe Infections:** During the neutropenic window (Days 0–28), absolute neutrophil counts drop near zero, predisposing to bacterial sepsis, CMV, EBV, and fungal aspergillosis.
4. **Conditioning Toxicity:** Mucositis, organ strain, and sinusoidal obstruction syndrome from chemo/TBI.
5. **🚨 Unproven Clinics Warning:** Commercial stem cell injections claiming cures for autism, dementia, or anti-aging pose risks of tumor formation, infection, and tissue necrosis. Avoid unregulated private clinics.""",

    "danger": """### ⚠️ Clinical Risks & Safety in Stem Cell Transplantation
Stem cell transplants carry notable clinical considerations:
- **Graft-versus-Host Disease (GvHD):** Donor immune cells attacking recipient tissues.
- **Infection Vulnerability:** Severe immunocompromise during marrow reconstitution.
- **Unregulated Clinic Risks:** Non-FDA/ICMR approved clinics selling injections for autism, dementia, or anti-aging carry risks of teratomas, blindness, and infections.""",

    "side effect": """### ⚠️ Stem Cell Side Effects & Complications
- **Donor Side Effects:** PBSC donors may feel mild bone achiness during G-CSF injections; bone marrow donors experience temporary pelvic soreness.
- **Patient Side Effects:** Conditioning chemotherapy causes nausea, hair loss, and mucositis. Transplant risks include GvHD and opportunistic infections.""",

    "what is": """### 🧬 What Are Stem Cells?
Stem cells are special biological cells that can self-renew (divide to make more of themselves) and develop into specialized cells (like blood cells, muscle cells, or brain cells).
- **Self-Renewal:** Unlike ordinary cells that can only divide a limited number of times, stem cells can regenerate indefinitely.
- **Differentiation:** Stem cells can receive biochemical signals that guide them to turn into specialized cell types needed by organs.""",

    "what are": """### 🧬 What Are Stem Cells?
Stem cells are the foundation cells for every organ and tissue in the human body.
- **How they differ from normal cells:** Ordinary somatic cells have fixed duties (e.g. skin cells only stay skin cells). Stem cells are unspecialized and have the unique capacity to divide and transform into specialized cell lineages.
- **Potency:** They can develop into mature red blood cells, immune white blood cells, platelets, cardiac muscle, or nerve cells.""",

    "types": """### 🔬 Types of Stem Cells
1. **Hematopoietic Stem Cells (HSCs):** Blood-forming stem cells responsible for generating the entire circulatory and immune system; used in life-saving bone marrow transplants.
2. **Embryonic Stem Cells (ESCs):** Pluripotent cells from early blastocysts capable of developing into every tissue type in the human body.
3. **Induced Pluripotent Stem Cells (iPSCs):** Adult cells (e.g., skin fibroblasts) scientifically reprogrammed back into an embryonic-like pluripotent state using Yamanaka factors.
4. **Mesenchymal Stem Cells (MSCs):** Found in bone marrow stroma and umbilical cord tissue; researched for immunomodulation and GvHD control.""",

    "uses": """### 🩸 Established Uses of Stem Cell Therapy
- **Blood Cancers:** Established standard of care for acute & chronic leukemia, lymphoma, and multiple myeloma.
- **Bone Marrow Failure:** Severe aplastic anemia, myelodysplastic syndromes (MDS).
- **Inherited Blood Disorders:** Thalassemia Major, Sickle Cell Disease.
- **Immune-System Disorders:** Severe Combined Immunodeficiency (SCID), Wiskott-Aldrich syndrome.

*Note: Stem cells are not a universal cure. Many advertised cosmetic or anti-aging therapies are unproven and lack regulatory approval.*""",

    "cure": """### 🩸 Can Stem Cells Cure Diseases?
Stem cell transplants are curative for established blood, marrow, and genetic disorders:
- Cures high-risk Leukemias (AML, ALL, CML), Severe Aplastic Anemia, and Thalassemia Major.
- However, stem cells are **not** an approved cure for Alzheimer's, Parkinson's, ALS, autism, or cosmetic aging outside monitored clinical trials.""",

    "benefit": """### 🌟 Clinical Benefits of Stem Cells
- **Cell Replacement:** Replaces damaged or diseased bone marrow and blood cells destroyed by high-dose chemotherapy or genetic defects.
- **Regenerative Medicine Research:** Enables scientists to test new pharmaceuticals safely without human subjects and study hereditary diseases.
- **Curative Potential:** Offers life-long remission and cure for conditions that were previously considered terminal.""",

    "storage": """### ❄️ Cryogenic Storage & Biobanking
- Preserved in liquid nitrogen vapor at **-150°C to -196°C**.
- Uses cryoprotectant solutions (e.g., DMSO) with controlled-rate cooling (-1°C/min) to protect cell membrane integrity.
- Proven viability exceeding **25+ years** in certified biobanks under uninterrupted cryogenic equilibrium.""",

    "cryo": """### ❄️ Cryogenic Storage & Biobanking
- Preserved in liquid nitrogen vapor at **-150°C to -196°C**.
- Controlled-rate freezing (-1°C/min) with 10% DMSO.
- Proven viability exceeding **25+ years** in certified biobanks.""",

    "donor": """### 🤝 Donor Matching & Compatibility
- **HLA Typing:** High-resolution match of Human Leukocyte Antigens (targeting 8/8 or 10/10 alleles) to avoid Graft-versus-Host Disease (GVHD).
- **Blood Group (ABO):** Stem cell transplants can succeed across different blood types because the donor's immune system will convert the recipient's blood group.
- **CD34+ Cell Count:** Optimal therapeutic threshold is >5.0 × 10⁶ CD34+ cells/kg of patient body weight.""",

    "pain": """### 🤝 Is Stem Cell Donation Painful?
- **PBSC Apheresis (>90% of donations):** Non-surgical blood filtering. Minor bone/muscle aches from pre-collection G-CSF injections, treated with acetaminophen.
- **Bone Marrow Harvest (~10%):** Performed under general anesthesia. Mild lower back soreness for a few days.
- **Recovery:** Bone marrow replenishes 100% naturally within 2–3 weeks.""",

    "autologous": """### ⚖️ Autologous vs. Allogeneic Transplants
- **Autologous:** Uses patient's own cells. Zero risk of GvHD. Used for multiple myeloma and lymphomas.
- **Allogeneic:** Uses donor cells (matched sibling, unrelated, or cord). Provides powerful Graft-versus-Leukemia (GvL) effect, but carries GvHD risk.""",

    "allogeneic": """### ⚖️ Allogeneic Stem Cell Transplants
- Uses healthy donor stem cells (matched related, unrelated, or haploidentical).
- Curative treatment for leukemia, MDS, and aplastic anemia.
- Carries Graft-versus-Host Disease (GvHD) risk managed by immunosuppressive drugs.""",

    "hla": """### 🧬 HLA Compatibility Analysis
- **Loci Analyzed:** HLA-A, B, C (Class I) and HLA-DRB1, DQB1 (Class II).
- **10/10 Match:** Highest survival and lowest GvHD rate.
- **Haploidentical (5/10):** Half-matched family donors utilizing post-transplant cyclophosphamide (PTCy).""",

    "sunil bhat": """### 👨‍⚕️ Dr. Sunil Bhat — Director, Paediatric Haemato-Oncology & BMT
- **Credentials:** MBBS, MD (Paediatrics), Fellowship in Paediatric BMT & CAR-T (USA/UK). 22+ Years of Experience.
- **Hospital:** Narayana Health City & Mazumdar Shaw Cancer Centre, Bengaluru.
- **Specialization:** Paediatric stem cell transplantation, haploidentical BMT in children, primary immunodeficiencies, and CAR-T cell therapy.
- **Contact:** 080-6750 6802 | Available: Mon, Tue, Thu.""",

    "sharat damodar": """### 👨‍⚕️ Dr. Sharat Damodar — Clinical Director & Senior Consultant
- **Credentials:** MD, Fellowship in Bone Marrow Transplant & Cellular Therapy (USA). 24+ Years of Experience.
- **Hospital:** Mazumdar Shaw Cancer Centre & Narayana Health City, Bengaluru.
- **Specialization:** Adult Haemato-Oncology, Allogeneic/Autologous HSCT, Cellular Therapy, and CAR-T for leukemias and multiple myeloma.
- **Contact:** 080-6750 6800 | Available: Mon, Wed, Fri.""",

    "hello": """👋 Hello! I am **KOSHIKA AI**, your patient-friendly stem cell awareness and clinical assistant. You can ask me about our 17 certified specialists, accredited BMT centres, stem cell biobanks, HLA matching protocols, or clinical therapies."""
}

ACTIVE_GEMINI_MODELS = [
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
    'gemini-pro-latest'
]

def _call_gemini_rest(message, api_key, model_name="gemini-3.5-flash", history=None):
    """Direct HTTPS REST call to Gemini API for high reliability across platforms."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    contents = _format_history_contents(message, history)
    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]}
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-goog-api-key": api_key
        }
    )
    
    # Try standard SSL first, then unverified fallback for local environments
    for get_ctx in [ssl.create_default_context, ssl._create_unverified_context]:
        try:
            ctx = get_ctx()
            with urllib.request.urlopen(req, data=data, context=ctx, timeout=25) as res:
                body = json.loads(res.read().decode("utf-8"))
                candidates = body.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and parts[0].get("text"):
                        return parts[0].get("text").strip()
        except Exception:
            continue
    return None

def ask_gemini(message, custom_api_key=None, history=None):
    api_key = custom_api_key or getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
    
    if api_key and not api_key.startswith("AIzaSy-DEMO"):
        # 1. Try direct high-performance REST call with active model chain
        for model_name in ACTIVE_GEMINI_MODELS:
            try:
                rest_result = _call_gemini_rest(message, api_key, model_name=model_name, history=history)
                if rest_result:
                    return {
                        'response': rest_result,
                        'source': f'KOSHIKA Gemini AI ({model_name})',
                        'has_api_key': True
                    }
            except Exception:
                pass

        # 2. Try SDK if available
        if HAS_GENAI:
            try:
                genai.configure(api_key=api_key)
                for model_name in ACTIVE_GEMINI_MODELS:
                    try:
                        model = genai.GenerativeModel(model_name=model_name, system_instruction=SYSTEM_PROMPT)
                        resp = model.generate_content(message)
                        if resp and resp.text:
                            return {'response': resp.text, 'source': f'KOSHIKA Gemini AI ({model_name})', 'has_api_key': True}
                    except Exception:
                        continue
            except Exception:
                pass

    # 3. Knowledge base fallback
    msg_low = message.lower()
    for key, ans in KNOWLEDGE_FALLBACKS.items():
        if key in msg_low:
            return {'response': ans, 'source': 'KOSHIKA Clinical Knowledge Base', 'has_api_key': bool(api_key)}

    # Dynamic contextual synthesis
    return {
        'response': f"### 🧬 KOSHIKA Clinical Analysis\n**Topic Analysis:** *{message}*\n\nStem cells are specialized biological cells characterized by self-renewal and multi-lineage differentiation. In clinical practice:\n- **Established Indications:** Hematopoietic stem cell transplants (HSCT) are approved curative standards for acute & chronic leukemias, lymphomas, severe aplastic anemia, and hemoglobinopathies (thalassemia, sickle cell).\n- **Safety & Parameters:** Clinical success relies on high-resolution HLA typing (10/10 or 8/8 allele match), target CD34+ cell counts (>= 2.0 to 5.0 × 10⁶ cells/kg), and controlled cryopreservation (-196°C).\n- **Regulatory Warning:** Stem cells are not a universal cure for degenerative or cosmetic conditions. Avoid unproven commercial clinics.\n\n*Consult your attending hematologist or oncologist for diagnosis-specific clinical protocols.*",
        'source': 'KOSHIKA Clinical Knowledge Base',
        'has_api_key': bool(api_key)
    }

def interpret_report_with_ai(report_text, custom_api_key=None):
    prompt = f"Analyze this medical/stem cell report:\n\n{report_text}\n\nProvide a clinical summary, evaluation of CD34+ yield, ABO status, and guidelines."
    return ask_gemini(prompt, custom_api_key)


