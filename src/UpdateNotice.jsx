import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Small notice shown when a new version of iPOS has been installed in the background
 * while the app was open. Never refreshes by itself, so it can't interrupt a sale.
 */
export default function UpdateNotice() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const show = () => setReady(true);
    window.addEventListener('ipos-update-ready', show);
    return () => window.removeEventListener('ipos-update-ready', show);
  }, []);
  if (!ready) return null;
  return (
    <div className="update-notice" role="status" aria-live="polite">
      <RefreshCw size={18} aria-hidden="true" />
      <div><strong>New version available</strong><span>Finish what you’re doing, then refresh to update iPOS.</span></div>
      <button type="button" className="primary" onClick={() => window.location.reload()}>Refresh</button>
      <button type="button" className="update-later" aria-label="Later" onClick={() => setReady(false)}><X size={17} /></button>
    </div>
  );
}

/** Registers the offline app shell and checks for new versions while the app stays open. */
export function registerAppUpdates() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    const hadVersion = !!navigator.serviceWorker.controller; // first visit: nothing to update from
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadVersion) window.dispatchEvent(new Event('ipos-update-ready'));
    });
    navigator.serviceWorker.register('/sw.js').then(reg => {
      const check = () => reg.update().catch(() => {});
      setInterval(check, 30 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    }).catch(() => {});
  });
}
