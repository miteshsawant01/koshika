import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_clinical_report_pdf(stats, patients, donors, storage_items, inventory_items):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#0284c7'),
        spaceAfter=12
    )
    story.append(Paragraph('KOSHIKA — Stem Cell Awareness & Biobank Clinical Report', title_style))
    story.append(Paragraph(f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', styles['Normal']))
    story.append(Spacer(1, 15))

    summary_data = [
        ['Metric', 'Count', 'Metric', 'Count'],
        ['Total Patients', str(stats.get('total_patients', 0)), 'Total Donors', str(stats.get('total_donors', 0))],
        ['Storage Units', str(stats.get('total_storage_units', 0)), 'Staff Members', str(stats.get('total_staff', 0))],
        ['Research Projects', str(stats.get('total_research', 0)), 'Inventory Items', str(stats.get('total_inventory', 0))],
    ]
    t_summary = Table(summary_data, colWidths=[130, 130, 130, 130])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0052cc')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 20))

    story.append(Paragraph('Recent Patients', styles['Heading2']))
    p_data = [['ID', 'Name', 'Age', 'Blood Group', 'Disease']]
    for p in patients[:6]:
        p_data.append([str(p.patient_id), p.name, str(p.age or '-'), p.blood_group or '-', p.disease or '-'])
    t_p = Table(p_data, colWidths=[40, 180, 50, 90, 160])
    t_p.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#dddddd')),
    ]))
    story.append(t_p)
    story.append(Spacer(1, 20))

    story.append(Paragraph('Critical Inventory Stocks', styles['Heading2']))
    inv_data = [['Item Name', 'Quantity', 'Unit', 'Last Updated']]
    for inv in inventory_items[:6]:
        inv_data.append([inv.item_name, str(inv.quantity), inv.unit, inv.last_updated.strftime("%Y-%m-%d") if inv.last_updated else '-'])
    t_inv = Table(inv_data, colWidths=[200, 100, 100, 120])
    t_inv.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#27ae60')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#dddddd')),
    ]))
    story.append(t_inv)

    doc.build(story)
    buffer.seek(0)
    return buffer
