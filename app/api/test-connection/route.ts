import { getProjects } from '../../../lib/googleSheets';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    console.log('Testing connection...');
    const projects = await getProjects();
    return NextResponse.json({
      success: true,
      count: projects.length,
      projects: projects
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
