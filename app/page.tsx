'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const campuses = [
  { name: 'Gandhinagar Campus', value: 'Gandhinagar' },
  { name: 'Delhi Campus', value: 'Delhi' },
  { name: 'Goa Campus', value: 'Goa' },
  { name: 'Tripura Campus', value: 'Tripura' },
  { name: 'Bhopal Campus', value: 'Bhopal' },
  { name: 'Pune Campus', value: 'Pune' },
  { name: 'Guwahati Campus', value: 'Guwahati' },
  { name: 'Manipur Campus', value: 'Manipur' },
  { name: 'Dharwad Campus', value: 'Dharwad' },
  { name: 'Bhubaneswar Campus', value: 'Bhubaneswar' },
  { name: 'Chennai Campus', value: 'Chennai' },
  { name: 'Nagpur Campus', value: 'Nagpur' },
  { name: 'Jaipur Campus', value: 'Jaipur' },
  { name: 'Raipur Campus', value: 'Raipur' },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            NFSU Projects Database
          </h1>
          <p className="text-xl text-gray-600">
            National Forensic Sciences University
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Select your campus to view projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campuses.map((campus) => (
            <button
              key={campus.value}
              onClick={() => router.push(`/select?campus=${campus.value}`)}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-indigo-500"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏛️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {campus.name}
                </h2>
                <p className="text-gray-600">Click to explore projects</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/admin/login"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors mr-4"
          >
            Admin Login
          </a>
          <a
            href="/faculty/login"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Faculty Login
          </a>
        </div>
      </div>
    </div>
  );
}
