import React, { useState } from 'react';
import { 
  Image, 
  Video, 
  Calendar, 
  FileText, 
  ThumbsUp, 
  MessageCircle, 
  Repeat2, 
  Send, 
  MoreHorizontal,
  Globe,
  Info,
  X,
  Smile
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/homefeed.css';

interface Post {
  id: number;
  author: {
    name: string;
    initials: string;
    headline: string;
    type: 'faculty' | 'cdc';
    badge?: string;
  };
  content: string;
  image?: string;
  link?: {
    title: string;
    description: string;
    domain: string;
    image?: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  liked: boolean;
}

export const HomeFeed: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: {
        name: 'Dr. Rajesh Kumar',
        initials: 'RK',
        headline: 'Head of Department, Computer Science | Acropolis Institute',
        type: 'faculty',
        badge: 'Faculty'
      },
      content: `🎓 Exciting News for CSE Students!\n\nI'm thrilled to announce that our department has partnered with Google for their Summer Internship Program 2025. This is a fantastic opportunity for 3rd and 4th-year students to gain real-world experience.\n\n📅 Application Deadline: December 15, 2024\n📍 Location: Bangalore, Hyderabad (Hybrid)\n💰 Stipend: Competitive\n\nEligibility:\n• CGPA 7.5+\n• Strong programming fundamentals\n• Knowledge of Data Structures & Algorithms\n\nInterested students, please submit your applications through the placement portal.\n\n#Placements #GoogleInternship #CSE #AcropolisInstitute`,
      timestamp: '2h',
      likes: 234,
      comments: 45,
      reposts: 28,
      liked: false
    },
    {
      id: 2,
      author: {
        name: 'Career Development Cell',
        initials: 'CDC',
        headline: 'Official CDC Account | Acropolis Institute of Technology',
        type: 'cdc',
        badge: 'Official'
      },
      content: `📢 Campus Recruitment Drive Alert!\n\nWe are pleased to announce that Microsoft will be visiting our campus for recruitment.\n\n🏢 Company: Microsoft India\n📅 Date: December 20, 2024\n👥 Roles: Software Engineer, Data Analyst\n📦 Package: 18-25 LPA\n\nEligible Branches: CSE, IT, ECE\nCriteria: No active backlogs, 70% aggregate\n\nPre-placement talk will be held on December 18th in Seminar Hall A.\n\nRegister now on the placement portal!\n\n#MicrosoftRecruitment #CampusPlacement #CareerOpportunities`,
      timestamp: '5h',
      likes: 456,
      comments: 89,
      reposts: 67,
      liked: true
    },
    {
      id: 3,
      author: {
        name: 'Dr. Priya Sharma',
        initials: 'PS',
        headline: 'Associate Professor, Data Science | ML Researcher',
        type: 'faculty',
        badge: 'Faculty'
      },
      content: `🔬 Research Opportunity for Final Year Students\n\nI'm looking for motivated students to join my research group working on "AI-powered Healthcare Diagnostics".\n\nWhat you'll work on:\n• Deep Learning for Medical Imaging\n• Natural Language Processing for Clinical Notes\n• Predictive Analytics for Patient Outcomes\n\nThis is a great opportunity to publish papers and gain research experience before applying for higher studies.\n\nInterested? Drop me an email with your resume and a brief statement of interest.\n\n#Research #MachineLearning #Healthcare #AI`,
      timestamp: '1d',
      likes: 178,
      comments: 34,
      reposts: 21,
      liked: false
    },
    {
      id: 4,
      author: {
        name: 'Career Development Cell',
        initials: 'CDC',
        headline: 'Official CDC Account | Acropolis Institute of Technology',
        type: 'cdc',
        badge: 'Official'
      },
      content: `🏆 Congratulations to our Star Performers!\n\nWe are proud to announce that the following students have received Pre-Placement Offers (PPOs) from their internship companies:\n\n⭐ Amit Verma - Amazon (SDE-1) - 32 LPA\n⭐ Sneha Patel - Google (Software Engineer) - 45 LPA  \n⭐ Rahul Singh - Microsoft (Data Scientist) - 28 LPA\n⭐ Priyanka Joshi - Adobe (Product Engineer) - 24 LPA\n\nTheir hard work and dedication during their internships have paid off! 🎉\n\nLet's celebrate their success and inspire others to follow their path.\n\n#PPO #PlacementSuccess #ProudMoment #AcropolisInstitute`,
      timestamp: '2d',
      likes: 892,
      comments: 156,
      reposts: 234,
      liked: true
    },
    {
      id: 5,
      author: {
        name: 'Dr. Anil Mehta',
        initials: 'AM',
        headline: 'Professor & Placement Coordinator | Industry Connect Lead',
        type: 'faculty',
        badge: 'Faculty'
      },
      content: `📚 Workshop Announcement: "Cracking FAANG Interviews"\n\nDear Students,\n\nWe're organizing a 3-day intensive workshop on technical interview preparation.\n\n📅 Dates: December 10-12, 2024\n⏰ Time: 2:00 PM - 6:00 PM\n📍 Venue: Computer Lab 3\n\nTopics Covered:\n• Data Structures & Algorithms\n• System Design Basics\n• Behavioral Interview Tips\n• Mock Interview Sessions\n\nLimited seats available. Register on the student portal.\n\n#InterviewPrep #FAANG #TechCareers #Workshop`,
      timestamp: '3d',
      likes: 345,
      comments: 67,
      reposts: 89,
      liked: false
    }
  ]);

  const canPost = user?.userType === 'faculty' || user?.userType === 'admin';

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now(),
      author: {
        name: user?.userType === 'faculty' 
          ? `Dr. ${user?.firstname || 'User'} ${user?.lastName || ''}`
          : 'Career Development Cell',
        initials: user?.userType === 'faculty' 
          ? `${user?.firstname?.[0] || 'U'}${user?.lastName?.[0] || ''}` 
          : 'CDC',
        headline: user?.userType === 'faculty'
          ? `${user?.designation || 'Professor'}, ${user?.department || 'Department'}`
          : 'Official CDC Account',
        type: user?.userType === 'faculty' ? 'faculty' : 'cdc',
        badge: user?.userType === 'faculty' ? 'Faculty' : 'Official'
      },
      content: postContent,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false
    };

    setPosts([newPost, ...posts]);
    setPostContent('');
    setShowCreateModal(false);
  };

  const getUserInitials = () => {
    if (user?.userType === 'faculty') {
      return `${user?.firstname?.[0] || 'U'}${user?.lastName?.[0] || ''}`;
    }
    return user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U';
  };

  const getUserName = () => {
    if (user?.userType === 'faculty') {
      return `Dr. ${user?.firstname || 'User'} ${user?.lastName || ''}`;
    }
    return user?.name || 'User';
  };

  return (
    <div className="home-feed">
      {/* Main Feed */}
      <div className="feed-main">
        {/* Create Post Card - Only for Faculty/Admin */}
        {canPost ? (
          <div className="create-post-card">
            <div className="create-post-input-row">
              <div className="create-post-avatar">
                {getUserInitials()}
              </div>
              <input 
                type="text" 
                className="create-post-input"
                placeholder="Share an announcement, opportunity, or update..."
                onClick={() => setShowCreateModal(true)}
                readOnly
              />
            </div>
            <div className="create-post-actions">
              <button className="create-post-btn photo" onClick={() => setShowCreateModal(true)}>
                <Image size={20} />
                <span>Photo</span>
              </button>
              <button className="create-post-btn video" onClick={() => setShowCreateModal(true)}>
                <Video size={20} />
                <span>Video</span>
              </button>
              <button className="create-post-btn event" onClick={() => setShowCreateModal(true)}>
                <Calendar size={20} />
                <span>Event</span>
              </button>
              <button className="create-post-btn article" onClick={() => setShowCreateModal(true)}>
                <FileText size={20} />
                <span>Article</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="student-notice">
            <Info size={20} />
            <p>This feed shows official announcements from faculty and CDC. Stay updated with placement drives, research opportunities, and important notices.</p>
          </div>
        )}

        {/* Feed Divider */}
        <div className="feed-divider">
          <div className="feed-divider-line"></div>
          <span className="feed-divider-text">Recent posts</span>
          <div className="feed-divider-line"></div>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className={`post-avatar ${post.author.type}`}>
                {post.author.initials}
              </div>
              <div className="post-author-info">
                <div className="post-author-row">
                  <span className="post-author-name">{post.author.name}</span>
                  {post.author.badge && (
                    <span className={`post-author-badge ${post.author.type === 'cdc' ? 'official' : 'faculty'}`}>
                      {post.author.badge}
                    </span>
                  )}
                </div>
                <p className="post-author-headline">{post.author.headline}</p>
                <div className="post-meta">
                  <span>{post.timestamp}</span>
                  <span>•</span>
                  <Globe size={14} />
                </div>
              </div>
              <button className="post-more-btn">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="post-content">
              <p className="post-text">
                {post.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.split(' ').map((word, j) => {
                      if (word.startsWith('#')) {
                        return <span key={j} className="hashtag">{word} </span>;
                      }
                      if (word.startsWith('@')) {
                        return <span key={j} className="mention">{word} </span>;
                      }
                      return word + ' ';
                    })}
                    {i < post.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {post.link && (
              <div className="post-link-preview">
                <div className="post-link-image"></div>
                <div className="post-link-content">
                  <h4 className="post-link-title">{post.link.title}</h4>
                  <p className="post-link-desc">{post.link.description}</p>
                  <span className="post-link-domain">{post.link.domain}</span>
                </div>
              </div>
            )}

            <div className="post-stats">
              <div className="post-reactions">
                <div className="reaction-icons">
                  <span className="reaction-icon like">👍</span>
                  <span className="reaction-icon celebrate">🎉</span>
                  <span className="reaction-icon support">💜</span>
                </div>
                <span>{post.likes.toLocaleString()}</span>
              </div>
              <div className="post-engagement">
                <span>{post.comments} comments</span>
                <span>•</span>
                <span>{post.reposts} reposts</span>
              </div>
            </div>

            <div className="post-actions">
              <button 
                className={`post-action-btn ${post.liked ? 'active' : ''}`}
                onClick={() => handleLike(post.id)}
              >
                <ThumbsUp size={20} />
                <span>Like</span>
              </button>
              <button className="post-action-btn">
                <MessageCircle size={20} />
                <span>Comment</span>
              </button>
              <button className="post-action-btn">
                <Repeat2 size={20} />
                <span>Repost</span>
              </button>
              <button className="post-action-btn">
                <Send size={20} />
                <span>Send</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && canPost && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a post</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-author">
                <div className="modal-author-avatar">
                  {getUserInitials()}
                </div>
                <div className="modal-author-info">
                  <h4>{getUserName()}</h4>
                  <p>Post to Anyone</p>
                </div>
              </div>
              <textarea
                className="modal-textarea"
                placeholder="What do you want to share with students?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <div className="modal-tools">
                <button className="modal-tool-btn"><Image size={20} /></button>
                <button className="modal-tool-btn"><Video size={20} /></button>
                <button className="modal-tool-btn"><Calendar size={20} /></button>
                <button className="modal-tool-btn"><Smile size={20} /></button>
              </div>
              <button 
                className="modal-submit"
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
