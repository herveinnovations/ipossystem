import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Visible way back to the iPOS front page (the installed app has no browser back button). */
export default function BackHome({ className = '' }) {
  return <Link to="/" className={'back-home ' + className}><ArrowLeft size={16} aria-hidden="true" /> Back to home</Link>;
}
