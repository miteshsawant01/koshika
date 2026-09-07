-- triggers_and_procedures.sql
-- Creates an audit table and example triggers & stored procedures for key tables.
-- Run on your test database and review before applying to production.

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  table_name VARCHAR(128) NOT NULL,
  operation ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  record_id BIGINT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by VARCHAR(128) NULL,
  old_values JSON NULL,
  new_values JSON NULL
) ENGINE=InnoDB;

DELIMITER $$

-- Patients triggers
CREATE TRIGGER trg_patients_ai AFTER INSERT ON patients
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, new_values)
  VALUES('patients','INSERT',NEW.patient_id, JSON_OBJECT('name',NEW.name,'age',NEW.age,'blood_group',NEW.blood_group,'contact',NEW.contact,'disease',NEW.disease));
END$$

CREATE TRIGGER trg_patients_au AFTER UPDATE ON patients
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
  VALUES('patients','UPDATE',NEW.patient_id,
    JSON_OBJECT('name',OLD.name,'age',OLD.age,'blood_group',OLD.blood_group,'contact',OLD.contact,'disease',OLD.disease),
    JSON_OBJECT('name',NEW.name,'age',NEW.age,'blood_group',NEW.blood_group,'contact',NEW.contact,'disease',NEW.disease)
  );
END$$

CREATE TRIGGER trg_patients_ad AFTER DELETE ON patients
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values)
  VALUES('patients','DELETE',OLD.patient_id, JSON_OBJECT('name',OLD.name,'age',OLD.age,'blood_group',OLD.blood_group,'contact',OLD.contact,'disease',OLD.disease));
END$$

-- Donors triggers
CREATE TRIGGER trg_donors_ai AFTER INSERT ON donors
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, new_values)
  VALUES('donors','INSERT',NEW.donor_id, JSON_OBJECT('name',NEW.name,'age',NEW.age,'blood_group',NEW.blood_group,'contact',NEW.contact,'donation_date',NEW.donation_date));
END$$

CREATE TRIGGER trg_donors_au AFTER UPDATE ON donors
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
  VALUES('donors','UPDATE',NEW.donor_id,
    JSON_OBJECT('name',OLD.name,'age',OLD.age,'blood_group',OLD.blood_group,'contact',OLD.contact,'donation_date',OLD.donation_date),
    JSON_OBJECT('name',NEW.name,'age',NEW.age,'blood_group',NEW.blood_group,'contact',NEW.contact,'donation_date',NEW.donation_date)
  );
END$$

CREATE TRIGGER trg_donors_ad AFTER DELETE ON donors
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values)
  VALUES('donors','DELETE',OLD.donor_id, JSON_OBJECT('name',OLD.name,'age',OLD.age));
END$$

-- Inventory triggers
CREATE TRIGGER trg_inventory_ai AFTER INSERT ON inventory
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, new_values)
  VALUES('inventory','INSERT',NEW.item_id, JSON_OBJECT('item_name',NEW.item_name,'quantity',NEW.quantity,'unit',NEW.unit));
END$$

CREATE TRIGGER trg_inventory_au AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
  VALUES('inventory','UPDATE',NEW.item_id,
    JSON_OBJECT('item_name',OLD.item_name,'quantity',OLD.quantity,'unit',OLD.unit),
    JSON_OBJECT('item_name',NEW.item_name,'quantity',NEW.quantity,'unit',NEW.unit)
  );
END$$

CREATE TRIGGER trg_inventory_ad AFTER DELETE ON inventory
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values)
  VALUES('inventory','DELETE',OLD.item_id, JSON_OBJECT('item_name',OLD.item_name,'quantity',OLD.quantity));
END$$

-- Research triggers
CREATE TRIGGER trg_research_ai AFTER INSERT ON research
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, new_values)
  VALUES('research','INSERT',NEW.research_id, JSON_OBJECT('project_name',NEW.project_name,'lead_scientist',NEW.lead_scientist,'start_date',NEW.start_date,'status',NEW.status));
END$$

CREATE TRIGGER trg_research_au AFTER UPDATE ON research
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values, new_values)
  VALUES('research','UPDATE',NEW.research_id,
    JSON_OBJECT('project_name',OLD.project_name,'lead_scientist',OLD.lead_scientist,'start_date',OLD.start_date,'status',OLD.status),
    JSON_OBJECT('project_name',NEW.project_name,'lead_scientist',NEW.lead_scientist,'start_date',NEW.start_date,'status',NEW.status)
  );
END$$

CREATE TRIGGER trg_research_ad AFTER DELETE ON research
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_values)
  VALUES('research','DELETE',OLD.research_id, JSON_OBJECT('project_name',OLD.project_name));
END$$

DELIMITER ;

-- Example stored procedures
-- Add patient using a stored procedure
DROP PROCEDURE IF EXISTS sp_add_patient;
DELIMITER $$
CREATE PROCEDURE sp_add_patient(
  IN p_name VARCHAR(255),
  IN p_age INT,
  IN p_bg VARCHAR(20),
  IN p_contact VARCHAR(255),
  IN p_disease VARCHAR(255)
)
BEGIN
  INSERT INTO patients (name, age, blood_group, contact, disease) VALUES (p_name, p_age, p_bg, p_contact, p_disease);
END$$
DELIMITER ;

-- Update patient example
DROP PROCEDURE IF EXISTS sp_update_patient;
DELIMITER $$
CREATE PROCEDURE sp_update_patient(
  IN p_id INT,
  IN p_name VARCHAR(255),
  IN p_age INT,
  IN p_bg VARCHAR(20),
  IN p_contact VARCHAR(255),
  IN p_disease VARCHAR(255)
)
BEGIN
  UPDATE patients SET name=p_name, age=p_age, blood_group=p_bg, contact=p_contact, disease=p_disease WHERE patient_id=p_id;
END$$
DELIMITER ;

-- Note: Add additional stored procedures as needed following these patterns.
-- When applying the file, make sure your MySQL user has CREATE TRIGGER and CREATE ROUTINE privileges.
