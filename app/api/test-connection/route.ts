import { getSheet } from '../../../lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    // Get headers
    const headers = sheet.headerValues;
    
    // Get first 3 rows of data
    const sampleData = rows.slice(0, 3).map(row => {
      const data = {};
      headers.forEach(header => {
        data[header] = row.get(header);
      });
      return data;
    });
    
    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      headers: headers,
      sampleData: sampleData
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
