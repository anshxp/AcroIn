import { MessageSquare, Plus, Search, X, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, facultyAPI } from '../../services/api';
import type { Chat, Faculty } from '../../types';
import './chat.css';

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);

  const loadChats = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setApiError('');
      const userChats = await chatAPI.getChats(user.id);
      setChats(userChats);
    } catch {
      setApiError('Failed to load chats');
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFacultyList = async () => {
    if (!showNewChatModal) return;
    try {
      setIsLoadingFaculty(true);
      const response = await facultyAPI.getAllFaculty();
      setFacultyList(Array.isArray(response) ? response : []);
    } catch {
      setFacultyList([]);
    } finally {
      setIsLoadingFaculty(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [user?.id]);

  useEffect(() => {
    loadFacultyList();
  }, [showNewChatModal]);

  const handleStartChat = async (facultyId: string) => {
    try {
      const chat = await chatAPI.createChat(facultyId);
      setShowNewChatModal(false);
      navigate(`/chat/${chat._id}`);
    } catch (error) {
      setApiError('Failed to create chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await chatAPI.deleteChat(chatId);
      setChats(chats.filter(c => c._id !== chatId));
    } catch {
      setApiError('Failed to delete chat');
    }
  };

  const filteredChats = chats.filter(chat => {
    const otherParticipantId = chat.participants.find(p => p !== user?.id);
    const name = otherParticipantId || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFaculty = facultyList.filter(faculty => {
    const name = `${faculty.firstname} ${faculty.lastName}`;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipantName = (chat: Chat) => {
    const otherParticipantId = chat.participants.find(p => p !== user?.id);
    return otherParticipantId || 'Unknown';
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'No messages yet';
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content.length > 50 ? lastMsg.content.substring(0, 50) + '...' : lastMsg.content;
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <div className="chat-list-title">
          <MessageSquare size={24} />
          <h1>Messages</h1>
        </div>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="new-chat-btn"
          title="Start a new chat"
        >
          <Plus size={20} />
        </button>
      </div>

      {apiError && (
        <div className="chat-error">
          {apiError}
          <button onClick={() => setApiError('')}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="chat-search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="chat-loading">
          <p>Loading chats...</p>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="chat-empty">
          <MessageSquare size={48} />
          <h2>No conversations yet</h2>
          <p>Start a conversation with a faculty member to get help with your queries</p>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="start-chat-btn"
          >
            Start a Chat
          </button>
        </div>
      ) : (
        <div className="chat-list">
          {filteredChats.map(chat => (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => navigate(`/chat/${chat._id}`)}
            >
              <div className="chat-item-content">
                <h3 className="chat-item-name">
                  {getOtherParticipantName(chat)}
                </h3>
                <p className="chat-item-preview">
                  {getLastMessage(chat)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat._id);
                }}
                className="chat-item-delete"
                title="Delete chat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="chat-modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <h2>Start a Conversation</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="chat-modal-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search faculty members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoadingFaculty ? (
              <div className="chat-modal-loading">Loading faculty...</div>
            ) : filteredFaculty.length === 0 ? (
              <div className="chat-modal-empty">No faculty members found</div>
            ) : (
              <div className="faculty-list">
                {filteredFaculty.map(faculty => (
                  <div
                    key={faculty._id}
                    className="faculty-item"
                    onClick={() => handleStartChat(faculty._id)}
                  >
                    <div className="faculty-avatar">
                      {faculty.firstname[0].toUpperCase()}
                    </div>
                    <div className="faculty-info">
                      <h4>{faculty.firstname} {faculty.lastName}</h4>
                      <p>{faculty.designation} - {faculty.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
