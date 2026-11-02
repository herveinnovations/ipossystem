import React from 'react';

// Placeholder shapes shown while a page loads. Each kind mirrors the real page's layout,
// so nothing jumps when the data arrives. Built only from the shared shimmer pieces
// (lines <i>, numbers <b>, panels .skeleton-card), so light and dark mode both work.
//
// kind: dashboard | pos | cards | table | rows | stats | report | statement | assistant |
//       reorder | branches | detail | checklist | form | list
const widths = ['62%', '48%', '71%', '55%', '66%', '44%', '58%', '69%'];
const L = ({ w = '100%', h, r, mt, mb, style }) => <i style={{ width: w, height: h, borderRadius: r, marginTop: mt, marginBottom: mb, ...style }} />;
const range = n => Array.from({ length: n }, (_, i) => i);

function StatCards({ n = 4 }) {
  return (
    <div className="skeleton-stats" style={{ gridTemplateColumns: `repeat(${n},1fr)` }}>
      {range(n).map(i => <div key={i} className="skeleton-card"><L w="45%" /><b /><L w={['70%', '55%', '62%', '48%'][i % 4]} /></div>)}
    </div>
  );
}
function Toolbar({ button = true }) {
  return <div className="sk-toolbar"><L w="min(320px,60%)" h={40} r={8} />{button && <L w={96} h={40} r={8} />}</div>;
}
function Rows({ rows = 6, cols = 5 }) {
  return <>
    <div className="skeleton-row head">{range(cols).map(i => <i key={i} style={{ width: [18, 24, 14, 12, 10][i % 5] + '%' }} />)}</div>
    {range(rows).map(r => (
      <div key={r} className="skeleton-row">
        <span className="skeleton-dot" />
        {range(cols - 1).map(c => <i key={c} style={{ width: [16 + (r * 7) % 10, 20 + (r * 5) % 10, 11, 9 + (r * 3) % 6][c % 4] + '%' }} />)}
      </div>
    ))}
  </>;
}
function Table({ rows, toolbar = true }) {
  return <div className="skeleton-table">{toolbar && <Toolbar />}<Rows rows={rows} /></div>;
}
function Tabs({ n = 4 }) {
  return <div className="sk-tabs">{range(n).map(i => <L key={i} w={[84, 96, 72, 90, 80, 100][i % 6]} h={30} r={20} />)}</div>;
}
function Tile({ i = 0 }) {
  return (
    <div className="skeleton-tile">
      <span className="skeleton-img" />
      <L w={widths[i % 8]} h={12} />
      <L w="30%" h={9} />
      <div className="sk-between"><L w="38%" h={14} /><L w={24} h={24} r={6} /></div>
    </div>
  );
}
function StatementLines({ n = 9 }) {
  return range(n).map(i => (
    <div key={i} className={'sk-line' + (i === 0 || i === 5 ? ' sk-line-head' : '')}>
      <L w={i === 0 || i === 5 ? '22%' : ['34%', '28%', '40%', '30%', '36%'][i % 5]} h={i === 0 || i === 5 ? 9 : 11} style={i === 0 || i === 5 ? null : { marginLeft: 14 }} />
      {!(i === 0 || i === 5) && <span className="sk-nums"><L w={84} /><L w={84} /><L w={36} /></span>}
    </div>
  ));
}

function Body({ kind, rows, stats, tabs, toolbar }) {
  switch (kind) {
    case 'dashboard': return <>
      <StatCards n={4} />
      <div className="sk-dash">
        <div className="skeleton-card">
          <L w="18%" h={9} /><b style={{ width: '38%' }} /><L w="52%" h={10} />
          <div className="sk-bars">{[58, 70, 52, 78, 64, 56, 92].map((h, i) => <i key={i} style={{ height: h + '%' }} />)}</div>
        </div>
        <div className="skeleton-card sk-stack">
          <div className="sk-between"><L w="40%" h={14} /><L w="24%" h={10} /></div>
          {range(5).map(i => <div key={i} className="sk-item"><div className="sk-between"><L w={widths[i]} h={12} /><L w={44} h={18} r={10} /></div><L w="100%" h={5} r={3} /><L w="72%" h={9} /></div>)}
        </div>
      </div>
    </>;
    case 'pos': return (
      <div className="sk-pos">
        <div>
          <L w="100%" h={46} r={10} mb={18} />
          <div className="sk-between" style={{ marginBottom: 14 }}><L w="22%" h={16} /><L w="12%" h={10} /></div>
          <div className="skeleton-grid sk-tiles">{range(rows || 6).map(i => <Tile key={i} i={i} />)}</div>
        </div>
        <div className="skeleton-card sk-stack">
          <div className="sk-between"><L w="42%" h={16} /><L w="14%" h={10} /></div>
          {range(3).map(i => <div key={i} className="sk-between sk-cartline"><span style={{ width: '60%' }}><L w="80%" h={12} /><L w="45%" h={9} mt={7} /></span><L w="22%" h={13} /></div>)}
          <L w="100%" h={40} r={8} />
          {range(3).map(i => <div key={i} className="sk-between"><L w="28%" h={10} /><L w="20%" h={10} /></div>)}
          <div className="sk-between"><L w="24%" h={18} /><L w="34%" h={20} /></div>
          <L w="100%" h={44} r={8} />
          <L w="100%" h={48} r={9} />
        </div>
      </div>
    );
    case 'cards': return <div className="skeleton-grid">{range(rows || 6).map(i => <Tile key={i} i={i} />)}</div>;
    case 'rows': return <div className="sk-rows"><Rows rows={rows || 6} /></div>;
    case 'stats': return <>
      <StatCards n={stats || 4} />
      {tabs > 0 && <Tabs n={tabs} />}
      <Table rows={rows || 6} toolbar={toolbar} />
    </>;
    case 'report': return <>
      <StatCards n={4} />
      <div className="sk-underline-tabs">{range(7).map(i => <L key={i} w={[96, 120, 84, 104, 92, 90, 128][i]} h={11} />)}</div>
      <div className="sk-chips"><Tabs n={5} /></div>
      <div className="skeleton-card sk-stack">
        <div className="sk-between"><L w="26%" h={16} /><L w="18%" h={18} r={10} /></div>
        <StatementLines />
      </div>
    </>;
    case 'statement': return <div className="skeleton-card sk-stack"><StatementLines n={rows || 9} /></div>;
    case 'assistant': return <>
      <div className="skeleton-card sk-stack">
        <div className="sk-row-gap"><span className="skeleton-dot" style={{ width: 22, height: 22 }} /><L w="24%" h={14} /></div>
        {['78%', '64%', '52%', '46%', '58%'].map((w, i) => <L key={i} w={w} h={12} style={{ marginLeft: 34 }} />)}
      </div>
      <div className="sk-row-gap" style={{ margin: '16px 0 12px' }}><L w="100%" h={44} r={8} /><L w={74} h={44} r={8} /></div>
      <div className="sk-pills">{range(8).map(i => <L key={i} w={[120, 104, 150, 110, 136, 118, 140, 126][i]} h={28} r={16} />)}</div>
    </>;
    case 'reorder': return <>
      <div className="skeleton-card sk-stack" style={{ marginBottom: 18 }}>
        <div className="sk-between"><L w="22%" h={14} /><L w="26%" h={9} /></div>
        <div className="sk-runout">{range(6).map(i => <div key={i} className="sk-item"><div className="sk-between"><L w="70%" h={11} /><L w={44} h={18} r={10} /></div><L w="55%" h={11} /><L w="100%" h={5} r={3} /><L w="80%" h={8} /></div>)}</div>
      </div>
      <StatCards n={3} />
      <Table rows={rows || 4} toolbar={false} />
    </>;
    case 'branches': return (
      <div className="sk-branches">{range(rows || 3).map(i => (
        <div key={i} className="skeleton-card sk-stack">
          <div className="sk-between"><L w="46%" h={16} /><L w={64} h={20} r={10} /></div>
          <L w="34%" h={10} />
          <div className="sk-metrics">{range(3).map(j => <span key={j}><L w="70%" h={9} /><b style={{ width: '60%', height: 20, margin: '8px 0 0' }} /></span>)}</div>
          <div className="sk-row-gap"><L w={110} h={34} r={8} /><L w={110} h={34} r={8} /></div>
        </div>
      ))}</div>
    );
    case 'detail': return <>
      <div className="sk-row-gap" style={{ marginBottom: 20 }}><span className="skeleton-dot" style={{ width: 48, height: 48 }} /><span style={{ flex: 1 }}><L w="40%" h={16} /><L w="26%" h={10} mt={8} /></span></div>
      <div className="skeleton-card sk-stack" style={{ marginBottom: 16 }}>{range(4).map(i => <div key={i} className="sk-between"><L w={['28%', '22%', '32%', '26%'][i]} h={10} /><L w={['18%', '24%', '14%', '20%'][i]} h={12} /></div>)}</div>
      <Table rows={rows || 3} toolbar={false} />
    </>;
    case 'checklist': return (
      <div className="skeleton-card sk-stack">
        <div className="sk-between"><L w="36%" h={18} /><L w={30} h={26} r={6} /></div>
        <L w="30%" h={10} />
        <L w="100%" h={8} r={4} />
        {range(rows || 6).map(i => <div key={i} className="sk-row-gap sk-check"><span className="skeleton-dot" style={{ width: 26, height: 26 }} /><L w={widths[i % 8]} h={13} /></div>)}
      </div>
    );
    case 'form': return (
      <div className="sk-stack">
        <L w="62%" h={22} /><L w="86%" h={11} />
        {range(rows || 1).map(i => <span key={i}><L w="34%" h={10} mb={8} /><L w="100%" h={42} r={8} /></span>)}
        <L w="100%" h={44} r={8} />
      </div>
    );
    case 'list': return <div className="skeleton-list">{range(rows).map(i => <L key={i} w={widths[i % 8]} />)}</div>;
    default: return <Table rows={rows} toolbar={toolbar} />;
  }
}

export function Skeleton({ label = 'Loading…', kind = 'table', rows = 6, stats, tabs = 0, toolbar = true }) {
  return (
    <div className={'skeleton sk-' + kind} role="status" aria-live="polite" aria-busy="true">
      <Body kind={kind} rows={rows} stats={stats} tabs={tabs} toolbar={toolbar} />
      {label && <p className="skeleton-label">{label}</p>}
    </div>
  );
}

/** Four-dot spinning loader (design from Uiverse.io by AbanoubMagdy1), in iPOS colours. */
export function DotsLoader({ size, tone }) {
  return (
    <span className={'dots-loader' + (tone === 'current' ? ' dots-current' : '')} style={size ? { '--dim': typeof size === 'number' ? size + 'px' : size } : undefined} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

/** Full-screen loading screen used while signing in, signing up and opening the store. */
export function AuthLoader({ label = 'Loading…' }) {
  return (
    <div className="auth-loader" role="status" aria-live="polite" aria-busy="true">
      <DotsLoader />
      <p>{label}</p>
    </div>
  );
}
