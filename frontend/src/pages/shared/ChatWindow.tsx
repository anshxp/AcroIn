import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, Trash2, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';
import type { Chat } from '../../types';
import './chat.css';

type Participant = string | { _id: string; name?: string; email?: string; userType?: string };

export const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTag, setMessageTag] = useState<'GENERAL' | 'DOUBT'>('GENERAL');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authUserId = user?.authUserId || user?.id || user?._id || '';

  const loadChat = async () => {
    if (!chatId || !authUserId) return;
    try {
      setIsLoading(true); setApiError('');
      const response = await chatAPI.getChats(authUserId);
      const foundChat = response.find((c) => c._id === chatId);
      if (foundChat) setChat(foundChat);
      else setApiError('Chat not found');
    } catch (error: any) {
      setApiError(error?.response?.data?.message || 'Failed to load chat');
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 3000);
    return () => clearInterval(interval);
  }, [chatId, authUserId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat?.messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !chatId) return;
    try {
      setIsSending(true);
      await chatAPI.sendMessage(chatId, messageContent, messageTag);
      setMessageContent(''); setMessageTag('GENERAL'); await loadChat();
    } catch (error: any) {
      setApiError(error?.response?.data?.message || 'Failed to send message');
    } finally { setIsSending(false); }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try { if (chatId) { await chatAPI.deleteMessage(chatId, messageId); await loadChat(); } }
    catch (error: any) { setApiError(error?.response?.data?.message || 'Failed to delete message'); }
  };

  const getParticipantId = (participant: Participant) => typeof participant === 'string' ? participant : participant?._id;
  const getParticipantName = (participant: Participant) => typeof participant === 'string' ? participant : (participant?.name || participant?.email || 'Unknown');
  const getOtherParticipantName = () => {
    if (!chat) return '';
    const other = (chat.participants as Participant[]).find((participant) => getParticipantId(participant) !== authUserId);
    return other ? getParticipantName(other) : 'Unknown';
  };
  const isOwnMessage = (sender: any) => {
    const senderId = typeof sender === 'string' ? sender : sender?._id;
    return senderId === authUserId;
  };

  if (isLoading) return <div className="chat-window-container"><div className="chat-loading">Loading chat...</div></div>;
  if (!chat) return <div className="chat-window-container"><div className="chat-error-full"><p>{apiError || 'Chat not found'}</p><button onClick={() => navigate('/chat')}>Back to Messages</button></div></div>;

  return (
    <div className="chat-window-container">
      <div className="chat-window-header">
        <div className="chat-header-left"><button type="button" onClick={() => navigate('/chat')} className="back-btn" title="Back to chats"><ArrowLeft size={20} /></button><div className="chat-header-info"><h2>{getOtherParticipantName()}</h2><p className="chat-status">Active</p></div></div>
        <button type="button" className="chat-header-menu" aria-label="Chat options"><MoreVertical size={20} /></button>
      </div>
      {apiError && <div className="chat-message-error">{apiError}<button type="button" onClick={() => setApiError('')} aria-label="Dismiss">×</button></div>}
      <div className="chat-messages">
        {!chat.messages?.length ? <div className="chat-messages-empty"><p>No messages yet. Start the conversation!</p></div> : <>{chat.messages.map((message) => <div key={message._id} className={`message ${isOwnMessage(message.sender) ? 'message-sent' : 'message-received'}`}><div className="message-bubble">{message.tag && message.tag !== 'GENERAL' && <span className="message-tag">{message.tag}</span>}<p className="message-text">{message.content}</p><span className="message-time">{new Date(message.createdAt).toLocaleTimeString()}</span></div>{isOwnMessage(message.sender) && <button type="button" onClick={() => handleDeleteMessage(message._id)} className="message-delete-btn" title="Delete message" aria-label="Delete message"><Trash2 size={14} /></button>}</div>)}<div ref={messagesEndRef} /></>}
      </div>
      <div className="chat-input-area">
        <div className="message-tag-selector"><button type="button" className={`tag-btn ${messageTag === 'GENERAL' ? 'active' : ''}`} onClick={() => setMessageTag('GENERAL')}>General</button><button type="button" className={`tag-btn ${messageTag === 'DOUBT' ? 'active' : ''}`} onClick={() => setMessageTag('DOUBT')}><Flag size={14} />Doubt</button></div>
        <div className="message-input-wrapper"><input type="text" value={messageContent} onChange={(e) => setMessageContent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Type your message..." disabled={isSending} /><button type="button" onClick={handleSendMessage} disabled={!messageContent.trim() || isSending} className="send-message-btn" aria-label="Send message"><Send size={18} /></button></div>
      </div>
    </div>
  );
};
