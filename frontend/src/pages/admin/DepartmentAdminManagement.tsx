import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { adminAPI } from '../../services/api';

const departments = ['CSE', 'AIML', 'DS', 'CSIT', 'CYBER', 'ECE', 'EEE', 'VLSI', 'ME', 'CE', 'IT', 'IL'];

export const DepartmentAdminManagement: React.FC = () => {
  const [form, setForm] = useState({
    firstname: '',
    lastName: '',
    email: '',
    password: '',
    department: 'CSE',
    designation: 'Department Administrator',
    qualification: '',
    experience: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await adminAPI.createFaculty({
        ...form,
        experience: Number(form.experience) || 0,
        role: 'dept_admin',
      });
      setMessage(`${form.department} departmental admin created successfully.`);
      setForm({ ...form, firstname: '', lastName: '', email: '', password: '', qualification: '', experience: '', phone: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to create departmental admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Shield className="text-indigo-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departmental Administrators</h1>
            <p className="text-gray-600">System admins create one departmental admin for each department.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        {message && <div className="p-3 rounded-lg bg-green-50 text-green-700">{message}</div>}
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-700">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-gray-700">First name<input required value={form.firstname} onChange={(e) => update('firstname', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700">Last name<input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700">College email<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700">Password<input required type="password" minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700">Department<select value={form.department} onChange={(e) => update('department', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5">{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Designation<input required value={form.designation} onChange={(e) => update('designation', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700">Qualification<input value={form.qualification} onChange={(e) => update('qualification', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700">Experience (years)<input type="number" min={0} value={form.experience} onChange={(e) => update('experience', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Phone<input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1 w-full border rounded-lg p-2.5" /></label>
        </div>

        <button disabled={saving} type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50">
          <Plus size={18} />
          {saving ? 'Creating...' : 'Create Departmental Admin'}
        </button>
      </form>
    </div>
  );
};

export default DepartmentAdminManagement;
