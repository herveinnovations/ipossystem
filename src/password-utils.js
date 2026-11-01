// Password rules for new accounts and password resets.
const COMMON = ['password', 'passw0rd', '12345678', '123456789', '1234567890', 'qwerty123', 'iloveyou', 'zambia123', 'lusaka123', 'admin123', 'welcome1', 'letmein1', '11111111', '00000000', 'abc12345', 'ipos1234'];

export const MIN_PASSWORD = 10;

/** Problems with a password, in plain words. Empty array = good to use. */
export function passwordProblems(pw = '', { email = '', name = '' } = {}) {
  const out = [];
  const lower = pw.toLowerCase();
  if (pw.length < MIN_PASSWORD) out.push(`Use at least ${MIN_PASSWORD} characters.`);
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) out.push('Mix letters and numbers.');
  const handle = email.split('@')[0].toLowerCase();
  const parts = [handle, ...name.toLowerCase().split(/\s+/)].filter(p => p.length >= 4);
  if (parts.some(p => lower.includes(p))) out.push('Don’t use your name or email in the password.');
  if (COMMON.some(c => lower.includes(c)) || /^(.)\1+$/.test(pw)) out.push('This password is too easy to guess.');
  return out;
}

/** 0–4 strength score for the meter. */
export function passwordScore(pw = '') {
  let s = 0;
  if (pw.length >= MIN_PASSWORD) s++;
  if (pw.length >= 14) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^a-z0-9]/i.test(pw)) s++;
  return passwordProblems(pw).length ? Math.min(s, 1) : Math.max(s, 2);
}
