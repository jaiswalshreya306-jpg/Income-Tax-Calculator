 
const incomeInput = document.getElementById("income");
const regimeInput = document.getElementById("regime");
const oldFields = document.getElementById("oldFields");

const money = (value) =>
  "₹" + Math.round(value).toLocaleString("en-IN");

function calculateNewTax(income) {
  const slabs = [
    [400000, 0],
    [400000, 0.05],
    [400000, 0.10],
    [400000, 0.15],
    [400000, 0.20],
    [400000, 0.25],
    [Infinity, 0.30]
  ];

  let tax = 0;
  let remaining = income;

  for (const [limit, rate] of slabs) {
    const amount = Math.min(remaining, limit);
    tax += amount * rate;
    remaining -= amount;

    if (remaining <= 0) break;
  }

  // Section 87A rebate for eligible resident individuals
  if (income <= 1200000) {
    tax = Math.max(0, tax - Math.min(tax, 60000));
  } else if (income <= 1270588) {
    // Approximate marginal relief near the rebate threshold
    tax = Math.min(tax, income - 1200000);
  }

  return tax;
}

function calculateOldTax(income) {
  const slabs = [
    [250000, 0],
    [250000, 0.05],
    [500000, 0.20],
    [Infinity, 0.30]
  ];

  let tax = 0;
  let remaining = income;

  for (const [limit, rate] of slabs) {
    const amount = Math.min(remaining, limit);
    tax += amount * rate;
    remaining -= amount;

    if (remaining <= 0) break;
  }

  // Basic Section 87A rebate approximation
  if (income <= 500000) {
    tax = 0;
  }

  return tax;
}

regimeInput.addEventListener("change", () => {
  oldFields.classList.toggle("hidden", regimeInput.value !== "old");
});

document.getElementById("calculateBtn").addEventListener("click", () => {
  const income = Number(incomeInput.value);
  const regime = regimeInput.value;
  const error = document.getElementById("error");

  error.textContent = "";

  if (!incomeInput.value || !Number.isFinite(income) || income < 0) {
    error.textContent = "Please enter a valid annual income.";
    return;
  }

  let standardDeduction = regime === "new" ? 75000 : 50000;
  let deduction = 0;

  if (regime === "old") {
    const d80c = Number(document.getElementById("deduction80c").value) || 0;
    const d80d = Number(document.getElementById("deduction80d").value) || 0;

    if (d80c < 0 || d80d < 0) {
      error.textContent = "Deductions cannot be negative.";
      return;
    }

    deduction = Math.min(d80c, 150000) + Math.min(d80d, 25000);
  }

  const taxableIncome = Math.max(
    0,
    income - standardDeduction - deduction
  );

  let baseTax = regime === "new"
    ? calculateNewTax(taxableIncome)
    : calculateOldTax(taxableIncome);

  const cess = baseTax * 0.04;
  const totalTax = baseTax + cess;
  const takeHome = income - totalTax;

  document.getElementById("taxResult").textContent = money(totalTax);
  document.getElementById("regimeResult").textContent =
    regime === "new" ? "New Tax Regime" : "Old Tax Regime";

  document.getElementById("incomeResult").textContent = money(income);
  document.getElementById("standardResult").textContent = money(standardDeduction);
  document.getElementById("deductionResult").textContent = money(deduction);
  document.getElementById("taxableResult").textContent = money(taxableIncome);
  document.getElementById("baseResult").textContent = money(baseTax);
  document.getElementById("cessResult").textContent = money(cess);
  document.getElementById("takeHome").textContent = money(takeHome);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  incomeInput.value = "";
  regimeInput.value = "new";
  document.getElementById("deduction80c").value = 0;
  document.getElementById("deduction80d").value = 0;
  oldFields.classList.add("hidden");

  document.getElementById("error").textContent = "";

  [
    "taxResult",
    "incomeResult",
    "standardResult",
    "deductionResult",
    "taxableResult",
    "baseResult",
    "cessResult",
    "takeHome"
  ].forEach(id => {
    document.getElementById(id).textContent = "₹0";
  });

  document.getElementById("regimeResult").textContent = "New Tax Regime";
});
B