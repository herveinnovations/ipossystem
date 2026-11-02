import React from 'react';
import { WORDMARK_VIEWBOX, WORDMARK_PATH } from './wordmark-path';

/** The "iPOS" name as a drawing (same shapes on every phone and computer). Takes the text colour. */
export default function Wordmark({ className = '' }) {
  return (
    <svg className={'wordmark ' + className} viewBox={WORDMARK_VIEWBOX} role="img" aria-label="iPOS">
      <path fill="currentColor" fillRule="evenodd" d={WORDMARK_PATH} />
    </svg>
  );
}
