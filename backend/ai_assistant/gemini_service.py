import os
from django.conf import settings

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

SYSTEM_PROMPT = "You are KOSHIKA AI Assistant, specializing in patient-friendly stem cell awareness, HCST bone marrow transplantation protocols, cryopreservation, donor compatibility matching, and regenerative medicine. Provide clear, accurate, reassuring, clinical-grade answers in markdown format."

KNOWLEDGE_FALLBACKS = {
    "what is": "### 🧬 What Are Stem Cells?\nStem cells are special biological cells that can self-renew (divide to make more of themselves) and develop into specialized cells (like blood cells, muscle cells, or brain cells).\n\n- **Self-Renewal:** Unlike ordinary cells that can only divide a limited number of times, stem cells can regenerate indefinitely.\n- **Differentiation:** Stem cells can receive biochemical signals that guide them to turn into specialized cell types needed by organs.",
    "what are": "### 🧬 What Are Stem Cells?\nStem cells are the foundation cells for every organ and tissue in the human body.\n\n- **How they differ from normal cells:** Ordinary somatic cells have fixed duties (e.g. skin cells only stay skin cells). Stem cells are unspecialized and have the unique capacity to divide and transform into specialized cell lineages.\n- **Potency:** They can develop into mature red blood cells, immune white blood cells, platelets, cardiac muscle, or nerve cells.",
    "types": "### 🔬 Types of Stem Cells\n1. **Embryonic Stem Cells (ESCs):** Pluripotent cells from early blastocysts capable of developing into every tissue type in the human body.\n2. **Adult Stem Cells:** Tissue-specific multipotent cells found in bone marrow, peripheral blood, and umbilical cord blood that maintain and repair specific organs.\n3. **Induced Pluripotent Stem Cells (iPSCs):** Adult cells (e.g., skin fibroblasts) scientifically reprogrammed back into an embryonic-like pluripotent state using Yamanaka factors.\n4. **Hematopoietic Stem Cells (HSCs):** Blood-forming stem cells responsible for generating the entire circulatory and immune system; used in life-saving bone marrow transplants.",
    "uses": "### 🩸 Established Uses of Stem Cell Therapy\n- **Blood Cancers:** Established standard of care for acute & chronic leukemia, lymphoma, and multiple myeloma.\n- **Bone Marrow Failure:** Severe aplastic anemia, myelodysplastic syndromes (MDS).\n- **Inherited Blood Disorders:** Thalassemia Major, Sickle Cell Disease.\n- **Immune-System Disorders:** Severe Combined Immunodeficiency (SCID), Wiskott-Aldrich syndrome.\n\n*Note: Stem cells are not a universal cure. Many advertised cosmetic or anti-aging therapies are unproven and lack regulatory approval.*",
    "benefit": "### 🌟 Clinical Benefits of Stem Cells\n- **Cell Replacement:** Replaces damaged or diseased bone marrow and blood cells destroyed by high-dose chemotherapy or genetic defects.\n- **Regenerative Medicine Research:** Enables scientists to test new pharmaceuticals safely without human subjects and study hereditary diseases.\n- **Curative Potential:** Offers life-long remission and cure for conditions that were previously considered terminal.",
    "storage": "### ❄️ Cryogenic Storage & Biobanking\n- Preserved in liquid nitrogen vapor at **-150°C to -196°C**.\n- Uses cryoprotectant solutions (e.g., DMSO) with controlled-rate cooling to protect cell membrane integrity.\n- Proven viability exceeding **25+ years** in certified biobanks under uninterrupted cryogenic equilibrium.",
    "donor": "### 🤝 Donor Matching & Compatibility\n- **HLA Typing:** High-resolution match of Human Leukocyte Antigens (targeting 8/8 or 10/10 alleles) to avoid Graft-versus-Host Disease (GVHD).\n- **Blood Group (ABO):** Stem cell transplants can succeed across different blood types because the donor's immune system will convert the recipient's blood group.\n- **CD34+ Cell Count:** Optimal therapeutic threshold is >5.0 × 10⁶ CD34+ cells/kg of patient body weight.",
    "hello": "👋 Hello! I am **KOSHIKA AI**, your patient-friendly stem cell awareness and clinical assistant. You can ask me about what stem cells are, cell types (ESCs, Adult, iPSCs, HSCs), proven therapies, donor HLA matching, or biobank cryopreservation."
}

def ask_gemini(message, custom_api_key=None):
    api_key = custom_api_key or getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
    if api_key and HAS_GENAI:
        try:
            genai.configure(api_key=api_key)
            for model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-pro']:
                try:
                    model = genai.GenerativeModel(model_name=model_name, system_instruction=SYSTEM_PROMPT)
                    resp = model.generate_content(message)
                    if resp and resp.text:
                        return {'response': resp.text, 'source': f'KOSHIKA Gemini AI ({model_name})', 'has_api_key': True}
                except Exception:
                    continue
        except Exception:
            pass

    msg_low = message.lower()
    for key, ans in KNOWLEDGE_FALLBACKS.items():
        if key in msg_low:
            return {'response': ans, 'source': 'KOSHIKA Clinical Knowledge Base', 'has_api_key': bool(api_key)}

    return {
        'response': f"### 🧬 KOSHIKA Clinical Analysis\nIn response to your query: **{message}**\n\nStem cells are specialized cells capable of self-renewal and multi-lineage differentiation. In modern medicine, hematopoietic stem cell transplants are established treatments for leukemia, lymphoma, severe aplastic anemia, and sickle cell disease.\n\nFor clinical matching, high-resolution HLA allele matching (8/8 or 10/10) and CD34+ stem cell yields (>2.0–5.0 × 10⁶ cells/kg) are critical factors.\n\n*Note: KOSHIKA provides evidence-based educational support. Stem cells are not a universal cure. Consult your licensed hematologist for personalized clinical care.*",
        'source': 'KOSHIKA Clinical Knowledge Base',
        'has_api_key': bool(api_key)
    }

def interpret_report_with_ai(report_text, custom_api_key=None):
    prompt = f"Analyze this medical/stem cell report:\n\n{report_text}\n\nProvide a clinical summary, evaluation of CD34+ yield, ABO status, and guidelines."
    return ask_gemini(prompt, custom_api_key)
