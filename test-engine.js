var E = require('./engine.js'), n = 0, bad = 0;
function near(a, b, tol, m) { n++; if (!(Math.abs(a - b) <= tol)) { bad++; console.log('FAIL', m, a, b); } }
function is(a, b, m) { n++; if (a !== b) { bad++; console.log('FAIL', m, a, b); } }
// exact definitions: 16 oz = 1 lb = 453.59237 g; 128 fl oz = 1 gal = 3785.411784 mL
near(E.UNITS.oz.f * 16, E.UNITS.lb.f, 1e-9, '16oz=lb'); near(E.UNITS.lb.f, 453.59237, 1e-9, 'lb');
near(E.UNITS.floz.f * 128, E.UNITS.gal.f, 1e-9, '128floz=gal'); near(E.UNITS.gal.f, 3785.411784, 1e-9, 'gal');
near(E.UNITS.qt.f * 4, E.UNITS.gal.f, 1e-9, 'qt'); near(E.UNITS.pt.f * 8, E.UNITS.gal.f, 1e-9, 'pt');
// same product in different units must tie: 1 lb at $4.54 == 16 oz at $4.54 == 453.59237 g
var a = E.deal({ price: 4.54, qty: 1, unit: 'lb' }), b = E.deal({ price: 4.54, qty: 16, unit: 'oz' }), c = E.deal({ price: 4.54, qty: 453.59237, unit: 'g' });
near(a.per, b.per, 1e-9, 'lb vs oz'); near(a.per, c.per, 1e-9, 'lb vs g'); near(a.per, 1.0009, 0.0002, '4.54/lb per 100g');
// $3.99 for 16 oz = $0.249375/oz; per 100 g = 3.99/453.59237*100
near(E.deal({ price: 3.99, qty: 16, unit: 'oz' }).per, 3.99 / 453.59237 * 100, 1e-9, '3.99 16oz');
// 1 gal at $3.79 vs 128 fl oz at $3.79 tie; 2 L vs 1/2 gal
near(E.deal({ price: 3.79, qty: 1, unit: 'gal' }).per, E.deal({ price: 3.79, qty: 128, unit: 'floz' }).per, 1e-9, 'gal=128floz');
near(E.deal({ price: 1, qty: 2, unit: 'l' }).per, 0.05, 1e-12, '2L $1 = 0.05/100mL');
// packs multiply size: 6 x 12 fl oz = 72 fl oz
near(E.deal({ price: 5.99, qty: 12, unit: 'floz', packs: 6 }).total, 72 * E.UNITS.floz.f, 1e-9, '6x12');
// coupon reduces paid, never below zero
near(E.deal({ price: 5, qty: 10, unit: 'oz', off: 1 }).paid, 4, 1e-12, 'coupon'); near(E.deal({ price: 5, qty: 10, unit: 'oz', off: 9 }).paid, 0, 1e-12, 'coupon floor');
// count items: 12 rolls at $9.60 = $0.80 each
near(E.deal({ price: 9.6, qty: 12, unit: 'ct' }).per, 0.8, 1e-12, 'each');
// invalid input
is(E.deal({ price: 0, qty: 1, unit: 'g' }), null, 'zero price'); is(E.deal({ price: 1, qty: 0, unit: 'g' }), null, 'zero qty'); is(E.deal({ price: 1, qty: 1, unit: 'zz' }), null, 'bad unit'); is(E.deal({ price: 1, qty: 1, unit: 'g', packs: 0 }), null, 'packs 0');
// compare: big box not always cheaper. 12 oz $2.99 vs 18 oz $4.99 -> small wins
var r = E.compare([{ name: 'Small', price: 2.99, qty: 12, unit: 'oz' }, { name: 'Big', price: 4.99, qty: 18, unit: 'oz' }]);
is(r.best.name, 'Small', 'small wins'); near(r.rows[1].more, ((4.99 / 18) / (2.99 / 12) - 1) * 100, 1e-9, 'more %'); is(r.label, 'per 100 g', 'label');
// mixed units compare correctly: 500 g $2.10 vs 1 lb $2.00 -> 500g is 0.42/100g, 1lb is 0.441
var m = E.compare([{ price: 2.1, qty: 500, unit: 'g' }, { price: 2.0, qty: 1, unit: 'lb' }]); is(m.best.i, 0, 'g wins'); near(m.rows[0].d.per, 0.42, 1e-9, 'g per');
// dimension mismatch and too few items
is(E.compare([{ price: 1, qty: 1, unit: 'kg' }, { price: 1, qty: 1, unit: 'l' }]).error.indexOf('Cannot compare'), 0, 'mixed dims');
is(E.compare([{ price: 1, qty: 1, unit: 'kg' }, {}]).error.indexOf('at least two'), 6, 'too few');
// tie
var t = E.compare([{ price: 4, qty: 1, unit: 'lb' }, { price: 4, qty: 16, unit: 'oz' }]); near(t.rows[1].more, 0, 1e-9, 'tie'); near(t.saving, 0, 1e-9, 'tie saving');
// savings vs runner-up
var s = E.compare([{ price: 3, qty: 100, unit: 'g' }, { price: 5, qty: 100, unit: 'g' }, { price: 4, qty: 100, unit: 'g' }]); near(s.saving, 1, 1e-9, 'saving'); near(s.savePct, 25, 1e-9, 'savePct');
console.log((n - bad) + '/' + n + ' passed'); process.exit(bad ? 1 : 0);
