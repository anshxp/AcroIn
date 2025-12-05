import React, { useState } from 'react';
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

export const StudentProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      _id: '1',
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product management, shopping cart, and payment integration.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      github_link: 'https://github.com/example/ecommerce',
      live_link: 'https://ecommerce.example.com',
    },
    {
      _id: '2',
      title: 'AI Chatbot',
      description: 'An intelligent chatbot using OpenAI GPT-3 API for natural language processing. Integrated with Discord and Slack for seamless communication.',
      technologies: ['Python', 'OpenAI', 'FastAPI', 'Docker'],
      github_link: 'https://github.com/example/chatbot',
    },
    {
      _id: '3',
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, team workspaces, and progress tracking features.',
      technologies: ['React', 'Firebase', 'Tailwind', 'Redux'],
      github_link: 'https://github.com/example/taskapp',
      live_link: 'https://taskapp.example.com',
    },
    {
      _id: '4',
      title: 'Weather Dashboard',
      description: 'A beautiful weather dashboard with 7-day forecasts, location-based weather, and interactive charts for temperature and precipitation.',
      technologies: ['Vue.js', 'Chart.js', 'OpenWeather API'],
      github_link: 'https://github.com/example/weather',
      live_link: 'https://weather.example.com',
    },
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map((t) => t.trim()),
    };

    if (editingProject) {
      setProjects(
        projects.map((p) =>
          p._id === editingProject._id ? { ...p, ...projectData } : p
        )
      );
    } else {
      const newProject: Project = {
        _id: Date.now().toString(),
        ...projectData,
      };
      setProjects([newProject, ...projects]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter((p) => p._id !== id));
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Projects</h1>
          <p>Showcase your work and achievements</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="cards-grid">
          {filteredProjects.map((project, index) => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <div className="project-card-actions">
                  <button onClick={() => handleOpenModal(project)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="delete" onClick={() => handleDelete(project._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="project-card-description">{project.description}</p>

              <div className="project-card-tech">
                {project.technologies.map((tech, i) => (
                  <span key={tech} className={`tech-tag ${techColors[(index + i) % techColors.length]}`}>
                    {tech}
                  </span>
                ))}
              </div>

              <div className="project-card-links">
                {project.github_link && (
                  <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                    <Github size={16} />
                    GitHub
                  </a>
                )}
                {project.live_link && (
                  <a href={project.live_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={40} />
          </div>
          <h3>No projects found</h3>
          <p>Start showcasing your work by adding your first project</p>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Project</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-field">
                  <label>Project Title</label>
                  <input
                    type="text"
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="modal-field">
                  <label>Description</label>
                  <textarea
                    placeholder="Describe your project..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>Technologies (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, MongoDB"
                    value={formData.technologies}
                    onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-field">
                  <label>GitHub Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github_link}
                    onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label>Live Demo Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.live_link}
                    onChange={(e) => setFormData({ ...formData, live_link: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn submit">
                  {editingProject ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
