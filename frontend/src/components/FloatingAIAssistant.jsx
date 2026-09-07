import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const QUICK_PROMPTS = [
  '🧬 What are stem cells?',
  '🔬 Types of stem cells (ESCs, Adult, iPSCs, HSCs)',
  '🩺 Uses of therapy (Leukemia, Lymphoma, Immune)',
  '🌟 Benefits of stem cells & research',
  '⚠️ What unproven claims should I avoid?'
];

const FloatingAIAssistant = ({ isOpenExternal, onCloseExternal }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: '👋 Hello! I am **KOSHIKA AI**, your patient-friendly guide to stem cells.\n\nAsk me about:\n- 🧬 **Stem cells & their types**\n- 🩸 **Transplantation options & research limitations**\n- 🤝 **HLA donor matching & registries**\n- ⚠️ **False cure warnings & patient safety**\n- 📚 **Myths vs. evidence-based facts**\n\n*Note: KOSHIKA provides educational support and does not replace professional medical advice.*',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'KOSHIKA Patient AI Guide'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with external trigger (e.g. from Navbar button)
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Listen to global open-koshika-ai custom event from any component
  useEffect(() => {
    const handleCustomOpen = (e) => {
      const query = e.detail?.query;
      setIsOpen(true);
      if (query) {
        handleSend(query);
      }
    };
    window.addEventListener('open-koshika-ai', handleCustomOpen);
    return () => window.removeEventListener('open-koshika-ai', handleCustomOpen);
  }, [loading]);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!nextState && onCloseExternal) {
      onCloseExternal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (customPrompt) => {
    const query = (customPrompt || input).trim();
    if (!query || loading) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat/', {
        message: `Answer in simple, patient-friendly, reassuring, evidence-based language: ${query}`
      });
      const botMsg = {
        sender: 'assistant',
        text: res.data.response || 'No response received from model.',
        source: res.data.source || 'KOSHIKA Patient AI Guide',
        notice: res.data.notice,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'assistant',
        text: 'Unable to reach the assistant right now. ' + (err.response?.data?.error || err.message || 'Please check connection.'),
        source: 'Error',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFullPage = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
    navigate('/ai-assistant');
  };

  return (
    <div className="floating-ai-wrapper">
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="floating-ai-window shadow-lg">
          {/* Header */}
          <div className="floating-ai-header">
            <div className="d-flex align-items-center gap-2">
              <div className="floating-ai-avatar">
                <i className="bi bi-heart-pulse-fill"></i>
              </div>
              <div>
                <div className="fw-bold text-white small d-flex align-items-center gap-1">
                  <span>KOSHIKA AI</span>
                  <span className="pulse-dot"></span>
                </div>
                <div className="text-white-50" style={{ fontSize: '0.68rem' }}>
                  Patient Support &amp; Stem Cell Awareness
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-link btn-sm text-white-50 p-1"
                onClick={handleOpenFullPage}
                title="Open in Full Page"
                aria-label="Open full page"
              >
                <i className="bi bi-arrows-angle-expand"></i>
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm text-white-50 p-1"
                onClick={() => setMessages([messages[0]])}
                title="Clear Chat History"
                aria-label="Clear chat"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm text-white p-1 ms-1"
                onClick={toggleOpen}
                title="Close AI Assistant"
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="floating-ai-quick-prompts">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="floating-ai-chip"
                onClick={() => handleSend(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="floating-ai-messages">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`floating-msg-row ${m.sender === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="floating-msg-bubble">
                  <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
                    <span className="floating-msg-sender">
                      {m.sender === 'user' ? 'You' : 'KOSHIKA AI'}
                    </span>
                    <span className="floating-msg-time">{m.time}</span>
                  </div>
                  <div className="floating-msg-text">{m.text}</div>
                  {m.source && (
                    <div className="floating-msg-source">
                      <span>{m.source}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="floating-msg-row assistant">
                <div className="floating-msg-bubble loading">
                  <div className="d-flex align-items-center gap-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span className="small text-muted">Finding patient-friendly answer...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            className="floating-ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="floating-ai-input"
              placeholder="Ask about stem cells, donor match, risks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="floating-ai-send-btn"
              aria-label="Send query"
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (Always Visible) */}
      <button
        type="button"
        className={`floating-ai-button ${isOpen ? 'active' : ''}`}
        onClick={toggleOpen}
        aria-label="Toggle KOSHIKA AI Assistant"
        title={isOpen ? 'Close KOSHIKA AI' : 'Open KOSHIKA AI Assistant'}
      >
        <span className="floating-ai-btn-icon">
          <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-robot'}`}></i>
        </span>
        <span className="floating-ai-btn-label">Ask KOSHIKA AI</span>
        {!isOpen && <span className="floating-ai-pulse-badge"></span>}
      </button>
    </div>
  );
};

export default FloatingAIAssistant;
