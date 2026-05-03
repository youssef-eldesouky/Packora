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

const productTypes = ['Food', 'Electronics', 'Cosmetics', 'Apparel'];

const recommendationMap = {
  food: {
    style: 'Kraft tuck-end boxes with window cutouts and tamper-evident seals.',
    colors: 'Natural kraft + warm green accents to signal freshness and sustainability.',
    materials: 'FSC kraft board, food-safe inks, and compostable inner wraps.',
  },
  electronics: {
    style: 'Rigid magnetic boxes with molded inserts for premium unboxing and safety.',
    colors: 'Charcoal, navy, and silver with minimal geometric patterns.',
    materials: 'Rigid board, EVA foam inserts, and matte lamination for protection.',
  },
  cosmetics: {
    style: 'Slim folding cartons with embossed logo panels and sleeve packaging.',
    colors: 'Soft neutrals, blush, and metallic highlights for a luxury look.',
    materials: 'Coated paperboard, spot UV, and recyclable glassine wraps.',
  },
  apparel: {
    style: 'Premium mailer boxes with tissue wrap and branded thank-you cards.',
    colors: 'Monochrome base with bold brand-color interior reveal.',
    materials: 'Corrugated board, soy-based inks, and recycled tissue paper.',
  },
};

export default function PackoraChatbot() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingRecommendation, setPendingRecommendation] = useState(false);
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
    (text) => {
      const normalized = text.toLowerCase().trim();
      const matchedType = productTypes.find((type) =>
        normalized.includes(type.toLowerCase())
      );

      setIsTyping(true);
      window.setTimeout(() => {
        setIsTyping(false);

        if (pendingRecommendation && matchedType) {
          const rec = recommendationMap[matchedType.toLowerCase()];
          addMessage(
            'bot',
            `${matchedType} suggestion:\n- Style: ${rec.style}\n- Colors: ${rec.colors}\n- Materials: ${rec.materials}`
          );
          setPendingRecommendation(false);
          return;
        }

        if (
          normalized.includes('recommend') ||
          normalized.includes('design') ||
          normalized.includes('suggest')
        ) {
          addMessage(
            'bot',
            'I would love to help you find the perfect packaging. What type of product will you be packaging? (Food, Electronics, Cosmetics, Apparel)'
          );
          setPendingRecommendation(true);
          return;
        }

        if (normalized.includes('catalog') || normalized.includes('browse')) {
          addMessage('bot', 'Taking you to the catalog so you can browse all packaging products.');
          setTimeout(() => {
            setIsChatOpen(false);
            navigate('/Catalog');
          }, 600);
          return;
        }

        if (normalized.includes('track') || normalized.includes('order')) {
          addMessage('bot', 'Sure, opening the order tracking page for you now.');
          setTimeout(() => {
            setIsChatOpen(false);
            navigate('/Track');
          }, 600);
          return;
        }

        if (
          normalized.includes('customize') ||
          normalized.includes('customiser') ||
          normalized.includes('customizer') ||
          normalized.includes('logo')
        ) {
          addMessage(
            'bot',
            'You can customize logos, colors, and packaging style from our 3D Customizer section. Redirecting you there now.'
          );
          setTimeout(() => {
            setIsChatOpen(false);
            navigate('/Catalog');
          }, 600);
          return;
        }

        if (normalized.includes('dashboard') || normalized.includes('home')) {
          addMessage('bot', 'Opening your dashboard now.');
          setTimeout(() => {
            setIsChatOpen(false);
            navigate('/HomePage');
          }, 600);
          return;
        }

        if (normalized.includes('price') || normalized.includes('pricing')) {
          addMessage(
            'bot',
            'Pricing depends on box type, dimensions, material, and quantity. Share your product category and estimated quantity and I can guide you with a suitable range.'
          );
          return;
        }

        if (normalized.includes('help') || normalized.includes('hello') || normalized.includes('hi')) {
          addMessage(
            'bot',
            'I can help with design recommendations, catalog browsing, order tracking, 3D customization guidance, and pricing questions.'
          );
          return;
        }

        addMessage(
          'bot',
          'I can help with: recommend design, browse catalog, track order, 3D customizer guidance, and pricing support.'
        );
      }, 700);
    },
    [addMessage, navigate, pendingRecommendation]
  );

  const handleSend = useCallback(
    (nextText) => {
      const text = (nextText ?? chatInput).trim();
      if (!text) return;
      setShowBadge(false);
      addMessage('user', text);
      setChatInput('');
      runBotReply(text);
    },
    [addMessage, chatInput, runBotReply]
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
                  <p>{message.text}</p>
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
