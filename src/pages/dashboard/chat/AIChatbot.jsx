import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Send, MessageSquare, Trash2, Bot, User, FileText } from 'lucide-react';
import chatService from '../../../services/chat.service';
import documentService from '../../../services/document.service';
import ConfirmDeleteModal from '../../../components/Modal/ConfirmDeleteModal';
import './AIChatbot.css';

const AIChatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Context selection
  const [myDocuments, setMyDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  
  // Delete Confirmation State
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadSessions();
    loadMyDocuments();
    
    // If navigated from DocumentDetail with state
    if (location.state?.documentId) {
      setSelectedDocumentId(location.state.documentId);
      // Clean up history state so refresh doesn't lock it
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadSessions = async () => {
    try {
      const data = await chatService.getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load chat sessions', err);
    }
  };

  const loadMyDocuments = async () => {
    try {
      // Just fetch all documents or recent ones for context selection
      const data = await documentService.getMyDocuments();
      setMyDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents for chat context', err);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      const data = await chatService.getSessionMessages(sessionId);
      setMessages(data || []);
      
      // Auto-set the selected document context if this session is tied to a document
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.documentId) {
        setSelectedDocumentId(session.documentId);
      } else if (session && !session.documentId) {
        setSelectedDocumentId(''); // General AI
      }
    } catch (err) {
      console.error('Failed to load session messages', err);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    // Optionally keep the currently selected document context or reset it
    // setSelectedDocumentId(''); 
  };

  const confirmDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeletingSession(true);
    try {
      await chatService.deleteSession(sessionToDelete);
      if (currentSessionId === sessionToDelete) {
        handleNewChat();
      }
      loadSessions();
      setSessionToDelete(null);
    } catch (err) {
      alert('Failed to delete session');
    } finally {
      setIsDeletingSession(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const textToSend = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message to UI optimistically
    const optimisticMsg = {
      id: Date.now().toString(),
      sender: 'USER',
      message: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    try {
      let response;
      if (selectedDocumentId) {
        response = await chatService.chatWithDocument(selectedDocumentId, textToSend, currentSessionId);
      } else {
        response = await chatService.chat(textToSend, currentSessionId);
      }
      
      // If this was a new session, set the currentSessionId
      if (!currentSessionId && response.sessionId) {
        setCurrentSessionId(response.sessionId);
        // We also need to reload sessions to update the sidebar
        loadSessions();
      }
      
      // Add AI response to UI
      const aiMsg = {
        id: Date.now().toString() + '-ai',
        sender: 'AI',
        message: response.answer,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (err) {
      console.error('Chat error', err);
      // Show error as a system message
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-err',
        sender: 'AI',
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        createdAt: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const autoResizeTextarea = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-page-wrapper">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            <Plus size={18} /> New Chat
          </button>
        </div>
        
        <div className="chat-sessions-list">
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: '2rem 1rem', fontSize: '13px' }}>
              No previous chats found.
            </div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id} 
                className={`chat-session-item ${currentSessionId === session.id ? 'active' : ''}`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <div className="session-info">
                  <span className="session-title">
                    <MessageSquare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/>
                    {session.title || 'New Chat'}
                  </span>
                  <span className="session-date">{new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
                </div>
                <button 
                  className="delete-session-btn" 
                  onClick={(e) => confirmDeleteSession(session.id, e)}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main-area">
        <header className="chat-header">
          <div className="chat-header-title">
            <div style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <Bot size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--neutral-900)' }}>AI Assistant</h2>
              <p style={{ fontSize: '13px', color: 'var(--neutral-500)' }}>
                {selectedDocumentId ? 'Answering based on your document' : 'General knowledge & assistance'}
              </p>
            </div>
          </div>
          
          <div className="context-selector">
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--neutral-600)' }}>Chat Context:</span>
            <div style={{ position: 'relative' }}>
              <FileText size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--neutral-500)' }} />
              <select 
                className="context-select"
                style={{ paddingLeft: '32px' }}
                value={selectedDocumentId}
                onChange={(e) => {
                  setSelectedDocumentId(e.target.value);
                  // Context change usually warrants a new chat unless you just want to switch mid-chat (which backend might support)
                  // For better UX, let's auto-start new chat if context changes while in an active chat
                  if (currentSessionId && messages.length > 0) {
                    handleNewChat();
                  }
                }}
              >
                <option value="">General AI (No Document)</option>
                {myDocuments.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat-state">
              <div className="empty-chat-icon">
                <Bot size={40} />
              </div>
              <h3 className="empty-chat-title">How can I help you today?</h3>
              <p className="empty-chat-desc">
                {selectedDocumentId 
                  ? "I'm ready to answer questions specifically about the document you've selected."
                  : "I'm your intelligent assistant. Ask me anything, or select a document above to ground my answers in your specific materials."}
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.sender.toLowerCase()}`}>
                <div className={`message-avatar ${msg.sender.toLowerCase()}`}>
                  {msg.sender === 'USER' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div>
                  <div className="message-bubble" style={msg.isError ? { backgroundColor: 'var(--error-50)', color: 'var(--error-600)', borderColor: 'var(--error-200)' } : {}}>
                    {msg.message}
                  </div>
                  <div className="message-time">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="message-wrapper ai">
              <div className="message-avatar ai">
                <Bot size={20} />
              </div>
              <div className="message-bubble typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder={selectedDocumentId ? "Ask a question about this document..." : "Message AI Assistant..."}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                autoResizeTextarea(e);
              }}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </div>
          <div style={{ fontSize: '11px', textAlign: 'center', marginTop: '8px', color: 'var(--neutral-400)' }}>
            AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </main>

      {/* Professional Delete Confirmation Modal */}
      <ConfirmDeleteModal 
        isOpen={!!sessionToDelete} 
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        isDeleting={isDeletingSession}
        title="Delete Chat Session"
        message="Are you sure you want to delete this chat session? All messages inside this session will be permanently removed. This action cannot be undone."
      />
    </div>
  );
};

export default AIChatbot;
