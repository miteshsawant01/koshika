import re
import os
import shutil
from pathlib import Path
from PIL import Image
import pytesseract
from django.conf import settings

# Setup tesseract path if found in common Windows locations
possible_paths = [
    getattr(settings, 'TESSERACT_CMD', ''),
    r'C:\Program Files\Tesseract-OCR\tesseract.exe',
    r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
    shutil.which('tesseract') or ''
]
for p in possible_paths:
    if p and os.path.exists(p):
        pytesseract.pytesseract.tesseract_cmd = p
        break

def extract_text_from_image(image_path):
    text = ''
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
    except Exception as e:
        text = f'[OCR Notice: Tesseract engine not found on PATH or could not read image: {str(e)}]'
    return text

def parse_medical_report(text):
    data = {
        'patient_name': None,
        'age': None,
        'blood_group': None,
        'cd34_count': None,
        'viability': None,
        'wbc_count': None,
        'disease': None,
        'test_date': None,
        'flags': []
    }

    # Blood group regex
    bg_match = re.search(r'(?:Blood\s*Group|Blood\s*Type|ABO\s*Group)[\s:]*([A|B|AB|O][\+\-]|(?:A|B|AB|O)\s*(?:Positive|Negative|Pos|Neg))', text, re.I)
    if bg_match:
        bg = bg_match.group(1).upper().replace('POSITIVE', '+').replace('POS', '+').replace('NEGATIVE', '-').replace('NEG', '-').replace(' ', '')
        data['blood_group'] = bg

    # Patient name
    name_match = re.search(r'(?:Patient\s*Name|Donor\s*Name|Name)[\s:]*([A-Za-z\s\.\,\-]+)', text, re.I)
    if name_match:
        cand = name_match.group(1).split('\n')[0].strip()
        # strip subsequent headers if matched
        cand = re.split(r'(?:Age|Sex|Gender|DOB|Date)', cand, flags=re.I)[0].strip()
        if len(cand) > 2:
            data['patient_name'] = cand

    # Age
    age_match = re.search(r'(?:Age|Years)[\s:]*(\d{1,2})\s*(?:Y|Yrs|Years)?', text, re.I)
    if age_match:
        data['age'] = int(age_match.group(1))

    # CD34+ Count
    cd34_match = re.search(r'(?:CD34\+?|Stem\s*Cell\s*Count)[\s:]*([\d\.]+)', text, re.I)
    if cd34_match:
        data['cd34_count'] = float(cd34_match.group(1))

    # Viability %
    viab_match = re.search(r'(?:Viability|Cell\s*Viability)[\s:]*([\d\.]+)\s*%', text, re.I)
    if viab_match:
        data['viability'] = float(viab_match.group(1))

    # WBC count
    wbc_match = re.search(r'(?:WBC|White\s*Blood\s*Cells)[\s:]*([\d\.,]+)', text, re.I)
    if wbc_match:
        data['wbc_count'] = wbc_match.group(1)

    # Diagnosis / Disease
    disease_match = re.search(r'(?:Diagnosis|Indication|Disease|Clinical\s*Condition)[\s:]*([A-Za-z\s\-]+)', text, re.I)
    if disease_match:
        cand_d = disease_match.group(1).split('\n')[0].strip()
        if len(cand_d) > 2:
            data['disease'] = cand_d

    # Clinical flags
    if data['viability'] and data['viability'] < 80:
        data['flags'].append('Low Cell Viability (<80%) - Review storage integrity')
    if data['cd34_count'] and data['cd34_count'] < 2.0:
        data['flags'].append('Sub-optimal CD34+ count (<2.0 x10^6 cells/kg)')

    return data
