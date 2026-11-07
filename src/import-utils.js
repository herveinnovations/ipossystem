// Reading a product list from Excel/CSV and checking it before import.

export const IMPORT_COLUMNS = [
  { key: 'name', header: 'Product name', required: true, example: 'White bread 700g', aliases: ['name', 'product', 'item', 'item name', 'description', 'product name'] },
  { key: 'selling_price', header: 'Selling price', required: true, example: 25, aliases: ['price', 'selling price', 'sell price', 'retail price', 'unit price', 'sp'] },
  { key: 'stock_quantity', header: 'Stock quantity', example: 40, aliases: ['stock', 'qty', 'quantity', 'stock quantity', 'on hand', 'opening stock'] },
  { key: 'unit_cost', header: 'Cost price', example: 18.5, aliases: ['cost', 'cost price', 'buying price', 'purchase price', 'unit cost', 'cp'] },
  { key: 'sku', header: 'SKU / code', example: 'BRD-700', aliases: ['sku', 'code', 'item code', 'product code', 'sku / code'] },
  { key: 'barcode', header: 'Barcode', example: '6001234567890', aliases: ['barcode', 'bar code', 'ean', 'upc'] },
  { key: 'low_stock_threshold', header: 'Low stock alert', example: 5, aliases: ['low stock', 'reorder level', 'low stock alert', 'minimum', 'min stock'] },
  { key: 'tax_rate', header: 'Tax rate %', example: 0, aliases: ['tax', 'vat', 'tax rate', 'tax rate %', 'vat %'] },
];
export const MAX_IMPORT = 2000;

const norm = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[*()]/g, '').trim();

/** Parses CSV text (commas, semicolons or tabs; quoted fields allowed) into rows of strings. */
export function parseCsv(text) {
  text = String(text || '').replace(/^﻿/, '');
  const first = text.split(/\r?\n/, 1)[0] || '';
  const sep = [',', ';', '\t'].map(s => [s, first.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

/** Matches the file's header row to our columns. Returns { map: {key: index}, unknown: [headers] }. */
export function matchHeaders(headers) {
  const map = {}, unknown = [];
  headers.forEach((h, i) => {
    const n = norm(h);
    const col = IMPORT_COLUMNS.find(c => !(c.key in map) && (norm(c.header) === n || c.aliases.includes(n)));
    if (col) map[col.key] = i; else if (n) unknown.push(String(h).trim());
  });
  return { map, unknown };
}

const number = v => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[Kk]\s?|ZMW|,|\s/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

// Short readable code from a name: "Mealie meal 10kg" → MEAL-10KG, "White bread" → WHIT-BRE.
const keep = (n, raw, empty) => n === null ? empty : Number.isNaN(n) ? String(raw).trim() : n;

const codeFrom = name => {
  const words = String(name).toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(' ').filter(Boolean);
  if (!words.length) return 'ITEM';
  const size = words.slice(1).find(w => /\d/.test(w));
  const second = size || (words[1] ? words[1].slice(0, 3) : '');
  return [words[0].slice(0, 4), second].filter(Boolean).join('-').slice(0, 14);
};

/**
 * Checks rows against each other and the shop's existing products.
 * Returns [{ line, values, status: 'ready'|'skip'|'error', messages: [] }].
 */
export function checkRows(rows, map, existing = []) {
  const takenSku = new Set(existing.map(p => String(p.sku || '').toLowerCase()).filter(Boolean));
  const takenBarcode = new Map(existing.filter(p => p.barcode).map(p => [String(p.barcode), p.name]));
  const takenName = new Map(existing.map(p => [norm(p.name), p.name]));
  const seenSku = new Set(), seenBarcode = new Set(), seenName = new Set();
  const out = [];
  rows.forEach((r, idx) => {
    const get = k => (k in map ? r[map[k]] : undefined);
    const messages = []; let status = 'ready';
    const name = String(get('name') ?? '').trim();
    const price = number(get('selling_price'));
    const stock = number(get('stock_quantity'));
    const cost = number(get('unit_cost'));
    const low = number(get('low_stock_threshold'));
    const tax = number(get('tax_rate'));
    let sku = String(get('sku') ?? '').trim();
    const barcode = String(get('barcode') ?? '').trim().replace(/\.0$/, '');
    if (!name) { messages.push('Product name is missing.'); status = 'error'; }
    if (price === null) { messages.push('Selling price is missing.'); status = 'error'; }
    else if (Number.isNaN(price) || price < 0) { messages.push('Selling price must be a number of zero or more.'); status = 'error'; }
    if (stock !== null && (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))) { messages.push('Stock must be a whole number of zero or more.'); status = 'error'; }
    if (cost !== null && (Number.isNaN(cost) || cost < 0)) { messages.push('Cost price must be a number of zero or more.'); status = 'error'; }
    if (low !== null && (Number.isNaN(low) || low < 0 || !Number.isInteger(low))) { messages.push('Low stock alert must be a whole number.'); status = 'error'; }
    if (tax !== null && (Number.isNaN(tax) || tax < 0 || tax > 100)) { messages.push('Tax rate must be between 0 and 100.'); status = 'error'; }
    if (status !== 'error') {
      if (takenName.has(norm(name))) { messages.push('Already in your products - skipped.'); status = 'skip'; }
      else if (seenName.has(norm(name))) { messages.push('Listed twice in this file - only the first is imported.'); status = 'skip'; }
      else if (barcode && takenBarcode.has(barcode)) { messages.push(`Barcode already used by ${takenBarcode.get(barcode)} - skipped.`); status = 'skip'; }
      else if (barcode && seenBarcode.has(barcode)) { messages.push('Barcode listed twice in this file - skipped.'); status = 'skip'; }
      else if (sku && (takenSku.has(sku.toLowerCase()) || seenSku.has(sku.toLowerCase()))) { messages.push(`Code ${sku} is already used - a new code was made.`); sku = ''; }
    }
    if (status === 'ready' && !sku) {
      const base = codeFrom(name); let n = 1; sku = base;
      while (takenSku.has(sku.toLowerCase()) || seenSku.has(sku.toLowerCase())) sku = `${base}-${++n}`;
    }
    if (status === 'ready') { seenName.add(norm(name)); seenSku.add(sku.toLowerCase()); if (barcode) seenBarcode.add(barcode); }
    out.push({
      line: idx + 2, status, messages,
      // rows with mistakes keep what was typed, so the preview and "rows to fix" file show it
      values: { name, sku, barcode, selling_price: keep(price, get('selling_price'), 0), stock_quantity: keep(stock, get('stock_quantity'), 0), unit_cost: keep(cost, get('unit_cost'), ''), low_stock_threshold: keep(low, get('low_stock_threshold'), 5), tax_rate: keep(tax, get('tax_rate'), 0) },
    });
  });
  return out;
}

/** Cell value from ExcelJS (handles formulas, rich text, hyperlinks, dates). */
export function excelCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'object') return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if ('result' in v) return excelCell(v.result);
  if (v.richText) return v.richText.map(t => t.text).join('');
  if ('text' in v) return v.text;
  return String(v);
}
