import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';

const AIChatbot = () => {
  const location = useLocation();
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am **KOSHIKA AI**, your stem cell awareness and patient support assistant.\n\nI can help you understand:\n- 🧬 **What stem cells are** and how they work\n- 🩸 **Where stem cells are used** (blood cancers, leukemia, bone marrow transplants)\n- 🤝 **Why donor matching matters** (HLA typing and registries)\n- ⚠️ **Risks, limitations & myths vs. facts** (stem cells are not a universal cure)',
      source: 'KOSHIKA AI'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle handoff from Medical Report OCR page if an initial query was passed
  useEffect(() => {
    if (location.state?.initialQuery) {
      handleSendMessage(location.state.initialQuery);
    }
  }, [location.state]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat/', { message: query });
      const botMsg = {
        sender: 'assistant',
        text: res.data.response,
        source: res.data.source || 'KOSHIKA AI',
        notice: res.data.notice,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, an error occurred communicating with the AI service: ' + (err.response?.data?.error || err.message),
          source: 'Error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'What are stem cells and how do they work?',
    'Where are stem cells used in medicine?',
    'Why is HLA donor matching so critical?',
    'What are the risks and limitations of stem cell therapy?',
    'Is stem cell therapy a guaranteed cure for all diseases?'
  ];

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.4rem' }}>🧬</span>
            KOSHIKA AI Clinical &amp; Patient Assistant
          </h3>
          <p className="text-secondary mb-0">Learn. Understand. Make Informed Decisions.</p>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
        >
          <i className="bi bi-arrow-counterclockwise"></i>
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="btn btn-sm btn-light border text-start py-1 px-3 rounded-pill text-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <i className="bi bi-chat-right-quote me-1 text-primary"></i>
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="chat-box flex-grow-1">
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message ${m.sender}`}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="fw-bold" style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                  {m.sender === 'user' ? 'You' : 'KOSHIKA AI'}
                </small>
                {m.source && (
                  <span className="badge bg-dark bg-opacity-10 text-dark" style={{ fontSize: '0.65rem' }}>
                    {m.source}
                  </span>
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              {m.notice && (
                <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 small text-muted">
                  <i className="bi bi-info-circle me-1"></i> {m.notice}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="d-flex align-items-center gap-2">
                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                <span className="small text-secondary">Gemini AI is analyzing stem cell literature...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-area"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="form-control border-0"
            placeholder="Ask a question about stem cells, therapies, donor compatibility..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary px-4">
            <i className="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbot;
