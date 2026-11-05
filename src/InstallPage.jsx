import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Share, SquarePlus, Check, EllipsisVertical, Smartphone, Monitor, ArrowRight, WifiOff, Zap, ShieldCheck, Compass } from 'lucide-react';
import Wordmark from './Wordmark';
import BackHome from './BackHome';
import { installListeners, canPromptInstall, promptInstall, isStandalone, isInstalled, isIOS, isAndroid, isIOSNotSafari } from './install';
import './landing.css';

const detect = () => {
  const forced = new URLSearchParams(window.location.search).get('device');
  if (['iphone', 'android', 'computer'].includes(forced)) return forced;
  return isIOS() ? 'iphone' : isAndroid() ? 'android' : window.matchMedia?.('(pointer: coarse)').matches ? 'android' : 'computer';
};

const Step = ({ n, icon: Icon, title, text }) => (
  <li className="in-step"><span className="in-num">{n}</span><div><b>{title}</b>{text && <p>{text}</p>}</div><span className="in-ico" aria-hidden="true"><Icon size={22} /></span></li>
);

export default function InstallPage() {
  const [device, setDevice] = useState(detect);
  const [, rerender] = useState(0);
  const [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => { const f = () => rerender(x => x + 1); installListeners.add(f); return () => installListeners.delete(f); }, []);
  useEffect(() => { document.title = 'Get the iPOS app'; }, []);

  const oneTap = canPromptInstall() && device !== 'iphone';
  async function install() { setBusy(true); try { if (await promptInstall()) setDone(true); } finally { setBusy(false); } }

  if (isStandalone()) return (
    <Shell><h1>iPOS is installed</h1><p className="in-lead">You’re using the app. Sign in to start selling.</p><Link className="lp-btn lp-primary lp-block" to="/login">Open iPOS <ArrowRight size={18} /></Link></Shell>
  );

  return (
    <Shell>
      <img className="in-icon" src="/icon-192.png" alt="" width="84" height="84" />
      <h1>Get the iPOS app</h1>
      <p className="in-lead">Free to install. No app store needed. It opens from your home screen like any other app and keeps selling when the internet goes off.</p>

      <div className="in-tabs" role="tablist" aria-label="Your device">
        {[['iphone', 'iPhone / iPad', Smartphone], ['android', 'Android', Smartphone], ['computer', 'Computer', Monitor]].map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={device === id} className={device === id ? 'on' : ''} onClick={() => setDevice(id)}><Icon size={16} /> {label}</button>
        ))}
      </div>

      {(done || (isInstalled() && !oneTap)) && <p className="in-ok"><Check size={18} /> iPOS is on this device. Find it on your home screen or app list.</p>}

      {device === 'iphone' && (<>
        {isIOSNotSafari() && <p className="in-warn"><Compass size={18} /> On iPhone, only Safari can add apps to the home screen. Open <b>ipossystem.vercel.app/install</b> in Safari first.</p>}
        <ol className="in-steps">
          <Step n="1" icon={Share} title="Tap the Share button" text="The square with an arrow pointing up, at the bottom of Safari (top on iPad)." />
          <Step n="2" icon={SquarePlus} title="Choose “Add to Home Screen”" text="Scroll down the list a little if you don’t see it." />
          <Step n="3" icon={Check} title="Tap “Add”" text="The iPOS icon appears on your home screen. Open it from there." />
        </ol>
      </>)}

      {device === 'android' && (oneTap
        ? <button className="lp-btn lp-primary lp-block in-big" onClick={install} disabled={busy}><Download size={20} /> {busy ? 'Installing…' : 'Install iPOS'}</button>
        : <ol className="in-steps">
            <Step n="1" icon={EllipsisVertical} title="Tap the menu ⋮" text="The three dots at the top right of Chrome." />
            <Step n="2" icon={Download} title="Choose “Install app”" text="Some phones call it “Add to Home screen”." />
            <Step n="3" icon={Check} title="Tap “Install”" text="The iPOS icon appears on your home screen and in your apps." />
          </ol>)}

      {device === 'computer' && (
        <div className="in-computer">
          <div className="in-qr">
            <img src="/install-qr.svg" alt="QR code that opens ipossystem.vercel.app/install" width="220" height="220" />
            <img className="in-qr-logo" src="/icon-192.png" alt="" width="52" height="52" />
          </div>
          <div>
            <b>On your phone</b>
            <p>Point your phone camera at the code and tap the link that appears.</p>
            <b>On this computer</b>
            {oneTap
              ? <button className="lp-btn lp-primary in-mid" onClick={install} disabled={busy}><Download size={18} /> {busy ? 'Installing…' : 'Install on this computer'}</button>
              : <p>In Chrome or Edge, click the install icon <Download size={14} className="in-inline" /> at the right of the address bar.</p>}
          </div>
        </div>
      )}

      <ul className="in-why">
        <li><Zap size={18} /> Opens straight to your till</li>
        <li><WifiOff size={18} /> Keeps selling offline</li>
        <li><ShieldCheck size={18} /> Updates by itself</li>
      </ul>
      <p className="in-foot">Already installed? <Link to="/login">Sign in</Link></p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="lp in-page">
      <header className="in-top"><Link to="/" className="lp-brand" aria-label="iPOS home"><img src="/ipos-logo.png?v=23670b6cd135" alt="" /><Wordmark /></Link><BackHome /></header>
      <main className="in-card">{children}</main>
    </div>
  );
}
