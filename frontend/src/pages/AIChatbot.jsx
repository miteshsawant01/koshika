import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import MarkdownRenderer from '../components/MarkdownRenderer';

const SAMPLE_CATEGORIES = {
  All: [
    'What are stem cells and how do they work?',
    'Why is HLA 10/10 donor matching so critical?',
    'What are the proven uses of stem cell therapy vs unproven claims?',
    'How does liquid nitrogen biobanking preserve stem cells at -196°C?',
    'What is the recovery process like for a peripheral blood stem cell donor?'
  ],
  Transplant: [
    'What conditions are treated with allogeneic stem cell transplants?',
    'What is Graft-versus-Host Disease (GvHD) and how is it prevented?',
    'What is the difference between autologous and allogeneic transplants?',
    'What CD34+ cell dose is required for a successful transplant?'
  ],
  'Donor & HLA': [
    'How does HLA tissue typing work?',
    'Can family members be half-matched (haploidentical) donors?',
    'Is stem cell donation painful or dangerous for the donor?',
    'What does high-resolution HLA typing (A, B, C, DRB1, DQB1) mean?'
  ],
  'Safety & Facts': [
    'Are advertised cosmetic stem cell injections FDA/regulatory approved?',
    'What are the real medical risks and limitations of stem cell therapy?',
    'Can stem cells cure all chronic diseases?'
  ]
};

const AIChatbot = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `### 🧬 Welcome to KOSHIKA Clinical AI Assistant
I am your clinical-grade guide for stem cell biology, bone marrow transplantation, donor compatibility, and cryopreservation.

#### What you can explore:
- 🩸 **Transplant Indications:** Approved therapies for Leukemia, Lymphoma, SAA, and Thalassemia
- 🤝 **Donor Matching:** High-resolution HLA allele matching (8/8 or 10/10) and donor safety
- ❄️ **Biobank Storage:** Liquid nitrogen vapor cryopreservation at **-196°C**
- ⚠️ **Patient Safety:** Evidence-based facts and warnings against unproven clinics

*Ask any clinical question or select a suggested topic below to begin.*`,
      source: 'KOSHIKA Gemini AI (gemini-flash-latest)'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle handoff from Medical Report OCR page if an initial query was passed
  useEffect(() => {
    if (location.state?.initialQuery) {
      handleSendMessage(location.state.initialQuery);
    }
  }, [location.state]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // Stop speaking if new question is asked
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }

    const userMsg = { sender: 'user', text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Send message with multi-turn history
      const res = await api.post('/ai/chat/', {
        message: query,
        history: updatedMessages
      });

      const botMsg = {
        sender: 'assistant',
        text: res.data?.response || 'No response returned.',
        source: res.data?.source || 'KOSHIKA Gemini AI (gemini-flash-latest)',
        notice: res.data?.notice
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: '### ⚠️ Communication Notice\nUnable to reach the AI assistant. ' + (err.response?.data?.error || err.message || 'Please check your local connection.'),
          source: 'Error',
          isError: true,
          failedPrompt: query
        }
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopy = (text, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
      });
    }
  };

  const handleSpeak = (text, idx) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for clear spoken narration
    const cleanText = text
      .replace(/[#*_`~>-]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(idx);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.4rem' }}>🧬</span>
            KOSHIKA AI Clinical Assistant
            <span className="badge bg-success bg-opacity-10 text-success fs-6 fw-normal ms-1">
              Google Gemini Flash
            </span>
          </h3>
          <p className="text-secondary small mb-0">
            Clinical-grade stem cell guidance, HLA donor compatibility, and patient education.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setSpeakingIndex(null);
              setMessages([messages[0]]);
            }}
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3"
            title="Start a fresh conversation"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Categorized Topic Pills */}
      <div className="mb-2">
        <div className="d-flex gap-1 overflow-auto pb-1 mb-2">
          {Object.keys(SAMPLE_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm rounded-pill px-3 py-1 ${activeCategory === cat ? 'btn-primary' : 'btn-light border text-secondary'}`}
              style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {SAMPLE_CATEGORIES[activeCategory].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="btn btn-sm btn-light border text-start py-1 px-3 rounded-pill text-secondary hover-shadow"
              style={{ fontSize: '0.8rem' }}
              disabled={loading}
            >
              <i className="bi bi-chat-right-text me-1 text-primary"></i>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="chat-box flex-grow-1 d-flex flex-column shadow-sm rounded-4 border bg-white overflow-hidden">
        <div className="chat-messages flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message ${m.sender} mb-3`}>
              <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
                <div className="d-flex align-items-center gap-1">
                  <span style={{ fontSize: '0.9rem' }}>
                    {m.sender === 'user' ? '👤' : '🧬'}
                  </span>
                  <small className="fw-bold" style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                    {m.sender === 'user' ? 'You' : 'KOSHIKA AI'}
                  </small>
                </div>
                
                <div className="d-flex align-items-center gap-1">
                  {m.source && (
                    <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.65rem' }}>
                      {m.source}
                    </span>
                  )}
                  {m.sender === 'assistant' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.text, idx)}
                        className={`btn btn-link btn-sm p-0 px-1 ${speakingIndex === idx ? 'text-primary' : 'text-muted'}`}
                        title={speakingIndex === idx ? 'Stop read aloud' : 'Read aloud'}
                      >
                        <i className={`bi ${speakingIndex === idx ? 'bi-volume-up-fill' : 'bi-volume-up'}`} style={{ fontSize: '0.85rem' }}></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.text, idx)}
                        className="btn btn-link btn-sm text-muted p-0 px-1"
                        title="Copy to clipboard"
                      >
                        <i className={`bi ${copiedIndex === idx ? 'bi-check-lg text-success' : 'bi-clipboard'}`} style={{ fontSize: '0.82rem' }}></i>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="message-bubble p-3 rounded-4" style={{
                backgroundColor: m.sender === 'user' ? '#e0f2fe' : '#f8fafc',
                color: '#0f172a',
                border: m.sender === 'user' ? '1px solid #bae6fd' : '1px solid #e2e8f0'
              }}>
                {m.sender === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                ) : (
                  <MarkdownRenderer content={m.text} />
                )}
              </div>

              {m.isError && m.failedPrompt && (
                <div className="mt-1 text-end">
                  <button
                    type="button"
                    onClick={() => handleSendMessage(m.failedPrompt)}
                    className="btn btn-sm btn-outline-danger py-0 px-2 rounded-pill"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className="bi bi-arrow-repeat me-1"></i> Retry Question
                  </button>
                </div>
              )}

              {m.notice && (
                <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 small text-muted">
                  <i className="bi bi-info-circle me-1"></i> {m.notice}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant mb-3">
              <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-4 border" style={{ maxWidth: '400px' }}>
                <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                <div className="small text-secondary">
                  <strong>KOSHIKA Gemini AI</strong> is analyzing stem cell biology...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-area p-3 border-top bg-light d-flex align-items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="form-control rounded-pill px-3 py-2 bg-white"
            placeholder="Ask about HLA alleles, transplant protocols, CD34+ dosing, cryopreservation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: '42px', height: '42px' }}
            title="Send query"
          >
            <i className="bi bi-arrow-up"></i>
          </button>
        </form>
      </div>

      {/* Clinical Disclaimer */}
      <div className="text-center text-muted small mt-2" style={{ fontSize: '0.73rem' }}>
        <i className="bi bi-shield-check me-1 text-primary"></i>
        <strong>Clinical Disclaimer:</strong> KOSHIKA AI provides educational awareness and clinical decision support. Stem cell treatments must be personalized by your licensed hematologist.
      </div>
    </div>
  );
};

export default AIChatbot;

