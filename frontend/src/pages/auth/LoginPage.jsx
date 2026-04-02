import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
    
    {/* LEFT SIDE (optional branding) */}
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#2d4a6f] text-white p-12">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold mb-4">
          Welcome Back 👋
        </h1>
        <p className="text-gray-300">
          Login to continue building your network and explore opportunities.
        </p>
      </div>
    </div>

    {/* RIGHT SIDE (FORM) */}
    <div className="flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-md">
        
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-[#1e3a5f] to-[#0f2744] hover:shadow-lg hover:-translate-y-0.5 transition disabled:opacity-70"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{" "}
          <Link to="/register" className="text-blue-500 font-medium hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>

  </div>
);};
