import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import './chat-workspace.css';

/**
 * Desktop chat workspace matching the Acro-In reference layout:
 * conversation list on the left, selected conversation on the right.
 * DashboardLayout owns the global navigation/header; this component only
 * controls the area underneath it.
 */
export const ChatWorkspace: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();

  return (
    <div className="chat-workspace">
      <aside className="chat-workspace-list">
        <ChatList />
      </aside>
      <main className="chat-workspace-conversation">
        {chatId ? (
          <ChatWindow />
        ) : (
          <div className="chat-workspace-empty">
            <h2>Select a conversation</h2>
            <p>Choose a conversation from your messages to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
};
