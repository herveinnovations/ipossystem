import React from 'react';

// Original flat illustration for the front page: a customer pays by phone while the
// cashier's iPOS tablet shows the sale, with cash, card and mobile money around them.
const SKIN_A = '#7a4a30', SKIN_B = '#5a3826';

export default function CheckoutIllustration() {
  return (
    <svg className="lp-illus" viewBox="0 0 600 500" role="img" aria-label="A customer pays with mobile money at a shop counter while the cashier's iPOS tablet shows the sale is complete">
      <defs>
        <pattern id="lp-chit" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="14" height="14" fill="#e09a4c" /><circle cx="7" cy="7" r="2.6" fill="#c9792f" /><path d="M0 0h14" stroke="#f2c48d" strokeWidth="1.6" />
        </pattern>
        <pattern id="lp-wrap" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#1f6a4d" /><circle cx="6" cy="6" r="2" fill="#f2c48d" />
        </pattern>
      </defs>

      {/* soft backdrop and floor */}
      <rect x="20" y="40" width="560" height="420" rx="40" fill="#eef6f1" />
      <rect x="60" y="466" width="480" height="6" rx="3" fill="#d9e5de" />

      {/* money in the air */}
      <g>
        <rect x="200" y="74" width="62" height="40" rx="6" fill="#e09a4c" transform="rotate(-10 231 94)" />
        <rect x="200" y="84" width="62" height="7" fill="#7a3f12" opacity=".55" transform="rotate(-10 231 94)" />
        <rect x="238" y="96" width="14" height="10" rx="2" fill="#f2c48d" transform="rotate(-10 231 94)" />
      </g>
      <g transform="rotate(8 360 86)">
        <rect x="322" y="66" width="78" height="40" rx="4" fill="#2b7d5c" />
        <rect x="328" y="72" width="66" height="28" rx="3" fill="none" stroke="#9fd2b9" strokeWidth="1.5" />
        <circle cx="361" cy="86" r="11" fill="#1f6a4d" />
        <text x="361" y="91" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="Trebuchet MS, sans-serif">K</text>
      </g>
      <g fontFamily="Trebuchet MS, sans-serif" fontWeight="800" fontSize="11" fill="#7a3f12" textAnchor="middle">
        <circle cx="430" cy="118" r="13" fill="#f2c48d" stroke="#e09a4c" strokeWidth="3" /><text x="430" y="122">K</text>
        <circle cx="450" cy="92" r="11" fill="#f2c48d" stroke="#e09a4c" strokeWidth="3" /><text x="450" y="96">K</text>
      </g>
      {/* signal from the phone to the till */}
      <g fill="none" stroke="#8aa197" strokeWidth="4" strokeLinecap="round">
        <path d="M282 170a16 16 0 0 1 16 -12" /><path d="M276 160a28 28 0 0 1 28 -20" />
      </g>

      {/* counter */}
      <rect x="150" y="300" width="420" height="16" rx="4" fill="#0f3a2e" />
      <rect x="166" y="316" width="388" height="144" fill="#1f6a4d" />
      <rect x="166" y="316" width="388" height="10" fill="#0f3a2e" opacity=".35" />

      {/* iPOS tablet on its stand */}
      <rect x="333" y="268" width="10" height="32" fill="#33463c" />
      <rect x="312" y="294" width="52" height="7" rx="3" fill="#33463c" />
      <rect x="290" y="198" width="96" height="72" rx="8" fill="#17251e" />
      <rect x="297" y="205" width="82" height="58" rx="3" fill="#fff" />
      <rect x="297" y="205" width="82" height="11" rx="3" fill="#1f6a4d" />
      <circle cx="338" cy="232" r="9" fill="#1f6a4d" />
      <path d="M333.5 232l3.2 3.2 6-6.4" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="338" y="257" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1f6a4d" fontFamily="Trebuchet MS, sans-serif">K68.00</text>

      {/* receipt printer and receipt */}
      <rect x="396" y="278" width="46" height="22" rx="4" fill="#33463c" />
      <path d="M404 300h30v62l-5 4-5-4-5 4-5-4-5 4-5-4z" fill="#fff" />
      <g fill="#9aa9a1"><rect x="409" y="307" width="20" height="3" /><rect x="409" y="315" width="14" height="2.5" /><rect x="409" y="322" width="17" height="2.5" /><rect x="409" y="329" width="12" height="2.5" /></g>
      <rect x="409" y="340" width="20" height="4" fill="#1f6a4d" />

      {/* cashier behind the counter */}
      <path d="M440 300c0-48 4-92 50-96 46 4 50 48 50 96z" fill="#e8efe9" />
      <path d="M462 300l4-74h48l4 74z" fill="#e09a4c" />
      <path d="M470 226v-14M510 226v-14" stroke="#c9792f" strokeWidth="4" />
      <rect x="481" y="176" width="18" height="30" fill={SKIN_B} />
      <circle cx="490" cy="158" r="25" fill={SKIN_B} />
      <path d="M465 154c-2-30 50-34 50-4-8-10-34-12-50 4z" fill="#1a110b" />
      <circle cx="476" cy="160" r="2.6" fill="#1a110b" />
      <path d="M470 171q6 4 11 0" fill="none" stroke="#1a110b" strokeWidth="2" strokeLinecap="round" />
      <path d="M452 222l-28 30-24-4" fill="none" stroke={SKIN_B} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M455 218l-10 14" stroke="#e8efe9" strokeWidth="20" strokeLinecap="round" />
      <path d="M528 222l12 52-24 22" fill="none" stroke={SKIN_B} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M526 218l6 16" stroke="#e8efe9" strokeWidth="20" strokeLinecap="round" />

      {/* basket on the floor */}
      <path d="M262 402a26 26 0 0 1 60 0" fill="none" stroke="#b9c9c0" strokeWidth="7" />
      <circle cx="276" cy="404" r="12" fill="#d9573b" />
      <circle cx="296" cy="398" r="13" fill="#e8b33a" />
      <path d="M306 380l6-16 8 14" fill="#2b7d5c" />
      <ellipse cx="313" cy="404" rx="14" ry="10" fill="#c98a4b" />
      <path d="M250 408h86l-10 56h-66z" fill="#d9e5de" />
      <path d="M262 420h62M266 436h54M270 452h46" stroke="#b9c9c0" strokeWidth="3" />

      {/* customer in front, paying by phone */}
      <rect x="124" y="428" width="16" height="36" fill={SKIN_A} />
      <rect x="168" y="428" width="16" height="36" fill={SKIN_A} />
      <rect x="118" y="460" width="26" height="9" rx="4" fill="#2a1a12" />
      <rect x="164" y="460" width="30" height="9" rx="4" fill="#2a1a12" />
      <path d="M120 212h70l14 120 12 100H98l12-100z" fill="url(#lp-chit)" />
      <rect x="146" y="184" width="18" height="30" fill={SKIN_A} />
      <circle cx="156" cy="166" r="26" fill={SKIN_A} />
      <path d="M128 164c-8-40 52-58 62-14 2 8 0 12-4 14-6-20-40-24-58 0z" fill="url(#lp-wrap)" />
      <circle cx="178" cy="122" r="11" fill="url(#lp-wrap)" />
      <circle cx="170" cy="168" r="2.6" fill="#1a110b" />
      <path d="M168 179q7 5 13 0" fill="none" stroke="#1a110b" strokeWidth="2" strokeLinecap="round" />
      <path d="M126 222l-14 78" stroke={SKIN_A} strokeWidth="14" strokeLinecap="round" />
      <path d="M124 218l-6 30" stroke="#e09a4c" strokeWidth="20" strokeLinecap="round" />
      <path d="M186 224l46 26 26-36" fill="none" stroke={SKIN_A} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M188 222l20 12" stroke="#e09a4c" strokeWidth="21" strokeLinecap="round" />
      <g transform="rotate(18 262 196)">
        <rect x="248" y="172" width="28" height="48" rx="5" fill="#17251e" />
        <rect x="252" y="178" width="20" height="34" rx="2" fill="#f2c48d" />
        <text x="262" y="200" textAnchor="middle" fontSize="11" fontWeight="800" fill="#7a3f12" fontFamily="Trebuchet MS, sans-serif">K</text>
      </g>
    </svg>
  );
}
