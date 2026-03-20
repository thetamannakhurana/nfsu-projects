// Save as: lib/nfsu-constants.ts
// All NFSU-specific constants used across admin, faculty, student forms

export const NFSU_DEPARTMENTS = [
  'School of Cyber Security & Digital Forensics',
  'School of Forensic Science',
  'School of Criminal Justice & Criminology',
  'School of Law, Justice & Governance',
  'School of Behavioural Sciences',
  'School of Management Studies'
]

export const NFSU_DESIGNATIONS = [
  'Professor Of Practice',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Research Scientist',
  'Scientific Assistant',
  'Teaching Assistant',
]

// Correct NFSU courses with actual durations
// B.Tech-M.Tech integrated = 5 years (sem 1-10)
// B.Tech = 4 years (sem 1-8)
// M.Tech = 2 years (sem 1-4)
// M.Sc = 2 years (sem 1-4)
// BSc-MSc integrated = 5 years (sem 1-10)
// BBA-MBA integrated = 5 years (sem 1-10)
// MA = 2 years (sem 1-4)
// PhD = 3 years

export const NFSU_COURSES = [
  // B.Tech-M.Tech Integrated (5 years = 10 semesters)
  { name: 'B.Tech-M.Tech Integrated (Cyber Security)', short: 'BTech-MTech CS', duration: 5, totalSem: 10 },
  // M.Tech (2 years)
  { name: 'M.Tech Cyber Security', short: 'M.Tech CS', duration: 2, totalSem: 4 },
  { name: 'M.Tech Digital Forensics', short: 'M.Tech DF', duration: 2, totalSem: 4 },
  { name: 'M.Tech Information Security', short: 'M.Tech IS', duration: 2, totalSem: 4 },
  // M.Sc (2 years)
  { name: 'M.Sc. Digital Forensics & Information Security', short: 'MSc DFIS', duration: 2, totalSem: 4 },
  { name: 'M.Sc. Forensic Science', short: 'MSc FS', duration: 2, totalSem: 4 },
  { name: 'M.Sc. Cyber Security', short: 'MSc CyberSec', duration: 2, totalSem: 4 },
  // BSc-MSc Integrated (5 years)
  { name: 'B.Sc.-M.Sc. Forensic Science (Integrated)', short: 'BSc-MSc FS', duration: 5, totalSem: 10 },
  // BBA-MBA (5 years)
  { name: 'BBA-MBA (Forensic Accounting & Financial Crimes)', short: 'BBA-MBA', duration: 5, totalSem: 10 },
  // MA (2 years)
  { name: 'M.A. Criminology', short: 'MA Criminology', duration: 2, totalSem: 4 },
  { name: 'M.A. Forensic Psychology', short: 'MA Forensic Psych', duration: 2, totalSem: 4 },
  // Clinical Psychology (2 years)
  { name: 'M.Sc. Clinical Psychology', short: 'M.Sc. Clinical Psychology', duration: 2, totalSem: 4 },
  { name: 'M.Phil. Clinical Psychology', short: 'MPhil. Clinical Psychology', duration: 2, totalSem: 4 },
  // PhD (3 years)
  { name: 'Ph.D.', short: 'PhD', duration: 3, totalSem: 6 },
]

// Project type logic based on semester
// For B.Tech-M.Tech integrated (5yr/10sem):
//   Sem 7-8 (3rd year B.Tech part) = minor only
//   Sem 9-10 (M.Tech part) = major only
// For M.Tech/MSc (2yr/4sem):
//   Sem 1-2 = minor
//   Sem 3-4 = major
// For 5yr integrated (BSc-MSc, BBA-MBA):
//   Sem 5-6 = minor
//   Sem 9-10 = major

export function getProjectTypeForSem(sem: number, totalSem: number): 'major' | 'minor' | 'both' {
  if (totalSem === 10) {
    // 5-year programs
    if (sem >= 9) return 'major'
    if (sem >= 7) return 'minor'
    return 'both'
  }

  if (totalSem === 4) {
    // 2-year M.Tech/MSc
    if (sem >= 3) return 'major'
    if (sem >= 1) return 'minor'
    return 'both'
  }
  return 'both'
}

export function getCurrentSemester(batchStartYear: number, totalSem: number): number {
  const now = new Date()
  const monthsElapsed = (now.getFullYear() - batchStartYear) * 12 + now.getMonth()
  const sem = Math.ceil((monthsElapsed + 1) / 6)
  return Math.min(Math.max(1, sem), totalSem)
}