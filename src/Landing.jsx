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
        {/* 1. Hero: photo, headline, one big button */}
        <section className="lp-hero lp-hero-a">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-text">
              <span className="lp-eyebrow">Point of sale for Zambian shops</span>
              <h1>Sell faster.<br />Lose less.<br /><em>Know your profit.</em></h1>
              <p>iPOS runs your till, stock, staff and accounts from one simple app, on the phone or computer you already have.</p>
              <div className="lp-cta-row">
                <Link className="lp-btn lp-orange lp-big-btn" to="/signup">Start your {p.trialDays}-day free trial <ArrowRight size={18} /></Link>
                <a className="lp-btn lp-outline" href="#how">See how it works</a>
              </div>
              <small className="lp-hero-note">No card needed · Cancel any time</small>
            </div>
            <picture className="lp-hero-photo">
              <source media="(max-width: 760px)" srcSet="/landing/hero-shop-small.webp" />
              <img src="/landing/hero-shop.webp" alt="A smiling customer at a shop counter while the cashier scans her items" width="1600" height="1267" fetchpriority="high" />
            </picture>
          </div>
        </section>

        {/* 2. Trust strip */}
        <div className="lp-trust">
          <div className="lp-wrap lp-trust-row">
            {TRUST.map(([I, text]) => <span key={text}><I size={18} /> {text}</span>)}
          </div>
        </div>

        {/* 3. Three easy steps */}
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

        {/* 4-7. Feature rows, picture and words swap sides */}
        <div id="features" className="lp-features">
          <section className="lp-feat">
            <div className="lp-wrap lp-feat-grid">
              <div className="lp-feat-art"><CheckoutIllustration /></div>
              <div>
                <span className="lp-eyebrow dark">Sell and get paid</span>
                <h2 className="lp-h2 left">Cash, mobile money or card. One till.</h2>
                <ul className="lp-checks">
                  <li><Check size={18} /> <span><b>Scan, tap or search</b> and the item is on the bill in a second</span></li>
                  <li><Check size={18} /> <span><b>Cash</b> with the change worked out for you</span></li>
                  <li><Check size={18} /> <span><b>MTN and Airtel money</b> recorded on every sale, so the day adds up</span></li>
                  <li><Check size={18} /> <span><b>Card</b> on your own card machine</span></li>
                  <li><Check size={18} /> <span><b>Credit for regulars</b>, so you always know who owes what</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="lp-feat lp-soft">
            <div className="lp-wrap lp-feat-grid flip">
              <div className="lp-feat-art lp-phone-stage">
                <span className="lp-tag">Running out · 10 items</span>
                <div className="lp-phone"><img src="/landing/phone-dashboard.webp" alt="The iPOS dashboard on a phone showing today’s sales and 10 items running out" width="540" height="1169" loading="lazy" /></div>
              </div>
              <div>
                <span className="lp-eyebrow dark">Stock</span>
                <h2 className="lp-h2 left">Never run out of what sells</h2>
                <ul className="lp-checks">
                  <li><Check size={18} /> <span><b>Know what’s running low</b> and how many days you have left</span></li>
                  <li><Check size={18} /> <span><b>A reorder list for each supplier</b>, ready in one tap</span></li>
                  <li><Check size={18} /> <span><b>Stock transfers</b> between branches, all counted</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="lp-feat">
            <div className="lp-wrap lp-feat-grid">
              <div className="lp-feat-art lp-screen"><img src="/landing/05-profit-loss.webp" alt="The iPOS Profit and Loss statement for this quarter" width="1440" height="900" loading="lazy" /></div>
              <div>
                <span className="lp-eyebrow dark">Profit and accounts</span>
                <h2 className="lp-h2 left">Your books, done for you</h2>
                <ul className="lp-checks">
                  <li><Check size={18} /> <span><b>Profit &amp; Loss and Balance Sheet</b> updated with every sale</span></li>
                  <li><Check size={18} /> <span><b>A cashbook</b> that shows where every kwacha went</span></li>
                  <li><Check size={18} /> <span><b>Download to Excel</b> any time for your accountant</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section className="lp-feat lp-soft">
            <div className="lp-wrap lp-feat-grid flip">
              <figure className="lp-feat-art lp-queue-art">
                <img src="/landing/queue-illustration.webp" alt="Customers with shopping bags queue at a shop counter while the cashier serves them" width="1200" height="770" loading="lazy" />
                <figcaption>Illustration: Freepik</figcaption>
              </figure>
              <div>
                <span className="lp-eyebrow dark">Busy days made easy</span>
                <h2 className="lp-h2 left">Shorter queues, even offline</h2>
                <ul className="lp-checks">
                  <li><Check size={18} /> <span><b>Make a sale in seconds</b>: scan with the phone camera, tap Complete sale</span></li>
                  <li><Check size={18} /> <span><b>Several tills at once</b>, each cashier on their own phone or computer</span></li>
                  <li><Check size={18} /> <span><b>Receipts by WhatsApp</b> or printed, so customers are on their way fast</span></li>
                  <li><Check size={18} /> <span><b>Keeps selling when the internet goes off</b>, and catches up when it’s back</span></li>
                </ul>
              </div>
            </div>
          </section>
        </div>

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

        {/* 9. Pricing with the plan calculator */}
        <section className="lp-price-sec">
          <div className="lp-wrap lp-price-grid">
            <div>
              <span className="lp-eyebrow">Pricing</span>
              <h2>One simple price. Everything included.</h2>
              <p>Till, stock, staff, reports and accounts for {kwacha(p.monthly)} a month. Pay monthly or yearly by MTN Money, Airtel Money or bank transfer.</p>
              <div className="lp-stats">
                <div><b>{p.trialDays} days</b><span>free trial, no card</span></div>
                <div><b>{kwacha(p.monthly)}</b><span>per month, everything included</span></div>
                <div><b>3</b><span>languages for your cashiers</span></div>
                <div><b>Any</b><span>phone, tablet or computer</span></div>
              </div>
            </div>
            <PlanCard p={p} />
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

        {/* 11. Final call to action with the install QR code */}
        <section className="lp-final">
          <div className="lp-wrap">
            <div className="lp-final-box">
              <div>
                <h2>Every sale counted, every kwacha accounted for.</h2>
                <p>Start free today. It takes about five minutes to set up your shop.</p>
                <div className="lp-cta-row">
                  <Link className="lp-btn lp-orange" to="/signup">Start your {p.trialDays}-day free trial <ArrowRight size={18} /></Link>
                  <Link className="lp-btn lp-outline" to="/install"><Download size={18} /> Get the app</Link>
                </div>
              </div>
              <Link to="/install" className="lp-final-qr" aria-label="Get the iPOS app">
                <span className="lp-qr-code"><img src="/install-qr.svg" alt="QR code to install the iPOS app" width="150" height="150" /><img className="lp-qr-logo" src="/icon-192.png" alt="" width="34" height="34" /></span>
                <b>Scan to get the app</b>
              </Link>
            </div>
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
