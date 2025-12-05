import React, { useState } from 'react';
import { Plus, Search, Calendar, MapPin, Briefcase, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { Card, Button, Input, Modal, Badge, Select } from '../../components/ui';

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'internship' | 'job' | 'competition' | 'workshop';
  location: string;
  deadline: string;
  description: string;
  requirements: string[];
  link?: string;
  isActive: boolean;
  createdAt: string;
}

/** typed form data used for the modal */
interface OpportunityForm {
  title: string;
  company: string;
  type: Opportunity['type']; // use union type so TS knows it's compatible
  location: string;
  deadline: string;
  description: string;
  requirements: string; // comma separated in the form
  link: string;
}

export const PostOpportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: '1',
      title: 'Software Engineering Internship',
      company: 'Google',
      type: 'internship',
      location: 'Bangalore, India',
      deadline: '2024-02-15',
      description: 'Join Google as a Software Engineering Intern and work on cutting-edge projects.',
      requirements: ['3rd or 4th year B.Tech/M.Tech', 'Strong coding skills', 'Data Structures knowledge'],
      link: 'https://careers.google.com',
      isActive: true,
      createdAt: '2024-01-10',
    },
    {
      id: '2',
      title: 'Smart India Hackathon 2024',
      company: 'Ministry of Education',
      type: 'competition',
      location: 'Pan India',
      deadline: '2024-03-01',
      description: 'Participate in India\'s largest hackathon and solve real-world problems.',
      requirements: ['Team of 6 members', 'All departments eligible'],
      link: 'https://sih.gov.in',
      isActive: true,
      createdAt: '2024-01-08',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [formData, setFormData] = useState<OpportunityForm>({
    title: '',
    company: '',
    type: 'internship',
    location: '',
    deadline: '',
    description: '',
    requirements: '',
    link: '',
  });

  const typeOptions = [
    { value: 'internship', label: 'Internship' },
    { value: 'job', label: 'Job' },
    { value: 'competition', label: 'Competition' },
    { value: 'workshop', label: 'Workshop' },
  ];

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (opportunity?: Opportunity) => {
    if (opportunity) {
      setEditingOpportunity(opportunity);
      setFormData({
        title: opportunity.title,
        company: opportunity.company,
        type: opportunity.type,
        location: opportunity.location,
        deadline: opportunity.deadline,
        description: opportunity.description,
        requirements: opportunity.requirements.join(', '),
        link: opportunity.link || '',
      });
    } else {
      setEditingOpportunity(null);
      setFormData({
        title: '',
        company: '',
        type: 'internship',
        location: '',
        deadline: '',
        description: '',
        requirements: '',
        link: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // build a Partial<Opportunity> from form data
    const opportunityData: Partial<Opportunity> = {
      title: formData.title,
      company: formData.company,
      // cast to the exact union type
      type: formData.type,
      location: formData.location,
      deadline: formData.deadline,
      description: formData.description,
      requirements: formData.requirements
        ? formData.requirements.split(',').map((r) => r.trim()).filter(Boolean)
        : [],
      link: formData.link || undefined,
    };

    if (editingOpportunity) {
      // update: preserve fields that form doesn't provide (id, isActive, createdAt)
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === editingOpportunity.id
            ? ({
                ...o,
                ...opportunityData,
              } as Opportunity) // assert as Opportunity after merging
            : o
        )
      );
    } else {
      // create new opportunity
      const newOpportunity: Opportunity = {
        id: Date.now().toString(),
        title: opportunityData.title || '',
        company: opportunityData.company || '',
        type: opportunityData.type || 'internship',
        location: opportunityData.location || '',
        deadline: opportunityData.deadline || '',
        description: opportunityData.description || '',
        requirements: opportunityData.requirements || [],
        link: opportunityData.link,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setOpportunities((prev) => [newOpportunity, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      setOpportunities(opportunities.filter((o) => o.id !== id));
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'internship':
        return 'info';
      case 'job':
        return 'success';
      case 'competition':
        return 'warning';
      case 'workshop':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-500">Post and manage opportunities for students</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={18} />}>
          Post Opportunity
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} hover>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                      <Badge variant={getTypeBadgeVariant(opportunity.type) as any} size="sm">
                        {opportunity.type}
                      </Badge>
                    </div>
                    <p className="text-indigo-600 font-medium">{opportunity.company}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenModal(opportunity)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(opportunity.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {opportunity.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                  {opportunity.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {opportunity.requirements.slice(0, 3).map((req, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {req}
                    </Badge>
                  ))}
                  {opportunity.requirements.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{opportunity.requirements.length - 3} more
                    </Badge>
                  )}
                </div>

                {opportunity.link && (
                  <a
                    href={opportunity.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Apply Now <ExternalLink size={14} className="ml-1" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No opportunities found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => handleOpenModal()}
          >
            Post your first opportunity
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOpportunity ? 'Edit Opportunity' : 'Post New Opportunity'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g., Software Engineering Internship"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company/Organization"
              placeholder="e.g., Google"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
            <Select
              label="Type"
              options={typeOptions}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Opportunity['type'] })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g., Bangalore, India"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <Input
              label="Application Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              required
            />
          </div>

          <Input
            label="Requirements (comma separated)"
            placeholder="e.g., 3rd year B.Tech, Strong coding skills"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />

          <Input
            label="Application Link"
            type="url"
            placeholder="https://..."
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingOpportunity ? 'Save Changes' : 'Post Opportunity'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
