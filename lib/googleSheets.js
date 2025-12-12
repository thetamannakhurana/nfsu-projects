import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function getSheet() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc.sheetsByIndex[0];
}

export async function getProjects(filters = {}) {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    let filteredRows = rows.filter(row => {
      if (filters.campus && row.get('Campus') !== filters.campus) return false;
      if (filters.program && row.get('Program') !== filters.program) return false;
      if (filters.specialization && row.get('Specialization') !== filters.specialization) return false;
      if (filters.batch && row.get('Batch') !== filters.batch) return false;
      if (filters.project_type && row.get('Project_Type') !== filters.project_type) return false;
      return true;
    });
    
    return filteredRows.map(row => ({
  campus: row.get('Campus'),
  program: row.get('Program'),
  specialization: row.get('Specialization'),
  batch: row.get('Batch'),
  projectType: row.get('Project_Type'),
  projectName: row.get('Project_Name'),
  studentName: row.get('Student_Name'),
  studentEmail: row.get('Student_Email'),  // Add this line
  guideName: row.get('Guide_Name'),
  addedBy: row.get('Added_By'),
  timestamp: row.get('Timestamp'),
}));

  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function addProject(data) {
  try {
    const sheet = await getSheet();
    await sheet.addRow({
      Campus: data.campus,
      Program: data.program,
      Specialization: data.specialization,
      Batch: data.batch,
      Project_Type: data.projectType,
      Project_Name: data.projectName,
      Student_Name: data.studentName,
      Student_Email: data.studentEmail,
      Guide_Name: data.guideName,
      Added_By: data.addedBy,
      Timestamp: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: error.message };
  }
}

export async function authenticateUser(email, password) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    // Get the Users sheet (second sheet, index 1)
    const usersSheet = doc.sheetsByIndex[1];
    const rows = await usersSheet.getRows();
    
    // Find matching user
    const user = rows.find(row => 
      row.get('Email') === email && row.get('Password') === password
    );
    
    if (user) {
      return {
        id: email,
        email: user.get('Email'),
        name: user.get('Name'),
        role: user.get('Role'),
        campus: user.get('Campus') || 'All',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
