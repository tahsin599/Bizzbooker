import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Plus, Send, User as UserIcon, Bot, 
  ChevronDown, ChevronUp, Loader2, X 
} from 'lucide-react';
import axios from 'axios';
import './Chatbot.css';
import { API_BASE_URL } from '../config/api';

const Chatbot = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingResponse, setTypingResponse] = useState('');
  const [expandedConvo, setExpandedConvo] = useState(null);
  const [error, setError] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const token = localStorage.getItem('token');
  const isFetchingRef = useRef(false);

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (userId) {
      fetchConversations();
    } else {
      navigate('/login');
    }
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0 && !loadingOlder) {
      scrollToBottom();
    }
  }, [messages, loadingOlder]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get(`/api/conversations/user/${userId}`);
      setConversations(response.data);
      
      if (response.data.length > 0 && !activeConversation) {
        handleConversationSelect(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    }
  };

  const handleConversationSelect = async (conversationId) => {
    setMessages([]);
    setActiveConversation(conversationId);
    setHasMoreMessages(true);
    await fetchMessages(conversationId);
  };

  const fetchMessages = useCallback(async (conversationId, beforeId = null) => {
    if (!conversationId || (beforeId && (!hasMoreMessages || isFetchingRef.current))) return;
    
    try {
      isFetchingRef.current = true;
      setLoadingOlder(!!beforeId);
      
      let url = `/api/messages/conversation/${conversationId}`;
      if (beforeId) {
        url += `?before=${beforeId}`;
      }
      
      const response = await api.get(url);
      const newMessages = response.data.reverse();
      
      if (newMessages.length === 0 && beforeId) {
        setHasMoreMessages(false);
        return;
      }

      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      const prevScrollTop = container?.scrollTop || 0;

      if (beforeId) {
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        setMessages(newMessages);
      }

      // Restore scroll position after state update
      if (beforeId && container) {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
        });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoadingOlder(false);
      isFetchingRef.current = false;
    }
  }, [hasMoreMessages]);

  const createNewConversation = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(`/api/conversations/new?userId=${userId}`);
      const newConversation = response.data;
      
      setConversations([newConversation, ...conversations]);
      handleConversationSelect(newConversation.id);
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating new conversation:', err);
      setError('Failed to create new conversation');
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const userMessage = {
      conversationId: activeConversation,
      userMessage: JSON.stringify({ userPrompt: newMessage }),
      createdAt: new Date().toISOString(),
      isUser: true,
      id: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await api.post(`/api/gemini/chat?conversationId=${activeConversation}`, {
        userPrompt: newMessage  
      });

      const responseText = response.data;

      let displayedText = '';
      const typingInterval = setInterval(() => {
        if (displayedText.length < responseText.length) {
          displayedText = responseText.substring(0, displayedText.length + 1);
          setTypingResponse(displayedText);
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setTypingResponse('');
          
          setMessages(prev => [
            ...prev.filter(m => m.id !== userMessage.id),
            {
              ...userMessage,
              id: Date.now(),
              userMessage: JSON.stringify({ userPrompt: newMessage }),
              aiReply: responseText,
              isUser: false
            }
          ]);
          
          setIsLoading(false);
        }
      }, 20);

    } catch (err) {
      console.error('Error sending message:', err);
      setIsLoading(false);
      setIsTyping(false);
      setTypingResponse('');
      
      setMessages(prev => [
        ...prev.filter(m => m.id !== userMessage.id),
        {
          id: Date.now(),
          conversationId: activeConversation,
          userMessage: JSON.stringify({ userPrompt: newMessage }),
          aiReply: 'Sorry, there was an error processing your request. Please try again.',
          createdAt: new Date().toISOString(),
          isUser: false
        }
      ]);
    }
  };

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollThreshold = 100;
    
    if (scrollTop < scrollThreshold && 
        !loadingOlder && 
        hasMoreMessages && 
        messages.length > 0 &&
        !isFetchingRef.current) {
      const oldestMessageId = messages[0].id;
      fetchMessages(activeConversation, oldestMessageId);
    }
  }, [activeConversation, fetchMessages, loadingOlder, hasMoreMessages, messages]);

  const toggleConvoExpand = (convoId) => {
    setExpandedConvo(expandedConvo === convoId ? null : convoId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="chatbot-error-container">
        <div className="chatbot-error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chatbot-main-container">
      <div className="chatbot-navigation-panel">
        <button 
          className="chatbot-new-conversation-btn"
          onClick={createNewConversation}
          disabled={isLoading}
        >
          <Plus size={16} /> New Chat
        </button>
        
        <div className="chatbot-conversation-list">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`chatbot-conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
            >
              <div 
                className="chatbot-conversation-header"
                onClick={() => {
                  if (activeConversation !== conv.id) {
                    handleConversationSelect(conv.id);
                  }
                  toggleConvoExpand(conv.id);
                }}
              >
                <MessageSquare size={16} />
                <span className="chatbot-conversation-title">
                  {conv.title || `Chat ${formatDate(conv.createdAt)}`}
                </span>
                {expandedConvo === conv.id ? (
                  <ChevronUp size={16} className="chatbot-expand-icon" />
                ) : (
                  <ChevronDown size={16} className="chatbot-expand-icon" />
                )}
              </div>

              {expandedConvo === conv.id && (
                <div className="chatbot-conversation-details">
                  <div className="chatbot-detail-row">
                    <span>Created:</span>
                    <span>{formatDate(conv.createdAt)}</span>
                  </div>
                  <div className="chatbot-detail-row">
                    <span>Last Active:</span>
                    <span>{formatDate(conv.lastActivity)}</span>
                  </div>
                  <button
                    className="chatbot-open-conversation-btn"
                    onClick={() => handleConversationSelect(conv.id)}
                  >
                    Open Chat
                  </button>
                  {activeConversation === conv.id && (
                    <button
                      className="chatbot-delete-conversation-btn"
                      onClick={async () => {
                        try {
                          await api.delete(`/api/conversations/${conv.id}`);
                          setConversations(conversations.filter(c => c.id !== conv.id));
                          if (activeConversation === conv.id) {
                            setActiveConversation(null);
                            setMessages([]);
                          }
                        } catch (err) {
                          console.error('Error deleting conversation:', err);
                        }
                      }}
                    >
                      <X size={14} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chatbot-content-area">
        {activeConversation ? (
          <>
            <div 
              className="chatbot-messages-window" 
              onScroll={handleScroll}
              ref={messagesContainerRef}
            >
              {loadingOlder && (
                <div className="chatbot-loading-older">
                  <Loader2 size={20} className="chatbot-spin-animation" />
                </div>
              )}
              {!hasMoreMessages && messages.length > 10 && (
                <div className="chatbot-no-more-messages">
                  No more messages to load
                </div>
              )}
              <div ref={messagesStartRef} />
              
              {messages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`chatbot-message ${message.isUser ? 'user' : 'ai'}`}
                >
                  <div className="chatbot-message-avatar">
                    {message.isUser ? <UserIcon size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="chatbot-message-content">
                    {message.userMessage && (
                      <div className="chatbot-user-message-text">
                        {JSON.parse(message.userMessage).userPrompt}
                      </div>
                    )}
                    {message.aiReply && (
                      <div className="chatbot-ai-message-text">{message.aiReply}</div>
                    )}
                    <div className="chatbot-message-timestamp">
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="chatbot-message ai">
                  <div className="chatbot-message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="chatbot-message-content">
                    <div className="chatbot-ai-message-text typing">{typingResponse}</div>
                    <div className="chatbot-typing-indicator">
                      <Loader2 size={16} className="chatbot-spin-animation" />
                      <span>Bizzy is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message Bizzy..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
              >
                {isLoading ? <Loader2 size={18} className="chatbot-spin-animation" /> : <Send size={18} />}
              </button>
            </div>
          </>
        ) : (
          <div className="chatbot-welcome-screen">
            <div className="chatbot-welcome-content">
              <Bot size={48} className="chatbot-welcome-icon" />
              <h2>Welcome to Bizzy- Bizzboker AI Assistant</h2>
              <p>Start a new chat to begin your conversation with our AI assistant.</p>
              <button 
                className="chatbot-new-conversation-btn"
                onClick={createNewConversation}
                disabled={isLoading}
              >
                <Plus size={16} /> New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;