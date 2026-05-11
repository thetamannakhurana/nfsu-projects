// Save as: import-delhi-faculty.js in project root
// Run: node import-delhi-faculty.js
require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const DEFAULT_PASSWORD = 'NFSU@2024'

// Department mapping from NFSU website to our DB department names
const DEPT_MAP = {
  'Cyber Security and Digital Forensics': 'School of Cyber Security & Digital Forensics',
  'Forensic Sciences': 'School of Forensic Science',
  'Behavioural Forensics': 'School of Behavioural Sciences',
  'Law, Forensic Justice and Policy Studies': 'School of Law, Justice & Governance',
  'Management Studies': 'School of Management Studies',
}

const DELHI_FACULTY = [
  // name, email, designation, dept_key
  ['Dr. Jaspal Singh IPS', 'jaspal.singh@nfsu.ac.in', 'Chair Professor', 'Behavioural Forensics'],
  ['Prof. Minakshi Sinha', 'minakshi.sinha@nfsu.ac.in', 'Professor', 'Behavioural Forensics'],
  ['Prof. Rajendra Sarin', 'rajendra.sarin@nfsu.ac.in', 'Professor', 'Forensic Sciences'],
  ['Prof. Basanna Patagundi', 'basanna.patagundi@nfsu.ac.in', 'Professor', 'Management Studies'],
  ['Prof. Mahesh Joshi', 'mahesh.joshi@nfsu.ac.in', 'Professor of Practice', 'Forensic Sciences'],
  ['Prof. Yashwant Nagle', 'yashwant.nagle@nfsu.ac.in', 'Professor of Practice', 'Behavioural Forensics'],
  ['Mr. Nidhish Bhatnagar', 'nidhish.bhatnagar@nfsu.ac.in', 'Professor of Practice', 'Cyber Security and Digital Forensics'],
  ['Dr. Mahipal Lather', 'mahipal.lather@nfsu.ac.in', 'Associate Professor of Practice', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Sanjai Singh', 'sanjai.singh@nfsu.ac.in', 'Associate Professor of Practice', 'Cyber Security and Digital Forensics'],
  ['Dr. Manu Sharma', 'manu.sharma@nfsu.ac.in', 'Associate Professor', 'Forensic Sciences'],
  ['Dr. Vandana Shriharsh', 'vandana.shriharsh@nfsu.ac.in', 'Associate Professor', 'Behavioural Forensics'],
  ['Dr. Virendra Chavda', 'virendra.chavda@nfsu.ac.in', 'Associate Professor', 'Management Studies'],
  ['Dr. Sapna Bansal', 'sapna.bansal@nfsu.ac.in', 'Associate Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Nandita Chaube', 'nandita.chaube@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Richa Rohatgi', 'richa.rohatgi@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Kanchan Mala', 'kanchan.mala@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Navtika Nautiyal', 'navtika.nautiyal@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Biswajit Dey', 'biswajit.dey@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Priyanka Samuel', 'priyanka.samuel@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Tanvi Yadav', 'tanvi.yadav@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Mohammed Subhan Attar', 'mohammed.attar@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Chothmal Kumawat', 'chothmal.kumawat@nfsu.ac.in', 'Assistant Professor', 'Cyber Security and Digital Forensics'],
  ['Dr. Archana Patel', 'archana.patel@nfsu.ac.in', 'Assistant Professor', 'Cyber Security and Digital Forensics'],
  ['Dr. Vikash Rai', 'vikash.rai@nfsu.ac.in', 'Assistant Professor', 'Cyber Security and Digital Forensics'],
  ['Dr. Hunny Matiyani', 'hunny.matiyani@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Thirupathi Chellapalli', 'thirupathi.chellapalli@nfsu.ac.in', 'Assistant Professor', 'Management Studies'],
  ['Mrs. Garima Puri', 'garima.puri@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Mr. Rithin Joseph', 'rithin.joseph@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Tanya Chauhan', 'tanya.chauhan@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Trikalagya Tiwari', 'trikalagya.tiwari@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Mradul Singh', 'mradul.singh@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Rohit Kanojia', 'rohit.kanojia@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Somabha Bandopadhay', 'somabha.bandopadhay@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Neha Tomar', 'neha.tomar@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Suraj Kataria', 'suraj.kataria@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Ms. Nishtha Grover', 'nishtha.grover@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Arpit Sharma', 'arpit.sharma@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Megha Chauhan', 'megha.chauhan@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Pankaj Sharma', 'pankaj.sharma@nfsu.ac.in', 'Assistant Professor', 'Cyber Security and Digital Forensics'],
  ['Dr. Nidhi Mehta', 'nidhi.mehta@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Dr. Santroop Tanwar', 'santroop.tanwar@nfsu.ac.in', 'Assistant Professor', 'Management Studies'],
  ['Dr. Bhagvanbhai Karnavat', 'bhagvanbhai.karnavat@nfsu.ac.in', 'Assistant Professor', 'Management Studies'],
  ['Dr. Surajit Das', 'surajit.das@nfsu.ac.in', 'Assistant Professor', 'Cyber Security and Digital Forensics'],
  ['Dr. Ajit Muzumdar', 'ajit.muzumdar@nfsu.ac.in', 'Assistant Professor', 'Cyber Security and Digital Forensics'],
  ['Dr. Veeravel V', 'veeravel.v@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Neha Singh', 'neha.singh@nfsu.ac.in', 'Assistant Professor', 'Management Studies'],
  ['Dr. Hanumantappa Bherigi', 'hanumantappa.bherigi@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Tilak Chandrakar', 'tilak.chandrakar@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Rutwik Shedge', 'rutwik.shedge@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Mahua Bhattacharyya', 'mahua.bhattacharyya@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Vernika Mehta', 'vernika.mehta@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Dr. Monika Paul', 'monika.paul@nfsu.ac.in', 'Assistant Professor', 'Law, Forensic Justice and Policy Studies'],
  ['Dr. Rahul Sharma', 'rahul.sharma@nfsu.ac.in', 'Assistant Professor', 'Forensic Sciences'],
  ['Ms. Nikita Paliwal', 'nikita.paliwal@nfsu.ac.in', 'Assistant Professor', 'Behavioural Forensics'],
  ['Mr. Aditya Singh', 'aditya.singh@nfsu.ac.in', 'Lecturer', 'Cyber Security and Digital Forensics'],
  ['Dr. Parul Arora', 'parul.arora@nfsu.ac.in', 'Lecturer', 'Cyber Security and Digital Forensics'],
  ['Ms. Aashi Yadav', 'aashi.yadav@nfsu.ac.in', 'Lecturer', 'Cyber Security and Digital Forensics'],
  ['Mr. Mrinal Mishra', 'mrinal.mishra@nfsu.ac.in', 'Lecturer', 'Management Studies'],
  ['Ms. Kanupriya Shrivastava', 'kanupriya.shrivastava@nfsu.ac.in', 'Lecturer', 'Cyber Security and Digital Forensics'],
  ['Ms. Reet Chauhan', 'reet.chauhan@nfsu.ac.in', 'Lecturer', 'Cyber Security and Digital Forensics'],
  ['Ms. Manya Lal', 'manya.lal@nfsu.ac.in', 'Lecturer', 'Behavioural Forensics'],
]

async function run() {
  console.log('🔐 Generating password hash for NFSU@2024...')
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
  console.log('✅ Hash generated')

  // Get Delhi campus id
  const campusRes = await pool.query(`SELECT id FROM campuses WHERE code = 'DEL' LIMIT 1`)
  const campusId = campusRes.rows[0]?.id || 2
  console.log(`📍 Delhi campus_id: ${campusId}`)

  let inserted = 0, skipped = 0
  console.log(`\n🌱 Importing ${DELHI_FACULTY.length} faculty members...\n`)

  for (const [name, email, designation, deptKey] of DELHI_FACULTY) {
    const department = DEPT_MAP[deptKey] || deptKey
    try {
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, campus_id, department, designation, is_active)
        VALUES ($1, $2, $3, 'faculty', $4, $5, $6, true)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          designation = EXCLUDED.designation,
          department = EXCLUDED.department,
          campus_id = EXCLUDED.campus_id,
          is_active = true
      `, [name, email, passwordHash, campusId, department, designation])
      inserted++
      process.stdout.write(`\r  ✅ ${inserted} inserted, ${skipped} skipped`)
    } catch (e) {
      skipped++
      console.log(`\n  ⚠️  Skipped ${name}: ${e.message}`)
    }
  }

  const { rows: [{ count }] } = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'faculty' AND campus_id = $1`, [campusId])
  console.log(`\n\n🎉 Done!`)
  console.log(`   ✅ Imported: ${inserted}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   👨‍🏫 Total Delhi faculty in DB: ${count}`)
  console.log(`\n   Default login password: NFSU@2024`)
  console.log(`   ⚠️  Tell faculty to change password after first login!\n`)

  await pool.end()
}

run().catch(e => { console.error(e); pool.end() })