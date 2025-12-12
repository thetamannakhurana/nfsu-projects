import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// @ts-ignore
import { getProjects, addProject } from '@/lib/googleSheets.js';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    campus: searchParams.get('campus') || undefined,
    program: searchParams.get('program') || undefined,
    specialization: searchParams.get('specialization') || undefined,
    batch: searchParams.get('batch') || undefined,
    project_type: searchParams.get('project_type') || undefined,
  };
  
  // @ts-ignore
  const projects = await getProjects(filters);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await request.json();
  data.addedBy = session.user.email;
  
  // @ts-ignore
  const result = await addProject(data);
  return NextResponse.json(result);
}
