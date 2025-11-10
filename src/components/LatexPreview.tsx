'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexPreviewProps {
  content: string;
}

export default function LatexPreview({ content }: LatexPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current || !content) return;

    try {
      // Split content by LaTeX delimiters
      const parts: { type: 'text' | 'inline' | 'block'; content: string }[] = [];
      let remaining = content;
      
      // Process block math first ($$...$$)
      const blockRegex = /\$\$([\s\S]*?)\$\$/g;
      let lastIndex = 0;
      let match;

      while ((match = blockRegex.exec(content)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          const textBefore = content.substring(lastIndex, match.index);
          // Process inline math in text before
          processInlineMath(textBefore, parts);
        }
        
        // Add block math
        parts.push({ type: 'block', content: match[1] });
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < content.length) {
        processInlineMath(content.substring(lastIndex), parts);
      }

      // Render all parts
      const container = previewRef.current;
      container.innerHTML = '';

      parts.forEach(part => {
        if (part.type === 'text') {
          const textNode = document.createElement('span');
          textNode.innerHTML = part.content.replace(/\n/g, '<br/>');
          container.appendChild(textNode);
        } else if (part.type === 'inline') {
          const span = document.createElement('span');
          span.className = 'inline-block mx-1';
          try {
            katex.render(part.content, span, {
              throwOnError: false,
              displayMode: false
            });
          } catch (e) {
            span.textContent = `$${part.content}$`;
            span.className += ' text-red-500';
          }
          container.appendChild(span);
        } else if (part.type === 'block') {
          const div = document.createElement('div');
          div.className = 'my-4 text-center';
          try {
            katex.render(part.content, div, {
              throwOnError: false,
              displayMode: true
            });
          } catch (e) {
            div.textContent = `$$${part.content}$$`;
            div.className += ' text-red-500';
          }
          container.appendChild(div);
        }
      });

    } catch (error) {
      console.error('LaTeX rendering error:', error);
      if (previewRef.current) {
        previewRef.current.textContent = content;
      }
    }
  }, [content]);

  return (
    <div 
      ref={previewRef} 
      className="prose prose-sm max-w-none"
    />
  );
}

function processInlineMath(text: string, parts: { type: 'text' | 'inline' | 'block'; content: string }[]) {
  const inlineRegex = /\$(.*?)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    
    // Add inline math
    parts.push({ type: 'inline', content: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
}
