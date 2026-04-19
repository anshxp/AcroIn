import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Search, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { facultyAPI, studentAPI } from '../../services/api';
import { Button, Card, Input } from '../../components/ui';
import type { Student } from '../../types';

export const VerifyStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const allStudents = await studentAPI.getAllStudents();
        setStudents(allStudents);
      } catch {
        setError('Unable to load students for verification.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const pendingStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students
      .filter((student) => (student.verificationStatus || 'not_verified') !== 'verified')
      .filter((student) => student.faceVerificationStatus === 'complete')
      .filter((student) => (student.profileCompleteness || 0) >= 40)
      .filter((student) => {
        if (!normalizedQuery) return true;

        return (
          String(student.name || '').toLowerCase().includes(normalizedQuery)
          || String(student.roll || '').toLowerCase().includes(normalizedQuery)
          || String(student.department || '').toLowerCase().includes(normalizedQuery)
        );
      });
  }, [students, query]);

  const handleVerify = async (identifier: string) => {
    try {
      setVerifyingId(identifier);
      setError(null);
      setMessage(null);

      const result = await facultyAPI.verifyStudent(identifier);
      setMessage(result?.message || 'Student verified successfully.');

      setStudents((prev) => prev.map((student) => (
        student._id === identifier
          ? {
              ...student,
              verificationStatus: 'verified',
              verifiedAt: new Date().toISOString(),
            }
          : student
      )));
    } catch {
      setError('Verification failed. Ensure student belongs to your department and has complete face verification.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Students</h1>
        <p className="text-gray-500">Students shown below already satisfy face complete + profile completeness criteria.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, roll, department"
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Loading students...</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="space-y-4">
        {pendingStudents.map((student) => (
          <Card key={student._id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-500">{student.roll} • {student.department}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Profile completeness: {student.profileCompleteness || 0}% • Face: {student.faceVerificationStatus}
                </p>
              </div>

              <Button
                onClick={() => handleVerify(student._id)}
                disabled={verifyingId === student._id}
                leftIcon={<CheckCircle size={16} />}
              >
                {verifyingId === student._id ? 'Verifying...' : 'Verify'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate(`/faculty/student/${student._id}`)}
              >
                Review Profile
              </Button>
            </div>
          </Card>
        ))}

        {!loading && !pendingStudents.length && (
          <Card>
            <div className="flex items-center gap-2 text-gray-600">
              <ShieldAlert size={18} />
              <span>No students are currently eligible for verification.</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
