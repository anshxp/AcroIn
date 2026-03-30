import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Plus, Search, ExternalLink, Trash2, Edit2, Github, FolderOpen, X } from 'lucide-react';
import '../../styles/pages.css';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
}

const techColors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan'];

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      _id
      title
      description
      technologies
      github_link
      live_link
    }
  }
`;

export const StudentProjects: React.FC = () => {
  const { data, loading, error } = useQuery<{ projects: Project[] }>(GET_PROJECTS);
  const projects = data?.projects || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    github_link: '',
    live_link: '',
  });

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        technologies: project.technologies.join(', '),
        github_link: project.github_link || '',
        live_link: project.live_link || '',
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        technologies: '',
        github_link: '',
        live_link: '',
      });
    }
    setIsModalOpen(true);
  };

  // TODO: Implement create/update/delete using useMutation if backend supports mutations
  // Remove local CRUD logic and use backend for all operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement create/update logic using useMutation
  };

  const handleDelete = (id: string) => {
    console.log('Deleting project:', id);
    // Implement delete logic using useMutation
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="page-container projects-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>My Projects</h1>
          <p>Showcase your work and technical skills</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search projects or technologies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="cards-grid">
        {filteredProjects.map((project) => (
          <div key={project._id} className="project-card">
            <div className="project-card-header">
              <h3>{project.title}</h3>
              <div className="project-card-actions">
                <button onClick={() => handleOpenModal(project)} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button className="delete" onClick={() => handleDelete(project._id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="project-card-description">{project.description}</p>
            <div className="project-card-tech">
              {project.technologies.map((tech, i) => (
                <span key={i} className={`tech-tag ${techColors[i % techColors.length]}`}>
                  {tech}
                </span>
              ))}
            </div>
            <div className="project-card-links">
              {project.github_link && (
                <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  <span>Code</span>
                </a>
              )}
              {project.live_link && (
                <a href={project.live_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  <span>Demo</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="table-empty">
          <FolderOpen size={48} />
          <p>No projects found. Add your first project to showcase your skills!</p>
        </div>
      )}

      {/* Project Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Portfolio Website" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what you built and what problems it solves..." 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Technologies (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.technologies}
                  onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                  placeholder="e.g. React, Node.js, MongoDB" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>GitHub Link</label>
                <input 
                  type="url" 
                  value={formData.github_link}
                  onChange={(e) => setFormData({...formData, github_link: e.target.value})}
                  placeholder="https://github.com/yourusername/project" 
                />
              </div>
              <div className="form-group">
                <label>Live Demo Link</label>
                <input 
                  type="url" 
                  value={formData.live_link}
                  onChange={(e) => setFormData({...formData, live_link: e.target.value})}
                  placeholder="https://project-demo.com" 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingProject ? 'Save Changes' : 'Add Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
