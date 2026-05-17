import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CircleUserRound,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PackoraChatbot.css';

import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function PackoraChatbot() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef(null);

  const timeStamp = useCallback(
    () =>
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  );

  const [messages, setMessages] = useState(() => [
    {
      id: 'intro-1',
      sender: 'bot',
      text: "Hi! I'm your packaging design assistant. How can I help you today?",
      time: timeStamp(),
    },
  ]);

  const quickActions = useMemo(
    () => ['Recommend a design', 'Browse catalog', 'Track order', 'Open dashboard'],
    []
  );

  useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isTyping]);

  const addMessage = useCallback(
    (sender, text) => {
      setMessages((prev) => [
        ...prev,
        { id: `${sender}-${Date.now()}-${Math.random()}`, sender, text, time: timeStamp() },
      ]);
    },
    [timeStamp]
  );

  const runBotReply = useCallback(
    async (text) => {
      setIsTyping(true);
      
      try {
        const data = await apiFetch('/api/chatbot/ask', {
          method: 'POST',
          body: JSON.stringify({ message: text }),
        });
        
        addMessage('bot', data.reply);
      } catch (error) {
        console.error("Chatbot API Error:", error);
        addMessage('bot', 'Sorry, I am having trouble connecting to my servers right now.');
      } finally {
        setIsTyping(false);
      }
    },
    [addMessage]
  );

  const handleSend = useCallback(
    (nextText) => {
      const text = (nextText ?? chatInput).trim();
      if (!text) return;
      setShowBadge(false);
      addMessage('user', text);
      setChatInput('');

      if (!isLoggedIn) {
        setTimeout(() => {
          addMessage('bot', 'Please [Log in](/login) first to use the chatbot.');
        }, 500);
        return;
      }

      runBotReply(text);
    },
    [addMessage, chatInput, runBotReply, isLoggedIn]
  );

  return (
    <div className="packora-chatbot">
      {isChatOpen && (
        <section className="chat-window">
          <header className="chat-header">
            <div className="chat-header-main">
              <div className="chat-avatar-wrap">
                <Bot size={18} />
              </div>
              <div>
                <h3>Packora Assistant</h3>
                <p>
                  <span className="chat-online-dot" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </header>

          <div className="chat-body" ref={chatBodyRef}>
            <div className="chat-quick-actions">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="chat-chip"
                  onClick={() => handleSend(action)}
                >
                  {action}
                </button>
              ))}
            </div>

            {messages.map((message) => (
              <article
                key={message.id}
                className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                <span className="chat-message-avatar">
                  {message.sender === 'user' ? (
                    <CircleUserRound size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </span>
                <div className="chat-message-content">
                  {message.sender === 'user' ? (
                    <p>{message.text}</p>
                  ) : (
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  )}
                  <time>{message.time}</time>
                </div>
              </article>
            ))}

            {isTyping && (
              <div className="chat-message bot">
                <span className="chat-message-avatar">
                  <Bot size={16} />
                </span>
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-wrap">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <button type="button" onClick={() => handleSend()} aria-label="Send message">
              <Send size={16} />
            </button>
          </div>
          <footer className="chat-footer">Powered by Packora AI</footer>
        </section>
      )}

      <button
        type="button"
        className="chat-toggle-btn"
        onClick={() => {
          setIsChatOpen((prev) => !prev);
          setShowBadge(false);
        }}
        aria-label="Open chatbot"
      >
        <MessageCircle size={28} />
        {showBadge && (
          <span className="chat-notification">
            <Sparkles size={13} />
          </span>
        )}
      </button>
    </div>
  );
}
