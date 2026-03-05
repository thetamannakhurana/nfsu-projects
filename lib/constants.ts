export const CAMPUSES = [
  { code: 'GUJ', name: 'Gandhinagar Campus', location: 'Gandhinagar, Gujarat', type: 'Main', icon: '🏛️' },
  { code: 'DEL', name: 'Delhi Campus', location: 'New Delhi, Delhi', type: 'Major', icon: '🏙️' },
  { code: 'GOA', name: 'Goa Campus', location: 'Goa', type: 'Major', icon: '🌊' },
  { code: 'TRP', name: 'Tripura Campus', location: 'Agartala, Tripura', type: 'Major', icon: '🌿' },
  { code: 'BPL', name: 'Bhopal Campus', location: 'Bhopal, Madhya Pradesh', type: 'Major', icon: '🏰' },
  { code: 'PNE', name: 'Pune Campus', location: 'Pune, Maharashtra', type: 'Major', icon: '🎓' },
  { code: 'GHY', name: 'Guwahati Campus', location: 'Guwahati, Assam', type: 'Major', icon: '🌄' },
  { code: 'MNP', name: 'Manipur Campus', location: 'Imphal, Manipur', type: 'Major', icon: '⛰️' },
  { code: 'DWD', name: 'Dharwad Campus', location: 'Dharwad, Karnataka', type: 'Major', icon: '🌺' },
  { code: 'BBS', name: 'Bhubaneswar Campus', location: 'Bhubaneswar, Odisha', type: 'Transit', icon: '🏯' },
  { code: 'CHN', name: 'Chennai Campus', location: 'Chennai, Tamil Nadu', type: 'Transit', icon: '🌞' },
  { code: 'NGP', name: 'Nagpur Campus', location: 'Nagpur, Maharashtra', type: 'Transit', icon: '🍊' },
  { code: 'JPR', name: 'Jaipur Campus', location: 'Jaipur, Rajasthan', type: 'Transit', icon: '🏰' },
  { code: 'RPR', name: 'Raipur Campus', location: 'Raipur, Chhattisgarh', type: 'Transit', icon: '🌾' },
  { code: 'UGA', name: 'International Campus', location: 'Jinja, Uganda', type: 'International', icon: '🌍' },
]

export const DEGREE_TYPES = [
  { value: 'B.Tech', label: 'B.Tech', color: 'blue' },
  { value: 'M.Tech', label: 'M.Tech', color: 'purple' },
  { value: 'M.Sc', label: 'M.Sc', color: 'green' },
  { value: 'B.Sc-M.Sc', label: 'B.Sc-M.Sc (Integrated)', color: 'teal' },
  { value: 'BBA-MBA', label: 'BBA-MBA (Integrated)', color: 'orange' },
  { value: 'M.A', label: 'M.A', color: 'red' },
  { value: 'Ph.D', label: 'Ph.D', color: 'yellow' },
]

export const BTECH_SPECIALIZATIONS = [
  'Cyber Security',
  'Digital Forensics',
  'Information Technology',
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Artificial Intelligence and Machine Learning',
  'Data Science and Analytics',
  'Internet of Things',
]

export const MTECH_SPECIALIZATIONS = [
  'Cyber Security',
  'Digital Forensics',
  'Information Security',
  'Network Security',
  'Forensic Science & Technology',
]

export const COMMON_COURSES = [
  { name: 'Bachelor of Technology', short_name: 'B.Tech', degree_type: 'B.Tech', duration_years: 4 },
  { name: 'Master of Technology', short_name: 'M.Tech', degree_type: 'M.Tech', duration_years: 2 },
  { name: 'M.Sc. Digital Forensics and Information Security', short_name: 'MSc DFIS', degree_type: 'M.Sc', duration_years: 2 },
  { name: 'M.Sc. Forensic Science', short_name: 'MSc FS', degree_type: 'M.Sc', duration_years: 2 },
  { name: 'B.Sc.-M.Sc. Forensic Science (Integrated)', short_name: 'BSc-MSc FS', degree_type: 'B.Sc-M.Sc', duration_years: 5 },
  { name: 'B.Sc.-M.Sc. Cyber and Forensic Science (Integrated)', short_name: 'BSc-MSc CRFS', degree_type: 'B.Sc-M.Sc', duration_years: 5 },
  { name: 'BBA-MBA (Forensic Accounting and Financial Crimes)', short_name: 'BBA-MBA', degree_type: 'BBA-MBA', duration_years: 5 },
  { name: 'M.A. Criminology', short_name: 'MA Criminology', degree_type: 'M.A', duration_years: 2 },
  { name: 'Ph.D.', short_name: 'PhD', degree_type: 'Ph.D', duration_years: 3 },
]

export function getBatchYears(): { start: number; end: number; label: string }[] {
  const batches = []
  const currentYear = new Date().getFullYear()
  for (let start = 2018; start <= currentYear; start++) {
    // Generate batches for 2-year, 4-year, and 5-year programs
    batches.push({ start, end: start + 2, label: `${start} – ${start + 2}` })
    batches.push({ start, end: start + 4, label: `${start} – ${start + 4}` })
    batches.push({ start, end: start + 5, label: `${start} – ${start + 5}` })
  }
  // Remove duplicates
  const seen = new Set()
  return batches.filter(b => {
    const key = `${b.start}-${b.end}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => b.start - a.start || a.end - b.end)
}

export const PROJECT_TYPES = [
  { value: 'major', label: 'Major Project', description: 'Final year / 8th semester project', semester: 8 },
  { value: 'minor', label: 'Minor Project', description: 'Mid-program project (6th/7th semester)', semester: 6 },
]

export const DEGREE_COLORS: Record<string, string> = {
  'B.Tech': 'bg-blue-100 text-blue-800 border-blue-200',
  'M.Tech': 'bg-purple-100 text-purple-800 border-purple-200',
  'M.Sc': 'bg-green-100 text-green-800 border-green-200',
  'B.Sc-M.Sc': 'bg-teal-100 text-teal-800 border-teal-200',
  'BBA-MBA': 'bg-orange-100 text-orange-800 border-orange-200',
  'M.A': 'bg-red-100 text-red-800 border-red-200',
  'Ph.D': 'bg-yellow-100 text-yellow-800 border-yellow-200',
}
