-- Stem Cell DB schema and sample data
CREATE DATABASE IF NOT EXISTS stemcelldb;
USE stemcelldb;

-- patients
CREATE TABLE IF NOT EXISTS patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  age INT,
  blood_group VARCHAR(5),
  contact VARCHAR(50),
  disease VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- donors
CREATE TABLE IF NOT EXISTS donors (
  donor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  age INT,
  blood_group VARCHAR(5),
  contact VARCHAR(50),
  donation_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- storage
CREATE TABLE IF NOT EXISTS storage (
  storage_id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT,
  storage_location VARCHAR(100),
  collected_date DATE,
  expiry_date DATE,
  units INT DEFAULT 1,
  FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE SET NULL
);

-- staff
CREATE TABLE IF NOT EXISTS staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  contact VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- research
CREATE TABLE IF NOT EXISTS research (
  research_id INT AUTO_INCREMENT PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  lead_scientist VARCHAR(150),
  start_date DATE,
  status VARCHAR(50),
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- inventory
CREATE TABLE IF NOT EXISTS inventory (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(150) NOT NULL,
  quantity INT DEFAULT 0,
  unit VARCHAR(50),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- sample inserts
INSERT INTO donors (name, age, blood_group, contact, donation_date, notes) VALUES
('Ravi Kumar', 28, 'A+', '9876543210', '2025-01-15', 'Healthy donor'),
('Sita Sharma', 35, 'B+', '9123456780', '2025-06-10', 'Repeat donor');

INSERT INTO patients (name, age, blood_group, contact, disease) VALUES
('Rahul Verma', 45, 'A+', '9988776655', 'Leukemia'),
('Anita Desai', 30, 'B+', '9870012345', 'Aplastic anemia');

INSERT INTO staff (name, role, department, contact) VALUES
('Dr. Meera Joshi', 'Lead Scientist', 'Research', '9012345678'),
('Amit Singh', 'Lab Technician', 'Storage', '9090909090');

INSERT INTO research (project_name, lead_scientist, start_date, status, summary) VALUES
('Stem cell engraftment study', 'Dr. Meera Joshi', '2025-03-01', 'Ongoing', 'Study on engraftment rates');

INSERT INTO inventory (item_name, quantity, unit) VALUES
('Cryo vials', 200, 'pcs'),
('Liquid Nitrogen', 50, 'litres');

INSERT INTO storage (donor_id, storage_location, collected_date, expiry_date, units) VALUES
(1, 'CryoTank-A1', '2025-01-15', '2035-01-15', 2),
(2, 'CryoTank-B3', '2025-06-10', '2035-06-10', 1);
