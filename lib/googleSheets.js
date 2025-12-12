import { google } from 'googleapis';

function getAuth() {
  // Parse credentials directly from env (not base64)
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getProjects(filters = {}) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A2:K1000',
    });
    
    const rows = response.data.values || [];
    
    let filteredRows = rows.filter(row => {
      if (filters.campus && row[0] !== filters.campus) return false;
      if (filters.program && row[1] !== filters.program) return false;
      if (filters.specialization && row[2] !== filters.specialization) return false;
      if (filters.batch && row[3] !== filters.batch) return false;
      if (filters.project_type && row[4] !== filters.project_type) return false;
      return true;
    });
    
    return filteredRows.map(row => ({
      campus: row[0],
      program: row[1],
      specialization: row[2],
      batch: row[3],
      projectType: row[4],
      projectName: row[5],
      studentName: row[6],
      studentEmail: row[7],
      guideName: row[8],
      addedBy: row[9],
      timestamp: row[10],
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function addProject(data) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:K',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          data.campus,
          data.program,
          data.specialization,
          data.batch,
          data.projectType,
          data.projectName,
          data.studentName,
          data.studentEmail,
          data.guideName,
          data.addedBy,
          new Date().toISOString(),
        ]],
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: error.message };
  }
}

export async function authenticateUser(email, password) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet2!A2:E100',
    });
    
    const rows = response.data.values || [];
    const user = rows.find(row => row[0] === email && row[1] === password);
    
    if (user) {
      return {
        id: email,
        email: user[0],
        name: user[2],
        role: user[3],
        campus: user[4] || 'All',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
