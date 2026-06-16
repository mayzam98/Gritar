import React from 'react';
import { GUITAR_GLOSSARY } from '../../core/domain/Glossary';
import type { GlossaryTerm } from '../../core/domain/Glossary';

interface GlossaryHighlighterProps {
  text: string;
  onTermClick: (term: GlossaryTerm) => void;
}

const GlossaryHighlighter: React.FC<GlossaryHighlighterProps> = ({ text, onTermClick }) => {
  // Sort terms by keyword length descending so we match longest phrases first
  const allKeywords: { keyword: string, term: GlossaryTerm }[] = [];
  GUITAR_GLOSSARY.forEach(term => {
    term.keywords.forEach(kw => {
      allKeywords.push({ keyword: kw, term });
    });
  });
  
  allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

  // We need to parse the text and find keywords
  // To avoid nested replacements, we use a regex to match all keywords globally
  const escapedKeywords = allKeywords.map(k => k.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchedStr = match[0];
    const startIndex = match.index;

    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    const matchedTerm = allKeywords.find(k => k.keyword.toLowerCase() === matchedStr.toLowerCase());
    
    parts.push(
      <span 
        key={startIndex} 
        onClick={() => matchedTerm && onTermClick(matchedTerm.term)}
        style={{
          color: '#60a5fa',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        {matchedStr}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span>{parts}</span>;
};

export default GlossaryHighlighter;
