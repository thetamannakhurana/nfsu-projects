// Save as: lib/nfsu-constants.ts

export const NFSU_DEPARTMENTS = [
  'School of Cyber Security & Digital Forensics',
  'School of Forensic Science',
  'School of Criminal Justice & Criminology',
  'School of Law, Justice & Governance',
  'School of Behavioural Sciences',
  'School of Management Studies',
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
  { name: 'M.Sc. Clinical Psychology', short: 'MSc Clinical Psych', duration: 2, totalSem: 4 },
  // BSc-MSc Integrated (5 years)
  { name: 'B.Sc.-M.Sc. Forensic Science (Integrated)', short: 'BSc-MSc FS', duration: 5, totalSem: 10 },
  // BBA-MBA (5 years)
  { name: 'BBA-MBA (Forensic Accounting & Financial Crimes)', short: 'BBA-MBA', duration: 5, totalSem: 10 },
  // MA (2 years)
  { name: 'M.A. Criminology', short: 'MA Criminology', duration: 2, totalSem: 4 },
  { name: 'M.A. Forensic Psychology', short: 'MA Forensic Psych', duration: 2, totalSem: 4 },
  // MPhil (2 years)
  { name: 'M.Phil. Clinical Psychology', short: 'MPhil Clinical Psych', duration: 2, totalSem: 4 },
  // PhD (3 years)
  { name: 'Ph.D.', short: 'PhD', duration: 3, totalSem: 6 },
]

// Project type logic based on semester
// B.Tech-M.Tech integrated (5yr / 10sem):
//   Sem 7-8 = minor only  (3rd year, B.Tech portion)
//   Sem 9-10 = major only (M.Tech portion)
// 2-year programs (M.Tech / M.Sc / MA etc, 4 sem):
//   Sem 1-2 = minor
//   Sem 3-4 = major
// 5-year integrated (BSc-MSc, BBA-MBA):
//   Sem 5-6 = minor
//   Sem 9-10 = major

export function getProjectTypeForSem(sem: number, totalSem: number): 'major' | 'minor' | 'both' {
  if (totalSem === 10) {
    if (sem >= 9) return 'major'
    if (sem >= 7) return 'minor'
    return 'both'
  }
  if (totalSem === 4) {
    if (sem >= 3) return 'major'
    return 'minor'
  }
  return 'both'
}

// NFSU Academic Calendar:
// Odd semesters  (1,3,5,7,9)  → July – December
// Even semesters (2,4,6,8,10) → January – May
//
// Logic:
//   Each academic year has 2 semesters.
//   Batch starts in July of batchStartYear → that's Sem 1.
//   Jan of batchStartYear+1 → Sem 2
//   July of batchStartYear+1 → Sem 3
//   ...and so on.
//
// Current semester = based on current month + year relative to batch start.

export function getCurrentSemester(batchStartYear: number, totalSem: number): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-12

  // How many academic years have passed since batch start
  // Academic year starts in July (month 7)
  // Year 1: July batchStart to May batchStart+1
  // Year 2: July batchStart+1 to May batchStart+2
  // etc.

  let sem = 0

  for (let year = batchStartYear; year <= currentYear; year++) {
    // Odd semester: July-December of this year
    // Even semester: January-May of this year

    // Check even semester first (Jan-May of this year)
    // This belongs to academic year that started in July of previous year
    if (year === batchStartYear) {
      // First year: odd sem starts July of batchStartYear
      if (currentYear === batchStartYear) {
        if (currentMonth >= 7) {
          sem = 1 // July-Dec of start year = Sem 1
        }
        // Before July of start year = not started yet, show sem 1
        if (sem === 0) sem = 1
      } else {
        // We are past the start year
        // Count full years completed
        const yearsCompleted = currentYear - batchStartYear
        if (currentMonth >= 7) {
          // Currently in odd sem of this academic year
          sem = yearsCompleted * 2 + 1
        } else {
          // Currently in even sem (Jan-May)
          sem = yearsCompleted * 2
        }
        break
      }
      break
    }
  }

  // Clamp to valid range
  if (sem <= 0) sem = 1
  return Math.min(sem, totalSem)
}

// Human-readable semester period
export function getSemesterPeriod(sem: number): string {
  return sem % 2 === 1 ? 'July – December' : 'January – May'
}