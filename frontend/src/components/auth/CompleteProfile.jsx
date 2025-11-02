import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import apiClient from '../../lib/apiClient.js';
import { Loader2 } from 'lucide-react';
import EnhancedBackground from '../common/EnhancedBackground.jsx';


export default function CompleteProfile() {
  const {user, login} = useAuth();
  const [formData, setFormData] = useState(
    user.role === 'student'
      ? { rollNumber: '', year: 1, program: 'CS' }
      : { facultyId: '', department: 'CSIT', designation: 'Lecturer' }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.name]: e.target.value,
      });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
          const url = user.role === 'student' ? '/student' : '/teacher';
          const response = await apiClient.post(url, formData);

          alert('Profile completed successfully! Please log in again.');
          await apiClient.post('/auth/logout');
          window.location.reload();
      } catch (error) {
          setError(error.response?.data?.message || 'Failed to update profile.');
          setLoading(false);
      }
  };

  const renderStudentForm = () => (
  <>
    <h2 className="text-3xl font-bold text-white mb-4">Complete Your Student Profile</h2>
    <p className="text-slate-400 mb-6">We need a few more details to get you set up.</p>
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">Roll Number</label>
      <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className="w-full p-3 bg-slate-700 rounded-lg text-white" />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">Year (1-4)</label>
      <input type="number" name="year" min="1" max="4" value={formData.year} onChange={handleChange} required className="w-full p-3 bg-slate-700 rounded-lg text-white" />
    </div>
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-2">Program (e.g., CS, SE, AI)</label>
      <input type="text" name="program" value={formData.program} onChange={handleChange} required className="w-full p-3 bg-slate-700 rounded-lg text-white" />
    </div>
  </>
  );

  const renderTeacherForm = () => (
    <>
      <h2 className="text-3xl font-bold text-white mb-4">Complete Your Faculty Profile</h2>
      <p className="text-slate-400 mb-6">We need a few more details to get you set up.</p>
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Faculty ID</label>
        <input type="text" name="facultyId" value={formData.facultyId} onChange={handleChange} required className="w-full p-3 bg-slate-700 rounded-lg text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Department</label>
        <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full p-3 bg-slate-700 rounded-lg text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">Designation</label>
        <select name="designation" value={formData.designation} onChange={handleChange} className="w-full p-3 bg-slate-700 rounded-lg text-white">
          <option>Lecturer</option>
          <option>Assistant Professor</option>
          <option>Associate Professor</option>
          <option>Professor</option>
        </select>
      </div>
    </>
  );

  return (
    <EnhancedBackground variant="dark">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
            {user.role === 'student' ? renderStudentForm() : renderTeacherForm()}
            {error && <p className="text-red-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin" /> : 'Save and Continue'}
            </button>
          </form>
        </div>
      </div>
    </EnhancedBackground>
  );
};