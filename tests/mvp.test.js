import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planPrice, planSummary, daysUntil, planError } from '../src/plan-utils.js';
import { passwordProblems, passwordScore } from '../src/password-utils.js';
import { parseCsv, matchHeaders, checkRows, excelCell } from '../src/import-utils.js';

const price = { monthly: 250, extraBranch: 100, yearlyMonths: 10 };
const now = Date.parse('2026-11-01T10:00:00Z');
const inDays = d => new Date(now + d * 86400000).toISOString();

test('plan prices: branches and the yearly discount', () => {
  assert.equal(planPrice(price, 1, 1), 250);
  assert.equal(planPrice(price, 3, 1), 450);
  assert.equal(planPrice(price, 1, 6), 1500);
  assert.equal(planPrice(price, 1, 12), 2500);
  assert.equal(planPrice(price, 2, 12), 3500);
  assert.equal(planPrice(price, 0, 1), 250);
});

test('days until', () => {
  assert.equal(daysUntil(inDays(5), now), 5);
  assert.equal(daysUntil(inDays(-2), now), -2);
  assert.equal(daysUntil(null, now), null);
});

test('plan wording for owners and cashiers', () => {
  const trial = planSummary({ state: 'trial', ends_at: inDays(23) }, { now });
  assert.equal(trial.title, 'Free trial · 23 days left'); assert.equal(trial.banner, false);
  const soon = planSummary({ state: 'trial', ends_at: inDays(1) }, { now });
  assert.equal(soon.title, 'Free trial · 1 day left'); assert.equal(soon.banner, true); assert.equal(soon.tone, 'warn');
  const ended = planSummary({ state: 'ended', ends_at: inDays(-9) }, { now, director: false });
  assert.equal(ended.title, 'Selling is paused'); assert.match(ended.text, /Ask the shop owner/); assert.match(ended.text, /safe/);
  const grace = planSummary({ state: 'grace', ends_at: inDays(-1), grace_ends_at: inDays(2) }, { now });
  assert.match(grace.text, /keep selling until/);
  assert.equal(planSummary({ state: 'paid', ends_at: inDays(40) }, { now }).banner, false);
  assert.equal(planSummary(null), null);
  assert.match(planError('IPOS_PLAN_ENDED: blah'), /plan has ended/);
  assert.equal(planError('other'), null);
});

test('password rules', () => {
  assert.deepEqual(passwordProblems('Shop-Kabwata-2026', { email: 'mary@shop.zm' }), []);
  assert.ok(passwordProblems('short1').some(p => /10 characters/.test(p)));
  assert.ok(passwordProblems('onlyletterslong').some(p => /letters and numbers/.test(p)));
  assert.ok(passwordProblems('mwilabanda2026', { email: 'mwilabanda@gmail.com' }).some(p => /name or email/.test(p)));
  assert.ok(passwordProblems('password12345').some(p => /easy to guess/.test(p)));
  assert.ok(passwordScore('short') <= 1);
  assert.ok(passwordScore('Shop-Kabwata-2026') >= 3);
});

test('CSV parsing: separators, quotes, blank lines, BOM', () => {
  assert.deepEqual(parseCsv('﻿Name,Price\n"Bread, white",25\n\nMilk,18\r\n'), [['Name', 'Price'], ['Bread, white', '25'], ['Milk', '18']]);
  assert.deepEqual(parseCsv('Name;Price\nSugar;55'), [['Name', 'Price'], ['Sugar', '55']]);
  assert.deepEqual(parseCsv('a\tb\n"say ""hi"""\t2'), [['a', 'b'], ['say "hi"', '2']]);
});

test('header matching understands common names', () => {
  const { map, unknown } = matchHeaders(['Item Name', 'Selling Price', 'Qty', 'Buying price', 'Barcode', 'Colour']);
  assert.deepEqual(map, { name: 0, selling_price: 1, stock_quantity: 2, unit_cost: 3, barcode: 4 });
  assert.deepEqual(unknown, ['Colour']);
});

test('row checks: errors, skips, duplicates and generated codes', () => {
  const map = { name: 0, selling_price: 1, stock_quantity: 2, sku: 3, barcode: 4 };
  const existing = [{ name: 'Sugar 2kg', sku: 'SUG-2KG', barcode: '600111' }];
  const rows = checkRows([
    ['White bread', 'K25.00', '40', '', ''],
    ['', '10', '1', '', ''],
    ['Milk', 'abc', '1', '', ''],
    ['Sugar 2kg', '55', '3', '', ''],
    ['White Bread', '25', '1', '', ''],
    ['Eggs', '90', '2.5', '', ''],
    ['Rice', '150', '1', 'SUG-2KG', ''],
    ['Oil', '95', '', '', '600111'],
    ['Soap', '1,200', '', '', 6009876543210],
  ], map, existing);
  assert.deepEqual(rows.map(r => r.status), ['ready', 'error', 'error', 'skip', 'skip', 'error', 'ready', 'skip', 'ready']);
  assert.equal(rows[0].values.selling_price, 25);
  assert.equal(rows[0].values.sku, 'WHIT-BRE');
  assert.equal(rows[0].line, 2);
  assert.notEqual(rows[6].values.sku, 'SUG-2KG');
  assert.match(rows[6].messages[0], /new code/);
  assert.equal(rows[8].values.selling_price, 1200);
  assert.equal(rows[2].values.selling_price, 'abc');
  assert.equal(rows[8].values.stock_quantity, 0);
  assert.equal(rows[8].values.barcode, '6009876543210');
});

test('generated codes are short and readable', () => {
  const r = checkRows([['Mealie meal 10kg', '105'], ['Kapenta 1kg', '160'], ['Bread (brown)', '26'], ['Sugar', '55'], ['Sugar 2kg', '60']], { name: 0, selling_price: 1 }, []);
  assert.deepEqual(r.map(x => x.values.sku), ['MEAL-10KG', 'KAPE-1KG', 'BREA-BRO', 'SUGA', 'SUGA-2KG']);
});

test('excel cell values', () => {
  assert.equal(excelCell({ result: 12 }), 12);
  assert.equal(excelCell({ richText: [{ text: 'Bre' }, { text: 'ad' }] }), 'Bread');
  assert.equal(excelCell(null), '');
  assert.equal(excelCell(new Date('2026-01-02T00:00:00Z')), '2026-01-02');
});
