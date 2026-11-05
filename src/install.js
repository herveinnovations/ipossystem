// Installing iPOS as an app. The browser offers the install prompt once, early, so this
// module is imported by main.jsx at start-up and keeps the prompt for whoever needs it
// (the setup guide and the /install page).
let installEvent = null;
export const installListeners = new Set();
const notify = () => installListeners.forEach(f => f());

export const readFlag = key => { try { return localStorage.getItem(key); } catch { return null; } };
export const writeFlag = (key, value) => { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* storage unavailable */ } };

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; notify(); });
  window.addEventListener('appinstalled', () => { installEvent = null; writeFlag('ipos.installed', '1'); notify(); });
}

/** True when the browser has offered a one-tap install (Android Chrome, Edge, desktop Chrome). */
export const canPromptInstall = () => !!installEvent;

/** Shows the browser's install prompt. Resolves to true when the person accepted. */
export async function promptInstall() {
  if (!installEvent) return false;
  const ev = installEvent;
  ev.prompt();
  const r = await ev.userChoice;
  installEvent = null;
  if (r?.outcome === 'accepted') writeFlag('ipos.installed', '1');
  notify();
  return r?.outcome === 'accepted';
}

/** Running as the installed app right now (opened from the home screen). */
export const isStandalone = () => typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);
export const isInstalled = () => isStandalone() || readFlag('ipos.installed') === '1';
export const isIOS = () => typeof navigator !== 'undefined' && (/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
export const isAndroid = () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
/** On iPhone only Safari can add to the home screen; other iPhone browsers must open the page in Safari first. */
export const isIOSNotSafari = () => isIOS() && /crios|fxios|edgios|opios|gsa\//i.test(navigator.userAgent);
