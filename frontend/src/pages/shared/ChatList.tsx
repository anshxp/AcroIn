import { MessageSquare, Plus, Search, X, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, facultyAPI } from '../../services/api';
import type { Chat, Faculty } from '../../types';
import './chat.css';

type Participant = string | { _id: string; name?: string; email?: string; userType?: string };

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
  const authUserId = user?.authUserId || user?.id || user?._id || '';

  const loadChats = async () => {
    if (!authUserId) { setChats([]); setIsLoading(false); return; }
    try {
      setIsLoading(true); setApiError('');
      setChats(await chatAPI.getChats(authUserId));
    } catch (error: any) {
      setApiError(error?.response?.data?.message || 'Failed to load chats');
      setChats([]);
    } finally { setIsLoading(false); }
  };

  const loadFacultyList = async () => {
    if (!showNewChatModal) return;
    try {
      setIsLoadingFaculty(true);
      const response = await facultyAPI.getAllFaculty();
      setFacultyList(Array.isArray(response) ? response : []);
    } catch { setFacultyList([]); }
    finally { setIsLoadingFaculty(false); }
  };

  useEffect(() => { loadChats(); }, [authUserId]);
  useEffect(() => { loadFacultyList(); }, [showNewChatModal]);

  const handleStartChat = async (facultyId: string) => {
    try {
      const chat = await chatAPI.createChat(facultyId);
      setShowNewChatModal(false);
      await loadChats();
      navigate(`/chat/${chat._id}`);
    } catch (error: any) {
      setApiError(error?.response?.data?.message || 'Failed to create chat');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await chatAPI.deleteChat(chatId);
      setChats((current) => current.filter((chat) => chat._id !== chatId));
    } catch (error: any) { setApiError(error?.response?.data?.message || 'Failed to delete chat'); }
  };

  const participantId = (participant: Participant) => typeof participant === 'string' ? participant : participant?._id;
  const participantName = (participant: Participant) => typeof participant === 'string' ? participant : (participant?.name || participant?.email || 'Unknown');
  const getOtherParticipant = (chat: Chat) => {
    const participants = (chat.participants || []) as Participant[];
    return participants.find((participant) => participantId(participant) !== authUserId) || 'Unknown';
  };
  const filteredChats = chats.filter((chat) => participantName(getOtherParticipant(chat)).toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFaculty = facultyList.filter((faculty) => `${faculty.firstname} ${faculty.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));
  const getLastMessage = (chat: Chat) => {
    if (!chat.messages?.length) return 'No messages yet';
    const content = chat.messages[chat.messages.length - 1].content || '';
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header"><div className="chat-list-title"><MessageSquare size={24} /><h1>Messages</h1></div><button type="button" onClick={() => setShowNewChatModal(true)} className="new-chat-btn" title="Start a new chat" aria-label="Start a new chat"><Plus size={20} /></button></div>
      {apiError && <div className="chat-error">{apiError}<button type="button" onClick={() => setApiError('')} aria-label="Dismiss error"><X size={18} /></button></div>}
      <div className="chat-search-bar"><Search size={18} /><input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
      {isLoading ? <div className="chat-loading"><p>Loading chats...</p></div> : filteredChats.length === 0 ? <div className="chat-empty"><MessageSquare size={48} /><h2>No conversations yet</h2><p>Start a conversation with a faculty member to get help with your queries</p><button type="button" onClick={() => setShowNewChatModal(true)} className="start-chat-btn">Start a Chat</button></div> : <div className="chat-list">{filteredChats.map((chat) => { const other = getOtherParticipant(chat); return <div key={chat._id} className="chat-item" onClick={() => navigate(`/chat/${chat._id}`)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/chat/${chat._id}`); }}><div className="chat-item-content"><h3 className="chat-item-name">{participantName(other)}</h3><p className="chat-item-preview">{getLastMessage(chat)}</p></div><button type="button" onClick={(event) => { event.stopPropagation(); handleDeleteChat(chat._id); }} className="chat-item-delete" title="Delete chat" aria-label="Delete chat"><Trash2 size={16} /></button></div>; })}</div>}
      {showNewChatModal && <div className="chat-modal-overlay" onClick={() => setShowNewChatModal(false)}><div className="chat-modal" onClick={(event) => event.stopPropagation()}><div className="chat-modal-header"><h2>Start a Conversation</h2><button type="button" onClick={() => setShowNewChatModal(false)} className="modal-close-btn" aria-label="Close"><X size={20} /></button></div><div className="chat-modal-search"><Search size={18} /><input type="text" placeholder="Search faculty members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>{isLoadingFaculty ? <div className="chat-modal-loading">Loading faculty...</div> : filteredFaculty.length === 0 ? <div className="chat-modal-empty">No faculty members found</div> : <div className="faculty-list">{filteredFaculty.map((faculty) => <button type="button" key={faculty._id} className="faculty-item" onClick={() => handleStartChat(faculty._id)}><div className="faculty-avatar">{faculty.firstname?.[0]?.toUpperCase() || '?'}</div><div className="faculty-info"><h4>{faculty.firstname} {faculty.lastName}</h4><p>{faculty.designation} - {faculty.department}</p></div></button>)}</div>}</div></div>}
    </div>
  );
};
