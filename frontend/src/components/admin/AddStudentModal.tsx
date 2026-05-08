import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (student: any) => void;
  createStudent: (data: any) => Promise<any>;
}

export const AddStudentModal: React.FC<Props> = ({ isOpen, onClose, onCreated, createStudent }) => {
  const [firstname, setFirstname] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const departmentOptions = ['CSE', 'AIML', 'DS', 'CSIT', 'CYBER', 'ECE', 'EEE', 'VLSI', 'ME', 'CE', 'IT', 'IL'];

  if (!isOpen) return null;

  const reset = () => {
    setFirstname(''); setLastName(''); setEmail(''); setRollNo(''); setDepartment(''); setPassword(''); setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstname.trim() || !lastName.trim() || !email.trim() || !rollNo.trim() || !department.trim() || !password.trim()) {
      setError('First name, last name, email, roll number, department, and password are required');
      return;
    }

    setLoading(true);
    try {
      const name = `${firstname.trim()} ${lastName.trim()}`.trim() || undefined;
      const payload = {
        name,
        email: email.trim().toLowerCase(),
        roll: rollNo.trim(),
        department: department.trim(),
        password: password,
      };

      const res = await createStudent(payload);
      if (onCreated) onCreated(res);
      reset();
      onClose();
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(backendMessage || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <header className="modal-header">
          <h3>Add Student</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </header>
        <form className="modal-body" onSubmit={handleSubmit}>
          {error && <div className="modal-error">{error}</div>}
          <div className="form-row">
            <label>First name</label>
            <input value={firstname} onChange={(e) => setFirstname(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Roll No</label>
            <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Select department</option>
              {departmentOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <p className="modal-help">Roll number and email must be unique. Use the student&apos;s official college email.</p>

          <footer className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Student'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
