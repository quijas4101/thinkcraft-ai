'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export function PopulateTestData() {
  const { authState } = useAuth();
  const [status, setStatus] = useState('');

  const populateData = async () => {
    try {
      setStatus('Populating...');
      
      const response = await fetch('/api/debug/populate-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherUid: 'TEACHER_UID', // Replace with actual teacher UID
          studentUid: 'STUDENT_UID'  // Replace with actual student UID
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('Data populated successfully!');
      } else {
        setStatus('Error: ' + data.error);
      }
    } catch (error) {
      setStatus('Error: ' + error);
    }
  };

  return (
    <div className="p-4 bg-yellow-100 rounded-lg">
      <button 
        onClick={populateData}
        className="bg-yellow-500 text-white px-4 py-2 rounded"
      >
        Populate Test Data
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
} 