import { createViewTemplates } from '../views/view-templates.js';
export function createPayrollEngine(onChange, dialogs) {
let modal = null, registration = null, toasts = [], toastId = 0;
const actions = {};
const alert = dialogs.alert;
const confirm = dialogs.confirm;

/* ============================ DATA MODEL ============================ */
const state = {
  role: "admin",
  activeCompanyId: "CO1",
  companies: [
    { id:"CO1", name:"Sa Ruri Engineering (Pty) Ltd", paye:"7550123456", uif:"U123456789", sdl:"L123456789", oid:"1234567/8",
      regNo:"2019/123456/07", taxYear:"2026/2027", branches:3, costCentres:14, departments:8, jobCodes:22, payPoints:3 },
    { id:"CO2", name:"Sa Ruri Facilities Management (Pty) Ltd", paye:"7550998877", uif:"U998877665", sdl:"L998877665", oid:"7654321/2",
      regNo:"2021/445566/07", taxYear:"2026/2027", branches:1, costCentres:4, departments:3, jobCodes:6, payPoints:1 },
  ],
  users: [
    {id:1, name:"K. Tapamo", email:"admin@sbi.co.za", role:"Super Administrator", scope:"All companies", status:"Active", username:"k.tapamo", invitedOn:"—", activatedOn:"01 Jan 2026"},
    {id:2, name:"L. Lekgetho", email:"l.lekgetho@sbi.co.za", role:"Payroll Manager", scope:"Sa Ruri Engineering (Pty) Ltd", status:"Active", username:"l.lekgetho", invitedOn:"—", activatedOn:"14 Jan 2026"},
    {id:3, name:"M. Dlamini", email:"m.dlamini@sbi.co.za", role:"Manager/Supervisor", scope:"Sa Ruri Engineering (Pty) Ltd", status:"Invited", username:null, invitedOn:"02 Sep 2026", activatedOn:null},
  ],
  /* Employee.basic / .travel / .medicalOptIn form the DEFAULT / RECURRING payslip — the permanent
     structure carried forward every period. Period-specific amounts (overtime, bonuses, ad-hoc
     deductions) are NOT stored here — they live in state.periodicTransactions, captured per pay
     period via the Periodic Capture screen, and reset automatically on period rollover.
     employee.banking holds the employee's chosen RSA bank, auto-resolved branch code, account
     number and account type — this is what a bank payment file is built from. */
  employees: [
    { id:"EMP00147", companyId:"CO1", name:"T. Nkosi", title:"Site Engineer", dept:"Construction", branch:"Durban Site", cc:"CC-104",
      empDate:"2022-02-03", type:"Permanent, Full-time", status:"Active", manager:"M. Dlamini", occLevel:"Skilled Technical",
      basic:28500, travel:3500, medicalOptIn:true,
      banking:{bankName:"Standard Bank", branchCode:"051001", accountNumber:"10234871190", accountType:"Cheque / Current Account"},
      leave:{annual:9.5, sick:22, family:3},
      essAccount:{status:"Active", username:"t.nkosi", invitedOn:"05 Feb 2022", activatedOn:"06 Feb 2022"} },
    { id:"EMP00098", companyId:"CO1", name:"S. Khumalo", title:"Payroll Clerk", dept:"Finance", branch:"Head Office", cc:"CC-101",
      empDate:"2021-06-14", type:"Permanent, Full-time", status:"Active", manager:"L. Lekgetho", occLevel:"Semi-Skilled",
      basic:19200, travel:1800, medicalOptIn:true,
      banking:{bankName:"First National Bank (FNB)", branchCode:"250655", accountNumber:"62194473310", accountType:"Savings Account"},
      leave:{annual:12, sick:30, family:3},
      essAccount:{status:"Active", username:"s.khumalo", invitedOn:"16 Jun 2021", activatedOn:"17 Jun 2021"} },
    { id:"EMP00212", companyId:"CO1", name:"R. Ndlovu", title:"Foreman", dept:"Construction", branch:"Durban Site", cc:"CC-104",
      empDate:"2019-09-01", type:"Permanent, Full-time", status:"Active", manager:"M. Dlamini", occLevel:"Skilled Technical",
      basic:24800, travel:2600, medicalOptIn:false,
      banking:{bankName:"Nedbank", branchCode:"198765", accountNumber:"1187720044", accountType:"Cheque / Current Account"},
      leave:{annual:4, sick:14, family:1},
      essAccount:{status:"Invited", username:null, invitedOn:"01 Sep 2026", activatedOn:null} },
    { id:"EMP00301", companyId:"CO1", name:"P. van Wyk", title:"Site Administrator", dept:"Construction", branch:"Cape Town Site", cc:"CC-107",
      empDate:"2023-03-20", type:"Permanent, Full-time", status:"Active", manager:"M. Dlamini", occLevel:"Semi-Skilled",
      basic:16400, travel:1200, medicalOptIn:false,
      banking:null,
      leave:{annual:8, sick:18, family:3},
      essAccount:{status:"Not Invited", username:null, invitedOn:null, activatedOn:null} },
    { id:"EMP00410", companyId:"CO2", name:"N. Zulu", title:"Facilities Manager", dept:"Operations", branch:"Head Office", cc:"CC-201",
      empDate:"2020-04-11", type:"Permanent, Full-time", status:"Active", manager:"—", occLevel:"Senior Management",
      basic:22500, travel:2200, medicalOptIn:true,
      banking:{bankName:"ABSA Bank", branchCode:"632005", accountNumber:"4056891127", accountType:"Cheque / Current Account"},
      leave:{annual:11, sick:28, family:3},
      essAccount:{status:"Active", username:"n.zulu", invitedOn:"12 Apr 2020", activatedOn:"13 Apr 2020"} },
    { id:"EMP00411", companyId:"CO2", name:"B. Mokoena", title:"Cleaning Supervisor", dept:"Operations", branch:"Head Office", cc:"CC-201",
      empDate:"2022-11-02", type:"Permanent, Full-time", status:"Active", manager:"N. Zulu", occLevel:"Unskilled",
      basic:14200, travel:900, medicalOptIn:false,
      banking:{bankName:"Capitec Bank", branchCode:"470010", accountNumber:"1620049873", accountType:"Savings Account"},
      leave:{annual:14, sick:30, family:3},
      essAccount:{status:"Not Invited", username:null, invitedOn:null, activatedOn:null} },
  ],
  /* Periodic (variable) transactions — overtime, bonuses, ad-hoc allowances/deductions.
     Scoped to a specific pay period; captured via the Periodic Capture screen. */
  periodicTransactions: [
    {id:1, employeeId:"EMP00147", period:"2026-09", type:"earning", label:"Overtime — 6.5 hrs @ R150.77/hr", amount:980, capturedBy:"K. Tapamo", capturedAt:"20 Sep 2026"},
    {id:2, employeeId:"EMP00212", period:"2026-09", type:"earning", label:"Overtime — 9.6 hrs @ R151.04/hr", amount:1450, capturedBy:"M. Dlamini", capturedAt:"21 Sep 2026"},
  ],
  periodArchive: [],
  earningTypes: [
    {name:"Basic Salary", taxable:"Yes", uif:"Yes", sdl:"Yes", pensionable:"Yes", payslip:"Yes", irp5:"3601"},
    {name:"Overtime", taxable:"Yes", uif:"Yes", sdl:"Yes", pensionable:"No", payslip:"Yes", irp5:"3605"},
    {name:"Travel Allowance", taxable:"80%", uif:"Yes", sdl:"Yes", pensionable:"No", payslip:"Yes", irp5:"3701"},
    {name:"Housing Allowance", taxable:"Yes", uif:"Yes", sdl:"Yes", pensionable:"No", payslip:"Yes", irp5:"3713"},
    {name:"Acting Allowance", taxable:"Yes", uif:"Yes", sdl:"Yes", pensionable:"No", payslip:"Yes", irp5:"3713"},
    {name:"Back Pay", taxable:"Yes", uif:"Yes", sdl:"Yes", pensionable:"Yes", payslip:"Yes", irp5:"3601"},
  ],
  benefitTypes: [
    {name:"Medical Aid", empC:"R2,450 / month", erC:"R2,450 / month", taxable:"Employer portion", code:"4005 / 3810"},
    {name:"Pension Fund", empC:"7.5% pensionable", erC:"10% pensionable", taxable:"No (within limits)", code:"4001 / 4472"},
    {name:"Company Vehicle", empC:"—", erC:"Full cost", taxable:"Yes — use value", code:"3802"},
    {name:"Group Life Insurance", empC:"—", erC:"R180 / month", taxable:"Yes", code:"3801"},
  ],
  deductionTypes: [
    {priority:1, name:"PAYE", type:"Statutory", rule:"SARS tax table (rules engine)", limit:"No limit"},
    {priority:2, name:"UIF", type:"Statutory", rule:"1% employee + 1% employer", limit:"R177.12 cap"},
    {priority:3, name:"Garnishee Order — ABC Attorneys", type:"Court order", rule:"25% of net (EAO cap)", limit:"R3,200.00"},
    {priority:4, name:"Pension Fund", type:"Retirement", rule:"7.5% of pensionable salary", limit:"—"},
    {priority:5, name:"Staff Loan Repayment", type:"Voluntary", rule:"Fixed instalment, 18 mths remaining", limit:"R850.00"},
  ],
  ruleVersions: [
    {name:"PAYE Tax Tables", version:"2026/27-v1", from:"01 Mar 2026", to:"28 Feb 2027", status:"Active", used:"1,412 pay runs"},
    {name:"Rebates (Primary/Secondary/Tertiary)", version:"2026/27-v1", from:"01 Mar 2026", to:"28 Feb 2027", status:"Active", used:"All employees"},
    {name:"UIF Contribution Ceiling", version:"2026-v1", from:"01 Mar 2026", to:"—", status:"Active", used:"All employees"},
    {name:"SDL Threshold", version:"2026-v1", from:"01 Mar 2026", to:"—", status:"Active", used:"Company level"},
    {name:"PAYE Tax Tables", version:"2025/26-v1", from:"01 Mar 2025", to:"28 Feb 2026", status:"Archived", used:"Historical recalculation"},
  ],
  calendar: [
    {period:"2026-09", start:"01 Sep 2026", end:"30 Sep 2026", cutoff:"22 Sep 2026", ot:"24 Sep 2026", pay:"25 Sep 2026", status:"Open"},
    {period:"2026-10", start:"01 Oct 2026", end:"31 Oct 2026", cutoff:"22 Oct 2026", ot:"24 Oct 2026", pay:"25 Oct 2026", status:"Scheduled"},
    {period:"2026-11", start:"01 Nov 2026", end:"30 Nov 2026", cutoff:"20 Nov 2026", ot:"22 Nov 2026", pay:"25 Nov 2026", status:"Scheduled"},
    {period:"2026-12", start:"01 Dec 2026", end:"31 Dec 2026", cutoff:"15 Dec 2026", ot:"17 Dec 2026", pay:"18 Dec 2026", status:"Scheduled — early run"},
  ],
  leaveRequests: [
    {emp:"T. Nkosi", type:"Annual Leave", from:"12 Oct 2026", to:"16 Oct 2026", days:5, status:"Pending"},
    {emp:"S. Khumalo", type:"Sick Leave", from:"03 Sep 2026", to:"04 Sep 2026", days:2, status:"Approved"},
    {emp:"P. van Wyk", type:"Family Responsibility", from:"20 Sep 2026", to:"20 Sep 2026", days:1, status:"Approved"},
    {emp:"R. Ndlovu", type:"Annual Leave", from:"02 Nov 2026", to:"04 Nov 2026", days:3, status:"Pending"},
  ],
  payrollRun: {
    period:"2026-09", stageIndex:3,
    stages:["Select Population","Import Inputs","Calculate","Validate","Review","Approve","Finalise","Payslips","Bank File","Post GL","Statutory"],
    exceptions: [],
    excludedIds: [],
  },
  bulkImport: { fileName:"Salary_Increase_2026_Sept.xlsx", validated:false, imported:false,
    rows:[
      {row:47, emp:"EMP00147", issue:"New salary 12% above band maximum", type:"Warning", resolved:false},
      {row:102, emp:"EMP00998", issue:"Employee number not found", type:"Error", resolved:false},
      {row:189, emp:"EMP00301", issue:"Bank account digit checksum failed", type:"Error", resolved:false},
    ] },
  paymentBatch: { id:"PB-2026-09", stageIndex:1,
    stages:["Finalised","Batch Created","Maker Review","Authoriser Approval","Bank File","Uploaded","Reconciled"] },
  sarsSubmissions: [
    {name:"EMP201", period:"Sep 2026", status:"Submitted", ref:"EMP201-2026-09-SBI", date:"07 Oct 2026"},
    {name:"EMP201", period:"Aug 2026", status:"Submitted", ref:"EMP201-2026-08-SBI", date:"07 Sep 2026"},
    {name:"EMP501 Reconciliation", period:"Aug–Feb 2026", status:"Draft", ref:"—", date:"Due 31 May 2027"},
    {name:"IRP5/IT3(a) Certificates", period:"2025/26 tax year", status:"Issued", ref:"249 certificates", date:"28 May 2026"},
  ],
  eeWorkforce: [
    {level:"Top Management", appt:0, promo:0, term:0, hc:3},
    {level:"Senior Management", appt:1, promo:1, term:0, hc:9},
    {level:"Skilled Technical", appt:6, promo:3, term:2, hc:94},
    {level:"Semi-Skilled", appt:4, promo:1, term:3, hc:112},
    {level:"Unskilled", appt:2, promo:0, term:1, hc:31},
  ],
  distribution: [
    {emp:"T. Nkosi", channel:"Employee Portal", gen:"25 Sep 08:02", sent:"25 Sep 08:02", delivered:"25 Sep 08:03", viewed:"25 Sep 14:20"},
    {emp:"S. Khumalo", channel:"Secure Email", gen:"25 Sep 08:02", sent:"25 Sep 08:02", delivered:"25 Sep 08:05", viewed:"Not yet viewed"},
    {emp:"P. van Wyk", channel:"Mobile App", gen:"25 Sep 08:02", sent:"25 Sep 08:02", delivered:"Pending", viewed:"—"},
  ],
  journal: [
    {acc:"5100 - Salaries & Wages", desc:"Gross salary expense", dr:6214880, cr:0},
    {acc:"2110 - PAYE Payable", desc:"Employee tax withheld", dr:0, cr:1014552},
    {acc:"2120 - UIF Payable", desc:"Employee + employer UIF", dr:0, cr:126480},
    {acc:"2130 - Pension Fund Payable", desc:"Employee + employer contributions", dr:0, cr:987000},
    {acc:"2100 - Bank / Net Pay Clearing", desc:"Net salaries to be paid", dr:0, cr:4532116.40},
    {acc:"5200 - Employer Contributions", desc:"UIF, SDL, pension employer cost", dr:1554332.60, cr:0},
  ],
  auditLog: [
    {ts:"19 Aug 2026 09:14", user:"K. Tapamo", action:"Changed banking details", emp:"EMP00098", verify:"2FA + Approver sign-off"},
    {ts:"18 Aug 2026 16:02", user:"L. Lekgetho", action:"Approved salary increase", emp:"EMP00147", verify:"Maker/Checker — approved"},
    {ts:"18 Aug 2026 11:47", user:"System", action:"Failed login attempt (3x)", emp:"N/A — user account", verify:"Account temporarily locked"},
    {ts:"17 Aug 2026 14:30", user:"K. Tapamo", action:"Exported EE report", emp:"N/A — bulk export", verify:"Logged, PII redaction applied"},
  ],
  pendingApprovals: [
    {id:1, emp:"R. Ndlovu", empId:"EMP00212", field:"Banking Details",
      detail:"Switching to Capitec Bank — account ending 8827 (Savings Account)", status:"Pending", requested:"18 Aug 2026",
      newBanking:{bankName:"Capitec Bank", branchCode:"470010", accountNumber:"1620098827", accountType:"Savings Account"}},
  ],
  currentManager: "M. Dlamini",
  employeeSearch: "",
  reportShares: [],
  reportConfigs: {},
  customRoles: [],
  notificationPrefs: {},
  passwordPolicy: {minLength:10, requireUpper:true, requireNumber:true, requireSymbol:true, expiryDays:90, sessionTimeoutMins:30, twoFactorRequired:false},
};
const TODAY = new Date(2026,8,3); // 3 Sep 2026 — fixed reference date for this demo

/* South African bank reference — universal (standard) branch codes used for EFT/ACB salary
   payment files. Selecting a bank auto-resolves its branch code; nothing is hand-typed. */
const SA_BANKS = [
  {name:"ABSA Bank", code:"632005"},
  {name:"Standard Bank", code:"051001"},
  {name:"First National Bank (FNB)", code:"250655"},
  {name:"Nedbank", code:"198765"},
  {name:"Capitec Bank", code:"470010"},
  {name:"African Bank", code:"430000"},
  {name:"Bidvest Bank", code:"462005"},
  {name:"Discovery Bank", code:"679000"},
  {name:"Investec Bank", code:"580105"},
  {name:"TymeBank", code:"678910"},
  {name:"Bank Zero", code:"888000"},
  {name:"Sasfin Bank", code:"683000"},
  {name:"Mercantile Bank", code:"450905"},
  {name:"Postbank (SA Post Office)", code:"460005"},
];
const ACCOUNT_TYPES = ["Cheque / Current Account","Savings Account","Transmission Account"];
const OCCUPATIONAL_LEVELS = ["Top Management","Senior Management","Skilled Technical","Semi-Skilled","Unskilled"];
function bankCode(name){ const b = SA_BANKS.find(x=>x.name===name); return b?b.code:""; }
function hasBanking(e){ return !!(e.banking && e.banking.bankName && e.banking.accountNumber); }

/* ============================ HELPERS ============================ */
const fmt = n => "R" + Number(n).toLocaleString("en-ZA",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");

function getActiveCompany(){ return state.companies.find(c=>c.id===state.activeCompanyId) || state.companies[0]; }
function companyEmployees(){ return state.employees.filter(e=>e.companyId===state.activeCompanyId); }
function activeEmployees(){ return companyEmployees().filter(e=>e.status==="Active"); }
function teamOf(managerName){ return activeEmployees().filter(e=>e.manager===managerName); }
function managerList(){ return [...new Set(activeEmployees().map(e=>e.manager).filter(m=>m && m!=="—"))]; }
function activeRuleVersion(name){ return state.ruleVersions.find(r=>r.name===name && r.status==="Active"); }

function kpi(label, value, opts){
  opts = opts || {};
  const cls = opts.onclick ? "kpi clickable" : "kpi";
  const click = opts.onclick ? `onclick="${opts.onclick}"` : "";
  return `<div class="${cls}" ${click}><div class="l">${esc(label)}</div><div class="v">${value}</div>${opts.delta?`<div class="d ${opts.delta.up?'up':'down'}">${esc(opts.delta.text)}</div>`:""}</div>`;
}
function badge(text, kind){ return `<span class="badge b-${kind}">${esc(text)}</span>`; }
function table(headers, rows){
  let h = "<table class='data'><tr>" + headers.map(x=>`<th>${esc(x)}</th>`).join("") + "</tr>";
  rows.forEach(r=> h += "<tr>" + r.map(c=>`<td>${c}</td>`).join("") + "</tr>");
  return h + "</table>";
}
function stepper(stages, activeIndex){
  return `<div class="stepper">` + stages.map((s,i)=>{
    const cls = i < activeIndex ? "done" : i === activeIndex ? "active" : "";
    return `<div class="step ${cls}"><div class="line"></div><div class="dot">${i<activeIndex?"&#10003;":i+1}</div><div class="lbl">${esc(s)}</div></div>`;
  }).join("") + `</div>`;
}
function note(label, text, cls){ return `<div class="note ${cls||''}"><b>${esc(label)}</b>${esc(text)}</div>`; }
function actionTile(icon, label, onclick){
  return `<div class="action-tile" onclick="${onclick}"><div class="ic">${icon}</div><div class="lbl">${esc(label)}</div></div>`;
}
function titleRow(title, subtitle, actionHtml){
  return `<div class="titlerow"><div><h1 class="title">${esc(title)}</h1><p class="subtitle">${esc(subtitle)}</p></div>${actionHtml?`<div>${actionHtml}</div>`:""}</div>`;
}
function field(label, inputHtml, help){
  return `<div class="field"><label>${esc(label)}</label>${inputHtml}${help?`<div class="help">${esc(help)}</div>`:""}</div>`;
}
/* Shared South African banking fields — used in both the Employee modal and the self-service
   "Update Banking Details" request, so the bank list and branch-code resolution live in one place. */
function bankFieldsHtml(prefix, banking){
  banking = banking || {};
  return `
    <div class="field-grid">
      ${field("Bank", `<select id="${prefix}bank" onchange="document.getElementById('${prefix}branch').value=bankCode(this.value)">
        <option value="">— Select bank —</option>
        ${SA_BANKS.map(b=>`<option value="${esc(b.name)}" ${banking.bankName===b.name?"selected":""}>${esc(b.name)}</option>`).join("")}
      </select>`)}
      ${field("Universal Branch Code", `<input type="text" id="${prefix}branch" value="${esc(banking.branchCode||bankCode(banking.bankName))}" readonly data-prototype-style="prototype-style-1">`, "Auto-resolved from the selected bank")}
    </div>
    <div class="field-grid">
      ${field("Account Number", `<input type="text" id="${prefix}acct" value="${esc(banking.accountNumber||"")}" placeholder="e.g. 10234871190">`)}
      ${field("Account Type", `<select id="${prefix}accttype">${ACCOUNT_TYPES.map(t=>`<option ${banking.accountType===t?"selected":""}>${esc(t)}</option>`).join("")}</select>`)}
    </div>`;
}
function readBankFields(prefix){
  const bankName = document.getElementById(prefix+"bank").value;
  const accountNumber = document.getElementById(prefix+"acct").value.trim();
  if(!bankName || !accountNumber) return null;
  return { bankName, branchCode: document.getElementById(prefix+"branch").value, accountNumber, accountType: document.getElementById(prefix+"accttype").value };
}

/* Periodic transactions for a given employee + period (defaults to the currently open period) */
function periodicFor(empId, period){
  period = period || state.payrollRun.period;
  return state.periodicTransactions.filter(t=>t.employeeId===empId && t.period===period);
}

/* Single source of truth for payslip calculation. Combines the employee's recurring/default
   structure with this period's captured periodic transactions, resolves statutory deductions
   through the simplified rules engine, and returns a full line-by-line trace — so any figure
   shown anywhere in the system (payslip, dashboard, journal) is reproducible from here.
   Simplified for demo purposes; a production build resolves the statutory portion through the
   versioned Statutory Rules Engine (technical specification, Module 7 / §12). */
function calcPayslip(e, period){
  period = period || state.payrollRun.period;
  const pt = periodicFor(e.id, period);
  const periodicEarnings = pt.filter(t=>t.type==="earning").reduce((s,t)=>s+t.amount,0);
  const periodicDeductions = pt.filter(t=>t.type==="deduction").reduce((s,t)=>s+t.amount,0);
  const gross = e.basic + e.travel + periodicEarnings;
  const uifD = Math.round(Math.min(gross*0.01, 177.12)*100)/100;
  const pension = Math.round(e.basic*0.075*100)/100;
  const taxableMonthly = e.basic + e.travel*0.8 + periodicEarnings;
  const annualTaxable = taxableMonthly*12;
  let annualTax;
  if(annualTaxable<=237100) annualTax = annualTaxable*0.18;
  else if(annualTaxable<=370500) annualTax = 42678 + (annualTaxable-237100)*0.26;
  else if(annualTaxable<=512800) annualTax = 77362 + (annualTaxable-370500)*0.31;
  else annualTax = 121475 + (annualTaxable-512800)*0.36;
  annualTax = Math.max(0, annualTax-17235);
  const payeD = Math.round((annualTax/12)*100)/100;
  const medical = e.medicalOptIn ? 2450 : 0;
  const totalDed = payeD+uifD+pension+medical+periodicDeductions;
  const net = gross-totalDed;
  const payeVer = activeRuleVersion("PAYE Tax Tables");
  const uifVer = activeRuleVersion("UIF Contribution Ceiling");
  const trace = [
    {label:"Basic Salary", amount:e.basic, source:"Recurring / Default Payslip", rule:"Employment contract base pay"},
    {label:"Travel Allowance", amount:e.travel, source:"Recurring / Default Payslip", rule:"80% taxable per SARS practice (earnings rule)"},
    ...pt.map(t=>({label:t.label, amount:t.type==="deduction"?-t.amount:t.amount, source:"Periodic Capture — "+period,
      rule:"Captured by "+t.capturedBy+" on "+t.capturedAt})),
    {label:"PAYE", amount:-payeD, source:"Statutory Rules Engine", rule:"Progressive SARS table, "+(payeVer?payeVer.version:"—")},
    {label:"UIF", amount:-uifD, source:"Statutory Rules Engine", rule:"1% employee, capped R177.12, "+(uifVer?uifVer.version:"—")},
    {label:"Pension Fund", amount:-pension, source:"Benefits Engine", rule:"7.5% of recurring basic salary"},
    {label:"Medical Aid", amount:-medical, source:"Benefits Engine", rule:e.medicalOptIn?"Flat company contribution (opted in)":"Not enrolled"},
  ];
  return {gross, uifD, pension, payeD, medical, periodicEarnings, periodicDeductions, totalDed, net, transactions:pt, trace};
}
function grossFor(e, period){ return calcPayslip(e, period).gross; }
function totalDedFor(e, period){ return calcPayslip(e, period).totalDed; }
function netFor(e, period){ return calcPayslip(e, period).net; }
function erContribFor(e, period){ const c = calcPayslip(e, period); return c.uifD + c.medical + (e.basic*0.10); }

/* Employees actually included in the current payroll run (population selection, spec §19.1 step 2) */
function runPopulation(){ return activeEmployees().filter(e=>!state.payrollRun.excludedIds.includes(e.id)); }
function togglePopulation(id){
  const idx = state.payrollRun.excludedIds.indexOf(id);
  if(idx>-1) state.payrollRun.excludedIds.splice(idx,1); else state.payrollRun.excludedIds.push(id);
  render();
}

/* Validation & Exception Centre — computed from real employee/period data, not hardcoded.
   Severity: Critical blocks finalisation, Warning requires review (spec §18). */
function computeExceptions(){
  const list = [];
  runPopulation().forEach(e=>{
    const c = calcPayslip(e);
    if(!hasBanking(e)) list.push({emp:e.id, issue:"Missing or incomplete bank details", sev:"Critical", action:"Capture bank, branch code and account number before finalisation", resolved:false});
    if(e.basic<=0) list.push({emp:e.id, issue:"Missing basic salary / rate", sev:"Critical", action:"Configure recurring salary structure", resolved:false});
    if(c.net<0) list.push({emp:e.id, issue:"Negative net pay after deductions", sev:"Critical", action:"Review deduction priority and periodic transactions", resolved:false});
    else if(c.net>0 && c.net<1000) list.push({emp:e.id, issue:"Unusually low net pay for review", sev:"Warning", action:"Confirm periodic deductions are correct", resolved:false});
  });
  const pendingLeave = state.leaveRequests.filter(l=>l.status==="Pending" && runPopulation().some(e=>e.name===l.emp));
  pendingLeave.forEach(l=>list.push({emp:l.emp, issue:"Leave request still pending manager approval ("+l.type+")", sev:"Warning", action:"Resolve before finalising if leave falls within this period", resolved:false}));
  return list;
}
function nextEmployeeId(){
  const nums = state.employees.map(e=>parseInt(e.id.replace(/[^0-9]/g,''),10)).filter(n=>!isNaN(n));
  return "EMP"+String((nums.length?Math.max(...nums):0)+1).padStart(5,'0');
}
function nextCompanyId(){
  const nums = state.companies.map(c=>parseInt(c.id.replace(/[^0-9]/g,''),10)).filter(n=>!isNaN(n));
  return "CO"+((nums.length?Math.max(...nums):0)+1);
}
function nextUserId(){ return (state.users.length?Math.max(...state.users.map(u=>u.id)):0)+1; }

/* ============================ MODAL / TOAST ============================ */



function confirmAction(title, msg, onYesFnName){
  openModal(title, `<p data-prototype-style="prototype-style-2">${esc(msg)}</p>`,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn danger" onclick="${onYesFnName}();closeModal();">Confirm</button>`);
}


/* ============================ NAV CONFIG ============================ */
const NAV_ADMIN = [
  {id:"dashboard", label:"Dashboard"},
  {id:"company", label:"Companies"},
  {id:"users", label:"Users & Roles"},
  {id:"employees", label:"Employees"},
  {id:"calendar", label:"Payroll Calendar"},
  {id:"earnings", label:"Earnings & Benefits"},
  {id:"deductions", label:"Deductions"},
  {id:"rules", label:"Statutory Rules"},
  {id:"periodic", label:"Periodic Capture"},
  {id:"payslips", label:"Payslips"},
  {id:"leave", label:"Leave"},
  {id:"payrollrun", label:"Payroll Run"},
  {id:"bulk", label:"Bulk Processing"},
  {id:"payments", label:"Payments & Banking"},
  {id:"sars", label:"SARS Reports"},
  {id:"ee", label:"Employment Equity"},
  {id:"reports", label:"Reports"},
  {id:"distribution", label:"Distribution"},
  {id:"accounting", label:"Accounting"},
  {id:"audit", label:"Audit & Security"},
  {id:"settings", label:"Settings"},
];
const NAV_MANAGER = [
  {id:"managerdashboard", label:"Manager Dashboard"},
  {id:"team", label:"My Team"},
  {id:"leave", label:"Leave Approvals"},
  {id:"payslips", label:"Team Payslips"},
  {id:"reports", label:"Team Reports"},
  {id:"mydashboard", label:"My Own Dashboard"},
  {id:"settings", label:"Settings"},
];
const NAV_EMPLOYEE = [
  {id:"mydashboard", label:"My Dashboard"},
  {id:"payslips", label:"My Payslips"},
  {id:"leave", label:"My Leave"},
  {id:"selfservice", label:"My Profile"},
  {id:"settings", label:"Settings"},
];
/* Auditor — read-only across historical payroll, submissions and audit information (spec §6) */
const NAV_AUDITOR = [
  {id:"audit", label:"Audit Trail"},
  {id:"reports", label:"Reports"},
  {id:"sars", label:"SARS Reports"},
  {id:"calendar", label:"Period History"},
  {id:"settings", label:"Settings"},
];
const ALL_LABELS = {};
[...NAV_ADMIN, ...NAV_MANAGER, ...NAV_EMPLOYEE, ...NAV_AUDITOR].forEach(n=>ALL_LABELS[n.id]=n.label);
ALL_LABELS["settingsanalytics"] = "System Configuration & Analytics";
function getNav(){
  return state.role==="admin" ? NAV_ADMIN : state.role==="manager" ? NAV_MANAGER :
         state.role==="auditor" ? NAV_AUDITOR : NAV_EMPLOYEE;
}

let currentRoute = "dashboard";
let currentEmployeeId = state.employees.find(e=>e.companyId===state.activeCompanyId).id;






/* Context bar: company switcher (admin) + "viewing employee" switcher (admin/manager) —
   a single shared control instead of repeating employee picker buttons on every screen. */

function switchCompany(id){
  state.activeCompanyId = id;
  const pool = companyEmployees();
  currentEmployeeId = pool.length ? pool[0].id : null;
  showToast("Switched to "+getActiveCompany().name+" — all screens now reflect this company's isolated data.");
  renderContextBar();
  render();
}
function openSwitchDemoUser(){
  const pool = companyEmployees();
  openModal("Switch Demo Employee",
    `<p class="muted">For demo purposes only — pick which employee's self-service view to preview.</p>
     ${pool.map(e=>`<div class="action-tile" data-prototype-style="prototype-style-6" onclick="viewEmployee('${e.id}');closeModal();">
       <b>${esc(e.name)}</b><div class="muted">${esc(e.title)} — ${e.id}</div></div>`).join("")}`,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>`);
}


function toggleNotif(){
  const emp = state.employees.find(e=>e.id===currentEmployeeId);
  let items = [];
  if(state.role==="admin"){
    items = state.payrollRun.exceptions.filter(x=>!x.resolved).map(x=>x.emp+": "+x.issue)
      .concat(state.pendingApprovals.filter(p=>p.status==="Pending").map(p=>"Approval needed: "+p.emp+" — "+p.field));
  } else if(state.role==="manager"){
    items = state.leaveRequests.filter(l=>l.status==="Pending" && teamOf(state.currentManager).some(e=>e.name===l.emp))
      .map(l=>l.emp+" requested "+l.type+" ("+l.days+" days)");
  } else if(state.role==="auditor"){
    items = state.pendingApprovals.filter(p=>p.status==="Pending").map(p=>"(Informational) "+p.emp+" — "+p.field+" awaiting approval");
  } else if(emp){
    items = state.leaveRequests.filter(l=>l.emp===emp.name).map(l=>l.type+" "+l.from+" — "+l.status);
  }
  alert(items.length ? items.join("\n") : "No new notifications.");
}

/* ============================ RENDERERS ============================ */


/* ---------- ADMIN: Dashboard ---------- */


/* ---------- ADMIN: Companies (multi-tenant CRUD) ---------- */

function openCompanyModal(id){
  const editing = !!id;
  const c = editing ? state.companies.find(x=>x.id===id) : {name:"",paye:"",uif:"",sdl:"",oid:"",regNo:"",taxYear:"2026/2027",branches:1,costCentres:1,departments:1,jobCodes:1,payPoints:1};
  const body = `
    ${field("Company Name", `<input type="text" id="f_name" value="${esc(c.name)}">`)}
    <div class="field-grid">
      ${field("PAYE Reference", `<input type="text" id="f_paye" value="${esc(c.paye)}">`)}
      ${field("UIF Reference", `<input type="text" id="f_uif" value="${esc(c.uif)}">`)}
      ${field("SDL Reference", `<input type="text" id="f_sdl" value="${esc(c.sdl)}">`)}
      ${field("OID/COID Registration No.", `<input type="text" id="f_oid" value="${esc(c.oid)}">`, "Compensation for Occupational Injuries & Diseases")}
      ${field("Registration No.", `<input type="text" id="f_reg" value="${esc(c.regNo)}">`)}
      ${field("Tax Year", `<input type="text" id="f_ty" value="${esc(c.taxYear)}">`)}
      ${field("Branches", `<input type="number" id="f_branches" value="${c.branches}">`)}
      ${field("Cost Centres", `<input type="number" id="f_cc" value="${c.costCentres}">`)}
      ${field("Departments", `<input type="number" id="f_dept" value="${c.departments}">`)}
      ${field("Job Codes", `<input type="number" id="f_jobcodes" value="${c.jobCodes||0}">`)}
      ${field("Pay Points", `<input type="number" id="f_paypoints" value="${c.payPoints||0}">`)}
    </div>`;
  openModal(editing?"Edit Company":"Add New Company", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="saveCompany(${editing?`'${id}'`:'null'})">${editing?"Save Changes":"Create Company"}</button>`);
}
function saveCompany(id){
  const data = {
    name: document.getElementById("f_name").value.trim(),
    paye: document.getElementById("f_paye").value.trim(),
    uif: document.getElementById("f_uif").value.trim(),
    sdl: document.getElementById("f_sdl").value.trim(),
    oid: document.getElementById("f_oid").value.trim(),
    regNo: document.getElementById("f_reg").value.trim(),
    taxYear: document.getElementById("f_ty").value.trim(),
    branches: Number(document.getElementById("f_branches").value)||0,
    costCentres: Number(document.getElementById("f_cc").value)||0,
    departments: Number(document.getElementById("f_dept").value)||0,
    jobCodes: Number(document.getElementById("f_jobcodes").value)||0,
    payPoints: Number(document.getElementById("f_paypoints").value)||0,
  };
  if(!data.name){ showToast("Company name is required.", true); return; }
  if(id){
    Object.assign(state.companies.find(c=>c.id===id), data);
    showToast("Company updated.");
  } else {
    const newId = nextCompanyId();
    state.companies.push({id:newId, ...data});
    state.activeCompanyId = newId;
    showToast("Company created and set as active. Add employees to get started.");
  }
  closeModal(); render();
}
function deleteCompany(id){
  if(state.employees.some(e=>e.companyId===id)){
    showToast("Cannot delete a company with employee records. Terminate or reassign employees first.", true); return;
  }
  if(state.companies.length<=1){ showToast("At least one company must remain.", true); return; }
  confirmAction("Delete Company", "This will permanently remove the company record. Continue?", `_doDeleteCompany_${id.replace(/\W/g,'')}`);
  actions["_doDeleteCompany_"+id.replace(/\W/g,'')] = function(){
    state.companies = state.companies.filter(c=>c.id!==id);
    if(state.activeCompanyId===id) state.activeCompanyId = state.companies[0].id;
    showToast("Company deleted.");
    render();
  };
}

/* ---------- ADMIN: Users & Roles CRUD ---------- */

function roleOptionsHtml(selected){
  const roles = ["Super Administrator","Payroll Administrator","Payroll Manager","HR Manager","Finance/Accountant","Manager/Supervisor","Employee","Auditor", ...state.customRoles];
  return roles.map(r=>`<option ${selected===r?"selected":""}>${esc(r)}</option>`).join("") + `<option value="__custom__">+ Create new role…</option>`;
}
function openUserModal(id){
  const editing = !!id;
  const u = editing ? state.users.find(x=>x.id===id) : {name:"",email:"",role:"Payroll Administrator",scope:"All companies",status:"Active"};
  const scopes = ["All companies", ...state.companies.map(c=>c.name)];
  const body = `
    ${field("Full Name", `<input type="text" id="f_uname" value="${esc(u.name)}">`)}
    ${field("Email", `<input type="email" id="f_uemail" value="${esc(u.email)}">`, editing?"":"A registration link will be sent to this address")}
    ${field("Role", `<select id="f_urole" onchange="if(this.value==='__custom__'){document.getElementById('f_ucustomrole').style.display='block';}else{document.getElementById('f_ucustomrole').style.display='none';}">${roleOptionsHtml(u.role)}</select>`)}
    <div id="f_ucustomrole" data-prototype-style="prototype-style-15">${field("New Role Name", `<input type="text" id="f_ucustomrolename" placeholder="e.g. Marketing, Operations, Technician">`, "Saved to the role list for future use across the system")}</div>
    ${field("Scope", `<select id="f_uscope">${scopes.map(s=>`<option ${u.scope===s?"selected":""}>${esc(s)}</option>`).join("")}</select>`)}
    ${editing ? field("Status", `<select id="f_ustatus"><option ${u.status==="Active"?"selected":""}>Active</option><option ${u.status==="Invited"?"selected":""}>Invited</option><option ${u.status==="Suspended"?"selected":""}>Suspended</option></select>`) : ""}
    ${!editing ? `<div class="note dev"><b>What happens next</b>The user is created with status "Invited". A registration link (simulated in this prototype) lets them choose a username and password before their account activates.</div>` : ""}
  `;
  openModal(editing?"Edit User":"Invite New User", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="saveUser(${editing?id:'null'})">${editing?"Save Changes":"Send Invitation"}</button>`);
}
function saveUser(id){
  let role = document.getElementById("f_urole").value;
  if(role==="__custom__"){
    const newRole = document.getElementById("f_ucustomrolename").value.trim();
    if(!newRole){ showToast("Enter a name for the new role.", true); return; }
    if(!state.customRoles.includes(newRole)) state.customRoles.push(newRole);
    role = newRole;
  }
  const data = {
    name: document.getElementById("f_uname").value.trim(),
    email: document.getElementById("f_uemail").value.trim(),
    role, scope: document.getElementById("f_uscope").value,
  };
  if(!data.name || !data.email){ showToast("Name and email are required.", true); return; }
  if(id){
    if(document.getElementById("f_ustatus")) data.status = document.getElementById("f_ustatus").value;
    Object.assign(state.users.find(u=>u.id===id), data);
    showToast("User updated.");
  } else {
    state.users.push({id:nextUserId(), ...data, status:"Invited", username:null, invitedOn:"Today", activatedOn:null});
    showToast("Invitation sent to "+data.email+". They'll receive a registration link to set up their account.");
  }
  closeModal(); render();
}
function deleteUser(id){
  const u = state.users.find(x=>x.id===id);
  confirmAction("Remove User", "Remove "+u.name+"'s access to the payroll system? This cannot be undone.", "_doDeleteUser");
  actions._doDeleteUser = function(){
    state.users = state.users.filter(x=>x.id!==id);
    showToast("User removed.");
    render();
  };
}

/* ============================ ACCOUNT SETUP / REGISTRATION (spec-adjacent onboarding flow) ============================ */
/* Simulates the link an invited person receives by email: a full-page, branded setup screen
   outside the normal app chrome where they choose a username and password before their
   account activates. Works for both system Users (Exec/Admin/Manager/Auditor/custom roles)
   and Employee self-service (ESS) accounts. */


function completeRegistration(kind, id){
  const username = document.getElementById("reg_username").value.trim();
  const pw = document.getElementById("reg_password").value;
  const pw2 = document.getElementById("reg_password2").value;
  const terms = document.getElementById("reg_terms").checked;
  const policy = state.passwordPolicy;
  if(!username){ showToast("Choose a username.", true); return; }
  if(pw.length < policy.minLength){ showToast("Password must be at least "+policy.minLength+" characters.", true); return; }
  if(policy.requireUpper && !/[A-Z]/.test(pw)){ showToast("Password must include an uppercase letter.", true); return; }
  if(policy.requireNumber && !/[0-9]/.test(pw)){ showToast("Password must include a number.", true); return; }
  if(policy.requireSymbol && !/[^A-Za-z0-9]/.test(pw)){ showToast("Password must include a special character.", true); return; }
  if(pw !== pw2){ showToast("Passwords do not match.", true); return; }
  if(!terms){ showToast("You must accept the Terms of Use to continue.", true); return; }
  if(kind==="user"){
    const u = state.users.find(x=>x.id===Number(id));
    u.username = username; u.status = "Active"; u.activatedOn = "Today";
  } else {
    const e = state.employees.find(x=>x.id===id);
    e.essAccount.username = username; e.essAccount.status = "Active"; e.essAccount.activatedOn = "Today";
  }
  state.auditLog.unshift({ts:"Just now", user:username, action:"Account activated via registration link", emp:kind==="employee"?id:"N/A — system user", verify:"Password policy enforced"});
  closeRegistrationPreview();
  showToast("Account activated for username \""+username+"\". They can now sign in.");
  render();
}


/* ---------- ADMIN: Employees CRUD ---------- */

function inviteToESS(empId){
  const e = state.employees.find(x=>x.id===empId);
  e.essAccount = {status:"Invited", username:null, invitedOn:"Today", activatedOn:null};
  showToast("Self-service invitation sent to "+e.name+". They'll set up a username and password via the registration link.");
  render();
}
function viewEmployee(id){ currentEmployeeId = id; render(); }

function openEmployeeModal(id){
  const editing = !!id;
  const e = editing ? state.employees.find(x=>x.id===id) : {
    id:"", name:"", title:"", dept:"", branch:"", cc:"", empDate:"2026-09-01", type:"Permanent, Full-time",
    status:"Active", manager:"—", occLevel:"Skilled Technical", basic:15000, travel:0, medicalOptIn:false, banking:null, leave:{annual:15,sick:30,family:3}
  };
  const managers = ["—", ...companyEmployees().map(x=>x.name)];
  const types = ["Permanent, Full-time","Permanent, Part-time","Fixed-term Contract","Temporary"];
  const body = `
    ${!editing ? `<div class="note dev" data-prototype-style="prototype-style-11"><b>Auto-generated</b>Employee number will be assigned as ${nextEmployeeId()} on save.</div>` : ""}
    <div class="field-grid">
      ${field("Full Name", `<input type="text" id="f_ename" value="${esc(e.name)}">`)}
      ${field("Job Title", `<input type="text" id="f_etitle" value="${esc(e.title)}">`)}
      ${field("Department", `<input type="text" id="f_edept" value="${esc(e.dept)}">`)}
      ${field("Branch", `<input type="text" id="f_ebranch" value="${esc(e.branch)}">`)}
      ${field("Cost Centre", `<input type="text" id="f_ecc" value="${esc(e.cc)}">`)}
      ${field("Employment Date", `<input type="date" id="f_edate" value="${esc(e.empDate)}">`)}
      ${field("Employment Type", `<select id="f_etype">${types.map(t=>`<option ${e.type===t?"selected":""}>${esc(t)}</option>`).join("")}</select>`)}
      ${field("Manager / Supervisor", `<select id="f_emgr">${managers.map(m=>`<option ${e.manager===m?"selected":""}>${esc(m)}</option>`).join("")}</select>`)}
      ${field("Occupational Level (EE)", `<select id="f_eocc">${OCCUPATIONAL_LEVELS.map(o=>`<option ${e.occLevel===o?"selected":""}>${esc(o)}</option>`).join("")}</select>`, "Feeds Employment Equity workforce reporting directly")}
    </div>
    <h2 class="section" data-prototype-style="prototype-style-26">Default / Recurring Payslip Structure</h2>
    <p class="help" data-prototype-style="prototype-style-27">This is the permanent structure carried forward every pay period. Overtime, bonuses and other one-off amounts are captured per period on the <b>Periodic Capture</b> screen, not here.</p>
    <div class="field-grid">
      ${field("Recurring Basic Salary (monthly)", `<input type="number" id="f_ebasic" value="${e.basic}">`)}
      ${field("Recurring Travel Allowance", `<input type="number" id="f_etravel" value="${e.travel}">`)}
    </div>
    <div class="field checkrow"><input type="checkbox" id="f_emedical" ${e.medicalOptIn?"checked":""}> <label data-prototype-style="prototype-style-22">Enrolled in Medical Aid (R2,450/month)</label></div>
    <h2 class="section">Banking Details</h2>
    <p class="help" data-prototype-style="prototype-style-27">Select the employee's bank of choice from all major South African banks — the universal branch code resolves automatically and feeds the bank-specific payment file at payment batch time.</p>
    ${bankFieldsHtml("f_e", e.banking)}
    ${editing ? field("Employment Status", `<select id="f_estatus"><option ${e.status==="Active"?"selected":""}>Active</option><option ${e.status==="Terminated"?"selected":""}>Terminated</option></select>`) : ""}
    <div class="note dev">PAYE, UIF and pension are not stored — they're calculated live from this structure plus any periodic transactions, every time a payslip or report is opened. Leaving banking incomplete will raise a Critical validation exception on the next Payroll Run.</div>
  `;
  openModal(editing?"Edit Employee":"Add New Employee", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="saveEmployee(${editing?`'${id}'`:'null'})">${editing?"Save Changes":"Create Employee"}</button>`);
}
function saveEmployee(id){
  const name = document.getElementById("f_ename").value.trim();
  if(!name){ showToast("Employee name is required.", true); return; }
  const basic = Number(document.getElementById("f_ebasic").value)||0;
  const travel = Number(document.getElementById("f_etravel").value)||0;
  const medicalOptIn = document.getElementById("f_emedical").checked;
  const banking = readBankFields("f_e");
  const data = {
    name, title: document.getElementById("f_etitle").value.trim(),
    dept: document.getElementById("f_edept").value.trim(),
    branch: document.getElementById("f_ebranch").value.trim(),
    cc: document.getElementById("f_ecc").value.trim(),
    empDate: document.getElementById("f_edate").value,
    type: document.getElementById("f_etype").value,
    manager: document.getElementById("f_emgr").value,
    occLevel: document.getElementById("f_eocc").value,
    basic, travel, medicalOptIn, banking,
  };
  if(id){
    const emp = state.employees.find(x=>x.id===id);
    if(document.getElementById("f_estatus")) data.status = document.getElementById("f_estatus").value;
    Object.assign(emp, data);
    showToast("Employee updated — payslip, dashboard, payment batch and Employment Equity figures recalculated.");
  } else {
    const newId = nextEmployeeId();
    state.employees.push({id:newId, companyId: state.activeCompanyId, status:"Active", leave:{annual:15,sick:30,family:3},
      essAccount:{status:"Not Invited", username:null, invitedOn:null, activatedOn:null}, ...data});
    currentEmployeeId = newId;
    showToast("Employee added — now reflected across Dashboard, Payroll Run, Payslips and Employment Equity.");
  }
  closeModal(); render();
}
function terminateEmployee(id){
  const e = state.employees.find(x=>x.id===id);
  confirmAction("Terminate Employee", "Terminate "+e.name+"? They will be excluded from the active payroll run but their record and history are retained.", "_doTerminate");
  actions._doTerminate = function(){
    e.status = "Terminated";
    state.auditLog.unshift({ts:"Just now", user:"K. Tapamo", action:"Terminated employee", emp:e.id, verify:"Status change — history retained"});
    showToast(e.name+" has been terminated. Record retained for statutory history.");
    render();
  };
}









/* ---------- ADMIN: Periodic Capture (variable transactions for the OPEN period only) ---------- */

function openPeriodicModal(empId){
  const emp = state.employees.find(e=>e.id===empId);
  const types = ["Overtime","Performance Bonus","Commission","Ad-hoc Allowance","Advance Recovery (deduction)","Ad-hoc Deduction"];
  const body = `
    <p class="muted">${esc(emp.name)} (${emp.id}) — Period ${state.payrollRun.period}</p>
    ${field("Transaction Type", `<select id="f_pttype">${types.map(t=>`<option>${t}</option>`).join("")}</select>`)}
    ${field("Amount (R)", `<input type="number" id="f_ptamount" value="0" min="0">`)}
    ${field("Note / Description", `<input type="text" id="f_ptnote" placeholder="e.g. 6.5 hrs @ R150.77/hr">`)}
  `;
  openModal("Add Periodic Transaction", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="savePeriodic('${empId}')">Add Transaction</button>`);
}
function savePeriodic(empId){
  const type = document.getElementById("f_pttype").value;
  const amount = Number(document.getElementById("f_ptamount").value)||0;
  const noteTxt = document.getElementById("f_ptnote").value.trim();
  if(amount<=0){ showToast("Enter an amount greater than zero.", true); return; }
  const isDeduction = /deduction/i.test(type) || /recovery/i.test(type);
  const id = state.periodicTransactions.length ? Math.max(...state.periodicTransactions.map(t=>t.id))+1 : 1;
  state.periodicTransactions.push({
    id, employeeId: empId, period: state.payrollRun.period,
    type: isDeduction?"deduction":"earning",
    label: type + (noteTxt?" — "+noteTxt:""),
    amount, capturedBy:"K. Tapamo", capturedAt:"Today"
  });
  showToast("Transaction captured — payslip and payroll run totals updated for this period.");
  closeModal(); render();
}
function removePeriodic(id){
  state.periodicTransactions = state.periodicTransactions.filter(t=>t.id!==id);
  showToast("Transaction removed.");
  render();
}

/* ---------- MANAGER: Dashboard ---------- */

function switchManager(name){ state.currentManager = name; render(); }



/* ---------- EMPLOYEE: My Dashboard ---------- */

function openLeaveModal(){
  const emp = state.employees.find(e=>e.id===currentEmployeeId);
  const body = `
    ${field("Leave Type", `<select id="f_ltype"><option>Annual Leave</option><option>Sick Leave</option><option>Family Responsibility</option></select>`)}
    <div class="field-grid">
      ${field("From Date", `<input type="date" id="f_lfrom">`)}
      ${field("To Date", `<input type="date" id="f_lto">`)}
    </div>
    ${field("Number of Days", `<input type="number" id="f_ldays" value="1" min="1">`)}
    <div class="note">Your current annual leave balance is ${emp.leave.annual} days.</div>
  `;
  openModal("Apply for Leave", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="submitLeaveRequest()">Submit Request</button>`);
}
function submitLeaveRequest(){
  const emp = state.employees.find(e=>e.id===currentEmployeeId);
  const type = document.getElementById("f_ltype").value;
  const fromRaw = document.getElementById("f_lfrom").value;
  const toRaw = document.getElementById("f_lto").value;
  const days = Number(document.getElementById("f_ldays").value)||1;
  if(!fromRaw){ showToast("Please select a start date.", true); return; }
  const fmtDate = d => new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  state.leaveRequests.push({emp:emp.name, type, from:fmtDate(fromRaw), to:fmtDate(toRaw||fromRaw), days, status:"Pending"});
  showToast("Leave request submitted for manager approval.");
  closeModal(); render();
}
function openBankingModal(){
  const emp = state.employees.find(e=>e.id===currentEmployeeId);
  const body = `
    <p class="muted">Choose your bank of choice from all major South African banks — the branch code resolves automatically.</p>
    ${bankFieldsHtml("f_b", emp.banking)}
    <div class="note dev"><b>Maker/Checker Control</b>This change will not take effect on your payslip or the next payment batch until approved by a second authorised user.</div>
  `;
  openModal("Update Banking Details", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="submitBankingChange()">Submit for Approval</button>`);
}
function submitBankingChange(){
  const emp = state.employees.find(e=>e.id===currentEmployeeId);
  const banking = readBankFields("f_b");
  if(!banking){ showToast("Please select a bank and enter an account number.", true); return; }
  const id = state.pendingApprovals.length ? Math.max(...state.pendingApprovals.map(p=>p.id))+1 : 1;
  state.pendingApprovals.push({id, emp:emp.name, empId:emp.id, field:"Banking Details",
    detail:banking.bankName+" — account ending "+banking.accountNumber.slice(-4)+" ("+banking.accountType+")",
    status:"Pending", requested:"Today", newBanking:banking});
  showToast("Change submitted. Banking updates require a second authorised approver before they take effect.");
  closeModal(); render();
}
function approveRequest(id){
  const p = state.pendingApprovals.find(x=>x.id===id);
  p.status = "Approved";
  if(p.newBanking && p.empId){
    const emp = state.employees.find(e=>e.id===p.empId);
    if(emp) emp.banking = p.newBanking;
  }
  state.auditLog.unshift({ts:"Just now", user:"K. Tapamo", action:"Approved "+p.field+" change", emp:p.emp, verify:"Maker/Checker — approved"});
  showToast("Approved — banking record updated and will apply to the next payment batch.");
  render();
}
function rejectRequest(id){
  const p = state.pendingApprovals.find(x=>x.id===id);
  p.status = "Rejected";
  showToast("Request rejected.", true);
  render();
}


function openTraceModal(empId){
  const e = state.employees.find(x=>x.id===empId);
  const c = calcPayslip(e);
  const body = `
    <p class="muted">Every figure below is reproducible from the employee's recurring structure, this period's captured transactions, and the statutory rule version active at calculation time — nothing is entered directly onto the payslip.</p>
    <table class="data"><tr><th>Line Item</th><th>Amount</th><th>Source</th><th>Rule / Basis</th></tr>
    ${c.trace.map(t=>`<tr><td>${esc(t.label)}</td><td class="mono">${t.amount<0?"-":""}${fmt(Math.abs(t.amount))}</td><td>${esc(t.source)}</td><td class="muted">${esc(t.rule)}</td></tr>`).join("")}
    <tr><td><b>Net Pay</b></td><td colspan="3"><b>${fmt(c.net)}</b></td></tr>
    </table>
  `;
  openModal("Calculation Breakdown — "+e.name, body, `<button class="btn secondary" onclick="closeModal()">Close</button>`);
}


function leaveAction(i, status){ state.leaveRequests[i].status = status; showToast("Leave request "+status.toLowerCase()+"."); render(); }


function advanceRun(){
  const pr = state.payrollRun;
  const approveIndex = pr.stages.indexOf("Approve");
  const validateIndex = pr.stages.indexOf("Validate");
  if(pr.stageIndex === approveIndex - 1 && pr.exceptions.some(x=>!x.resolved && x.sev==="Critical")){
    showToast("Cannot proceed to Approve: a Critical exception is unresolved.", true); return;
  }
  if(pr.stageIndex < pr.stages.length-1){
    pr.stageIndex++;
    if(pr.stageIndex===validateIndex) pr.exceptions = computeExceptions();
  }
  render();
}
function resetRun(){
  state.payrollRun.stageIndex = 0;
  state.payrollRun.exceptions = [];
  state.payrollRun.excludedIds = [];
  render();
}
function resolveException(i){ state.payrollRun.exceptions[i].resolved = true; render(); }

/* ---------- Pay Period Update / Rollover (spec §29) ---------- */
function openClosePeriodModal(){
  const pr = state.payrollRun;
  const pb = state.paymentBatch;
  const checks = [
    {label:"Payroll approved", pass: pr.stageIndex >= pr.stages.indexOf("Approve")},
    {label:"Payslips generated", pass: pr.stageIndex >= pr.stages.indexOf("Payslips")},
    {label:"Bank file generated", pass: pb.stageIndex >= pb.stages.indexOf("Bank File")},
    {label:"Statutory data generated", pass: pr.stageIndex >= pr.stages.indexOf("Statutory")},
    {label:"Backup / archive point", pass: true, note:"Created automatically on close"},
  ];
  const allPass = checks.every(c=>c.pass);
  const nextCal = state.calendar[state.calendar.findIndex(c=>c.period===pr.period)+1];
  const body = `
    <table class="data"><tr><th>Precondition</th><th>Status</th></tr>
    ${checks.map(c=>`<tr><td>${esc(c.label)}${c.note?`<div class="muted">${esc(c.note)}</div>`:""}</td><td>${c.pass?badge("Met","green"):badge("Not met","red")}</td></tr>`).join("")}
    </table>
    ${allPass ? `<div class="note dev">Closing ${pr.period} will archive its results and ${nextCal?"open "+nextCal.period:"require a new period to be added to the calendar"}. Periodic transactions reset; recurring salary structures and leave balances carry forward unchanged.</div>`
      : `<div class="note" data-prototype-style="prototype-style-38"><b>Cannot close yet</b>Complete the outstanding preconditions above — including the Payments &amp; Banking workflow — before rolling to the next period.</div>`}
  `;
  openModal("Close Period & Roll Forward", body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     ${allPass ? `<button class="btn" onclick="closeModal();rollToNextPeriod();">Confirm Close &amp; Roll Forward</button>` : ""}`);
}
function rollToNextPeriod(){
  const pr = state.payrollRun;
  const pop = runPopulation();
  const gross = pop.reduce((s,e)=>s+grossFor(e),0);
  const net = pop.reduce((s,e)=>s+netFor(e),0);
  state.periodArchive.unshift({period:pr.period, employees:pop.length, gross, net, closedOn:"Today", closedBy:"K. Tapamo"});
  const calIdx = state.calendar.findIndex(c=>c.period===pr.period);
  if(calIdx>-1) state.calendar[calIdx].status = "Closed";
  const next = state.calendar[calIdx+1];
  if(!next){ showToast("No further periods configured in the calendar — add one under Payroll Calendar.", true); return; }
  next.status = "Open";
  pr.period = next.period;
  pr.stageIndex = 0;
  pr.exceptions = [];
  pr.excludedIds = [];
  state.paymentBatch = {id:"PB-"+next.period, stageIndex:0, stages: state.paymentBatch.stages};
  showToast("Period closed and archived. Now processing "+next.period+" — periodic transactions reset, recurring structures carried forward.");
  render();
}


function runValidation(){ state.bulkImport.validated = true; render(); }
function overrideRow(row){ state.bulkImport.rows.find(r=>r.row===row).resolved = true; render(); }
function commitImport(){ state.bulkImport.imported = true; showToast("Valid rows imported."); render(); }


function advancePayment(){ if(state.paymentBatch.stageIndex < state.paymentBatch.stages.length-1) state.paymentBatch.stageIndex++; render(); }





/* ============================ REPORTS ENGINE ============================ */
/* Each report resolves to a real table computed from live state — nothing here is placeholder
   text. Actions are gated by role: View is available to anyone with Reports access; Edit and
   Share are Exec/Admin only (Managers get Share on their own team reports). */
function reportData(key){
  const emps = activeEmployees();
  const term = companyEmployees().filter(e=>e.status==="Terminated");
  switch(key){
    case "Payroll Register":
      return {headers:["Employee","Dept","Gross","Deductions","Net"], rows: emps.map(e=>{const c=calcPayslip(e);
        return [e.name+" ("+e.id+")", e.dept, fmt(c.gross), fmt(c.totalDed), fmt(c.net)];})};
    case "Gross-to-Net Report":
      return {headers:["Employee","Gross","Net","Effective Deduction %"], rows: emps.map(e=>{const c=calcPayslip(e);
        return [e.name, fmt(c.gross), fmt(c.net), ((c.totalDed/c.gross)*100).toFixed(1)+"%"];})};
    case "Department Payroll": {
      const byDept = {};
      emps.forEach(e=>{ byDept[e.dept]=(byDept[e.dept]||0)+grossFor(e); });
      return {headers:["Department","Headcount","Gross Payroll"], rows:Object.keys(byDept).map(d=>[d, emps.filter(e=>e.dept===d).length, fmt(byDept[d])])};
    }
    case "Cost-Centre Payroll": {
      const byCC = {};
      emps.forEach(e=>{ byCC[e.cc]=(byCC[e.cc]||0)+grossFor(e); });
      return {headers:["Cost Centre","Headcount","Gross Payroll"], rows:Object.keys(byCC).map(c=>[c, emps.filter(e=>e.cc===c).length, fmt(byCC[c])])};
    }
    case "Employee Listing":
      return {headers:["Employee No.","Name","Title","Department","Status"], rows: companyEmployees().map(e=>[e.id, e.name, e.title, e.dept, e.status])};
    case "New Employees":
      return {headers:["Employee No.","Name","Title","Employment Date"], rows: companyEmployees().filter(e=>e.empDate>="2026-01-01").map(e=>[e.id, e.name, e.title, e.empDate])};
    case "Terminations":
      return {headers:["Employee No.","Name","Title","Status"], rows: term.map(e=>[e.id, e.name, e.title, "Terminated"])};
    case "Salary Changes":
      return {headers:["Timestamp","User","Action","Employee"], rows: state.auditLog.filter(a=>/salary|banking/i.test(a.action)).map(a=>[a.ts,a.user,a.action,a.emp])};
    case "Leave Balances":
      return {headers:["Employee","Annual","Sick","Family Responsibility"], rows: emps.map(e=>[e.name, e.leave.annual, e.leave.sick, e.leave.family])};
    case "Leave Liability":
      return {headers:["Employee","Annual Balance (days)","Daily Rate","Liability (R)"], rows: emps.map(e=>{
        const daily = e.basic/21.67; return [e.name, e.leave.annual, fmt(daily), fmt(daily*e.leave.annual)];})};
    case "Absence Report":
      return {headers:["Employee","Type","From","To","Days","Status"], rows: state.leaveRequests.filter(l=>l.type==="Sick Leave").map(l=>[l.emp,l.type,l.from,l.to,l.days,l.status])};
    case "PAYE Summary":
      return {headers:["Employee","Gross","PAYE","UIF"], rows: emps.map(e=>{const c=calcPayslip(e); return [e.name, fmt(c.gross), fmt(c.payeD), fmt(c.uifD)];})};
    case "EMP201/EMP501":
      return {headers:["Submission","Period","Status","Reference"], rows: state.sarsSubmissions.map(s=>[s.name,s.period,s.status,s.ref])};
    case "IRP5/IT3(a)":
      return {headers:["Employee","Tax Year","Certificate Status"], rows: companyEmployees().map(e=>[e.name, getActiveCompany().taxYear, e.status==="Active"?"Issued":"Issued (final)"])};
    default:
      return {headers:["Notice"], rows:[["No detailed dataset configured for this report in the prototype."]]};
  }
}
function openReportView(key){
  const d = reportData(key);
  const body = `<p class="muted">${esc(getActiveCompany().name)} — Period ${state.payrollRun.period}</p>` + table(d.headers, d.rows);
  openModal(key, body, `<button class="btn secondary" onclick="closeModal()">Close</button>
    <button class="btn" onclick="alert('Prototype: would export this exact view to PDF/Excel.')">Export</button>`);
}
function openReportEdit(key){
  const d = reportData(key);
  const body = `
    <p class="muted">Customise what this report shows for all users who view it.</p>
    ${field("Reporting Period", `<select id="f_redperiod"><option>${state.payrollRun.period} (current)</option><option>Year to date</option><option>Custom range</option></select>`)}
    <div class="field"><label>Columns Included</label>
      ${d.headers.map((h,i)=>`<div class="field checkrow"><input type="checkbox" checked id="f_recol${i}"> <label data-prototype-style="prototype-style-22">${esc(h)}</label></div>`).join("")}
    </div>
    ${field("Sort By", `<select id="f_resort">${d.headers.map(h=>`<option>${esc(h)}</option>`).join("")}</select>`)}
  `;
  openModal("Edit Report — "+key, body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="saveReportEdit('${key.replace(/'/g,"")}')">Save Report Configuration</button>`);
}
function saveReportEdit(key){
  state.reportConfigs = state.reportConfigs || {};
  state.reportConfigs[key] = {savedBy:"K. Tapamo", savedOn:"Today"};
  showToast("Report configuration saved for \""+key+"\" — applies next time anyone opens it.");
  closeModal(); render();
}
function openReportShare(key){
  const body = `
    ${field("Share With", `<select id="f_rsuser">
      ${state.users.map(u=>`<option value="${esc(u.email)}">${esc(u.name)} (${esc(u.role)})</option>`).join("")}
      <option value="__other__">Other email address…</option>
    </select>`)}
    ${field("Or enter an email", `<input type="text" id="f_rsemail" placeholder="name@example.com">`)}
    ${field("Format", `<select id="f_rsformat"><option>PDF</option><option>Excel (.xlsx)</option><option>CSV</option></select>`)}
    ${field("Message (optional)", `<input type="text" id="f_rsmsg" placeholder="e.g. For your review ahead of Friday's meeting">`)}
  `;
  openModal("Share Report — "+key, body,
    `<button class="btn secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" onclick="sendReportShare('${key.replace(/'/g,"")}')">Share Report</button>`);
}
function sendReportShare(key){
  const sel = document.getElementById("f_rsuser").value;
  const other = document.getElementById("f_rsemail").value.trim();
  const to = (sel==="__other__" ? other : sel) || other;
  if(!to){ showToast("Choose a recipient or enter an email address.", true); return; }
  const format = document.getElementById("f_rsformat").value;
  state.reportShares = state.reportShares || [];
  state.reportShares.unshift({report:key, to, format, sharedBy:"K. Tapamo", date:"Today"});
  state.auditLog.unshift({ts:"Just now", user:"K. Tapamo", action:"Shared report \""+key+"\" ("+format+")", emp:"N/A — "+to, verify:"Logged"});
  showToast("\""+key+"\" shared with "+to+" as "+format+".");
  closeModal(); render();
}









/* ============================ SETTINGS (universal to every role) ============================ */
function currentSessionUser(){
  if(state.role==="admin") return {...state.users[0], kind:"user"};
  if(state.role==="manager"){
    const u = state.users.find(x=>x.name===state.currentManager);
    return u ? {...u, kind:"user"} : {id:0, name:state.currentManager, email:state.currentManager.toLowerCase().replace(/[^a-z]/g,".")+"@sbi.co.za", username:state.currentManager.toLowerCase().replace(/\s+/g,"."), role:"Manager/Supervisor", status:"Active", kind:"synthetic"};
  }
  if(state.role==="auditor") return {id:0, name:"Compliance Auditor", email:"auditor@sbi.co.za", username:"auditor.readonly", role:"Auditor", status:"Active", kind:"synthetic"};
  const e = state.employees.find(x=>x.id===currentEmployeeId);
  return {id:e.id, name:e.name, email:e.name.toLowerCase().replace(/\s+/g,".")+"@sbi-employee.co.za", username:e.essAccount.username||"— not set —", role:"Employee", status:e.essAccount.status, kind:"employee"};
}

function changePassword(){
  const cur = document.getElementById("f_pwcurrent").value;
  const pw = document.getElementById("f_pwnew").value;
  const pw2 = document.getElementById("f_pwconfirm").value;
  const policy = state.passwordPolicy;
  if(!cur){ showToast("Enter your current password.", true); return; }
  if(pw.length < policy.minLength){ showToast("New password must be at least "+policy.minLength+" characters.", true); return; }
  if(policy.requireUpper && !/[A-Z]/.test(pw)){ showToast("New password must include an uppercase letter.", true); return; }
  if(policy.requireNumber && !/[0-9]/.test(pw)){ showToast("New password must include a number.", true); return; }
  if(policy.requireSymbol && !/[^A-Za-z0-9]/.test(pw)){ showToast("New password must include a special character.", true); return; }
  if(pw !== pw2){ showToast("New passwords do not match.", true); return; }
  const me = currentSessionUser();
  state.auditLog.unshift({ts:"Just now", user:me.username, action:"Password changed", emp:"N/A — own account", verify:"Policy enforced client-side"});
  showToast("Password updated.");
  render();
}
function toggleTwoFactor(username){
  state.twoFactorEnabled = state.twoFactorEnabled || {};
  state.twoFactorEnabled[username] = !state.twoFactorEnabled[username];
  showToast(state.twoFactorEnabled[username] ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
  render();
}
function setPref(username, key, val){
  state.notificationPrefs[username] = state.notificationPrefs[username] || {};
  state.notificationPrefs[username][key] = val;
}

/* Admin-only: System Configuration & Analytics (deep-dive drill-down per module) */

function savePolicy(){
  state.passwordPolicy = {
    minLength: Number(document.getElementById("f_polminlen").value)||8,
    sessionTimeoutMins: Number(document.getElementById("f_polsession").value)||30,
    expiryDays: Number(document.getElementById("f_polexpiry").value)||90,
    requireUpper: document.getElementById("f_polupper").checked,
    requireNumber: document.getElementById("f_polnumber").checked,
    requireSymbol: document.getElementById("f_polsymbol").checked,
    twoFactorRequired: document.getElementById("f_pol2fa").checked,
  };
  showToast("Security policy updated — applies to all future password changes and registrations.");
  render();
}



/* ============================ INIT ============================ */
 // seed initial demo state at the Validate stage





const notify = () => onChange();
function openModal(title, bodyHtml, footHtml) { modal = {title, bodyHtml, footHtml}; notify(); }
function closeModal() { modal=null; notify(); }
function showToast(msg, isErr=false) { const id=++toastId; toasts=[...toasts,{id,msg,isErr}]; notify(); setTimeout(()=>{toasts=toasts.filter(t=>t.id!==id);notify();},4200); }
function render() { notify(); }
function renderContextBar() { notify(); }
function renderNav() { notify(); }
function renderRoleSwitch() { notify(); }
function go(route) { currentRoute=route; render(); window.scrollTo(0,0); }
function switchRole(role) { state.role=role; currentRoute=role==='admin'?'dashboard':role==='manager'?'managerdashboard':role==='auditor'?'audit':'mydashboard'; if(role==='employee'&&!companyEmployees().some(e=>e.id===currentEmployeeId)) currentEmployeeId=companyEmployees()[0]?.id; render(); }
function resetDemo() { dialogs.confirm('Reset all demo data back to its original state?',()=>window.location.reload()); }
function openRegistrationPreview(kind, id){
  const person = kind==="user" ? state.users.find(u=>u.id===id) : state.employees.find(e=>e.id===id);
  const email = kind==="user" ? person.email : person.name.toLowerCase().replace(/[^a-z]/g,".")+"@sbi-employee.co.za";
  const suggestedUsername = kind==="user" ? person.email.split("@")[0] : person.name.toLowerCase().replace(/\s+/g,".");
  const pw = state.passwordPolicy;
  const reqs = [
    "At least "+pw.minLength+" characters",
    pw.requireUpper?"At least one uppercase letter":null,
    pw.requireNumber?"At least one number":null,
    pw.requireSymbol?"At least one special character":null,
  ].filter(Boolean);

  registration = `
    <div data-prototype-style="prototype-style-16">
      <div data-prototype-style="prototype-style-17">
        <div data-prototype-style="prototype-style-18">SBI &bull; PAYROLL</div>
        <div data-prototype-style="prototype-style-19">Account Setup</div>
      </div>
      <div data-prototype-style="prototype-style-20">
        <p data-prototype-style="prototype-style-21">Welcome, <b>${esc(person.name)}</b>. You've been invited to access ${esc(getActiveCompany().name)}'s payroll system as <b>${esc(kind==="user"?person.role:"Employee (Self-Service)")}</b>. Choose a username and password to activate your account.</p>
        ${field("Email", `<input type="text" value="${esc(email)}" readonly data-prototype-style="prototype-style-1">`)}
        ${field("Choose a Username", `<input type="text" id="reg_username" value="${esc(suggestedUsername)}">`)}
        ${field("Create Password", `<input type="password" id="reg_password" placeholder="Enter a password">`, reqs.join(" · "))}
        ${field("Confirm Password", `<input type="password" id="reg_password2" placeholder="Re-enter password">`)}
        <div class="field checkrow"><input type="checkbox" id="reg_terms"> <label data-prototype-style="prototype-style-22">I accept the Terms of Use and Privacy Policy (POPIA)</label></div>
        <button class="btn" data-prototype-style="prototype-style-23" onclick="completeRegistration('${kind}','${id}')">Activate Account</button>
        <button class="btn secondary" data-prototype-style="prototype-style-24" onclick="closeRegistrationPreview()">Cancel — Close This Preview</button>
        <div class="note dev" data-prototype-style="prototype-style-25"><b>Demo Note</b>In production this page is reached via a unique, time-limited link emailed to the person by the system — never a link an admin can generate on someone else's behalf without their email access.</div>
      </div>
    </div>`;
  notify();
}
function closeRegistrationPreview(){ registration=null; notify(); }
const scope = { state, TODAY, OCCUPATIONAL_LEVELS, bankCode, hasBanking, getActiveCompany, companyEmployees, activeEmployees, teamOf, managerList, activeRuleVersion, kpi, badge, table, stepper, note, actionTile, titleRow, field, bankFieldsHtml, readBankFields, periodicFor, calcPayslip, grossFor, totalDedFor, netFor, erContribFor, runPopulation, togglePopulation, computeExceptions, nextEmployeeId, nextCompanyId, nextUserId, confirmAction, getNav, switchCompany, openSwitchDemoUser, toggleNotif, openCompanyModal, saveCompany, deleteCompany, roleOptionsHtml, openUserModal, saveUser, deleteUser, completeRegistration, inviteToESS, viewEmployee, openEmployeeModal, saveEmployee, terminateEmployee, openPeriodicModal, savePeriodic, removePeriodic, switchManager, openLeaveModal, submitLeaveRequest, openBankingModal, submitBankingChange, approveRequest, rejectRequest, openTraceModal, leaveAction, advanceRun, resetRun, resolveException, openClosePeriodModal, rollToNextPeriod, runValidation, overrideRow, commitImport, advancePayment, reportData, openReportView, openReportEdit, saveReportEdit, openReportShare, sendReportShare, currentSessionUser, changePassword, toggleTwoFactor, setPref, savePolicy, get currentEmployeeId(){return currentEmployeeId;} };
const templates=createViewTemplates(scope);
const viewMap={dashboard:'renderDashboard',company:'renderCompany',users:'renderUsers',employees:'renderEmployees',calendar:'renderCalendar',earnings:'renderEarnings',deductions:'renderDeductions',rules:'renderRules',periodic:'renderPeriodicCapture',payslips:'renderPayslips',leave:'renderLeave',payrollrun:'renderPayrollRun',bulk:'renderBulk',payments:'renderPayments',sars:'renderSars',ee:'renderEE',reports:'renderReports',distribution:'renderDistribution',selfservice:'renderSelfService',accounting:'renderAccounting',audit:'renderAudit',mydashboard:'renderMyDashboard',managerdashboard:'renderManagerDashboard',team:'renderTeam',settings:'renderSettings',settingsanalytics:'renderSettingsAnalytics'};
Object.assign(actions,{ bankCode, hasBanking, getActiveCompany, companyEmployees, activeEmployees, teamOf, managerList, activeRuleVersion, kpi, badge, table, stepper, note, actionTile, titleRow, field, bankFieldsHtml, readBankFields, periodicFor, calcPayslip, grossFor, totalDedFor, netFor, erContribFor, runPopulation, togglePopulation, computeExceptions, nextEmployeeId, nextCompanyId, nextUserId, openModal, closeModal, showToast, confirmAction, resetDemo, getNav, renderRoleSwitch, switchRole, renderNav, go, renderContextBar, switchCompany, openSwitchDemoUser, toggleNotif, render, openCompanyModal, saveCompany, deleteCompany, roleOptionsHtml, openUserModal, saveUser, deleteUser, openRegistrationPreview, closeRegistrationPreview, completeRegistration, inviteToESS, viewEmployee, openEmployeeModal, saveEmployee, terminateEmployee, openPeriodicModal, savePeriodic, removePeriodic, switchManager, openLeaveModal, submitLeaveRequest, openBankingModal, submitBankingChange, approveRequest, rejectRequest, openTraceModal, leaveAction, advanceRun, resetRun, resolveException, openClosePeriodModal, rollToNextPeriod, runValidation, overrideRow, commitImport, advancePayment, reportData, openReportView, openReportEdit, saveReportEdit, openReportShare, sendReportShare, currentSessionUser, changePassword, toggleTwoFactor, setPref, savePolicy, state, bankCode });
state.payrollRun.exceptions=computeExceptions();
return {
 actions,
 snapshot(){
 const employee=state.employees.find(e=>e.id===currentEmployeeId);
 const notificationCount=state.role==='admin'?state.payrollRun.exceptions.filter(x=>!x.resolved).length+state.pendingApprovals.filter(p=>p.status==='Pending').length:state.role==='manager'?state.leaveRequests.filter(l=>l.status==='Pending'&&teamOf(state.currentManager).some(e=>e.name===l.emp)).length:state.role==='auditor'?state.pendingApprovals.filter(p=>p.status==='Pending').length:state.leaveRequests.filter(l=>l.emp===employee?.name&&l.status==='Pending').length;
 return {state,currentRoute,currentEmployeeId,employee,company:getActiveCompany(),nav:getNav(),label:ALL_LABELS[currentRoute],notificationCount,modal,registration,toasts,html:templates[viewMap[currentRoute]||'renderDashboard']()};
 }
};
}
