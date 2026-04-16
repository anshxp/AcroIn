import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Award,
  Briefcase,
  Trophy,
} from 'lucide-react';
import { Card, Button, Input, Modal, Badge, Avatar, Select } from '../../components/ui';

interface VerificationRequest {
  id: string;
  student: {
    name: string;
    roll: string;
    department: string;
  };
  type: 'certificate' | 'internship' | 'competition';
  title: string;
  organization: string;
  date: string;
  documentLink?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export const VerifyStudents: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([
    {
      id: '1',
      student: { name: 'John Doe', roll: '21CS001', department: 'CSE' },
      type: 'certificate',
      title: 'AWS Solutions Architect',
      organization: 'Amazon Web Services',
      date: '2024-01-10',
      documentLink: 'https://aws.amazon.com/verification/123',
      status: 'pending',
      submittedAt: '2024-01-15',
    },
    {
      id: '2',
      student: { name: 'Jane Smith', roll: '21CS002', department: 'CSE' },
      type: 'internship',
      title: 'Software Engineering Intern',
      organization: 'Google',
      date: '2023-06-01',
      documentLink: 'https://drive.google.com/certificate',
      status: 'pending',
      submittedAt: '2024-01-14',
    },
    {
      id: '3',
      student: { name: 'Mike Johnson', roll: '21CS003', department: 'CSE' },
      type: 'competition',
      title: 'Smart India Hackathon - 1st Place',
      organization: 'Ministry of Education',
      date: '2024-01-05',
      documentLink: 'https://sih.gov.in/certificate',
      status: 'pending',
      submittedAt: '2024-01-13',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'internship', label: 'Internships' },
    { value: 'competition', label: 'Competitions' },
  ];

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || request.type === filterType;
    return matchesSearch && matchesFilter && request.status === 'pending';
  });

  const handleVerify = (id: string, status: 'approved' | 'rejected') => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status } : r))
    );
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <Award className="w-5 h-5" />;
      case 'internship':
        return <Briefcase className="w-5 h-5" />;
      case 'competition':
        return <Trophy className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'info';
      case 'internship':
        return 'success';
      case 'competition':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verify Students</h1>
        <p className="text-gray-500">Review and verify student achievements</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by student or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={filterOptions}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      {/* Pending Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['certificate', 'internship', 'competition'].map((type) => {
          const count = requests.filter((r) => r.type === type && r.status === 'pending').length;
          return (
            <Card key={type} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    type === 'certificate' ? 'bg-blue-100 text-blue-600' :
                    type === 'internship' ? 'bg-green-100 text-green-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {getTypeIcon(type)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 capitalize">{type}s</p>
                    <p className="text-xl font-bold text-gray-900">{count}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} hover>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start space-x-4">
                <Avatar name={request.student.name} size="lg" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{request.student.name}</h3>
                    <span className="text-sm text-gray-500">({request.student.roll})</span>
                  </div>
                  <p className="text-sm text-gray-500">{request.student.department}</p>
                  <div className="mt-2">
                    <p className="font-medium text-gray-800">{request.title}</p>
                    <p className="text-sm text-gray-500">{request.organization}</p>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant={getTypeBadgeVariant(request.type) as any} size="sm">
                      {request.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {request.documentLink && (
                  <a
                    href={request.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsModalOpen(true);
                  }}
                  leftIcon={<Eye size={16} />}
                >
                  Review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVerify(request.id, 'approved')}
                  className="text-green-600 hover:bg-green-50"
                  leftIcon={<CheckCircle size={16} />}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVerify(request.id, 'rejected')}
                  className="text-red-600 hover:bg-red-50"
                  leftIcon={<XCircle size={16} />}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-500">No pending verification requests</p>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Review Request"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar name={selectedRequest.student.name} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedRequest.student.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedRequest.student.roll} • {selectedRequest.student.department}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase">Type</label>
                <p className="font-medium capitalize">{selectedRequest.type}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Title</label>
                <p className="font-medium">{selectedRequest.title}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Organization</label>
                <p className="font-medium">{selectedRequest.organization}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Date</label>
                <p className="font-medium">
                  {new Date(selectedRequest.date).toLocaleDateString()}
                </p>
              </div>
              {selectedRequest.documentLink && (
                <div>
                  <label className="text-xs text-gray-500 uppercase">Document</label>
                  <a
                    href={selectedRequest.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-700"
                  >
                    View Document <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="danger"
                onClick={() => handleVerify(selectedRequest.id, 'rejected')}
                leftIcon={<XCircle size={16} />}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleVerify(selectedRequest.id, 'approved')}
                leftIcon={<CheckCircle size={16} />}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
