// Plan maths and wording shared by the Billing page, the banner and the front page.

const DAY = 86400000;

/** Price for a shop with `branches` branches for `months` months (12 months gets the yearly price). */
export function planPrice(price, branches = 1, months = 1) {
  const perMonth = price.monthly + Math.max(0, (Number(branches) || 1) - 1) * price.extraBranch;
  if (months === 12) return perMonth * price.yearlyMonths;
  return perMonth * months;
}

/** Whole days from now until `date` (rounded up; negative when past). */
export function daysUntil(date, now = Date.now()) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - now) / DAY);
}

const nice = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lusaka' }) : '';

/**
 * Turns the server's subscription answer into what we show people.
 * tone: ok | info | warn | bad. banner: whether to show the top banner.
 */
export function planSummary(sub, { now = Date.now(), director = true } = {}) {
  if (!sub) return null;
  const left = daysUntil(sub.ends_at, now);
  const sellsUntil = nice(sub.grace_ends_at);
  const ask = director ? '' : ' Ask the shop owner to renew.';
  switch (sub.state) {
    case 'trial':
      return { state: 'trial', tone: left <= 7 ? 'warn' : 'info', banner: left <= 7, daysLeft: left,
        title: `Free trial · ${left} day${left === 1 ? '' : 's'} left`,
        text: `Your free trial ends on ${nice(sub.ends_at)}.${director ? ' Pay any time to keep selling without a break.' : ask}` };
    case 'paid':
      return { state: 'paid', tone: left <= 7 ? 'warn' : 'ok', banner: left <= 7, daysLeft: left,
        title: left <= 7 ? `Plan renews soon · ${left} day${left === 1 ? '' : 's'} left` : 'Plan active',
        text: `Paid until ${nice(sub.ends_at)}.${left <= 7 ? (director ? ' Renew now to avoid a break.' : ask) : ''}` };
    case 'grace':
      return { state: 'grace', tone: 'bad', banner: true, daysLeft: left,
        title: 'Your plan has ended',
        text: `You can keep selling until ${sellsUntil}, then new sales will stop.${director ? ' Renew to continue.' : ask}` };
    case 'ended':
      return { state: 'ended', tone: 'bad', banner: true, daysLeft: left,
        title: 'Selling is paused',
        text: `The plan ended on ${nice(sub.ends_at)}. Your products, sales and reports are safe and can still be viewed and downloaded.${director ? ' Renew to start selling again.' : ask}` };
    case 'suspended':
      return { state: 'suspended', tone: 'bad', banner: true, daysLeft: null,
        title: 'Account on hold',
        text: `Selling is paused on this shop.${director ? ' Please contact iPOS support.' : ask}` };
    default:
      return { state: 'active', tone: 'ok', banner: false, daysLeft: null, title: 'Plan active', text: '' };
  }
}

/** Friendly text for the database's "plan ended" refusal. */
export function planError(message = '') {
  if (!/IPOS_PLAN_ENDED/.test(message)) return null;
  return 'This shop’s iPOS plan has ended, so new sales can’t be recorded. The owner can renew under Billing - all your data is safe.';
}
