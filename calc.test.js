// Futtatás: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const { TAX_RULES_2026: R, STATUS, calculate, taxablePortion } = require("./calc.js");

const near = (actual, expected, msg) =>
  assert.ok(Math.abs(actual - expected) < 0.01, `${msg}: ${actual} != ${expected}`);

const base = { revenue: 0, aboveTaxFree: false, costRatio: 0.45, status: STATUS.SIDE, requiresDegree: false, szjaExempt: false };
const run = (overrides) => calculate({ ...base, ...overrides });

test("2026-os paraméterek", () => {
  assert.equal(R.taxFreeIncome, 1936800);
  assert.equal(R.revenueLimit, 38736000);
  assert.equal(R.revenueLimitRetail, 193680000);
});

test("havi minimum közteher (főfoglalkozás)", () => {
  near(run({}).monthlyMinTotal, 101682, "minimálbér");
  near(run({}).monthlyMinTb, 59718, "minimálbér TB");
  near(run({}).monthlyMinSocho, 41964, "minimálbér szocho");
  near(run({ requiresDegree: true }).monthlyMinTotal, 117558, "garantált bérminimum");
});

test("még alatta: nincs SZJA, TB, szocho", () => {
  const r = run({ revenue: 500000 });
  near(r.income, 275000, "jövedelem");
  near(r.taxableIncome, 0, "adóköteles");
  near(r.totalTax, 0, "összes teher");
  near(r.netIncome, 500000, "nettó");
});

test("már felette: a teljes jövedelem adóköteles", () => {
  const r = run({ revenue: 500000, aboveTaxFree: true });
  near(r.taxableIncome, 275000, "adóköteles");
  near(r.szja, 41250, "SZJA");
  near(r.tb, 50875, "TB");
  near(r.szocho, 35750, "szocho");
  near(r.netIncome, 372125, "nettó");
});

test("még alatta, de a projekt egymaga nagyobb a sávnál: csak a felette lévő rész adóköteles", () => {
  const r = run({ revenue: 4000000 });
  near(r.taxableIncome, 263200, "adóköteles");
  near(r.taxFreePart, 1936800, "mentes rész");
  near(r.szja, 39480, "SZJA");
  near(r.tb, 48692, "TB");
  near(r.szocho, 34216, "szocho");
  near(r.totalTax, 122388, "összes teher");
});

test("nyugdíjas: csak SZJA", () => {
  const r = run({ revenue: 500000, aboveTaxFree: true, status: STATUS.PENSIONER });
  near(r.tb + r.szocho, 0, "TB + szocho");
  near(r.totalTax, 41250, "összes teher");
});

test("SZJA-mentes kedvezmény: TB és szocho marad", () => {
  const r = run({ revenue: 500000, aboveTaxFree: true, status: STATUS.MAIN, szjaExempt: true });
  near(r.szja, 0, "SZJA");
  near(r.totalTax, 86625, "összes teher");
});

test("80% és 90% költséghányad", () => {
  near(run({ revenue: 10000000, costRatio: 0.8 }).taxableIncome, 63200, "80%");
  near(run({ revenue: 20000000, costRatio: 0.9 }).taxableIncome, 63200, "90%");
  near(run({ revenue: 1000000, costRatio: 0.8, aboveTaxFree: true }).szja, 30000, "80% felette");
});

test("bevételi határ (a projekt egymaga)", () => {
  assert.equal(run({ revenue: 38736001 }).overRevenueLimit, true);
  assert.equal(run({ revenue: 38736000 }).overRevenueLimit, false);
  assert.equal(run({ revenue: 38736001, costRatio: 0.9 }).overRevenueLimit, false);
});

test("a mentes sáv bevételben", () => {
  near(run({ costRatio: 0.45 }).taxFreeRevenueLimit, 1936800 / 0.55, "45%");
  near(run({ costRatio: 0.8 }).taxFreeRevenueLimit, 9684000, "80%");
  near(run({ costRatio: 0.9 }).taxFreeRevenueLimit, 19368000, "90%");
});

test("a sáv két szélén pontos nulla (a felület === 0 vizsgálatához)", () => {
  assert.equal(run({ revenue: 500000 }).taxableIncome, 0);
  assert.equal(run({ revenue: 333333, aboveTaxFree: true }).taxFreePart, 0);
  assert.equal(run({ revenue: 1936800 / 0.55 }).taxableIncome, 0);
});

test("érvénytelen bemenet nullának számít", () => {
  assert.equal(run({ revenue: "-5" }).revenue, 0);
  assert.equal(run({ revenue: "abc" }).revenue, 0);
  assert.equal(run({ revenue: "" }).totalTax, 0);
});

test("a sávlogika felbontható: két részlet = egy projekt", () => {
  for (let i = 0; i < 5000; i++) {
    const used = Math.random() * 3000000;
    const a = Math.random() * 3000000;
    const b = Math.random() * 3000000;
    near(
      taxablePortion(used, a, R.taxFreeIncome) + taxablePortion(used + a, b, R.taxFreeIncome),
      taxablePortion(used, a + b, R.taxFreeIncome),
      "felbontás"
    );
  }
});

test("általános szabályok véletlen bemenetekre", () => {
  const statuses = Object.values(STATUS);
  for (let i = 0; i < 5000; i++) {
    const r = run({
      revenue: Math.round(Math.random() * 50000000),
      aboveTaxFree: i % 2 === 0,
      costRatio: [0.45, 0.8, 0.9][i % 3],
      status: statuses[i % 3],
      szjaExempt: i % 7 === 0,
    });
    assert.ok(r.totalTax >= 0);
    near(r.netIncome + r.totalTax, r.revenue, "nettó + teher");
    assert.ok(r.taxableIncome >= 0 && r.taxableIncome <= r.income);
    near(r.taxFreePart + r.taxableIncome, r.income, "mentes + adóköteles");
    assert.ok(r.totalTax <= r.income * (R.szja + R.tb + R.szocho) + 1e-6);
  }
});
