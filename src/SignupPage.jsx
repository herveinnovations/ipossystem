import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, WifiOff, BadgeCheck, Smartphone, User, Store, KeyRound } from 'lucide-react';
import { AuthLoader, DotsLoader } from './Loading';
import BackHome from './BackHome';
import Brand from './Brand';
import PasswordMeter from './PasswordMeter';
import CheckoutIllustration from './CheckoutIllustration';
import { passwordProblems, MIN_PASSWORD } from './password-utils';
import { SITE } from './site-config';
import { supabase } from './supabase';

// The sign-up page. Three designs are on this preview so they can be compared:
// /signup?design=a (split, like Sign in), ?design=b (card on a green band), ?design=c (one step at a time).
const GROUPS = [
  ['you', 'About you', User, [['full_name', 'Your full name', 'text'], ['email', 'Email address', 'email']]],
  ['shop', 'Your business', Store, [['company_name', 'Company / Store name', 'text'], ['registration_number', 'Business registration number', 'text'], ['tpin', 'TPIN', 'text'], ['address', 'Physical address', 'text'], ['phone', 'Phone number', 'tel'], ['currency', 'Currency', 'select'], ['logo_url', 'Company logo URL (optional)', 'url']]],
  ['pass', 'Your password', KeyRound, [['password', 'Password', 'password'], ['confirm', 'Confirm password', 'password']]],
];
const PERKS = [[BadgeCheck, `${SITE.price.trialDays}-day free trial`], [Smartphone, 'No card needed'], [WifiOff, 'Works offline']];

export function Signup() {
  const design = (new URLSearchParams(window.location.search).get('design') || 'a').toLowerCase();
  const [form, setForm] = useState({ full_name: '', company_name: '', registration_number: '', tpin: '', address: '', phone: '', email: '', password: '', confirm: '', currency: 'ZMW', logo_url: '' });
  const [agree, setAgree] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false), [step, setStep] = useState(0);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const weak = passwordProblems(form.password, { email: form.email, name: form.full_name });
      if (weak.length) throw Error(weak[0]);
      if (form.password !== form.confirm) throw Error('Passwords do not match.');
      if (!agree) throw Error('Please tick the box to agree to the Terms of Service and Privacy Policy.');
      const { email, password, confirm, ...details } = form;
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'https://ipossystem.vercel.app/account/register/success', data: { full_name: form.full_name, director_registration: details, terms_accepted: SITE.termsVersion, terms_accepted_at: new Date().toISOString() } } });
      if (error) throw error;
      if (data.user?.identities?.length === 0) throw Error('This email already has an account. Sign in or reset your password.');
      setDone(true); setForm({ ...form, password: '', confirm: '' });
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  const field = ([key, label, type]) => (
    <label key={key} className={key === 'address' || key === 'logo_url' ? 'su-wide' : ''}>
      {label}{key !== 'logo_url' && ' *'}
      {type === 'select'
        ? <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>{['ZMW', 'USD', 'ZAR', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}</select>
        : <input required={key !== 'logo_url'} type={type} minLength={type === 'password' ? MIN_PASSWORD : undefined} autoComplete={type === 'password' ? 'new-password' : undefined} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />}
      {key === 'password' && <PasswordMeter value={form.password} email={form.email} name={form.full_name} />}
    </label>
  );
  const group = ([id, title, Icon, fields], i) => (
    <fieldset key={id} className="su-group">
      <legend><span className="su-num">{i + 1}</span> {title}</legend>
      <div className="su-fields">{fields.map(field)}</div>
    </fieldset>
  );
  const terms = (
    <label className="check terms-check su-terms"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required /><span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>, and confirm I can sign up on behalf of this business.</span></label>
  );
  const submitBtn = <button className="primary su-submit" disabled={busy || !supabase}>{busy ? <><DotsLoader size={17} tone="current" />Creating account…</> : <>Create my account <ArrowRight size={18} /></>}</button>;
  const note = <p className="su-note">Cashiers and supervisors join through an invitation from the shop owner. You can add your logo later in Store Settings.</p>;
  const doneBox = <><div className="setup-note"><Check size={19} /><span>Check your email and confirm your account. Your company workspace will be created after verification and sign-in.</span></div><Link className="primary" to="/login">Go to sign in</Link></>;
  const perks = <div className="su-perks">{PERKS.map(([I, t]) => <span key={t}><I size={17} /> {t}</span>)}</div>;
  const back = <Link className="reset-back" to="/login"><ArrowLeft size={15} /> Already have an account? Sign in</Link>;
  const heading = <div className="su-head"><h1>Register your business</h1><p>Your own shop workspace, ready in about five minutes.</p></div>;

  // C: one step at a time
  function next(e) {
    e.preventDefault();
    const box = e.currentTarget.closest('form').querySelector('.su-step.on');
    if (box && [...box.querySelectorAll('input,select')].some(el => !el.reportValidity())) return;
    setStep(s => Math.min(2, s + 1));
  }
  const stepsForm = (
    <form onSubmit={submit} className="su-form su-steps" noValidate={false}>
      <div className="su-progress">{GROUPS.map(([id, title, Icon], i) => <span key={id} className={i <= step ? 'on' : ''}><b>{i < step ? <Check size={15} /> : i + 1}</b>{title}</span>)}</div>
      {GROUPS.map(([id, title, Icon, fields], i) => (
        <div key={id} className={'su-step' + (i === step ? ' on' : '')} hidden={i !== step}>
          <h2><Icon size={20} /> {title}</h2>
          <div className="su-fields">{fields.map(field)}</div>
          {i === 2 && terms}
        </div>
      ))}
      <div className="su-step-nav">
        {step > 0 && <button type="button" className="secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Back</button>}
        {step < 2 ? <button type="button" className="primary su-submit" onClick={next}>Next <ArrowRight size={18} /></button> : submitBtn}
      </div>
    </form>
  );
  const fullForm = <form onSubmit={submit} className="su-form">{GROUPS.map(group)}{terms}{submitBtn}</form>;

  if (design === 'a') return (
    <div className="su-split">
      <aside className="su-story">
        <Brand />
        <div className="su-story-main">
          <span className="eyebrow">Start free today</span>
          <h2>Run your whole shop from one app.</h2>
          <p>Till, stock, staff and accounts. Set up in minutes, on the phone or computer you already have.</p>
          <div className="su-art"><CheckoutIllustration /></div>
        </div>
        {perks}
      </aside>
      <main className="su-side">
        <div className="su-top"><BackHome /></div>
        <div className="su-box">
          {heading}
          {error && <div className="notice" role="alert">{error}</div>}
          {done ? doneBox : fullForm}
          {note}{back}
        </div>
      </main>
      {busy && <AuthLoader label="Creating your account…" />}
    </div>
  );

  return (
    <div className={'reset-page su-band su-' + design}>
      <section className="reset-card signup-card su-card">
        <BackHome className="card-back" />
        <Brand className="auth-brand" />
        {heading}
        {perks}
        {error && <div className="notice" role="alert">{error}</div>}
        {done ? doneBox : design === 'c' ? stepsForm : fullForm}
        {note}{back}
      </section>
      {busy && <AuthLoader label="Creating your account…" />}
    </div>
  );
}
