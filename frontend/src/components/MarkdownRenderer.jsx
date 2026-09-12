import React from 'react';

/**
 * Format inline markdown: bold, italic, inline code, links
 */
function renderInline(text) {
  if (!text) return null;

  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="bg-light text-danger px-1 rounded font-monospace" style={{ fontSize: '0.88em' }}>
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="fw-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="text-secondary">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-decoration-underline"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        parts.push(token);
      }
    } else {
      parts.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Clean, safe, zero-dependency Markdown Renderer component
 */
export const MarkdownRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = null;
  let inCodeBlock = false;
  let codeBlockLines = [];

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`list-${elements.length}`} className="ps-3 mb-2" style={{ listStyleType: 'disc' }}>
            {currentList.items.map((item, i) => (
              <li key={i} className="mb-1">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${elements.length}`} className="ps-3 mb-2">
            {currentList.items.map((item, i) => (
              <li key={i} className="mb-1">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="p-2 rounded bg-dark text-light small font-monospace overflow-auto mb-2"
        >
          <code>{codeBlockLines.join('\n')}</code>
        </pre>
      );
      codeBlockLines = [];
      inCodeBlock = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (/^(\*\*\*|---|___)$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-2 border-secondary opacity-25" />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h6 key={`h3-${i}`} className="fw-bold mt-2 mb-1 text-dark d-flex align-items-center gap-1">
          {renderInline(trimmed.substring(4))}
        </h6>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h5 key={`h2-${i}`} className="fw-bold mt-2 mb-1 text-primary">
          {renderInline(trimmed.substring(3))}
        </h5>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h4 key={`h1-${i}`} className="fw-bold mt-3 mb-2 text-primary">
          {renderInline(trimmed.substring(2))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="border-start border-3 border-primary ps-2 py-1 my-2 text-secondary fst-italic bg-light rounded-end small"
        >
          {renderInline(trimmed.substring(2))}
        </blockquote>
      );
      continue;
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    flushList();
    if (trimmed === '') {
      elements.push(<div key={`sp-${i}`} style={{ height: '6px' }} />);
    } else {
      elements.push(
        <p key={`p-${i}`} className="mb-1 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  flushList();
  flushCodeBlock();

  return <div className={`koshika-markdown ${className}`}>{elements}</div>;
};

export default MarkdownRenderer;
