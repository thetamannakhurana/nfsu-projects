-- ============================================================
-- NFSU Projects Database - PostgreSQL Schema
-- National Forensic Sciences University
-- ============================================================

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS specializations CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS campuses CASCADE;

-- ============================================================
-- CAMPUSES TABLE
-- ============================================================
CREATE TABLE campuses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO campuses (name, location, state, code, description) VALUES
  ('Gandhinagar Campus', 'Gandhinagar', 'Gujarat', 'GUJ', 'Headquarters and main campus of NFSU'),
  ('Delhi Campus', 'New Delhi', 'Delhi', 'DEL', 'Established in collaboration with Institute of Criminology and Forensic Science'),
  ('Goa Campus', 'Goa', 'Goa', 'GOA', 'Features specialized forensic departments'),
  ('Tripura Campus', 'Agartala', 'Tripura', 'TRP', 'Located in Agartala, Tripura'),
  ('Bhopal Campus', 'Bhopal', 'Madhya Pradesh', 'BPL', 'Campus in the heart of India'),
  ('Pune Campus', 'Pune', 'Maharashtra', 'PNE', 'Campus in the educational hub of Maharashtra'),
  ('Guwahati Campus', 'Guwahati', 'Assam', 'GHY', 'Serving the North-East region'),
  ('Manipur Campus', 'Imphal', 'Manipur', 'MNP', 'North-East India campus'),
  ('Dharwad Campus', 'Dharwad', 'Karnataka', 'DWD', 'Campus in North Karnataka'),
  ('Bhubaneswar Campus', 'Bhubaneswar', 'Odisha', 'BBS', 'Transit campus in Odisha'),
  ('Chennai Campus', 'Chennai', 'Tamil Nadu', 'CHN', 'Transit campus in Tamil Nadu'),
  ('Nagpur Campus', 'Nagpur', 'Maharashtra', 'NGP', 'Transit campus in Nagpur'),
  ('Jaipur Campus', 'Jaipur', 'Rajasthan', 'JPR', 'Transit campus in Rajasthan'),
  ('Raipur Campus', 'Raipur', 'Chhattisgarh', 'RPR', 'Transit campus in Chhattisgarh'),
  ('International Campus - Uganda', 'Jinja', 'Uganda', 'UGA', 'International campus at Jinja, Uganda');

-- ============================================================
-- COURSES TABLE
-- ============================================================
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  degree_type VARCHAR(50) NOT NULL,  -- 'B.Tech', 'M.Tech', 'M.Sc', 'B.Sc-M.Sc', 'BBA-MBA', 'M.A', 'Ph.D'
  duration_years INTEGER NOT NULL,
  campus_id INTEGER REFERENCES campuses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common courses (can be customized per campus)
INSERT INTO courses (name, short_name, degree_type, duration_years, campus_id) VALUES
  -- Gujarat campus courses
  ('Bachelor of Technology', 'B.Tech', 'B.Tech', 4, 1),
  ('Master of Technology', 'M.Tech', 'M.Tech', 2, 1),
  ('M.Sc. Digital Forensics and Information Security', 'MSc DFIS', 'M.Sc', 2, 1),
  ('M.Sc. Forensic Science', 'MSc FS', 'M.Sc', 2, 1),
  ('B.Sc.-M.Sc. Forensic Science (Integrated)', 'BSc-MSc FS', 'B.Sc-M.Sc', 5, 1),
  ('B.Sc.-M.Sc. Cyber and Forensic Science (Integrated)', 'BSc-MSc CRFS', 'B.Sc-M.Sc', 5, 1),
  ('BBA-MBA (Forensic Accounting and Financial Crimes)', 'BBA-MBA', 'BBA-MBA', 5, 1),
  ('M.A. Criminology', 'MA Criminology', 'M.A', 2, 1),
  ('Ph.D.', 'PhD', 'Ph.D', 3, 1),
  -- Delhi campus courses
  ('Bachelor of Technology', 'B.Tech', 'B.Tech', 4, 2),
  ('Master of Technology', 'M.Tech', 'M.Tech', 2, 2),
  ('M.Sc. Digital Forensics and Information Security', 'MSc DFIS', 'M.Sc', 2, 2),
  ('M.Sc. Forensic Science', 'MSc FS', 'M.Sc', 2, 2),
  ('B.Sc.-M.Sc. Forensic Science (Integrated)', 'BSc-MSc FS', 'B.Sc-M.Sc', 5, 2),
  ('B.Sc.-M.Sc. Cyber and Forensic Science (Integrated)', 'BSc-MSc CRFS', 'B.Sc-M.Sc', 5, 2),
  ('BBA-MBA (Forensic Accounting and Financial Crimes)', 'BBA-MBA', 'BBA-MBA', 5, 2),
  ('M.A. Criminology', 'MA Criminology', 'M.A', 2, 2);

-- ============================================================
-- SPECIALIZATIONS TABLE
-- ============================================================
CREATE TABLE specializations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B.Tech specializations (apply to all B.Tech courses across campuses)
-- We'll insert for course_id 1 (Gujarat B.Tech) as reference
INSERT INTO specializations (name, code, course_id) VALUES
  ('Cyber Security', 'CS', 1),
  ('Digital Forensics', 'DF', 1),
  ('Information Technology', 'IT', 1),
  ('Computer Science and Engineering', 'CSE', 1),
  ('Electronics and Communication Engineering', 'ECE', 1),
  ('Artificial Intelligence and Machine Learning', 'AIML', 1),
  ('Data Science and Analytics', 'DSA', 1),
  ('Internet of Things', 'IOT', 1),
  -- M.Tech specializations
  ('Cyber Security', 'CS', 2),
  ('Digital Forensics', 'DF', 2),
  ('Information Security', 'IS', 2),
  ('Network Security', 'NS', 2),
  ('Forensic Science & Technology', 'FST', 2);

-- ============================================================
-- USERS TABLE (Faculty & Admins)
-- ============================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty')),
  campus_id INTEGER REFERENCES campuses(id),
  department VARCHAR(200),
  designation VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Default admin user (password: Admin@NFSU2024 - CHANGE IN PRODUCTION)
-- bcrypt hash for 'Admin@NFSU2024'
INSERT INTO users (name, email, password_hash, role, campus_id, designation) VALUES
  ('System Administrator', 'admin@nfsu.ac.in', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6d.hQGz0mW', 'admin', 1, 'System Administrator');

-- Note: The above hash is for 'Admin@NFSU2024'. Run db:seed to create with proper hashing.

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  
  -- Project Info
  title VARCHAR(500) NOT NULL,
  description TEXT,
  project_type VARCHAR(10) NOT NULL CHECK (project_type IN ('major', 'minor')),
  semester INTEGER CHECK (semester BETWEEN 1 AND 10),
  academic_year VARCHAR(20),  -- e.g., '2024-25'
  
  -- Student Info
  student_name VARCHAR(200) NOT NULL,
  student_email VARCHAR(200),
  roll_number VARCHAR(50),
  enrollment_number VARCHAR(50),
  
  -- Academic Info
  campus_id INTEGER NOT NULL REFERENCES campuses(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  specialization_id INTEGER REFERENCES specializations(id),
  batch_start_year INTEGER NOT NULL,
  batch_end_year INTEGER NOT NULL,
  
  -- Guide/Supervisor Info
  guide_name VARCHAR(200) NOT NULL,
  guide_email VARCHAR(200),
  guide_designation VARCHAR(200),
  co_guide_name VARCHAR(200),
  
  -- Project Details
  technologies TEXT[],           -- Array of technologies used
  keywords TEXT[],               -- Keywords/tags
  achievements TEXT,             -- What was achieved
  github_url VARCHAR(500),
  report_url VARCHAR(500),
  
  -- Status & Meta
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  added_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- INDEXES for Performance
-- ============================================================
CREATE INDEX idx_projects_campus ON projects(campus_id);
CREATE INDEX idx_projects_course ON projects(course_id);
CREATE INDEX idx_projects_batch ON projects(batch_start_year, batch_end_year);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_guide ON projects(guide_name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_specializations_course ON specializations(course_id);
CREATE INDEX idx_courses_campus ON courses(campus_id);

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================
-- Insert sample projects
INSERT INTO projects (
  title, description, project_type, semester, academic_year,
  student_name, student_email, roll_number,
  campus_id, course_id, specialization_id, batch_start_year, batch_end_year,
  guide_name, guide_email, guide_designation,
  technologies, keywords, achievements, status
) VALUES
(
  'AI-Powered Network Intrusion Detection System',
  'Developed a machine learning based intrusion detection system that monitors network traffic in real-time and identifies anomalous patterns indicative of cyber attacks. The system achieves 97.3% accuracy on the NSL-KDD dataset and can detect zero-day attacks using unsupervised learning techniques.',
  'major', 8, '2024-25',
  'Arjun Sharma', 'arjun.sharma@nfsu.ac.in', 'NFSU/GUJ/BTech/20/001',
  1, 1, 1, 2020, 2024,
  'Dr. Rakesh Patel', 'rakesh.patel@nfsu.ac.in', 'Associate Professor',
  ARRAY['Python', 'TensorFlow', 'Scikit-learn', 'Wireshark', 'Elasticsearch'],
  ARRAY['Machine Learning', 'Network Security', 'Intrusion Detection', 'AI'],
  'Published paper in IEEE conference. System deployed in university lab network. Achieved 97.3% detection accuracy.',
  'published'
),
(
  'Blockchain-based Digital Evidence Management System',
  'Designed and implemented a blockchain-based system for maintaining chain of custody for digital evidence in criminal investigations. Uses Ethereum smart contracts to create immutable audit trails.',
  'major', 8, '2024-25',
  'Priya Mehta', 'priya.mehta@nfsu.ac.in', 'NFSU/GUJ/BTech/20/042',
  1, 1, 2, 2020, 2024,
  'Dr. Sunita Verma', 'sunita.verma@nfsu.ac.in', 'Assistant Professor',
  ARRAY['Solidity', 'Ethereum', 'React', 'Node.js', 'IPFS', 'Web3.js'],
  ARRAY['Blockchain', 'Digital Forensics', 'Evidence Management', 'Smart Contracts'],
  'Prototype successfully demonstrated to Gujarat Police Cyber Crime Division. Patent filed.',
  'published'
),
(
  'Deep Fake Detection Using Convolutional Neural Networks',
  'Built a deep learning model to detect AI-generated fake videos and images with high accuracy, addressing growing concerns about misinformation.',
  'minor', 6, '2023-24',
  'Rohan Gupta', 'rohan.gupta@nfsu.ac.in', 'NFSU/DEL/BTech/21/015',
  2, 10, NULL, 2021, 2025,
  'Prof. Amit Kumar', 'amit.kumar@nfsu.ac.in', 'Professor',
  ARRAY['Python', 'PyTorch', 'OpenCV', 'FaceForensics++'],
  ARRAY['Deep Learning', 'Media Forensics', 'DeepFake Detection', 'CNN'],
  'Achieved 94% accuracy on FaceForensics++ benchmark. Presented at national cyber forensics seminar.',
  'published'
);
