import React from 'react';
import Wordmark from './Wordmark';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SITE, kwacha } from './site-config';
import './landing.css';

const updated = new Date(SITE.termsVersion + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const us = SITE.legalName || '[Your registered business name]';
const contact = [SITE.supportEmail, SITE.whatsapp && '+' + SITE.whatsapp, SITE.address].filter(Boolean).join(' · ') || '[Your contact email, phone and address]';

function Shell({ title, children }) {
  return (
    <div className="lp lp-legal">
      <header className="lp-nav"><div className="lp-wrap lp-nav-row">
        <Link to="/" className="lp-brand" aria-label="iPOS home"><img src="/ipos-logo.png?v=23670b6cd135" alt="" /><Wordmark /></Link>
        <nav className="lp-legal-links"><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/login" className="lp-signin">Sign in</Link></nav>
      </div></header>
      <main className="lp-wrap lp-narrow lp-doc">
        <Link to="/" className="lp-back"><ArrowLeft size={16} /> Back to iPOS</Link>
        <h1>{title}</h1>
        <p className="lp-updated">Last updated {updated}</p>
        {children}
      </main>
      <footer className="lp-foot"><div className="lp-wrap lp-foot-row"><small>© {new Date().getFullYear()} {SITE.legalName || 'iPOS'} · Lusaka, Zambia</small><nav><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link></nav></div></footer>
    </div>
  );
}

export function Terms() {
  const p = SITE.price;
  return (
    <Shell title="Terms of Service">
      <p>These terms are an agreement between you (the business that signs up, and the person signing up for it) and {us} (“iPOS”, “we”, “us”), the provider of the iPOS point-of-sale service at this website and its apps. By creating an account or using iPOS you agree to these terms. If you don’t agree, please don’t use iPOS.</p>

      <h2>1. The service</h2>
      <p>iPOS is online software for recording sales, stock, customers, staff, expenses and reports for your business. Some features work without internet and send information to our servers when your device is next online. We may improve, change or add features over time; if we remove a major feature you rely on, we will tell you in advance where we reasonably can.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>The person who registers the business is its <b>owner (director)</b> and is responsible for the account, including any staff accounts they invite.</li>
        <li>Give accurate business details and keep passwords secret. Each staff member should have their own login. Tell us straight away if you think someone has used your account without permission.</li>
        <li>You must be at least 18 years old and allowed to enter into contracts on behalf of the business.</li>
      </ul>

      <h2>3. Free trial</h2>
      <p>New shops get a free trial of {p.trialDays} days. No payment details are needed. At the end of the trial you can choose a paid plan; if you don’t, selling pauses as described in section 5.</p>

      <h2>4. Prices and payment</h2>
      <ul>
        <li>Plans are paid in advance, monthly or yearly, at the prices shown on our website when you pay (currently {kwacha(p.monthly)} a month per shop, plus {kwacha(p.extraBranch)} a month for each extra branch; a year costs the same as {p.yearlyMonths} months).</li>
        <li>You pay by mobile money or bank transfer to the details shown in iPOS, and then enter the payment reference on the Billing page. Your plan is extended once we have confirmed the payment, normally within one working day.</li>
        <li>Prices include any taxes we are required to charge unless we say otherwise. We may change prices for future periods; we will give you at least 30 days’ notice, and changes never affect a period you have already paid for.</li>
        <li>Payments are not refundable, except where the law requires or where we cannot provide the service because of our own fault.</li>
      </ul>

      <h2>5. If a plan ends</h2>
      <p>If your trial or paid period ends and isn’t renewed, you can keep selling for {p.graceDays} more days. After that, recording new sales is paused until you pay, but you can still sign in, view your information and download it. Sales made offline before the end date will still be saved when the device reconnects. If a shop stays unpaid for 12 months we may delete its data after giving the owner at least 30 days’ notice by email.</p>

      <h2>6. Your data</h2>
      <ul>
        <li>Everything you put into iPOS — products, sales, customers, staff, expenses — belongs to you. You can download it at any time.</li>
        <li>You allow us to store and process it only to run, secure, support and improve iPOS, as explained in our <Link to="/privacy">Privacy Policy</Link>.</li>
        <li>When you record information about your own customers or staff, you are responsible for having the right to do so and for telling them how you use it, as required by the Data Protection Act, 2021. We process that information on your behalf and on your instructions.</li>
      </ul>

      <h2>7. Taxes and records</h2>
      <p>iPOS helps you keep records and produce tax invoices, but you remain responsible for your business’s tax, accounting and legal obligations, including registering with and reporting to the Zambia Revenue Authority. Unless iPOS clearly says a feature submits information to ZRA for you, it does not. Please have your accountant check reports before relying on them for tax returns.</p>

      <h2>8. Acceptable use</h2>
      <p>Don’t use iPOS for anything illegal, to record fake or fraudulent transactions, to try to access other businesses’ data, to break or overload the service, or to copy or resell the software. We may suspend an account that does any of these things, and will tell you why unless the law prevents us.</p>

      <h2>9. Availability and offline use</h2>
      <p>We work hard to keep iPOS available and your data safe, including regular backups. But no online service can promise to be available all the time, and internet, power or device problems outside our control can affect it. Offline sales are kept on the device until they are sent; if a device is lost, reset or its browser data is cleared before it reconnects, those unsent sales can be lost.</p>

      <h2>10. Liability</h2>
      <p>iPOS is provided “as is”. To the fullest extent the law allows, we are not liable for indirect losses such as lost profits or lost business, and our total liability to you in any 12-month period is limited to the amount you paid us in that period. Nothing in these terms limits rights you have under Zambian law that cannot be limited, including under the Competition and Consumer Protection Act.</p>

      <h2>11. Ending the agreement</h2>
      <p>You can stop using iPOS at any time by not renewing; please download your data first. We may end or suspend the service for a business that seriously breaks these terms. If we ever decide to close iPOS, we will give at least 60 days’ notice so you can download your data.</p>

      <h2>12. Changes to these terms</h2>
      <p>We may update these terms. We will show the date of the latest version at the top and tell owners about important changes by email or in the app at least 14 days before they apply. Using iPOS after that means you accept the new terms.</p>

      <h2>13. Law and disputes</h2>
      <p>These terms are governed by the laws of the Republic of Zambia. If you have a problem, please contact us first so we can try to fix it. Disputes that can’t be resolved will be dealt with by the courts of Zambia.</p>

      <h2>14. Contact</h2>
      <p>{us} · {contact}</p>
    </Shell>
  );
}

export function Privacy() {
  return (
    <Shell title="Privacy Policy">
      <p>This policy explains what information {us} (“iPOS”, “we”) collects when you use iPOS, why, who we share it with and your rights. We follow the Data Protection Act No. 3 of 2021 of Zambia.</p>

      <h2>Two kinds of information</h2>
      <ul>
        <li><b>About you and your business</b> — the owner’s and staff members’ accounts. For this, we are the <b>data controller</b>.</li>
        <li><b>Information your business records in iPOS</b> — such as your customers’ names, phone numbers and balances, sales and stock. Your business is the <b>data controller</b> for this and we act as its <b>data processor</b>: we only use it to provide iPOS to you.</li>
      </ul>

      <h2>What we collect</h2>
      <ul>
        <li><b>Account details:</b> name, email address, password (stored only in scrambled form, never readable by us), role, and the business’s name, address, phone, TPIN and registration number.</li>
        <li><b>Business records</b> you enter: products, prices, stock, sales, receipts, refunds, customers, suppliers, expenses, staff shifts and an audit history of changes.</li>
        <li><b>Payment details for your plan:</b> the payment method, reference, amount and phone number you submit. We never ask for or store card or mobile-money PINs.</li>
        <li><b>Usage and device information:</b> pages used, errors, device type, browser, app version, whether a device is online, and your approximate location (city and country) worked out from your internet address. We use this to keep iPOS working, fix problems and see which features are used.</li>
        <li><b>Feedback and messages</b> you send us.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To provide iPOS: sign you in, store and show your records, keep shops separate, and sync offline sales.</li>
        <li>To keep it secure: detect misuse, keep an audit history and protect accounts.</li>
        <li>To support you and improve iPOS, including fixing errors and understanding which features help.</li>
        <li>To send service emails such as account confirmation, password resets, payment confirmations and important notices.</li>
        <li>To meet legal obligations such as keeping payment records.</li>
      </ul>
      <p>We rely on our contract with you, our legitimate interest in running a safe and reliable service, and legal obligations. We do not sell personal information, and we do not use your shop’s customer data for our own marketing.</p>

      <h2>Who we share it with</h2>
      <p>Only service providers that help us run iPOS, under agreements that require them to protect it: our database and sign-in provider (Supabase), our website hosting provider (Vercel), and our email delivery provider. Some of these store information on servers outside Zambia; we choose providers that use strong security and encryption. We may also share information if the law requires it, for example with a court order.</p>

      <h2>How we protect it</h2>
      <ul>
        <li>Information is encrypted when it travels between your device and our servers.</li>
        <li>Every table in our database is protected so that each business can only reach its own records, and only signed-in staff of that business can see them.</li>
        <li>Owners control which staff can see what, and every important change is recorded in the audit history.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>We keep your business’s records while your account is open so you can see your history and reports. If an account is closed or stays unpaid for 12 months, we delete its data after giving the owner at least 30 days’ notice, except where we must keep payment records for legal or tax reasons. Usage and error logs are deleted after about 12 months.</p>

      <h2>Your rights</h2>
      <p>You can ask us to give you a copy of your personal information, correct it, delete it, or stop or limit certain uses, and you can object to processing. Owners can download their business’s records themselves from the Reports pages. Customers of a shop should contact that shop first, because the shop controls their information; we will help the shop respond. You can also complain to the Office of the Data Protection Commissioner of Zambia.</p>

      <h2>Children</h2>
      <p>iPOS is for businesses and is not meant for anyone under 18.</p>

      <h2>Changes</h2>
      <p>We will show the date of the latest version at the top of this page and tell owners about important changes by email or in the app.</p>

      <h2>Contact</h2>
      <p>{us} · {contact}</p>
    </Shell>
  );
}
