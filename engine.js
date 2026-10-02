(function (root) {
  'use strict';
  // Exact definitions: 1 lb = 0.45359237 kg (1959 international yard and pound agreement, NIST Handbook 44 App. C),
  // 1 oz = 1/16 lb, 1 US gal = 3.785411784 L, 1 US fl oz = 1/128 gal.
  var UNITS = {
    g: { dim: 'mass', f: 1 }, kg: { dim: 'mass', f: 1000 }, oz: { dim: 'mass', f: 453.59237 / 16 }, lb: { dim: 'mass', f: 453.59237 },
    ml: { dim: 'vol', f: 1 }, l: { dim: 'vol', f: 1000 }, floz: { dim: 'vol', f: 3785.411784 / 128 }, pt: { dim: 'vol', f: 3785.411784 / 8 }, qt: { dim: 'vol', f: 3785.411784 / 4 }, gal: { dim: 'vol', f: 3785.411784 },
    ct: { dim: 'count', f: 1 }
  };
  var BASE = { mass: { size: 100, label: 'per 100 g' }, vol: { size: 100, label: 'per 100 mL' }, count: { size: 1, label: 'each' } };
  function deal(p) {
    var u = UNITS[p.unit], price = +p.price, qty = +p.qty, packs = p.packs === undefined || p.packs === '' ? 1 : +p.packs, off = +(p.off || 0);
    if (!u || !(price > 0) || !(qty > 0) || !(packs >= 1)) return null;
    var paid = Math.max(0, price - (off > 0 ? off : 0));
    var total = qty * packs * u.f;
    return { dim: u.dim, paid: paid, total: total, per: paid / total * BASE[u.dim].size };
  }
  function compare(list) {
    var rows = list.map(function (p, i) { var d = deal(p); return d ? { i: i, name: p.name || ('Item ' + (i + 1)), d: d } : null; }).filter(Boolean);
    if (rows.length < 2) return { error: 'Enter at least two items with price and size.' };
    var dim = rows[0].d.dim;
    var mixed = rows.some(function (r) { return r.d.dim !== dim; });
    if (mixed) return { error: 'Cannot compare weight, volume and count directly. Use the same kind of unit.' };
    rows.sort(function (a, b) { return a.d.per - b.d.per; });
    var best = rows[0].d.per;
    rows.forEach(function (r) { r.more = best > 0 ? (r.d.per / best - 1) * 100 : 0; });
    var second = rows[1].d.per;
    return { dim: dim, label: BASE[dim].label, rows: rows, best: rows[0], saving: second - best, savePct: second > 0 ? (1 - best / second) * 100 : 0 };
  }
  var api = { UNITS: UNITS, deal: deal, compare: compare, BASE: BASE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.UnitPick = api;
})(typeof window !== 'undefined' ? window : this);
