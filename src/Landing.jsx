import React, { useState } from 'react';
import Wordmark from './Wordmark';
import { Link, Navigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, ChevronDown, Menu, X, Minus, Plus, Check } from 'lucide-react';
import { SITE, whatsappLink, kwacha } from './site-config';
import { planPrice } from './plan-utils';
import { ICONS } from './landing-icons';
import CheckoutIllustration from './CheckoutIllustration';
import './landing.css';

const Icon = ({ name }) => <span className="lp-svg" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;

const PILLARS = [
  ['barcode', 'Sell', 'Scan, tap or search. Take cash, MTN, Airtel or card and share the receipt on WhatsApp.'],
  ['package', 'Stock', 'Know what’s running low and how many days you have left, with a reorder list for each supplier.'],
  ['chart-line-up', 'Accounts', 'Profit & Loss, Balance Sheet and a cashbook that fill themselves in as you sell.'],
];

const STEPS = [
  ['/landing/phone-signup.webp', 'Register your business', 'Your shop name, TPIN and phone. Confirm your email and your workspace is ready.'],
  ['/landing/phone-staff.webp', 'Add products and staff', 'Import your stock list from Excel and invite your cashiers and supervisors.'],
  ['/landing/phone-pay.webp', 'Start selling', 'Scan, take payment and watch your profit grow on the dashboard.'],
];

const SHOPS = [
  ['basket', 'Groceries & tuck shops', 'Fast checkout for busy counters, with low-stock alerts.'],
  ['pill', 'Pharmacies', 'Track stock carefully and see what sells, branch by branch.'],
  ['hammer', 'Hardware stores', 'Thousands of items, found fast by name, code or barcode.'],
  ['t-shirt', 'Boutiques', 'Know your best sellers and what’s left on the rails.'],
  ['scissors', 'Salons & services', 'Sell services and products together, with credit for regulars.'],
  ['truck', 'Wholesalers', 'Multiple branches, stock transfers and supplier reorder lists.'],
];

const FAQ = [
  ['Do I need internet all the time?', 'No. iPOS keeps selling when the internet goes off and catches up by itself when it’s back. You need internet the first time you sign in on a device.'],
  ['What do I need to start?', 'Any phone, tablet or computer with a modern browser. A barcode scanner and receipt printer are optional — you can also scan with the phone camera.'],
  ['Can I bring my existing product list?', 'Yes. Upload your products from Excel or a CSV file, check them on screen, and import hundreds at once.'],
  ['How do I pay?', 'Pay monthly or yearly by MTN Money, Airtel Money or bank transfer, then enter the payment reference in iPOS. No card needed.'],
  ['What happens after the free trial?', `Your shop keeps everything. If you haven’t paid, selling pauses ${SITE.price.graceDays} days after the trial ends — you can still see and download all your data, and selling starts again as soon as you pay.`],
  ['Is my shop’s data safe?', 'Each shop’s data is kept separate and only your own staff can see it. Every action is recorded, and you can download your data to Excel any time.'],
  ['Can I cancel?', 'Yes, any time. There’s no contract — simply don’t renew. You can download your data first.'],
];

function PlanCard({ p }) {
  const [branches, setBranches] = useState(1), [yearly, setYearly] = useState(true);
  const extra = branches - 1;
  return (
    <div className="lp-calc" id="pricing">
      <h3>Your iPOS plan</h3>
      <label id="lp-branches">How many shops (branches)?</label>
      <div className="lp-stepper" role="group" aria-labelledby="lp-branches">
        <button aria-label="Fewer branches" onClick={() => setBranches(Math.max(1, branches - 1))} disabled={branches === 1}><Minus size={18} /></button>
        <b aria-live="polite">{branches}</b>
        <button aria-label="More branches" onClick={() => setBranches(Math.min(20, branches + 1))}><Plus size={18} /></button>
      </div>
      <label>How would you like to pay?</label>
      <div className="lp-toggle">
        <button className={yearly ? '' : 'on'} aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
        <button className={yearly ? 'on' : ''} aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly · 2 months free</button>
      </div>
      <div className="lp-summary">
        <h4>Plan summary</h4>
        <div className="lp-row">Free trial<b>{p.trialDays} days</b></div>
        <div className="lp-row">Main shop<b>{kwacha(p.monthly)} / month</b></div>
        {extra > 0 && <div className="lp-row">{extra} extra branch{extra > 1 ? 'es' : ''}<b>{kwacha(extra * p.extraBranch)} / month</b></div>}
        <div className="lp-row">{yearly ? 'Yearly price' : 'Monthly price'}<b>{kwacha(planPrice(p, branches, yearly ? 12 : 1))}</b></div>
        <div className="lp-row total">You pay today<b>{kwacha(0)}</b></div>
      </div>
      <Link className="lp-btn lp-primary lp-block" to="/signup">Start free trial</Link>
      <small>No card needed · Cancel any time</small>
    </div>
  );
}

export default function Landing({ auth }) {
  const [menu, setMenu] = useState(false), [open, setOpen] = useState(0);
  if (auth?.session && auth?.membership && !auth?.loading) return <Navigate to="/dashboard" replace />;
  const wa = whatsappLink();
  const p = SITE.price;
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-row">
          <Link to="/" className="lp-brand" aria-label="iPOS home"><img src="/ipos-logo.png?v=23670b6cd135" alt="" /><Wordmark /></Link>
          <nav className={'lp-links' + (menu ? ' open' : '')} onClick={() => setMenu(false)}>
            <a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#faq">Questions</a>
            <Link to="/login" className="lp-signin">Sign in</Link>
            <Link to="/signup" className="lp-btn lp-primary lp-small">Start free trial</Link>
          </nav>
          <button className="lp-burger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-text">
              <span className="lp-eyebrow">Point of sale for Zambian shops</span>
              <h1>Sell faster.<br />Lose less.<br /><em>Know your profit.</em></h1>
              <p>iPOS runs your till, stock, staff and accounts from one simple app, on the phone or computer you already have.</p>
              <div className="lp-cta-row">
                <Link className="lp-btn lp-orange" to="/signup">Start your {p.trialDays}-day free trial <ArrowRight size={18} /></Link>
                <a className="lp-btn lp-outline" href="#how">See how it works</a>
              </div>
              <div className="lp-tags"><span>Works offline</span><span>Cash &amp; mobile money</span><span>English, Bemba, Nyanja</span></div>
            </div>
            <picture className="lp-hero-photo">
              <source media="(max-width: 760px)" srcSet="/landing/hero-shop-small.webp" />
              <img src="/landing/hero-shop.webp" alt="A smiling customer at a shop counter while the cashier scans her items" width="1600" height="1267" fetchpriority="high" />
            </picture>
            <PlanCard p={p} />
          </div>
        </section>

        <p className="lp-quote">“Every sale counted, every kwacha accounted for, <span>even when the internet goes off.</span>”</p>

        <section className="lp-pillars" id="features">
          <div className="lp-wrap lp-grid3">
            {PILLARS.map(([icon, title, text]) => (
              <article className="lp-pill" key={title}><span className="lp-i"><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p><Link to="/signup">Try it free <ArrowRight size={16} /></Link></article>
            ))}
          </div>
        </section>

        <section className="lp-pay">
          <div className="lp-wrap lp-pay-grid">
            <CheckoutIllustration />
            <div>
              <span className="lp-eyebrow dark">Every way your customers pay</span>
              <h2 className="lp-h2 left">Cash, mobile money or card. One till.</h2>
              <ul className="lp-checks">
                <li><Check size={18} /> <span><b>Cash</b> with the change worked out for you</span></li>
                <li><Check size={18} /> <span><b>MTN and Airtel money</b> recorded on every sale, so the day adds up</span></li>
                <li><Check size={18} /> <span><b>Card</b> on your own card machine</span></li>
                <li><Check size={18} /> <span><b>Credit for regulars</b>, so you always know who owes what</span></li>
              </ul>
              <Link className="lp-btn lp-primary" to="/signup">Start your {p.trialDays}-day free trial <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>

        <section className="lp-banner">
          <div className="lp-wrap">
            <div className="lp-box">
              <div className="lp-box-phone" aria-hidden="true"><span className="lp-tag">Sale complete · K305</span><div className="lp-phone"><img src="/landing/phone-receipt.webp" alt="" width="540" height="1169" loading="lazy" /></div></div>
              <div className="lp-box-text"><h2>Make a sale in seconds</h2><p>Scan the barcode with your phone camera, tap Complete sale, and the receipt is ready to send.</p><Link className="lp-btn lp-white" to="/signup">Start free trial</Link></div>
            </div>
          </div>
        </section>

        <section className="lp-steps" id="how">
          <div className="lp-wrap">
            <h2 className="lp-h2">Get your shop running in 3 easy steps</h2>
            <div className="lp-grid3">
              {STEPS.map(([img, title, text], i) => (
                <div key={title}>
                  <div className="lp-cwrap"><i>{i + 1}</i><div className="lp-circle"><img src={img} alt="" width="540" height="1169" loading="lazy" /></div></div>
                  <h3>{title}</h3><p>{text}</p>
                </div>
              ))}
            </div>
            <Link className="lp-btn lp-primary" to="/signup">Start your {p.trialDays}-day free trial <ArrowRight size={18} /></Link>
          </div>
        </section>

        <section className="lp-types">
          <div className="lp-wrap">
            <h2 className="lp-h2">Made for every kind of shop</h2>
            <div className="lp-grid3">
              {SHOPS.map(([icon, title, text]) => (
                <article className="lp-type" key={title}><div><h3>{title}</h3><p>{text}</p><Link className="lp-btn lp-primary lp-small" to="/signup">Start free</Link></div><span className="lp-big"><Icon name={icon} /></span></article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-band">
          <div className="lp-wrap lp-band-grid">
            <div><h2>Keeps selling when the internet goes off</h2><p>Sales are saved on the device and sent automatically when you’re back online, so load-shedding and network problems never stop your till.</p></div>
            <div className="lp-stats">
              <div><b>{p.trialDays} days</b><span>free trial, no card</span></div>
              <div><b>{kwacha(p.monthly)}</b><span>per month, everything included</span></div>
              <div><b>3</b><span>languages for your cashiers</span></div>
              <div><b>Any</b><span>phone, tablet or computer</span></div>
            </div>
          </div>
        </section>

        <section className="lp-faq-sec" id="faq">
          <div className="lp-wrap lp-narrow">
            <h2 className="lp-h2">Questions</h2>
            <div className="lp-faq">{FAQ.map(([q, a], i) => (
              <div key={q} className={'lp-q' + (open === i ? ' open' : '')}>
                <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}<ChevronDown size={18} /></button>
                {open === i && <p>{a}</p>}
              </div>))}
            </div>
            {wa && <div className="lp-center"><a className="lp-btn lp-ghost" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Ask us on WhatsApp</a></div>}
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="lp-foot-grid">
            <div><div className="lp-brand light"><img src="/ipos-logo.png?v=23670b6cd135" alt="" /><Wordmark /></div><p>Point of sale, stock and accounts for Zambian shops.</p></div>
            <div><h4>Product</h4><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#how">How it works</a></div>
            <div><h4>Help</h4><a href="#faq">Questions</a>{wa && <a href={wa} target="_blank" rel="noreferrer">WhatsApp us</a>}{SITE.supportEmail && <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>}<Link to="/login">Sign in</Link></div>
            <div><h4>Legal</h4><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link></div>
          </div>
          <div className="lp-copy"><span>© {new Date().getFullYear()} {SITE.legalName || 'iPOS'} · Lusaka, Zambia</span><span>Made for Zambian shops</span></div>
        </div>
      </footer>
      {wa && <a className="lp-wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><MessageCircle size={26} /></a>}
    </div>
  );
}
