import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationAPI, type RecommendationItem } from '../../services/recommendationApi';

interface SuggestedTeammate {
  id: string;
  name: string;
  role: string;
  skills: string[];
  match: number;
  color: string;
  profileImage?: string;
  missingSkills: string[];
  reasons: string[];
}

const palette = ['blue', 'green', 'purple', 'orange'];

const toTeammate = (student: RecommendationItem, index: number): SuggestedTeammate => ({
  id: student.student_id || `recommendation-${index}`,
  name: student.name || 'Unknown Student',
  role: student.department || 'Student',
  skills: student.matched_skills?.length ? student.matched_skills.slice(0, 4) : [],
  match: student.match_percent,
  color: palette[index % palette.length],
  profileImage: student.profile_image || undefined,
  missingSkills: student.missing_skills || [],
  reasons: student.reasons || [],
});

export const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [suggestedTeammates, setSuggestedTeammates] = useState<SuggestedTeammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await recommendationAPI.recommend({ top_n: 8 });
        if (!cancelled) setSuggestedTeammates(response.data.map(toTeammate));
      } catch {
        if (!cancelled) {
          setSuggestedTeammates([]);
          setError('Unable to load recommendations. Please try again later.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadRecommendations();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="page-header"><div className="page-title-section"><h1>Recommendations</h1><p>AI-powered student recommendations for your requirements</p></div></div>
      <div className="dashboard-grid full"><div className="card"><div className="card-header"><div><h2>Top Recommended Students</h2><p>Ranked by the AcroIn recommendation service</p></div></div><div className="card-body">
        {loading && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading recommendations...</p>}
        {!loading && error && <p style={{ color: '#dc2626', textAlign: 'center', padding: '40px' }}>{error}</p>}
        {!loading && !error && !suggestedTeammates.length && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>No recommendations are currently available.</p>}
        {!loading && !error && suggestedTeammates.length > 0 && (
          <div className="teammate-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {suggestedTeammates.map((teammate) => (
              <div key={teammate.id} className="teammate-card" style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                {teammate.profileImage ? <img src={teammate.profileImage} alt={`${teammate.name} profile`} className="teammate-avatar" style={{ objectFit: 'cover' }} /> : <div className={`teammate-avatar ${teammate.color}`}>{teammate.name.split(' ').map((name) => name[0]).join('')}</div>}
                <div className="teammate-info"><h4 className="teammate-name">{teammate.name}</h4><p className="teammate-role">{teammate.role}</p><div className="teammate-skills">{teammate.skills.map((skill, skillIndex) => <span key={skillIndex} className="skill-tag">{skill}</span>)}</div>{teammate.missingSkills.length > 0 && <small style={{ color: '#64748b' }}>Missing: {teammate.missingSkills.slice(0, 3).join(', ')}</small>}</div>
                <div className="teammate-actions"><span className="match-score">{teammate.match}% match</span><button type="button" className="connect-btn" onClick={() => navigate(`/faculty/student/${teammate.id}`)} disabled={teammate.id.startsWith('recommendation-')}>View Profile</button></div>
              </div>
            ))}
          </div>
        )}
      </div></div></div>
    </div>
  );
};
