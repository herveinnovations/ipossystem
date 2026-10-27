// Site-wide: when a button is clicked and the screen then disables it while
// work happens (saving, sending, signing in…), show the four-dot loader inside
// it until it is enabled again. Works for every button without changing each one.

const WINDOW_MS = 1500; // how long after a click a "disabled" counts as "now loading"

export function startButtonLoading(root = document) {
  if (typeof window === 'undefined' || !window.MutationObserver) return () => {};
  let last = null, at = 0;
  const loading = new Set();

  const onClick = e => {
    const b = e.target.closest?.('button');
    if (!b || b.disabled) return;
    last = b; at = Date.now();
    // Disabling can happen in the same tick or after React re-renders.
    requestAnimationFrame(check); setTimeout(check, 60);
  };
  const onSubmit = e => {
    const b = e.submitter || e.target.querySelector?.('button[type=submit],button:not([type])');
    if (b) { last = b; at = Date.now(); setTimeout(check, 60); }
  };

  function check() {
    if (last && Date.now() - at < WINDOW_MS && last.isConnected && last.matches(':disabled') && !last.querySelector('.dots-loader')) {
      last.classList.add('is-loading'); last.setAttribute('aria-busy', 'true'); loading.add(last); last = null;
    }
    for (const b of loading) {
      if (!b.isConnected || !b.matches(':disabled') || b.querySelector('.dots-loader')) {
        b.classList.remove('is-loading'); b.removeAttribute('aria-busy'); loading.delete(b);
      }
    }
  }

  const observer = new MutationObserver(check);
  observer.observe(root.body || root, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
  root.addEventListener('click', onClick, true);
  root.addEventListener('submit', onSubmit, true);
  return () => { observer.disconnect(); root.removeEventListener('click', onClick, true); root.removeEventListener('submit', onSubmit, true); };
}
