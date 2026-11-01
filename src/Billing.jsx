import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Landmark, Copy, MessageCircle, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from './supabase';
import { toast } from './Toast';
import { SITE, whatsappLink, kwacha } from './site-config';
import { planPrice, planSummary } from './plan-utils';
import { DotsLoader } from './Loading';

/** Shares the shop's plan with pages such as the checkout. */
export const PlanContext = createContext(null);

const missingFunction = e => /my_subscription|PGRST202|42883|Could not find the function/i.test(`${e?.code} ${e?.message}`);

/** Loads this shop's plan. Returns null (and shows nothing) if billing isn't set up on the server yet. */
export function useSubscription(auth) {
  const cid = auth?.membership?.company_id;
  const [state, setState] = useState({ sub: null, loading: true });
  async function load() {
    if (!cid || !supabase) return;
    const { data, error } = await supabase.rpc('my_subscription', { p_company_id: cid });
    if (error) { setState({ sub: null, loading: false, missing: missingFunction(error) }); return; }
    setState({ sub: data, loading: false });
  }
  useEffect(() => { setState({ sub: null, loading: true }); load(); const t = setInterval(load, 10 * 60 * 1000); return () => clearInterval(t); }, [cid]);
  return { ...state, reload: load };
}

/** Thin banner at the top of every page when the trial/plan needs attention. */
export function PlanBanner({ auth, sub }) {
  const director = auth.membership.role === 'director';
  const onBilling = useLocation().pathname === '/billing';
  const s = planSummary(sub, { director });
  if (!s?.banner || onBilling) return null;
  return (
    <div className={'plan-banner ' + s.tone} role="status">
      {s.tone === 'bad' ? <AlertTriangle size={17} /> : <Clock size={17} />}
      <span><b>{s.title}.</b> {s.text}</span>
      {director && <Link className="plan-banner-btn" to="/billing">{s.state === 'trial' ? 'Choose a plan' : 'Renew now'}</Link>}
    </div>
  );
}

function CopyLine({ label, value }) {
  if (!value) return null;
  return <div className="pay-line"><span>{label}</span><strong>{value}</strong><button type="button" aria-label={`Copy ${label}`} onClick={() => { navigator.clipboard?.writeText(value); toast('Copied.', 'info'); }}><Copy size={14} /></button></div>;
}

const METHODS = ['MTN Money', 'Airtel Money', 'Zamtel Kwacha', 'Bank transfer'];
const MONTHS = [[1, '1 month'], [3, '3 months'], [6, '6 months'], [12, '1 year (2 months free)']];
const STATUS = { pending: ['Waiting for confirmation', Clock, 'amber'], approved: ['Confirmed', CheckCircle2, 'green'], rejected: ['Not confirmed', XCircle, 'red'] };

export default function Billing({ auth, subscription }) {
  const m = auth.membership;
  const { sub, loading, missing, reload } = subscription;
  const branches = Math.max(1, (auth.branches || []).filter(b => b.active !== false).length);
  const [form, setForm] = useState({ method: 'MTN Money', months: 1, reference: '', phone: '' });
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const amount = useMemo(() => planPrice(SITE.price, branches, Number(form.months)), [branches, form.months]);
  const s = planSummary(sub, { director: true });
  const pay = SITE.pay, hasPay = pay.mtn.number || pay.airtel.number || pay.bank.account;
  const wa = whatsappLink(`Hello, I'd like to pay for iPOS for ${m.companies.name}.`);
  const shopRef = m.companies.name.slice(0, 20);

  if (m.role !== 'director') return <section className="management-panel"><h2>Billing</h2><p className="muted">Only the shop owner can manage the plan.</p></section>;

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const { error } = await supabase.rpc('submit_payment_claim', { p_company_id: m.company_id, p_method: form.method, p_reference: form.reference.trim(), p_amount: amount, p_months: Number(form.months), p_phone: form.phone.trim() || null });
      if (error) throw error;
      toast('Payment sent for confirmation. We’ll update your plan shortly.');
      setForm({ ...form, reference: '', phone: '' }); reload();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">MANAGEMENT</span><h1>Billing</h1><p>Your iPOS plan, how to pay, and your payments.</p></div></div>
      {missing && <div className="notice">Billing isn’t switched on for this shop yet.</div>}
      {loading ? <div className="insights-loading"><DotsLoader size={20} /> Checking your plan…</div> : s && (
        <section className={'plan-card ' + s.tone}>
          <div className="plan-card-main">
            <span className="plan-state">{{ trial: 'Free trial', paid: 'Paid plan', grace: 'Plan ended', ended: 'Selling paused', suspended: 'On hold', active: 'Active' }[s.state]}</span>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </div>
          <div className="plan-card-side">
            <small>Your price</small>
            <strong>{kwacha(planPrice(SITE.price, branches, 1))}<span> / month</span></strong>
            <small>{branches === 1 ? 'One branch' : `${branches} branches (${kwacha(SITE.price.extraBranch)} each after the first)`}</small>
          </div>
        </section>
      )}

      <div className="billing-grid">
        <section className="management-panel">
          <h2><CreditCard size={19} /> 1. Send your payment</h2>
          <p className="muted">Pay from any phone, then come back and enter the transaction reference below. Use <b>{shopRef}</b> as the payment reference or note so we can find it quickly.</p>
          <div className="price-table">
            {MONTHS.map(([n, label]) => <button type="button" key={n} className={Number(form.months) === n ? 'active' : ''} onClick={() => setForm({ ...form, months: n })}><span>{label}</span><strong>{kwacha(planPrice(SITE.price, branches, n))}</strong></button>)}
          </div>
          {hasPay ? (
            <div className="pay-options">
              {pay.mtn.number && <div className="pay-box"><h3><Smartphone size={17} /> MTN Money</h3><CopyLine label="Number" value={pay.mtn.number} /><CopyLine label="Name" value={pay.mtn.name} /></div>}
              {pay.airtel.number && <div className="pay-box"><h3><Smartphone size={17} /> Airtel Money</h3><CopyLine label="Number" value={pay.airtel.number} /><CopyLine label="Name" value={pay.airtel.name} /></div>}
              {pay.bank.account && <div className="pay-box"><h3><Landmark size={17} /> Bank transfer</h3><CopyLine label="Bank" value={pay.bank.bank} /><CopyLine label="Account" value={pay.bank.account} /><CopyLine label="Name" value={pay.bank.name} /><CopyLine label="Branch" value={pay.bank.branch} /></div>}
            </div>
          ) : <div className="setup-note"><span className="status-dot" /><div><strong>Payment details</strong><p>Message us on WhatsApp and we’ll send you the mobile money number or bank details.</p></div></div>}
          {wa && <a className="secondary wa-btn" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Questions? WhatsApp us</a>}
        </section>

        <section className="management-panel">
          <h2><ShieldCheck size={19} /> 2. Tell us you’ve paid</h2>
          {error && <div className="notice" role="alert">{error}</div>}
          <form className="pay-form" onSubmit={submit}>
            <label>How did you pay?<select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>{METHODS.map(x => <option key={x}>{x}</option>)}</select></label>
            <label>Period<select value={form.months} onChange={e => setForm({ ...form, months: Number(e.target.value) })}>{MONTHS.map(([n, l]) => <option key={n} value={n}>{l} — {kwacha(planPrice(SITE.price, branches, n))}</option>)}</select></label>
            <label>Transaction reference (from the SMS or bank slip)<input required minLength={3} maxLength={80} placeholder="e.g. MP241101.1530.A12345" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} /></label>
            <label>Phone number you paid from (optional)<input type="tel" maxLength={30} placeholder="e.g. 0977 123 456" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <div className="pay-total"><span>Amount</span><strong>{kwacha(amount)}</strong></div>
            <button className="primary" disabled={busy || missing}>{busy ? 'Sending…' : 'Send for confirmation'}</button>
            <p className="muted small">We check payments every working day. Your plan is extended from the day it would have ended, so you never lose days by paying early.</p>
          </form>
        </section>
      </div>

      <section className="management-panel">
        <h2>Your payments</h2>
        {sub?.claims?.length ? (
          <div className="table-scroll"><table><thead><tr><th>Date</th><th>Method</th><th>Reference</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{sub.claims.map(c => { const [label, Icon, tone] = STATUS[c.status] || STATUS.pending; return (
              <tr key={c.id}><td>{new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{c.method}</td><td>{c.reference}</td><td>{c.months === 12 ? '1 year' : `${c.months} month${c.months > 1 ? 's' : ''}`}</td><td>{kwacha(c.amount)}</td>
                <td><span className={'badge ' + tone}><Icon size={12} /> {label}</span>{c.review_note && <small>{c.review_note}</small>}</td></tr>); })}</tbody></table></div>
        ) : <p className="muted">No payments yet.</p>}
      </section>
    </>
  );
}
