import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShoppingCart, WifiOff, PackageSearch, ShieldCheck, FileSpreadsheet, Store, Languages, Smartphone, Check, MessageCircle, ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { SITE, whatsappLink, kwacha } from './site-config';
import { planPrice } from './plan-utils';
import './landing.css';

const BENEFITS = [
  [ShoppingCart, 'Sell fast', 'A simple checkout with barcode scanning, quick search and receipts. Cash, mobile money, card and credit sales in one place.'],
  [WifiOff, 'Keeps working offline', 'No internet? Keep selling. Sales are saved on the device and sent automatically when you’re back online.'],
  [PackageSearch, 'Never run out', 'See what’s running low, how many days of stock you have left, and a ready-made reorder list for each supplier.'],
  [ShieldCheck, 'Stop losses', 'Cashier shifts with cash counts, a full history of every change, and automatic checks for unusual refunds or discounts.'],
  [FileSpreadsheet, 'Accounts done for you', 'Profit & Loss, Balance Sheet and a cashbook that fill themselves in as you sell. Download any report to Excel.'],
  [Store, 'One shop or many', 'Run several branches, move stock between them, and see each branch or everything together.'],
  [Languages, 'In your language', 'Cashiers can use iPOS in English, Bemba or Nyanja.'],
  [Smartphone, 'Any device', 'Works on a phone, tablet, laptop or desktop. Install it like an app — nothing to buy.'],
];

const SHOWCASE = [
  ['/landing/03-checkout.webp', 'A checkout your cashiers learn in minutes', 'Tap or scan items, take cash or mobile money, and print or share the receipt. Keyboard shortcuts make busy hours faster.'],
  ['/landing/08-reorder.webp', 'Know what to buy before you run out', 'iPOS watches how fast each item sells and tells you — “you’ll run out of sugar in 4 days” — with a reorder list ready to send.'],
  ['/landing/05-profit-loss.webp', 'Your real profit, every month', 'Sales, cost of goods and expenses become a Profit & Loss statement and Balance Sheet, compared with last month, ready for your accountant.'],
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

export default function Landing({ auth }) {
  const [menu, setMenu] = useState(false), [open, setOpen] = useState(0);
  if (auth?.session && auth?.membership && !auth?.loading) return <Navigate to="/dashboard" replace />;
  const wa = whatsappLink();
  const p = SITE.price;
  const trialCta = <Link className="lp-btn lp-primary" to="/signup">Start your {p.trialDays}-day free trial <ArrowRight size={18} /></Link>;
  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-row">
          <Link to="/" className="lp-brand" aria-label="iPOS home"><img src="/ipos-logo.png?v=23670b6cd135" alt="" /><span>iPOS</span></Link>
          <nav className={'lp-links' + (menu ? ' open' : '')} onClick={() => setMenu(false)}>
            <a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">Questions</a>
            {wa && <a href={wa} target="_blank" rel="noreferrer">Contact</a>}
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
              <h1>Sell faster. Lose less. <span>Know your profit.</span></h1>
              <p>iPOS runs your till, stock, staff and accounts from one simple app — on the phone or computer you already have, even when the internet goes off.</p>
              <div className="lp-cta-row">{trialCta}{wa && <a className="lp-btn lp-ghost" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Chat on WhatsApp</a>}</div>
              <ul className="lp-ticks"><li><Check size={16} /> {p.trialDays} days free</li><li><Check size={16} /> No card needed</li><li><Check size={16} /> Set up in an afternoon</li></ul>
            </div>
            <div className="lp-hero-shot" aria-hidden="true">
              <div className="lp-browser"><div className="lp-browser-bar"><i /><i /><i /></div><img src="/landing/01-dashboard.webp" alt="" width="1440" height="900" fetchpriority="high" /></div>
              <img className="lp-phone" src="/landing/phone-checkout.webp" alt="" width="540" height="1169" />
            </div>
          </div>
        </section>

        <section className="lp-strip"><div className="lp-wrap"><span>Made for</span> grocery shops · pharmacies · hardware stores · boutiques · salons · wholesalers · tuck shops</div></section>

        <section className="lp-section" id="features">
          <div className="lp-wrap">
            <h2 className="lp-h2">Everything your shop needs, nothing it doesn’t</h2>
            <p className="lp-lead">Made for the way Zambian shops actually work — from a busy Saturday till to the month-end books.</p>
            <div className="lp-benefits">{BENEFITS.map(([Icon, title, text]) => <article key={title}><span className="lp-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
          </div>
        </section>

        {SHOWCASE.map(([img, title, text], i) => (
          <section className={'lp-show' + (i % 2 ? ' flip' : '')} key={title}>
            <div className="lp-wrap lp-show-grid">
              <div><h2 className="lp-h2 left">{title}</h2><p className="lp-lead left">{text}</p></div>
              <div className="lp-browser"><div className="lp-browser-bar"><i /><i /><i /></div><img src={img} alt={title} loading="lazy" width="1440" height="900" /></div>
            </div>
          </section>
        ))}

        <section className="lp-section lp-pricing" id="pricing">
          <div className="lp-wrap">
            <h2 className="lp-h2">Simple pricing in Kwacha</h2>
            <p className="lp-lead">One price per shop with everything included. Start free — pay only if iPOS works for you.</p>
            <div className="lp-plans">
              <article className="lp-plan">
                <h3>Monthly</h3>
                <p className="lp-price"><strong>{kwacha(p.monthly)}</strong><span>/ month</span></p>
                <p className="lp-plan-note">per shop · main branch included</p>
                <Link className="lp-btn lp-ghost lp-block" to="/signup">Start free trial</Link>
              </article>
              <article className="lp-plan best">
                <span className="lp-badge">2 months free</span>
                <h3>Yearly</h3>
                <p className="lp-price"><strong>{kwacha(planPrice(p, 1, 12))}</strong><span>/ year</span></p>
                <p className="lp-plan-note">same as {kwacha(Math.round(planPrice(p, 1, 12) / 12))} a month</p>
                <Link className="lp-btn lp-primary lp-block" to="/signup">Start free trial</Link>
              </article>
            </div>
            <ul className="lp-included">
              {['Unlimited products, sales and receipts', 'Unlimited staff accounts', 'Offline selling', 'Reports, Profit & Loss and Balance Sheet', 'Excel import and downloads', 'WhatsApp support'].map(x => <li key={x}><Check size={16} /> {x}</li>)}
              <li><Check size={16} /> Extra branches {kwacha(p.extraBranch)} each per month</li>
            </ul>
            <p className="lp-fine">Pay by MTN Money, Airtel Money or bank transfer. No contract — stop any time.</p>
          </div>
        </section>

        <section className="lp-section" id="faq">
          <div className="lp-wrap lp-narrow">
            <h2 className="lp-h2">Questions</h2>
            <div className="lp-faq">{FAQ.map(([q, a], i) => (
              <div key={q} className={'lp-q' + (open === i ? ' open' : '')}>
                <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}<ChevronDown size={18} /></button>
                {open === i && <p>{a}</p>}
              </div>))}
            </div>
          </div>
        </section>

        <section className="lp-final">
          <div className="lp-wrap">
            <h2>Ready to run a smarter shop?</h2>
            <p>Set up your products and staff today and make your first sale in minutes.</p>
            <div className="lp-cta-row center">{trialCta}{wa && <a className="lp-btn lp-light" href={wa} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Ask us on WhatsApp</a>}</div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-row">
          <div className="lp-brand small"><img src="/ipos-logo.png?v=23670b6cd135" alt="" /><span>iPOS</span></div>
          <nav><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link><Link to="/login">Sign in</Link>{SITE.supportEmail && <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>}</nav>
          <small>© {new Date().getFullYear()} {SITE.legalName || 'iPOS'} · Lusaka, Zambia</small>
        </div>
      </footer>
      {wa && <a className="lp-wa-float" href={wa} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"><MessageCircle size={26} /></a>}
    </div>
  );
}
