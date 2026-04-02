import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    firstname: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    designation: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload =
      userType === 'student'
        ? {
            name: formData.name,
            roll: formData.roll,
            email: formData.email,
            password: formData.password,
            department: formData.department,
          }
        : {
            firstname: formData.firstname,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            department: formData.department,
            designation: formData.designation,
          };

    try {
      await register(payload, userType);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <select value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
        </select>

        {userType === 'student' ? (
          <>
            <input name="name" placeholder="Full name" value={formData.name} onChange={handleChange} required />
            <input name="roll" placeholder="Roll" value={formData.roll} onChange={handleChange} required />
          </>
        ) : (
          <>
            <input name="firstname" placeholder="First name" value={formData.firstname} onChange={handleChange} required />
            <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
            <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} />
          </>
        )}

        <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};
