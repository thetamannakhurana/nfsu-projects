const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

const campuses = ['Gandhinagar', 'Delhi', 'Goa', 'Tripura', 'Bhopal', 'Pune', 'Guwahati', 'Manipur', 'Dharwad', 'Bhubaneswar', 'Chennai', 'Nagpur', 'Jaipur', 'Raipur'];

const projectNames = [
  'AI-Based Crime Prediction System',
  'Blockchain for Evidence Management',
  'Facial Recognition System',
  'Digital Forensics Toolkit',
  'Cybercrime Investigation Dashboard',
  'Network Traffic Analysis System',
  'Malware Detection using ML',
  'Automated Report Generator',
  'E-Evidence Management Portal',
  'Crime Pattern Analysis Tool',
  'CCTV Footage Analysis System',
  'Social Media Forensics Tool',
  'Mobile Forensics Framework',
  'Fingerprint Matching Algorithm',
  'Voice Recognition System',
  'DNA Database Management',
  'Cybersecurity Audit Platform',
  'Intrusion Detection System',
  'Secure Communication Protocol',
  'Digital Signature Verification',
  'Web Application Security Scanner',
  'Password Strength Analyzer',
  'Phishing Detection System',
  'Ransomware Analysis Tool',
  'IoT Security Framework',
  'Cloud Forensics Platform',
  'Email Forensics System',
  'Dark Web Monitoring Tool',
  'Cryptocurrency Tracker',
  'Deepfake Detection System',
  'Online Fraud Detection',
  'Smart Contract Auditor',
  'Biometric Authentication System',
  'Secure File Transfer Protocol',
  'Network Packet Analyzer',
  'Vulnerability Assessment Tool',
  'Incident Response Automation',
  'Threat Intelligence Platform',
  'Security Dashboard',
  'Access Control Management'
];

const studentData = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@nfsu.ac.in' },
  { name: 'Vivaan Kumar', email: 'vivaan.kumar@nfsu.ac.in' },
  { name: 'Aditya Singh', email: 'aditya.singh@nfsu.ac.in' },
  { name: 'Vihaan Patel', email: 'vihaan.patel@nfsu.ac.in' },
  { name: 'Arjun Gupta', email: 'arjun.gupta@nfsu.ac.in' },
  { name: 'Sai Reddy', email: 'sai.reddy@nfsu.ac.in' },
  { name: 'Arnav Mehta', email: 'arnav.mehta@nfsu.ac.in' },
  { name: 'Dhruv Joshi', email: 'dhruv.joshi@nfsu.ac.in' },
  { name: 'Krishna Verma', email: 'krishna.verma@nfsu.ac.in' },
  { name: 'Atharv Desai', email: 'atharv.desai@nfsu.ac.in' },
  { name: 'Aadhya Iyer', email: 'aadhya.iyer@nfsu.ac.in' },
  { name: 'Ananya Nair', email: 'ananya.nair@nfsu.ac.in' },
  { name: 'Diya Rao', email: 'diya.rao@nfsu.ac.in' },
  { name: 'Isha Pillai', email: 'isha.pillai@nfsu.ac.in' },
  { name: 'Kiara Menon', email: 'kiara.menon@nfsu.ac.in' },
  { name: 'Saanvi Bhat', email: 'saanvi.bhat@nfsu.ac.in' },
  { name: 'Sara Khan', email: 'sara.khan@nfsu.ac.in' },
  { name: 'Myra Das', email: 'myra.das@nfsu.ac.in' },
  { name: 'Aanya Mishra', email: 'aanya.mishra@nfsu.ac.in' },
  { name: 'Navya Pandey', email: 'navya.pandey@nfsu.ac.in' },
  { name: 'Rohan Kapoor', email: 'rohan.kapoor@nfsu.ac.in' },
  { name: 'Kabir Malhotra', email: 'kabir.malhotra@nfsu.ac.in' },
  { name: 'Shivansh Agarwal', email: 'shivansh.agarwal@nfsu.ac.in' },
  { name: 'Rudra Saxena', email: 'rudra.saxena@nfsu.ac.in' },
  { name: 'Reyansh Jain', email: 'reyansh.jain@nfsu.ac.in' },
  { name: 'Prisha Banerjee', email: 'prisha.banerjee@nfsu.ac.in' },
  { name: 'Anvi Chatterjee', email: 'anvi.chatterjee@nfsu.ac.in' },
  { name: 'Avni Ghosh', email: 'avni.ghosh@nfsu.ac.in' },
  { name: 'Riya Sen', email: 'riya.sen@nfsu.ac.in' },
  { name: 'Tara Mukherjee', email: 'tara.mukherjee@nfsu.ac.in' }
];

const guideNames = [
  'Dr. Rajesh Kumar',
  'Dr. Priya Sharma',
  'Dr. Amit Patel',
  'Dr. Neha Singh',
  'Dr. Vikram Reddy',
  'Dr. Meera Iyer',
  'Dr. Suresh Gupta',
  'Dr. Kavita Verma',
  'Dr. Anil Desai',
  'Dr. Pooja Nair',
  'Dr. Rahul Mehta',
  'Dr. Sneha Pillai',
  'Dr. Kiran Joshi',
  'Dr. Deepak Rao'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seedData() {
  console.log('Starting data seeding...');
  console.log('⚠️  This will take about 8-10 minutes due to API rate limits');
  
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  
  console.log('Connected to Google Sheet:', doc.title);
  
  let projectIndex = 0;
  let studentIndex = 0;
  let count = 0;
  
  // Add 20 projects per campus
  for (const campus of campuses) {
    console.log(`\nAdding projects for ${campus} Campus...`);
    
    for (let i = 0; i < 20; i++) {
      const program = i < 10 ? 'B.Tech' : 'M.Tech';
      const projectType = i % 2 === 0 ? 'Minor Project' : 'Major Project';
      const student = studentData[studentIndex % studentData.length];
      
      try {
        await sheet.addRow({
          Campus: campus,
          Program: program,
          Specialization: 'Cybersecurity',
          Batch: '2022-2027',
          Project_Type: projectType,
          Project_Name: projectNames[projectIndex % projectNames.length],
          Student_Name: student.name,
          Student_Email: student.email,
          Guide_Name: guideNames[projectIndex % guideNames.length],
          Added_By: 'system@nfsu.ac.in',
          Timestamp: new Date().toISOString(),
        });
        
        projectIndex++;
        studentIndex++;
        count++;
        
        if (count % 5 === 0) {
          console.log(`  ✓ Added ${count} projects so far...`);
        }
        
        // Delay 1.5 seconds between each row
        await delay(1500);
        
      } catch (error) {
        console.error(`  ✗ Error adding project ${count + 1}:`, error.message);
        console.log('  Waiting 10 seconds before retry...');
        await delay(10000);
        i--; // Retry
      }
    }
    
    console.log(`✓ Completed ${campus} Campus (${count} total projects)`);
  }
  
  console.log(`\n🎉 Successfully added ${count} demo projects across all campuses!`);
  console.log('Check your Google Sheet to verify the data.');
}

seedData().catch(console.error);
