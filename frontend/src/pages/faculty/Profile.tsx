import React, { useState } from 'react';
import { Camera, Save, Plus, X } from 'lucide-react';
import { Card, CardHeader, Button, Input, Badge, Avatar, Select } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export const FacultyProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const [profile, setProfile] = useState({
    firstname: 'Dr. Sarah',
    lastName: 'Johnson',
    email: user?.email || 'sarah.johnson@university.edu',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    qualification: 'Ph.D in Computer Science',
    experience: 12,
    phone: '+91 9876543210',
    linkedin: 'https://linkedin.com/in/drsarah',
    dob: '1980-05-15',
    headof: ['AI/ML Club', 'Coding Club'],
    subjects: ['Data Structures', 'Machine Learning', 'Deep Learning'],
    skills: ['Python', 'TensorFlow', 'Research', 'Data Analysis'],
    techstacks: ['Python', 'R', 'PyTorch', 'Scikit-learn', 'Pandas'],
  });

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.techstacks.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        techstacks: [...profile.techstacks, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      techstacks: profile.techstacks.filter((s) => s !== skill),
    });
  };

  const handleSave = () => {
    // Save profile to API
    setIsEditing(false);
  };

  const designations = [
    { value: 'Professor', label: 'Professor' },
    { value: 'Associate Professor', label: 'Associate Professor' },
    { value: 'Assistant Professor', label: 'Assistant Professor' },
    { value: 'Lecturer', label: 'Lecturer' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-green-500 to-teal-500 rounded-t-xl -m-5 mb-0"></div>
          
          {/* Avatar */}
          <div className="relative -mt-16 ml-6">
            <div className="relative inline-block">
              <Avatar name={`${profile.firstname} ${profile.lastName}`} size="xl" />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-green-600 rounded-full text-white hover:bg-green-700">
                  <Camera size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.firstname} {profile.lastName}</h1>
            <p className="text-gray-500">{profile.designation} • {profile.department}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.headof.map((club) => (
                <Badge key={club} variant="success" size="sm">Head: {club}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            {isEditing ? (
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} leftIcon={<Save size={16} />}>
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader title="Contact Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            value={profile.email}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={profile.phone}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <Input
            label="LinkedIn"
            value={profile.linkedin}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={profile.dob}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
          />
        </div>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader title="Professional Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={profile.firstname}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, firstname: e.target.value })}
          />
          <Input
            label="Last Name"
            value={profile.lastName}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
          />
          {isEditing ? (
            <Select
              label="Designation"
              options={designations}
              value={profile.designation}
              onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
            />
          ) : (
            <Input
              label="Designation"
              value={profile.designation}
              disabled
            />
          )}
          <Input
            label="Qualification"
            value={profile.qualification}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
          />
          <Input
            label="Experience (years)"
            type="number"
            value={profile.experience.toString()}
            disabled={!isEditing}
            onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) })}
          />
          <Input
            label="Department"
            value={profile.department}
            disabled
          />
        </div>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader title="Subjects Teaching" />
        <div className="flex flex-wrap gap-2">
          {profile.subjects.map((subject) => (
            <Badge key={subject} variant="info">
              {subject}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader title="Tech Stack & Skills" subtitle="Your technical expertise" />
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.techstacks.map((skill) => (
            <Badge key={skill} variant="default">
              {skill}
              {isEditing && (
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1.5 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              )}
            </Badge>
          ))}
        </div>
        
        {isEditing && (
          <div className="flex space-x-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} leftIcon={<Plus size={16} />}>
              Add
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
