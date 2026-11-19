import React, { useEffect, useState } from 'react';
import Wordmark from './Wordmark';
import { Link, Navigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, ChevronDown, Menu, X, Minus, Plus, Check, Download, WifiOff, Smartphone, Languages, BadgeCheck } from 'lucide-react';
import { isStandalone, readFlag, writeFlag } from './install';
import { SITE, whatsappLink, kwacha } from './site-config';
import { planPrice } from './plan-utils';
import { ICONS } from './landing-icons';
import CheckoutIllustration from './CheckoutIllustration';
import './landing.css';

const Icon = ({ name }) => <span className="lp-svg" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;

const PILLARS = [['barcode', 'Sell'], ['package', 'Stock'], ['chart-line-up', 'Accounts']];

const FEATURES6 = [
  [<CheckoutIllustration />, 'Take every kind of payment', 'Cash with change worked out, MTN and Airtel money, card, and credit for regulars.'],
  [<img src="/landing/phone-pos.webp" alt="" loading="lazy" />, 'Scan, tap or search', 'The phone camera is your barcode scanner. Items are on the bill in a second.'],
  [<img src="/landing/08-reorder.webp" alt="" loading="lazy" />, 'Never run out', 'See what’s running low and how many days you have left, with a reorder list per supplier.'],
  [<img src="/landing/05-profit-loss.webp" alt="" loading="lazy" />, 'Books that do themselves', 'Profit & Loss, Balance Sheet and a cashbook, filled in as you sell.'],
  [<img src="/landing/phone-staff.webp" alt="" loading="lazy" />, 'Staff and shifts', 'Invite cashiers and supervisors. Every sale and shift is recorded under their name.'],
  [<img src="/landing/07-cashbook.webp" alt="" loading="lazy" />, 'Every branch in one place', 'Switch branches, move stock between them and compare how each one sells.'],
];

const TRUST = [
  [WifiOff, 'Works offline'],
  [Smartphone, 'MTN & Airtel money'],
  [Languages, 'English, Bemba, Nyanja'],
  [BadgeCheck, 'No card needed'],
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
  ['What do I need to start?', 'Any phone, tablet or computer with a modern browser. A barcode scanner and receipt printer are optional - you can also scan with the phone camera.'],
  ['Can I bring my existing product list?', 'Yes. Upload your products from Excel or a CSV file, check them on screen, and import hundreds at once.'],
  ['How do I pay?', 'Pay monthly or yearly by MTN Money, Airtel Money or bank transfer, then enter the payment reference in iPOS. No card needed.'],
  ['What happens after the free trial?', `Your shop keeps everything. If you haven’t paid, selling pauses ${SITE.price.graceDays} days after the trial ends - you can still see and download all your data, and selling starts again as soon as you pay.`],
  ['Is my shop’s data safe?', 'Each shop’s data is kept separate and only your own staff can see it. Every action is recorded, and you can download your data to Excel any time.'],
  ['Can I cancel?', 'Yes, any time. There’s no contract - simply don’t renew. You can download your data first.'],
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

function GetTheApp() {
  const [hidden, setHidden] = useState(() => isStandalone() || readFlag('ipos.qrHidden') === '1');
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 0.45);
    check(); window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  if (hidden) return null;
  const close = () => { writeFlag('ipos.qrHidden', '1'); setHidden(true); };
  return (<>
    <aside className={'lp-qr' + (shown ? ' show' : '')} aria-label="Get the iPOS app">
      <button className="lp-qr-x" aria-label="Hide" onClick={close}><X size={14} /></button>
      <Link to="/install" className="lp-qr-code"><img src="/install-qr.svg" alt="QR code to install the iPOS app" width="120" height="120" /><img className="lp-qr-logo" src="/icon-192.png" alt="" width="30" height="30" /></Link>
      <b>Scan to get the app</b><small>Android, iPhone and computer</small>
    </aside>
    <Link to="/install" className="lp-get-app"><Download size={17} /> Install the app</Link>
  </>);
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
            <Link to="/install">Get the app</Link>
            <Link to="/login" className="lp-signin">Sign in</Link>
            <Link to="/signup" className="lp-btn lp-primary lp-small">Start free trial</Link>
          </nav>
          <button className="lp-burger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        {/* 1. Hero with the plan card (as now) */}
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

        {/* 2. The problem */}
        <section className="lp-problem">
          <div className="lp-wrap lp-narrow">
            <span className="lp-eyebrow">Sound familiar?</span>
            <h2>Long day at the till. No idea what sold, what’s left, or what you made?</h2>
            <div className="lp-pains">
              <span>Stock runs out before you notice</span>
              <span>The cash and mobile money never add up</span>
              <span>Books done by hand at the end of the month</span>
            </div>
          </div>
        </section>

        {/* 3. The answer */}
        <section className="lp-answer" id="features">
          <div className="lp-wrap lp-feat-grid">
            <div className="lp-feat-art lp-phone-stage">
              <span className="lp-tag">Sale complete · K305</span>
              <div className="lp-phone"><img src="/landing/phone-receipt.webp" alt="An iPOS receipt on a phone" width="540" height="1169" loading="lazy" /></div>
            </div>
            <div>
              <span className="lp-eyebrow dark">The answer</span>
              <h2 className="lp-h2 left">iPOS puts your whole shop in one app</h2>
              <p className="lp-lead">Every sale counted, every kwacha accounted for, even when the internet goes off.</p>
              <div className="lp-answer-icons">
                {PILLARS.map(([icon, title]) => <span key={title}><span className="lp-i"><Icon name={icon} /></span>{title}</span>)}
                <span><span className="lp-i"><WifiOff size={26} /></span>Offline</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Feature cards (6) */}
        <section className="lp-cards6">
          <div className="lp-wrap">
            <h2 className="lp-h2">Everything your shop needs</h2>
            <div className="lp-grid3">
              {FEATURES6.map(([art, title, text]) => (
                <article className="lp-fcard" key={title}><div className="lp-fcard-art">{art}</div><h3>{title}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. See it in action */}
        <section className="lp-pay lp-queue">
          <div className="lp-wrap lp-pay-grid">
            <div>
              <span className="lp-eyebrow dark">Busy days made easy</span>
              <h2 className="lp-h2 left">Shorter queues at the till</h2>
              <ul className="lp-checks">
                <li><Check size={18} /> <span><b>Make a sale in seconds</b>: scan with the phone camera, tap Complete sale</span></li>
                <li><Check size={18} /> <span><b>Several tills at once</b>, each cashier on their own phone or computer</span></li>
                <li><Check size={18} /> <span><b>Receipts by WhatsApp</b> or printed, so customers are on their way fast</span></li>
              </ul>
            </div>
            <figure className="lp-queue-art">
              <img src="/landing/queue-illustration.webp" alt="Customers with shopping bags queue at a shop counter while the cashier serves them" width="1200" height="770" loading="lazy" />
              <figcaption>Illustration: Freepik</figcaption>
            </figure>
          </div>
        </section>

        {/* 6. Three easy steps */}
        <section className="lp-steps" id="how">
          <div className="lp-wrap">
            <span className="lp-eyebrow dark">How it works</span>
            <h2 className="lp-h2">Get your shop running in 3 easy steps</h2>
            <div className="lp-grid3">
              {STEPS.map(([img, title, text], i) => (
                <div key={title}>
                  <div className="lp-cwrap"><i>{i + 1}</i><div className="lp-circle"><img src={img} alt="" width="540" height="1169" loading="lazy" /></div></div>
                  <h3>{title}</h3><p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Offline band */}
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

        {/* 8. Every kind of shop */}
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

        {/* 10. Questions */}
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
      <GetTheApp />
      {wa && <a className="lp-wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><MessageCircle size={26} /></a>}
    </div>
  );
}
