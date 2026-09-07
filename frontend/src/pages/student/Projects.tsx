import React, { useEffect, useState } from 'react';
import { Plus, Search, ExternalLink, Trash2, Edit2, Github, FolderOpen, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectAPI } from '../../services/api';
import '../../styles/pages.css';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
  student?: string;
}

const techColors = ['blue', 'green', 'purple', 'orange', 'pink', 'cyan'];

export const StudentProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', technologies: '', github_link: '', live_link: '' });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const studentIdentifier = user?.email || user?.id;
        if (!studentIdentifier) { setProjects([]); return; }
        const backendProjects = await projectAPI.getByStudent(studentIdentifier);
        setProjects(Array.isArray(backendProjects) ? backendProjects : []);
      } catch { setProjects([]); }
    };
    loadProjects();
  }, [user?.email, user?.id]);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({ title: project.title, description: project.description, technologies: project.technologies.join(', '), github_link: project.github_link || '', live_link: project.live_link || '' });
    } else {
      setEditingProject(null);
      setFormData({ title: '', description: '', technologies: '', github_link: '', live_link: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      student: editingProject?.student || user?.email || user?.id || '',
    };
    try {
      if (editingProject) {
        const updatedProject = await projectAPI.update(editingProject._id, projectData);
        setProjects((current) => current.map((project) => project._id === editingProject._id ? updatedProject : project));
      } else {
        const createdProject = await projectAPI.create(projectData);
        setProjects((current) => [createdProject, ...current]);
      }
      setIsModalOpen(false);
    } catch { return; }
  };

  const handleDelete = (id: string) => {
    setDeletingProject(projects.find((project) => project._id === id) || null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    try {
      await projectAPI.delete(deletingProject._id);
      setProjects((current) => current.filter((project) => project._id !== deletingProject._id));
    } catch { return; }
    setDeletingProject(null);
    setIsDeleteModalOpen(false);
  };

  const cancelDelete = () => { setDeletingProject(null); setIsDeleteModalOpen(false); };

  const addProjectButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    minHeight: '44px',
    padding: '12px 20px',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
    boxSizing: 'border-box',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Projects</h1>
          <p>Showcase your work and achievements</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn-primary" style={addProjectButtonStyle} onClick={() => handleOpenModal()}>
            <Plus size={18} aria-hidden="true" style={{ display: 'block', flex: '0 0 auto', margin: 0 }} />
            <span style={{ display: 'block', margin: 0, lineHeight: 1.2 }}>Add Project</span>
          </button>
        </div>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="cards-grid">
          {filteredProjects.map((project, index) => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <div className="project-card-actions">
                  <button type="button" onClick={() => handleOpenModal(project)} aria-label={`Edit ${project.title}`}><Edit2 size={16} /></button>
                  <button type="button" className="delete" onClick={() => handleDelete(project._id)} aria-label={`Delete ${project.title}`}><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="project-card-description">{project.description}</p>
              <div className="project-card-tech">
                {(project.technologies || []).map((tech, i) => <span key={`${tech}-${i}`} className={`tech-tag ${techColors[(index + i) % techColors.length]}`}>{tech}</span>)}
              </div>
              <div className="project-card-links">
                {project.github_link && <a href={project.github_link} target="_blank" rel="noopener noreferrer"><Github size={16} />GitHub</a>}
                {project.live_link && <a href={project.live_link} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />Live Demo</a>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon"><FolderOpen size={40} /></div>
          <h3>No projects found</h3>
          <p>Start showcasing your work by adding your first project</p>
          <button type="button" className="btn-primary" style={addProjectButtonStyle} onClick={() => handleOpenModal()}>
            <Plus size={18} aria-hidden="true" style={{ display: 'block', flex: '0 0 auto', margin: 0 }} />
            <span style={{ display: 'block', margin: 0, lineHeight: 1.2 }}>Add Project</span>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-field"><label>Project Title</label><input type="text" placeholder="Enter project title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                <div className="modal-field"><label>Description</label><textarea placeholder="Describe your project..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></div>
                <div className="modal-field"><label>Technologies (comma separated)</label><input type="text" placeholder="React, Node.js, MongoDB" value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} required /></div>
                <div className="modal-field"><label>GitHub Link</label><input type="url" placeholder="https://github.com/..." value={formData.github_link} onChange={(e) => setFormData({ ...formData, github_link: e.target.value })} /></div>
                <div className="modal-field"><label>Live Demo Link</label><input type="url" placeholder="https://..." value={formData.live_link} onChange={(e) => setFormData({ ...formData, live_link: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn submit">{editingProject ? 'Save Changes' : 'Add Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deletingProject && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Delete Project</h2><button type="button" className="modal-close" onClick={cancelDelete} aria-label="Close"><X size={20} /></button></div>
            <div className="modal-body"><div className="confirm-delete-box"><p className="confirm-delete-title">Are you sure you want to delete this project?</p><p className="confirm-delete-text"><strong>{deletingProject.title}</strong> will be removed permanently from your list.</p></div></div>
            <div className="modal-footer"><button type="button" className="modal-btn cancel" onClick={cancelDelete}>Cancel</button><button type="button" className="modal-btn submit delete" onClick={confirmDelete}>Delete Project</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
