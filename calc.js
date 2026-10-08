// Átalányadó számítási logika (2026). Böngészőben window.AtalanyCalc, Node-ban module.exports.
(function (root) {
  const MIN_WAGE_MONTHLY = 322800;

  const TAX_RULES_2026 = {
    szja: 0.15,
    tb: 0.185,
    szocho: 0.13,
    minWageMonthly: MIN_WAGE_MONTHLY,
    guaranteedMinMonthly: 373200,
    // Az éves minimálbér fele
    taxFreeIncome: (MIN_WAGE_MONTHLY * 12) / 2,
    // Bevételi határ: éves minimálbér 10×, kizárólag kiskereskedelemnél 50×
    revenueLimit: MIN_WAGE_MONTHLY * 12 * 10,
    revenueLimitRetail: MIN_WAGE_MONTHLY * 12 * 50,
  };

  const STATUS = { MAIN: "main", SIDE: "side", PENSIONER: "pensioner" };

  function toAmount(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  // A projekt jövedelméből a mentes sáv feletti rész
  function taxablePortion(usedTaxFreeIncome, projectIncome, taxFreeIncome) {
    // A sávból még szabad rész; így a teljesen mentes és a teljesen adóköteles eset pontosan 0-t ad
    const freeRoom = Math.max(0, taxFreeIncome - usedTaxFreeIncome);
    return projectIncome - Math.min(projectIncome, freeRoom);
  }

  function revenueLimitFor(costRatio, r = TAX_RULES_2026) {
    return costRatio === 0.9 ? r.revenueLimitRetail : r.revenueLimit;
  }

  function calculate(input, r = TAX_RULES_2026) {
    const revenue = toAmount(input.revenue);
    const costRatio = input.costRatio;
    const status = input.status;
    const incomeRatio = 1 - costRatio;

    const income = revenue * incomeRatio;
    // "Még alatta vagyok": a teljes sáv szabad; "Már felette vagyok": a sáv elfogyott
    const usedTaxFreeIncome = input.aboveTaxFree ? r.taxFreeIncome : 0;
    const taxableIncome = taxablePortion(usedTaxFreeIncome, income, r.taxFreeIncome);
    const taxFreePart = income - taxableIncome;

    const szja = input.szjaExempt ? 0 : taxableIncome * r.szja;
    const paysContributions = status !== STATUS.PENSIONER;
    const tb = paysContributions ? taxableIncome * r.tb : 0;
    const szocho = paysContributions ? taxableIncome * r.szocho : 0;
    const totalTax = szja + tb + szocho;

    const minBase = input.requiresDegree ? r.guaranteedMinMonthly : r.minWageMonthly;
    const monthlyMinTb = minBase * r.tb;
    const monthlyMinSocho = minBase * r.szocho;

    const revenueLimit = revenueLimitFor(costRatio, r);

    return {
      revenue,
      costDeduction: revenue * costRatio,
      income,
      taxableIncome,
      taxFreePart,
      szja,
      tb,
      szocho,
      totalTax,
      netIncome: revenue - totalTax,
      minBase,
      monthlyMinTb,
      monthlyMinSocho,
      monthlyMinTotal: monthlyMinTb + monthlyMinSocho,
      revenueLimit,
      overRevenueLimit: revenue > revenueLimit,
      // Ekkora éves bevételig tart a mentes sáv az adott költséghányadnál
      taxFreeRevenueLimit: r.taxFreeIncome / incomeRatio,
    };
  }

  const api = { TAX_RULES_2026, STATUS, calculate, taxablePortion, revenueLimitFor };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AtalanyCalc = api;
})(typeof window !== "undefined" ? window : globalThis);
