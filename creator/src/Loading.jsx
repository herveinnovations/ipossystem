import React from 'react';

/** Four-dot spinning loader (design from Uiverse.io by AbanoubMagdy1), same as iPOS. */
export function DotsLoader({ size, tone }) {
  return (
    <span className={'dots-loader' + (tone === 'current' ? ' dots-current' : '')} style={size ? { '--dim': typeof size === 'number' ? size + 'px' : size } : undefined} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

/** Full-screen loading screen (signing in, checking access, opening the console). */
export function AuthLoader({ label = 'Loading…' }) {
  return (
    <div className="auth-loader" role="status" aria-live="polite" aria-busy="true">
      <DotsLoader />
      <p>{label}</p>
    </div>
  );
}
