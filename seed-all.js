// ============================================================
// NFSU Big Seed Script
// Run from project root: node seed-big.js
// Inserts 2 major + 2 minor per campus × course × batch
// ============================================================
const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ── DB layout (matches schema.sql) ─────────────────────────
// campuses: 1=GUJ 2=DEL 3=GOA 4=TRP 5=BPL 6=PNE 7=GHY 8=MNP
//           9=DWD 10=BBS 11=CHN 12=NGP 13=JPR 14=RPR 15=UGA
//
// courses per campus (campus_id):
//   Gujarat (1):  1=BTech 2=MTech 3=MSc-DFIS 4=MSc-FS
//                 5=BSc-MSc-FS 6=BSc-MSc-CRFS 7=BBA-MBA 8=MA-Crim 9=PhD
//   Delhi (2):   10=BTech 11=MTech 12=MSc-DFIS 13=MSc-FS
//                14=BSc-MSc-FS 15=BSc-MSc-CRFS 16=BBA-MBA 17=MA-Crim
//
// specializations (course_id):
//   BTech-GUJ (1): 1=CyberSec 2=DigForensics 3=IT 4=CSE 5=ECE 6=AIML 7=DSA 8=IoT
//   MTech-GUJ (2): 9=CyberSec 10=DigForensics 11=InfoSec 12=NetSec 13=FST
//   (other courses have no specializations)

// ── Helpers ────────────────────────────────────────────────
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)]
const yr = (from, to) => Array.from({length: to-from+1}, (_,i) => from+i)

// Campus short codes for readable roll numbers
const campusCode = {1:'GUJ',2:'DEL',3:'GOA',4:'TRP',5:'BPL',6:'PNE',7:'GHY',8:'MNP',9:'DWD',10:'BBS',11:'CHN',12:'NGP',13:'JPR',14:'RPR',15:'UGA'}

// Course info: [shortName, degreeType, durationYears]
const courseInfo = {
  1:['BTech','B.Tech',4], 2:['MTech','M.Tech',2], 3:['MScDFIS','M.Sc',2], 4:['MScFS','M.Sc',2],
  5:['BScMScFS','B.Sc-M.Sc',5], 6:['BScMScCRFS','B.Sc-M.Sc',5], 7:['BBAMBA','BBA-MBA',5],
  8:['MACrim','M.A',2], 9:['PhD','Ph.D',3],
  10:['BTech','B.Tech',4], 11:['MTech','M.Tech',2], 12:['MScDFIS','M.Sc',2], 13:['MScFS','M.Sc',2],
  14:['BScMScFS','B.Sc-M.Sc',5], 15:['BScMScCRFS','B.Sc-M.Sc',5], 16:['BBAMBA','BBA-MBA',5],
  17:['MACrim','M.A',2],
}

// Batch start years per course type
const batchYearsFor = (dur) => {
  if (dur === 4) return [2019, 2020, 2021, 2022, 2023]
  if (dur === 2) return [2019, 2020, 2021, 2022, 2023, 2024]
  if (dur === 5) return [2019, 2020, 2021, 2022, 2023]
  if (dur === 3) return [2020, 2021, 2022, 2023]
  return [2020, 2021, 2022, 2023]
}

// Specializations per course (null means no specialization for that course)
const specsForCourse = {
  1: [1,2,3,4,5,6,7,8],
  2: [9,10,11,12,13],
  // all other courses: no specialization
}

// ── Project title banks ────────────────────────────────────
// Indexed by [courseId or category][type=major/minor][index]
const titleBank = {
  // B.Tech
  BTech: {
    major: [
      'AI-Powered Network Intrusion Detection Using LSTM',
      'Blockchain-based Digital Evidence Chain of Custody',
      'DeepFake Detection Using Multimodal Transformers',
      'Federated Learning for Distributed Threat Detection',
      'Post-Quantum Cryptography for Secure Channels',
      'Hardware Security Module for IoT Authentication',
      'Memory Forensics Framework for APT Detection',
      'Zero Trust Network Architecture for Enterprise',
      'Smart City IoT Security Framework',
      'Automated Malware Classification via Graph Neural Networks',
      'Real-time Threat Prediction Using Streaming Analytics',
      'LLM-Powered Threat Report Generation for SOC',
      'Supply Chain Attack Detection in Software Packages',
      'Industrial Control System Security Monitoring',
      'RF Fingerprinting for Wireless Device Identification',
      'Adversarial Robustness Testing for Security ML Models',
      'Secure OTA Firmware Update for Industrial IoT',
      'Graph-Based Threat Hunting Platform',
    ],
    minor: [
      'Zero-Day Vulnerability Scanner Using Fuzzing',
      'Mobile Device Forensics Automation Framework',
      'Social Engineering Attack Simulator',
      'Real-time Threat Intelligence Aggregation Platform',
      'Side-Channel Attack Detection in Embedded Systems',
      'Explainable AI for Incident Classification',
      'DNS-over-HTTPS Security Analysis Tool',
      'Container Escape Vulnerability Detection',
      'Automated OSINT Collection Framework',
      'Botnet Detection via Traffic Fingerprinting',
      'Browser Forensics for Dark Web Activity',
      'Rogue Access Point Detection System',
      'Dark Web Credential Monitoring System',
      'Mobile App Vulnerability Assessment Platform',
      'Cybersecurity Gamification Training Platform',
      'Log Anomaly Detection using Isolation Forest',
      'Phishing Email Detection Using BERT',
      'Threat Modelling Automation Tool',
    ]
  },
  // M.Tech
  MTech: {
    major: [
      'Adversarial Attacks and Defenses in ML-based IDS',
      'Cloud Forensics Investigation Methodology for AWS',
      'Quantum Key Distribution Implementation for Secure Channels',
      'Automated Penetration Testing via AI Planning',
      'Honeypot Network for Advanced Threat Intelligence',
      'Digital Forensics of Encrypted Messaging Apps',
      'Firmware Analysis Framework for IoT Vulnerability Discovery',
      'Side-Channel Resistant Cryptographic Implementations',
    ],
    minor: [
      'Malware Sandbox Analysis with Evasion Detection',
      'Email Forensics for Business Email Compromise',
      'Container Security Hardening Benchmark Tool',
      'Threat Actor Attribution Using ML on TTPs',
      'Secure Coding Static Analysis Plugin for IDEs',
      'Cyber Range Scenario Generation Platform',
    ]
  },
  // MSc / BSc-MSc / others
  MSc: {
    major: [
      'Steganography Detection Using Deep Learning',
      'Network Traffic Visualization for Incident Response',
      'Email Forensics Platform for BEC Investigation',
      'Cryptocurrency Transaction Analysis for Cybercrime',
      'AI-Assisted Fingerprint Enhancement and Latent Print Analysis',
      'Handwriting Forgery Detection Using Neural Networks',
      'Ballistic Trajectory Reconstruction via Computer Vision',
      'Toxicological Analysis Automation Using LC-MS',
      'DNA Profiling Database for Cold Case Investigation',
      'Integrated Cyber-Physical Crime Scene Framework',
      'Social Media Evidence Preservation System',
      'Vehicle Telematics Forensics for Accident Reconstruction',
      'Forensic Accounting System for Financial Fraud Detection',
      'Cryptocurrency Tracing for Money Laundering Detection',
      'Insurance Fraud Detection via Network Analysis',
      'Predictive Policing Model Using Crime Pattern Analysis',
      'Online Radicalization Detection Using NLP',
      'Juvenile Cybercrime Prevention Framework',
      'Soil Forensics Database for Crime Scene Geolocation',
      'Facial Reconstruction from Skull Using 3D Morphing',
    ],
    minor: [
      'Dark Web Marketplace Monitoring for Drug Intelligence',
      'Forensic Audit Trail System for Corporate Governance',
      'Victimology Study of Financial Cybercrime in Senior Citizens',
      'SIM Swapping Attack Investigation Methodology',
      'Women Cyber Safety Index for Indian Metro Cities',
      'Cyberbullying Impact Assessment Among Adolescents',
      'Digital Age Estimation from Skeletal Remains',
      'Browser Artifact Analysis Tool',
      'Geospatial Crime Mapping Dashboard',
      'Automated Chain of Custody Document Generator',
    ]
  }
}

// Tech stacks by category
const techStacks = {
  BTech: [
    ['Python','TensorFlow','Scikit-learn','Wireshark'],
    ['Python','PyTorch','OpenCV','Keras'],
    ['Solidity','Ethereum','React','Web3.js'],
    ['Python','Volatility 3','YARA','Cuckoo'],
    ['Python','Kafka','Spark','Grafana'],
    ['C++','Python','OpenSSL','FPGA'],
    ['Python','GNN','PyTorch Geometric','IDA Pro'],
    ['React','Node.js','PostgreSQL','Docker'],
    ['Python','Scapy','Elasticsearch','Kibana'],
    ['Python','BERT','Transformers','NLP'],
    ['VHDL','Xilinx','Python','MQTT'],
    ['Python','Frida','JADX','MobSF'],
  ],
  MSc: [
    ['Python','R','SPSS','GIS'],
    ['Python','NetworkX','Neo4j','D3.js'],
    ['Python','BioPython','PostgreSQL','CODIS'],
    ['Python','Cellebrite','Autopsy','Oxygen'],
    ['Python','Tableau','XGBoost','Selenium'],
    ['SPSS','NVivo','Survey Tools','ArcGIS'],
    ['Python','OpenCV','TensorFlow','GAN'],
    ['Python','AWS CLI','boto3','CloudTrail'],
  ]
}

// Keywords by category
const kwStacks = {
  BTech: [
    ['Machine Learning','Network Security','IDS'],
    ['Blockchain','Digital Forensics','Evidence'],
    ['Deep Learning','Computer Vision','Forensics'],
    ['IoT Security','Hardware Security','PUF'],
    ['Malware Analysis','Reverse Engineering','GNN'],
    ['Threat Intelligence','OSINT','Intelligence'],
    ['Privacy Computing','Federated Learning','MPC'],
    ['Mobile Security','SAST','OWASP'],
    ['Streaming Analytics','Big Data','Real-time'],
    ['Zero Trust','Microsegmentation','ZTNA'],
  ],
  MSc: [
    ['Forensic Accounting','Financial Fraud','Benford'],
    ['DNA Forensics','Cold Cases','Database'],
    ['Fingerprint Analysis','Biometrics','AFIS'],
    ['Toxicology','LC-MS','Drug Analysis'],
    ['Crime Analysis','GIS','Predictive Policing'],
    ['Document Forensics','Handwriting','Signature'],
    ['Cyberbullying','Adolescents','Mental Health'],
    ['Cloud Forensics','AWS','Incident Response'],
    ['Social Media','Evidence Preservation','Authentication'],
    ['Cryptocurrency','Blockchain','Money Laundering'],
  ]
}

const guides = [
  ['Dr. Rakesh Patel','rakesh.patel@nfsu.ac.in','Associate Professor'],
  ['Dr. Sunita Verma','sunita.verma@nfsu.ac.in','Assistant Professor'],
  ['Prof. Vijay Kumar','vijay.kumar@nfsu.ac.in','Professor'],
  ['Dr. Anjali Desai','anjali.desai@nfsu.ac.in','Professor'],
  ['Dr. Meera Krishnan','meera.krishnan@nfsu.ac.in','Assistant Professor'],
  ['Prof. Amit Kumar','amit.kumar@nfsu.ac.in','Professor'],
  ['Dr. Priya Sharma','priya.sharma@nfsu.ac.in','Assistant Professor'],
  ['Dr. Suresh Nair','suresh.nair@nfsu.ac.in','Associate Professor'],
  ['Dr. Seema Tripathi','seema.tripathi@nfsu.ac.in','Associate Professor'],
  ['Prof. Deepak Mehta','deepak.mehta@nfsu.ac.in','Professor'],
  ['Dr. Kavita Rao','kavita.rao@nfsu.ac.in','Associate Professor'],
  ['Dr. Ramesh Chandra','ramesh.chandra@nfsu.ac.in','Professor'],
  ['Dr. Vandana Singh','vandana.singh@nfsu.ac.in','Professor'],
  ['Dr. Arun Gupta','arun.gupta@nfsu.ac.in','Associate Professor'],
  ['Prof. Rajesh Pandey','rajesh.pandey@nfsu.ac.in','Professor'],
]

const firstNames = ['Arjun','Priya','Rohan','Sneha','Karan','Ananya','Vikram','Pooja','Rahul','Nisha','Aditya','Kavya','Tanvi','Harsh','Ishaan','Meenakshi','Divya','Sahil','Riya','Manav','Lakshmi','Fatima','Yusuf','Omar','Zara','Kenji','Prerna','Laleh','Sunidhi','Nikhil','Prateek','Megha','Ravi','Anjali','Aditi','Ritika','Manish','Shreya','Vijay','Deepa','Mohan','Swati','Rajesh','Sunita','Arun']
const lastNames = ['Sharma','Mehta','Gupta','Patel','Verma','Singh','Kumar','Joshi','Nair','Iyer','Rao','Reddy','Das','Malhotra','Kapoor','Trivedi','Shah','Desai','Mishra','Tiwari','Agarwal','Srivastava','Saxena','Bajpai','Chopra','Khanna','Pandey','Tripathi','Chandra','Krishna']

let nameIdx = 0
const nextName = () => {
  const n = `${firstNames[nameIdx % firstNames.length]} ${lastNames[Math.floor(nameIdx/firstNames.length) % lastNames.length]}`
  nameIdx++
  return n
}

const achievements = [
  'Published in IEEE conference proceedings.',
  'Presented at National Cyber Forensics Seminar.',
  'Patent filed with Indian Patent Office.',
  'Adopted by university forensics lab for training.',
  'Used in real investigation by state police.',
  'Open-sourced on GitHub with 500+ downloads.',
  'Demonstrated to CERT-In officials.',
  'Selected for NFSU Best Project Award.',
  'Deployed in university SOC lab.',
  'Research cited in government policy report.',
  'Prototype validated by industry expert panel.',
  'Presented at IIT workshop.',
  'Methodology adopted as standard procedure.',
  'Pilot project approved by state government.',
  'Tool used in 5+ real criminal investigations.',
]

// ── Build project list ─────────────────────────────────────
async function run() {
  console.log('🔍 Reading DB structure...')
  const { rows: campuses } = await pool.query('SELECT id, code FROM campuses WHERE is_active=true ORDER BY id')
  const { rows: courses } = await pool.query('SELECT id, campus_id, degree_type, duration_years FROM courses WHERE is_active=true ORDER BY id')
  const { rows: specs } = await pool.query('SELECT id, course_id FROM specializations WHERE is_active=true ORDER BY id')

  // Add project_url column if missing
  await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_url VARCHAR(500)`).catch(()=>{})

  // Clear existing seed data
  await pool.query(`DELETE FROM projects`)
  console.log('🗑️  Cleared existing projects')

  const projects = []
  let titleCounters = {}

  const getTitle = (cat, type, key) => {
    const bank = titleBank[cat]?.[type] || titleBank.MSc[type]
    const k = `${key}-${type}`
    titleCounters[k] = (titleCounters[k] || 0)
    const idx = titleCounters[k] % bank.length
    titleCounters[k]++
    return bank[idx]
  }

  for (const campus of campuses) {
    const campusCourses = courses.filter(c => c.campus_id === campus.id)

    for (const course of campusCourses) {
      const [shortName, , dur] = courseInfo[course.id] || ['Course','Other',2]
      const batchStarts = batchYearsFor(dur)
      const courseSpecs = specsForCourse[course.id] || [null]
      const isBTech = course.degree_type === 'B.Tech'
      const isMTech = course.degree_type === 'M.Tech'
      const cat = isBTech ? 'BTech' : isMTech ? 'MTech' : 'MSc'
      const techPool = isBTech ? techStacks.BTech : techStacks.MSc
      const kwPool = isBTech ? kwStacks.BTech : kwStacks.MSc

      for (const batchStart of batchStarts) {
        const batchEnd = batchStart + dur
        const ay = `${batchEnd-1}-${String(batchEnd).slice(-2)}`

        for (const specId of courseSpecs) {
          // 2 major + 2 minor per combo
          for (const type of ['major', 'major', 'minor', 'minor']) {
            const key = `${campus.id}-${course.id}-${specId}`
            const title = getTitle(cat, type, key)
            const guide = rnd(guides)
            const tech = rnd(techPool)
            const kw = rnd(kwPool)
            const studentName = nextName()
            const email = studentName.toLowerCase().replace(' ','.') + batchStart + '@nfsu.ac.in'
            const enrollment = `NFSU/${campusCode[campus.id]}/${shortName}/${batchStart}/${String(projects.length % 99 + 1).padStart(3,'0')}`
            const sem = type === 'major'
              ? (dur >= 4 ? rnd([7,8]) : dur >= 3 ? rnd([3,4]) : rnd([3,4]))
              : (dur >= 4 ? rnd([5,6]) : rnd([1,2]))

            projects.push({
              title,
              description: `${title}: A comprehensive ${type} project exploring cutting-edge techniques in forensic science and cybersecurity. This ${course.degree_type} project was undertaken at NFSU ${campusCode[campus.id]} campus during the ${batchStart}-${batchEnd} batch. The project applies modern computational methods and forensic methodologies to solve real-world challenges faced by law enforcement and security professionals.`,
              type,
              sem,
              ay,
              studentName,
              email,
              enrollment,
              campusId: campus.id,
              courseId: course.id,
              specId,
              batchStart,
              batchEnd,
              guide: guide[0],
              guideEmail: guide[1],
              guideDesig: guide[2],
              tech,
              kw,
              ach: rnd(achievements),
            })
          }
        }
      }
    }
  }

  console.log(`\n📦 Generated ${projects.length} projects. Inserting...`)
  let ok = 0, fail = 0

  for (const p of projects) {
    try {
      await pool.query(`
        INSERT INTO projects (
          title,description,project_type,semester,academic_year,
          student_name,student_email,enrollment_number,
          campus_id,course_id,specialization_id,
          batch_start_year,batch_end_year,
          guide_name,guide_email,guide_designation,
          technologies,keywords,achievements,
          status,added_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'published',1)
      `, [
        p.title, p.description, p.type, p.sem, p.ay,
        p.studentName, p.email, p.enrollment,
        p.campusId, p.courseId, p.specId,
        p.batchStart, p.batchEnd,
        p.guide, p.guideEmail, p.guideDesig,
        p.tech, p.kw, p.ach
      ])
      ok++
      if (ok % 50 === 0) process.stdout.write(`\r  ✅ ${ok}/${projects.length} inserted...`)
    } catch(e) {
      fail++
    }
  }

  const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM projects')
  console.log(`\n\n🎉 Done!`)
  console.log(`   ✅ Inserted: ${ok}`)
  console.log(`   ⚠️  Failed:  ${fail}`)
  console.log(`   📁 Total in DB: ${count} projects`)
  console.log(`\n   Every campus → every course → every batch → 2 major + 2 minor ✓`)
  await pool.end()
}

run().catch(e => { console.error(e); pool.end() })