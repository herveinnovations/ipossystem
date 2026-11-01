import React from 'react';
import { Check, X } from 'lucide-react';
import { passwordProblems, passwordScore, MIN_PASSWORD } from './password-utils';

const LABELS = ['Too weak', 'Weak', 'Good', 'Strong', 'Very strong'];

/** Live strength bar and checklist under a "new password" field. */
export default function PasswordMeter({ value = '', email = '', name = '' }) {
  if (!value) return <p className="pw-hint">At least {MIN_PASSWORD} characters, with letters and numbers.</p>;
  const problems = passwordProblems(value, { email, name });
  const score = passwordScore(value);
  const rules = [
    [`At least ${MIN_PASSWORD} characters`, value.length >= MIN_PASSWORD],
    ['Letters and numbers', /[a-z]/i.test(value) && /\d/.test(value)],
    ['Not your name, email or a common password', !problems.some(p => /name or email|easy to guess/.test(p))],
  ];
  return (
    <div className="pw-meter" aria-live="polite">
      <div className={'pw-bar s' + score}><i /><i /><i /><i /></div>
      <span className="pw-label">{LABELS[score]}</span>
      <ul>{rules.map(([text, ok]) => <li key={text} className={ok ? 'ok' : ''}>{ok ? <Check size={13} /> : <X size={13} />} {text}</li>)}</ul>
    </div>
  );
}
