import React, { useRef, useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { IMPORT_COLUMNS, MAX_IMPORT, parseCsv, matchHeaders, checkRows, excelCell } from './import-utils';
import { toast } from './Toast';

async function downloadTemplate() {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Products');
  ws.columns = IMPORT_COLUMNS.map(c => ({ header: c.header + (c.required ? ' *' : ''), key: c.key, width: Math.max(16, c.header.length + 6) }));
  ws.addRow(Object.fromEntries(IMPORT_COLUMNS.map(c => [c.key, c.example])));
  ws.addRow({ name: 'Cooking oil 2L', selling_price: 95, stock_quantity: 12, unit_cost: 78, low_stock_threshold: 4 });
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF24694F' } };
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  const help = wb.addWorksheet('How to fill this in');
  help.columns = [{ width: 22 }, { width: 80 }];
  [['Column', 'What to enter'], ...IMPORT_COLUMNS.map(c => [c.header + (c.required ? ' *' : ''), {
    name: 'Required. The name cashiers will search for.', selling_price: 'Required. Price per item in Kwacha, e.g. 25 or 25.50.',
    stock_quantity: 'How many you have now (whole number). Leave empty for 0.', unit_cost: 'What you paid per item. Used for profit reports. Optional.',
    sku: 'Your own item code. Leave empty and iPOS makes one.', barcode: 'The number under the barcode. Optional.',
    low_stock_threshold: 'Warn me when stock falls to this number. Leave empty for 5.', tax_rate: 'VAT % if the item is taxed, e.g. 16. Leave empty for 0.',
  }[c.key]]), [], ['Tips', 'Delete the two example rows. Keep the first row (the headings). You can upload .xlsx or .csv.']].forEach(r => help.addRow(r));
  help.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'iPOS product import template.xlsx' });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function readFile(file) {
  if (/\.csv$|\.txt$/i.test(file.name) || file.type === 'text/csv') return parseCsv(await file.text());
  if (!/\.xlsx$/i.test(file.name)) throw Error('Please choose an Excel (.xlsx) or CSV (.csv) file. Old .xls files: open them in Excel and “Save as” .xlsx first.');
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.worksheets.find(w => w.actualRowCount > 0);
  if (!ws) return [];
  const rows = [];
  ws.eachRow({ includeEmpty: false }, row => { const vals = []; for (let i = 1; i <= ws.actualColumnCount; i++) vals.push(excelCell(row.getCell(i).value)); rows.push(vals); });
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

const ICON = { ready: [CheckCircle2, 'green', 'Ready'], skip: [MinusCircle, 'amber', 'Skipped'], error: [AlertCircle, 'red', 'Fix this'] };

/** "Import from Excel" for the Products page. save(product) creates one product and resolves when done. */
export default function ProductImport({ existing, save, onClose, onDone }) {
  const input = useRef(null);
  const [file, setFile] = useState(null), [rows, setRows] = useState(null), [unknown, setUnknown] = useState([]), [error, setError] = useState('');
  const [show, setShow] = useState('all'), [progress, setProgress] = useState(null), [result, setResult] = useState(null);
  const counts = rows ? { done: rows.filter(r => r.status === 'done').length, ready: rows.filter(r => r.status === 'ready').length, skip: rows.filter(r => r.status === 'skip').length, error: rows.filter(r => r.status === 'error').length } : null;
  const running = progress && !result;

  async function choose(f) {
    if (!f) return;
    setError(''); setRows(null); setResult(null); setFile(f);
    try {
      const all = await readFile(f);
      if (all.length < 2) throw Error('The file is empty. Put headings in the first row and one product per row below.');
      const { map, unknown } = matchHeaders(all[0]);
      if (!('name' in map) || !('selling_price' in map)) throw Error('We couldn’t find the “Product name” and “Selling price” columns. Download the template to see the headings to use.');
      const body = all.slice(1);
      if (body.length > MAX_IMPORT) throw Error(`That’s ${body.length} products. Please import up to ${MAX_IMPORT} at a time - split the file into smaller ones.`);
      setUnknown(unknown); setRows(checkRows(body, map, existing));
    } catch (e) { setError(e.message || 'We couldn’t read that file.'); }
  }

  async function run() {
    const ready = rows.filter(r => r.status === 'ready');
    const failed = []; let done = 0;
    setProgress({ done: 0, total: ready.length });
    for (const r of ready) {
      try { await save(r.values); } catch (e) { failed.push({ ...r, status: 'error', messages: [e.message || 'Could not be saved.'] }); }
      done++; setProgress({ done, total: ready.length });
    }
    setResult({ added: ready.length - failed.length, failed });
    setRows(rs => rs.map(r => failed.find(f => f.line === r.line) || (r.status === 'ready' ? { ...r, status: 'done' } : r)));
    if (ready.length - failed.length) { toast(`${ready.length - failed.length} products added.`); onDone(); }
  }

  function downloadProblems() {
    const bad = rows.filter(r => r.status === 'error' || r.status === 'skip');
    const esc = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
    const csv = [['Row', 'Problem', ...IMPORT_COLUMNS.map(c => c.header)], ...bad.map(r => [r.line, r.messages.join(' '), ...IMPORT_COLUMNS.map(c => r.values[c.key] ?? '')])].map(r => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'products to check.csv' }).click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  const list = rows ? rows.filter(r => show === 'all' || r.status === show).slice(0, 300) : [];
  return (
    <div className="modal-backdrop">
      <div className="modal import-modal" role="dialog" aria-label="Import products">
        <div className="modal-head"><h2>Import products from Excel</h2><button aria-label="Close" disabled={running} onClick={onClose}><X /></button></div>
        {!rows && <>
          <ol className="import-steps">
            <li><b>Download the template</b> (or use your own list - we’ll match columns like “Item”, “Price” and “Qty”).</li>
            <li><b>Fill in one product per row.</b> Only the name and selling price are required.</li>
            <li><b>Upload it here</b>, check the preview, then import.</li>
          </ol>
          <button type="button" className="secondary" onClick={() => downloadTemplate().catch(() => toast('Could not make the template.', 'error'))}><Download size={16} /> Download template</button>
          <div className={'drop-zone' + (error ? ' bad' : '')} onClick={() => input.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); choose(e.dataTransfer.files[0]); }} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}>
            <FileSpreadsheet size={34} />
            <strong>{file ? file.name : 'Choose your Excel or CSV file'}</strong>
            <span>or drag it here · .xlsx or .csv · up to {MAX_IMPORT} products</span>
            <input ref={input} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={e => choose(e.target.files[0])} />
          </div>
          {error && <div className="notice" role="alert">{error}</div>}
        </>}

        {rows && <>
          <div className="import-summary">
            <button className={show === 'all' ? 'active' : ''} onClick={() => setShow('all')}><strong>{rows.length}</strong> rows in {file?.name}</button>
            {result ? <button className={'good' + (show === 'done' ? ' active' : '')} onClick={() => setShow('done')}><strong>{counts.done}</strong> added</button> : <button className={'good' + (show === 'ready' ? ' active' : '')} onClick={() => setShow('ready')}><strong>{counts.ready}</strong> ready to add</button>}
            <button className={'warn' + (show === 'skip' ? ' active' : '')} onClick={() => setShow('skip')}><strong>{counts.skip}</strong> skipped</button>
            <button className={'bad' + (show === 'error' ? ' active' : '')} onClick={() => setShow('error')}><strong>{counts.error}</strong> need fixing</button>
          </div>
          {unknown.length > 0 && <p className="muted small">Ignored columns: {unknown.join(', ')}</p>}
          <div className="table-scroll import-table"><table><thead><tr><th>Row</th><th>Status</th><th>Product</th><th className="num">Price</th><th className="num">Stock</th><th className="num">Cost</th><th>Code</th><th>Barcode</th></tr></thead>
            <tbody>{list.map(r => { const [Icon, tone, label] = ICON[r.status] || [CheckCircle2, 'green', 'Added']; return (
              <tr key={r.line} className={'imp-' + r.status}><td>{r.line}</td><td><span className={'badge ' + tone}><Icon size={12} /> {label}</span>{r.messages.map(msg => <small key={msg}>{msg}</small>)}</td>
                <td><strong>{r.values.name || '-'}</strong></td><td className="num">{r.values.selling_price}</td><td className="num">{r.values.stock_quantity}</td><td className="num">{r.values.unit_cost === '' ? '-' : r.values.unit_cost}</td><td>{r.values.sku}</td><td>{r.values.barcode || '-'}</td></tr>); })}</tbody></table>
            {list.length === 300 && <p className="muted small pad">Showing the first 300 rows.</p>}
          </div>
          {progress && <div className="import-progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}><i style={{ width: `${progress.total ? progress.done / progress.total * 100 : 100}%` }} /><span>{result ? `Done - ${result.added} added${result.failed.length ? `, ${result.failed.length} failed` : ''}.` : `Adding ${progress.done} of ${progress.total}…`}</span></div>}
          <div className="modal-actions">
            {(counts.error > 0 || counts.skip > 0) && <button type="button" className="secondary" disabled={running} onClick={downloadProblems}><Download size={15} /> Download rows to fix</button>}
            {!result && <button type="button" className="secondary" disabled={running} onClick={() => { setRows(null); setFile(null); setProgress(null); }}><Upload size={15} /> Choose another file</button>}
            {result ? <button className="primary" onClick={onClose}>Finish</button>
              : <button className="primary" disabled={running || !counts.ready} onClick={run}>{running ? 'Adding products…' : `Add ${counts.ready} product${counts.ready === 1 ? '' : 's'}`}</button>}
          </div>
        </>}
      </div>
    </div>
  );
}
