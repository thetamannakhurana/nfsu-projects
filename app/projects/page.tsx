'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Project {
  campus: string;
  program: string;
  specialization: string;
  batch: string;
  projectType: string;
  projectName: string;
  studentName: string;
  studentEmail: string;
  guideName: string;
}

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const campus = searchParams.get('campus');
  const program = searchParams.get('program');
  const specialization = searchParams.get('specialization');
  const batch = searchParams.get('batch');
  const projectType = searchParams.get('project_type');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        campus: campus || '',
        program: program || '',
        specialization: specialization || '',
        batch: batch || '',
        project_type: projectType || '',
      });
      
      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 mb-6 border border-gray-700">
          <button
            onClick={() => router.back()}
            className="mb-4 text-white hover:text-gray-300 font-semibold"
          >
            ← Back
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {projectType}s
          </h1>
          
          <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-700">
            <p className="text-gray-300">
              <span className="font-semibold text-white">Campus:</span> {campus} |{' '}
              <span className="font-semibold text-white">Program:</span> {program} |{' '}
              <span className="font-semibold text-white">Specialization:</span> {specialization} |{' '}
              <span className="font-semibold text-white">Batch:</span> {batch}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-300">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-300">No projects found for this criteria.</p>
              <p className="text-gray-400 mt-2">Try different filters or add projects via admin/faculty panel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedProject(project)}
                  className="bg-gray-900 p-6 rounded-lg border-2 border-gray-700 hover:border-white cursor-pointer transform hover:scale-102 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {project.projectName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Click to view details
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full shadow-2xl border-2 border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              {selectedProject.projectName}
            </h2>
            
            <div className="space-y-4 text-lg">
              <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border border-blue-700">
                <p className="font-semibold text-blue-200 mb-1">Student Name</p>
                <p className="text-white">{selectedProject.studentName}</p>
              </div>
              
              <div className="bg-purple-900 bg-opacity-50 p-4 rounded-lg border border-purple-700">
                <p className="font-semibold text-purple-200 mb-1">Student Email</p>
                <p className="text-white">{selectedProject.studentEmail || 'Not provided'}</p>
              </div>
              
              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg border border-green-700">
                <p className="font-semibold text-green-200 mb-1">Guide Name</p>
                <p className="text-white">{selectedProject.guideName}</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <p className="font-semibold text-gray-300 mb-1">Project Details</p>
                <p className="text-gray-400 text-sm mt-2">
                  {selectedProject.program} - {selectedProject.specialization}<br/>
                  Batch: {selectedProject.batch}<br/>
                  Type: {selectedProject.projectType}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="mt-6 w-full bg-white text-black py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
