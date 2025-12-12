'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SelectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const campus = searchParams.get('campus') || '';
  const [program, setProgram] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [batch, setBatch] = useState('');
  const [projectType, setProjectType] = useState('');

  const programs = ['B.Tech', 'M.Tech', 'M.Sc', 'Ph.D'];
  const specializations = ['CSC', 'Cybersecurity', 'Forensics', 'Digital Forensics'];
  const batches = ['2021-2026', '2022-2027', '2023-2028', '2024-2029', '2025-2030', '2026-2031'];
  const projectTypes = ['Minor Project', 'Major Project'];

  const handleViewProjects = () => {
    const params = new URLSearchParams({
      campus,
      program,
      specialization,
      batch,
      project_type: projectType,
    });
    router.push(`/projects?${params.toString()}`);
  };

  const isFormValid = program && specialization && batch && projectType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <h1 className="text-4xl font-bold text-white mb-2">
            {campus} Campus
          </h1>
          <p className="text-gray-300 mb-8">Select project criteria</p>

          <div className="space-y-6">
            {/* Program */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Select Program
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {programs.map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setProgram(prog)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      program === prog
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-gray-600 bg-gray-900 text-white hover:border-gray-400'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Select Specialization
              </label>
              <div className="grid grid-cols-2 gap-4">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSpecialization(spec)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      specialization === spec
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-gray-600 bg-gray-900 text-white hover:border-gray-400'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Select Batch Year
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {batches.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBatch(b)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      batch === b
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-gray-600 bg-gray-900 text-white hover:border-gray-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Select Project Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {projectTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setProjectType(type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      projectType === type
                        ? 'border-white bg-white text-black font-bold'
                        : 'border-gray-600 bg-gray-900 text-white hover:border-gray-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={handleViewProjects}
              disabled={!isFormValid}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                isFormValid
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              View Projects →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
