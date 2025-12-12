import { google } from 'googleapis';

function getAuth() {
  // Parse credentials directly from env (not base64)
  const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getProjects() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A2:K1000', // or just 'A2:K1000'
    });

    const rows = response.data.values || [];
    console.log('ROW SAMPLE', rows.slice(0, 3));

    return rows.map(row => ({
      campus: row[0] || '',
      program: row[1] || '',
      specialization: row[2] || '',
      batch: row[3] || '',
      projectType: row[4] || '',
      projectName: row[5] || '',
      studentName: row[6] || '',
      studentEmail: row[7] || '',
      guideName: row[8] || '',
      addedBy: row[9] || '',
      timestamp: row[10] || '',
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
      range: 'A2:E100',
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
