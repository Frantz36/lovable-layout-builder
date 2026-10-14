// Faithful view templates migrated from the supplied SBI Payroll V2.1 prototype.
export function createViewTemplates(scope) {
const { state, TODAY, OCCUPATIONAL_LEVELS, fmt, esc, bankCode, hasBanking, getActiveCompany, companyEmployees, activeEmployees, teamOf, managerList, activeRuleVersion, kpi, badge, table, stepper, note, actionTile, titleRow, field, bankFieldsHtml, readBankFields, periodicFor, calcPayslip, grossFor, totalDedFor, netFor, erContribFor, runPopulation, togglePopulation, computeExceptions, nextEmployeeId, nextCompanyId, nextUserId, confirmAction, getNav, switchCompany, openSwitchDemoUser, toggleNotif, openCompanyModal, saveCompany, deleteCompany, roleOptionsHtml, openUserModal, saveUser, deleteUser, completeRegistration, inviteToESS, viewEmployee, openEmployeeModal, saveEmployee, terminateEmployee, openPeriodicModal, savePeriodic, removePeriodic, switchManager, openLeaveModal, submitLeaveRequest, openBankingModal, submitBankingChange, approveRequest, rejectRequest, openTraceModal, leaveAction, advanceRun, resetRun, resolveException, openClosePeriodModal, rollToNextPeriod, runValidation, overrideRow, commitImport, advancePayment, reportData, openReportView, openReportEdit, saveReportEdit, openReportShare, sendReportShare, currentSessionUser, changePassword, toggleTwoFactor, setPref, savePolicy } = scope;
function renderDashboard(){
  const emps = activeEmployees();
  const gross = emps.reduce((s,e)=>s+grossFor(e),0);
  const ded = emps.reduce((s,e)=>s+totalDedFor(e),0);
  const net = gross - ded;
  const er = emps.reduce((s,e)=>s+erContribFor(e),0);
  const pendingApprovals = state.pendingApprovals.filter(p=>p.status==="Pending");
  const openPeriod = state.calendar.find(p=>p.status==="Open") || state.calendar[0];
  const payDate = new Date(openPeriod.pay);
  const daysToPay = Math.ceil((payDate-TODAY)/86400000);
  return `
  ${titleRow("Payroll Management Dashboard", "Pay Run "+state.payrollRun.period+" • "+getActiveCompany().name, "")}
  <div class="kpis">
    ${kpi("Employees Processed", emps.length+" / "+emps.length)}
    ${kpi("Gross Payroll", fmt(gross))}
    ${kpi("Net Payroll", fmt(net))}
    ${kpi("Employer Cost", fmt(er))}
  </div>
  <div class="card" data-prototype-style="prototype-style-7">
    <div data-prototype-style="prototype-style-8">
      <div><b data-prototype-style="prototype-style-5">Payroll Countdown</b><div class="muted" data-prototype-style="prototype-style-9">Next pay date: ${openPeriod.pay} — cut-off ${openPeriod.cutoff}</div></div>
      <div data-prototype-style="prototype-style-10">${daysToPay>=0?daysToPay+" days":"Paid"}</div>
    </div>
  </div>
  <div class="grid2">
    <div class="card"><h2 class="section" data-prototype-style="prototype-style-11">Compliance</h2>
      ${table(["Item","Status"],[
        ["PAYE / UIF / SDL", badge("Calculated","green")],
        ["EMP201 Due","07 Oct 2026"],
        ["Failed Submissions","0"],
      ])}
    </div>
    <div class="card"><h2 class="section" data-prototype-style="prototype-style-11">Workforce</h2>
      ${table(["Item","Value"],[
        ["Headcount", emps.length],
        ["Departments", getActiveCompany().departments],
        ["Branches", getActiveCompany().branches],
      ])}
    </div>
  </div>
  <div class="grid2">
    <div class="card"><h2 class="section" data-prototype-style="prototype-style-11">Leave</h2>
      ${table(["Item","Value"],[
        ["Pending Requests", state.leaveRequests.filter(l=>l.status==="Pending").length],
        ["Approved This Period", state.leaveRequests.filter(l=>l.status==="Approved").length],
      ])}
    </div>
    <div class="card"><h2 class="section" data-prototype-style="prototype-style-11">Payments</h2>
      ${table(["Item","Value"],[
        ["Batch Stage", state.paymentBatch.stages[state.paymentBatch.stageIndex]],
        ["Bank Files Generated", state.paymentBatch.stageIndex>=4 ? "1" : "0"],
      ])}
    </div>
  </div>
  <div class="card">
    <h2 class="section" data-prototype-style="prototype-style-11">Pending Approvals Queue (Maker/Checker)</h2>
    ${pendingApprovals.length ? table(["Employee","Field","Detail","Requested","Action"], pendingApprovals.map(p=>[
      esc(p.emp), esc(p.field), esc(p.detail), p.requested,
      `<button class="btn small" onclick="approveRequest(${p.id})">Approve</button> <button class="btn small danger" onclick="rejectRequest(${p.id})">Reject</button>`
    ])) : "<div class='muted'>No pending approvals — queue is clear.</div>"}
  </div>
  <div class="card">
    <h2 class="section" data-prototype-style="prototype-style-11">Gross Payroll Trend (6 months, illustrative)</h2>
    <div class="bars">
      ${[62,64,66,68,70,72].map((v,i)=>`<div class="bar" style="height:${(v-55)*7}px;"><span>${["Apr","May","Jun","Jul","Aug","Sep"][i]}</span></div>`).join("")}
    </div>
  </div>
  ${note("Data note","All figures on this screen are computed live from the Employee, Leave and Payroll Run data — nothing here is a separately maintained summary. Add or edit an employee and these numbers move immediately.","dev")}
  `;
}

function renderCompany(){
  const co = getActiveCompany();
  return `
  ${titleRow("Companies", "Each company holds fully isolated payroll data and configuration", `<button class="btn" onclick="openCompanyModal()">+ Add Company</button>`)}
  ${table(["Company","PAYE Ref","Tax Year","Employees","Status",""], state.companies.map(c=>{
    const empCount = state.employees.filter(e=>e.companyId===c.id).length;
    return [
      (c.id===state.activeCompanyId?"<b>":"")+esc(c.name)+(c.id===state.activeCompanyId?" "+badge("Active","gold")+"</b>":""),
      `<span class="mono">${c.paye}</span>`, c.taxYear, empCount+" employee(s)",
      c.id===state.activeCompanyId?badge("Viewing","green"):`<button class="btn small secondary" onclick="switchCompany('${c.id}')">Switch to this</button>`,
      `<button class="btn ghost small" onclick="openCompanyModal('${c.id}')">Edit</button> <button class="btn ghost small" data-prototype-style="prototype-style-12" onclick="deleteCompany('${c.id}')">Delete</button>`
    ];
  }))}

  <h2 class="section">Active Company Profile — ${esc(co.name)}</h2>
  <div class="card">
    <div class="field-grid">
      <div class="field"><label>PAYE Reference Number</label><div class="val">${co.paye}</div></div>
      <div class="field"><label>UIF Reference Number</label><div class="val">${co.uif}</div></div>
      <div class="field"><label>SDL Reference Number</label><div class="val">${co.sdl}</div></div>
      <div class="field"><label>OID/COID Registration Number</label><div class="val">${co.oid||"—"}</div></div>
      <div class="field"><label>Company Registration No.</label><div class="val">${co.regNo}</div></div>
      <div class="field"><label>Tax Year</label><div class="val">${co.taxYear} (1 Mar – 28 Feb)</div></div>
      <div class="field"><label>Financial Year End</label><div class="val">28 February</div></div>
    </div>
  </div>
  <h2 class="section">Organisational Structure</h2>
  <div class="kpis">
    ${kpi("Departments", co.departments)}
    ${kpi("Branches", co.branches)}
    ${kpi("Cost Centres", co.costCentres)}
    ${kpi("Job Codes", co.jobCodes||0)}
    ${kpi("Pay Points", co.payPoints||0)}
  </div>
  <div class="card">
    <div data-prototype-style="prototype-style-13">
      <div><b data-prototype-style="prototype-style-14">Payroll Administrators & Roles</b><div class="muted">Manage who can access this company's payroll</div></div>
      <button class="btn secondary" onclick="go('users')">Manage Users &rarr;</button>
    </div>
  </div>
  ${note("Business rule","Switching the active company reloads a fully isolated configuration set — no cross-company data leakage. A company cannot be deleted while it still has employee records.","dev")}
  `;
}

function renderUsers(){
  const invited = state.users.filter(u=>u.status==="Invited");
  return `
  ${titleRow("Users & Roles", "System users who can access payroll functions, and their permission scope", `<button class="btn" onclick="openUserModal()">+ Invite User</button>`)}
  ${table(["Name","Email","Username","Role","Scope","Status",""], state.users.map(u=>[
    esc(u.name), esc(u.email), u.username?`<span class="mono">${esc(u.username)}</span>`:"<span class='muted'>— pending setup —</span>",
    esc(u.role), esc(u.scope), badge(u.status, u.status==="Active"?"green":u.status==="Invited"?"gold":"red"),
    `<button class="btn ghost small" onclick="openUserModal(${u.id})">Edit</button>
     ${u.status==="Invited"?`<button class="btn ghost small" onclick="openRegistrationPreview('user',${u.id})">Open Registration Link</button>`:""}
     <button class="btn ghost small" data-prototype-style="prototype-style-12" onclick="deleteUser(${u.id})">Remove</button>`
  ]))}
  ${invited.length ? note("Pending Setup", invited.length+" user(s) have been invited but have not yet completed account setup. Use \"Open Registration Link\" to preview what they'll see when they click the link in their email.","dev") : ""}
  ${note("Segregation of duties","A Payroll Administrator (prepares) and a Payroll Manager (approves) should never be the same person for a given company — enforced at workflow level in Payroll Run and Payment Batch approvals. The Auditor role is read-only across every module by design.","dev")}
  `;
}

function renderEmployees(){
  const emp = state.employees.find(e=>e.id===scope.currentEmployeeId && e.companyId===state.activeCompanyId) || companyEmployees()[0];
  const q = state.employeeSearch.toLowerCase();
  const list = companyEmployees().filter(e => !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q));
  return `
  ${titleRow("Employee Master Data", getActiveCompany().name+" — "+companyEmployees().length+" employee record(s)", `<button class="btn" onclick="openEmployeeModal()">+ Add Employee</button>`)}
  <input class="searchbox" placeholder="Search by name, number or department..." value="${esc(state.employeeSearch)}" oninput="state.employeeSearch=this.value;render();">
  <table class="data"><tr><th>Employee No.</th><th>Name</th><th>Job Title</th><th>Department</th><th>Bank</th><th>Status</th><th></th></tr>
  ${list.map(e=>`<tr class="clickable ${e.status!=='Active'?'inactive':''}" onclick="viewEmployee('${e.id}')">
    <td><span class="mono">${e.id}</span></td><td>${esc(e.name)}</td><td>${esc(e.title)}</td><td>${esc(e.dept)}</td>
    <td>${hasBanking(e)?esc(e.banking.bankName):badge("Not captured","red")}</td>
    <td>${badge(e.status, e.status==="Active"?"green":"red")}</td>
    <td onclick="event.stopPropagation();"><button class="btn ghost small" onclick="openEmployeeModal('${e.id}')">Edit</button>
    ${e.status==="Active"?`<button class="btn ghost small" data-prototype-style="prototype-style-12" onclick="terminateEmployee('${e.id}')">Terminate</button>`:""}</td>
  </tr>`).join("") || `<tr><td colspan="7" class="muted">No employees match your search.</td></tr>`}
  </table>

  ${emp ? `
  <h2 class="section">Employee Profile — ${esc(emp.name)} (${emp.id}) ${emp.status!=="Active"?badge(emp.status,"red"):""}</h2>
  <div class="tabbar">
    ${["Personal","Employment","Salary Structure","Banking","Tax","Leave","Audit Trail"].map((t,i)=>`<div class="tab ${i===1?'active':''}">${t}</div>`).join("")}
  </div>
  <div class="card">
    <div class="field-grid">
      <div class="field"><label>Employee Number</label><div class="val">${emp.id}</div></div>
      <div class="field"><label>Job Title</label><div class="val">${esc(emp.title)}</div></div>
      <div class="field"><label>Department / Branch</label><div class="val">${esc(emp.dept)} / ${esc(emp.branch)}</div></div>
      <div class="field"><label>Cost Centre</label><div class="val">${emp.cc}</div></div>
      <div class="field"><label>Occupational Level (EE)</label><div class="val">${esc(emp.occLevel||"—")}</div></div>
      <div class="field"><label>Employment Date</label><div class="val">${emp.empDate}</div></div>
      <div class="field"><label>Employment Type</label><div class="val">${esc(emp.type)}</div></div>
      <div class="field"><label>Manager / Supervisor</label><div class="val">${esc(emp.manager)}</div></div>
      <div class="field"><label>Employment Status</label><div class="val">${badge(emp.status,emp.status==="Active"?"green":"red")}</div></div>
      <div class="field"><label>Basic Salary</label><div class="val">${fmt(emp.basic)}</div></div>
      <div class="field"><label>Current Net Pay (estimate)</label><div class="val">${fmt(netFor(emp))}</div></div>
      <div class="field"><label>Banking</label><div class="val">${hasBanking(emp)?esc(emp.banking.bankName)+" • Branch "+esc(emp.banking.branchCode)+" • •••• "+emp.banking.accountNumber.slice(-4):badge("Missing — will block payroll finalisation","red")}</div></div>
      <div class="field"><label>Self-Service Account</label><div class="val">
        ${emp.essAccount.status==="Active" ? badge("Active — "+emp.essAccount.username,"green") :
          emp.essAccount.status==="Invited" ? badge("Invited — awaiting setup","gold")+` <button class="btn ghost small" onclick="openRegistrationPreview('employee','${emp.id}')">Open Registration Link</button>` :
          badge("Not invited","red")+` <button class="btn ghost small" onclick="inviteToESS('${emp.id}')">Invite to Self-Service</button>`}
      </div></div>
    </div>
    <button class="btn secondary small" onclick="openEmployeeModal('${emp.id}')">Edit This Employee</button>
    <button class="btn secondary small" onclick="go('payslips')">View Payslip</button>
  </div>` : ""}
  ${note("Access control","ID number, banking & tax fields are masked by default for users without EMPLOYEE_PII_VIEW permission. Termination is a soft delete — records are retained for statutory history.","dev")}
  `;
}

function renderCalendar(){
  return `
  ${titleRow("Payroll Calendar — "+getActiveCompany().taxYear+" Tax Year", "Frequency: Monthly (weekly & fortnightly configured separately for wage staff)", "")}
  ${table(["Period","Start","End","Cut-off","OT Cut-off","Pay Date","Status"], state.calendar.map(p=>[
    p.period,p.start,p.end,p.cutoff,p.ot,p.pay,
    badge(p.status, p.status==="Open"?"gold":p.status==="Closed"?"navy":"navy")
  ]))}
  <div class="kpis">
    ${kpi("Next SARS EMP201 Deadline","07 Oct 2026")}
    ${kpi("Public Holidays This Period","1 (24 Sep)")}
    ${kpi("Leave Cut-off","20th of month")}
  </div>
  <h2 class="section">Closed Period History</h2>
  ${state.periodArchive.length ? table(["Period","Employees","Gross Payroll","Net Payroll","Closed On","Closed By"], state.periodArchive.map(a=>[
    a.period, a.employees, fmt(a.gross), fmt(a.net), a.closedOn, esc(a.closedBy)
  ])) : "<div class='muted'>No periods closed yet — close one from the Payroll Run screen once its workflow is complete.</div>"}
  ${note("Business rule","System auto-assigns each employee to a period from employment date + frequency; cut-offs cascade to overtime, leave and bulk-import windows. Closed periods remain visible for audit and reporting but are protected from ordinary editing.","dev")}
  `;
}

function renderEarnings(){
  return `
  ${titleRow("Earnings & Benefits Structure", "Configurable rules engine — not hard-coded salary types", "")}
  <h2 class="section">Earning Types</h2>
  ${table(["Earning Type","Taxable","UIF","SDL","Pensionable","On Payslip","IRP5 Code"], state.earningTypes.map(e=>[
    esc(e.name), e.taxable, e.uif, e.sdl, e.pensionable, e.payslip, `<span class="mono">${e.irp5}</span>`
  ]))}
  <h2 class="section">Benefit Types</h2>
  ${table(["Benefit","Employee Contribution","Employer Contribution","Taxable Benefit","Fringe Code"], state.benefitTypes.map(b=>[
    esc(b.name), b.empC, b.erC, b.taxable, `<span class="mono">${b.code}</span>`
  ]))}
  ${note("Effective dating","Each rule change applies from a specific effective date without altering already-finalised pay runs.","dev")}
  `;
}

function renderDeductions(){
  return `
  ${titleRow("Deduction Engine", "Statutory + voluntary deductions, with effective dates, limits, priorities & calculation rules", "")}
  ${table(["Priority","Deduction","Type","Rule","Limit"], state.deductionTypes.map(d=>[
    d.priority, esc(d.name), d.type, esc(d.rule), d.limit
  ]))}
  ${note("Insufficient-funds rule","If net pay can't cover all deductions: statutory deductions are honoured in full first, then court orders in priority order, then voluntary deductions are reduced or deferred with an exception flag.","dev")}
  `;
}

function renderRules(){
  return `
  ${titleRow("Statutory Rules Engine — Version Control", "Controlled updates to tax tables, rebates and thresholds — never hard-coded", "")}
  ${table(["Rule Set","Version","Effective From","Effective To","Status","Used In"], state.ruleVersions.map(r=>[
    esc(r.name), `<span class="mono">${r.version}</span>`, r.from, r.to, badge(r.status, r.status==="Active"?"green":"navy"), r.used
  ]))}
  ${note("Why this matters","Every payroll calculation records which tax-rule version was used — critical for historical recalculation and SARS audits.","dev")}
  `;
}

function renderPeriodicCapture(){
  const period = state.payrollRun.period;
  const emps = activeEmployees();
  const all = state.periodicTransactions.filter(t=>t.period===period && emps.some(e=>e.id===t.employeeId));
  const totalEarn = all.filter(t=>t.type==="earning").reduce((s,t)=>s+t.amount,0);
  const totalDed = all.filter(t=>t.type==="deduction").reduce((s,t)=>s+t.amount,0);
  const locked = state.payrollRun.stageIndex >= state.payrollRun.stages.indexOf("Finalise");
  return `
  ${titleRow("Periodic Capture — Period "+period, "Overtime, bonuses and ad-hoc items for this period only. Recurring salary structure lives on the Employee record and is not touched here.", "")}
  <div class="kpis">
    ${kpi("Transactions Captured", all.length)}
    ${kpi("Total Periodic Earnings", fmt(totalEarn))}
    ${kpi("Total Periodic Deductions", fmt(totalDed))}
  </div>
  ${locked ? note("Period locked","This period has moved into Finalise or beyond — periodic transactions are read-only. New items will apply to the next period once opened.","dev") : ""}
  <table class="data"><tr><th>Employee</th><th>Recurring Basic</th><th>Periodic Earnings</th><th>Periodic Deductions</th><th>Net Impact</th><th></th></tr>
  ${emps.map(e=>{
    const pt = periodicFor(e.id, period);
    const earn = pt.filter(t=>t.type==="earning").reduce((s,t)=>s+t.amount,0);
    const ded = pt.filter(t=>t.type==="deduction").reduce((s,t)=>s+t.amount,0);
    return `<tr><td>${esc(e.name)} <span class="muted">(${e.id})</span></td><td>${fmt(e.basic)}</td>
    <td>${earn?fmt(earn):"—"}</td><td>${ded?fmt(ded):"—"}</td><td>${fmt(earn-ded)}</td>
    <td>${locked?"":`<button class="btn small" onclick="openPeriodicModal('${e.id}')">+ Add</button>`}</td></tr>`;
  }).join("")}
  </table>
  <h2 class="section">Captured Transactions — ${period}</h2>
  ${all.length ? table(["Employee","Type","Description","Amount","Captured By","Date",""], all.map(t=>{
    const emp = state.employees.find(x=>x.id===t.employeeId);
    return [esc(emp?emp.name:t.employeeId), badge(t.type==="earning"?"Earning":"Deduction", t.type==="earning"?"green":"red"),
      esc(t.label), (t.type==="deduction"?"-":"")+fmt(t.amount), esc(t.capturedBy), t.capturedAt,
      locked?"—":`<button class="btn ghost small" data-prototype-style="prototype-style-12" onclick="removePeriodic(${t.id})">Remove</button>`];
  })) : "<div class='muted'>No periodic transactions captured for this period yet.</div>"}
  ${note("Rollover behaviour","These transactions are scoped to "+period+" only. When the period is closed and rolled forward, this list resets to empty for the next period — the recurring structure on each employee's record carries forward unchanged.","dev")}
  `;
}

function renderManagerDashboard(){
  const mgr = state.currentManager;
  const team = teamOf(mgr);
  const teamGross = team.reduce((s,e)=>s+grossFor(e),0);
  const teamOvertime = team.reduce((s,e)=>s+calcPayslip(e).periodicEarnings,0);
  const pendingLeave = state.leaveRequests.filter(l=>l.status==="Pending" && team.some(e=>e.name===l.emp));
  return `
  <div class="hero">
    <h1>Good morning, ${esc(mgr)}</h1>
    <p>You manage ${team.length} team member(s) across ${[...new Set(team.map(e=>e.branch))].join(", ")||"—"}.</p>
  </div>
  <div class="kpis">
    ${kpi("Team Size", team.length)}
    ${kpi("Pending Leave Approvals", pendingLeave.length, {onclick:"go('leave')"})}
    ${kpi("Team Gross Payroll (period)", fmt(teamGross))}
    ${kpi("Team Periodic Earnings (period)", fmt(teamOvertime))}
  </div>
  <h2 class="section">Team Roster</h2>
  ${table(["Employee No.","Name","Job Title","Branch","Status"], team.map(e=>[
    `<span class="mono">${e.id}</span>`, esc(e.name), esc(e.title), esc(e.branch), badge(e.status,"green")
  ]))}
  <h2 class="section">Pending Leave Requests From Your Team</h2>
  ${pendingLeave.length ? table(["Employee","Type","From","To","Days","Action"], pendingLeave.map(l=>{
    const idx = state.leaveRequests.indexOf(l);
    return [esc(l.emp), esc(l.type), l.from, l.to, l.days,
      `<button class="btn small" onclick="leaveAction(${idx},'Approved')">Approve</button> <button class="btn small danger" onclick="leaveAction(${idx},'Declined')">Decline</button>`];
  })) : "<div class='muted'>No pending requests from your team.</div>"}
  <div class="action-row">
    ${actionTile("&#128203;","Review Full Leave Queue","go('leave')")}
    ${actionTile("&#128101;","View Full Team","go('team')")}
    ${actionTile("&#128202;","Team Reports","go('reports')")}
  </div>
  ${note("Access scope","Managers only see team members within their own reporting line — enforced at the data layer, not just hidden in the UI. Use the Team selector at the top to demo a different manager.","dev")}
  `;
}

function renderTeam(){
  const team = teamOf(state.currentManager);
  return `
  ${titleRow("My Team — "+state.currentManager, "Employees within your reporting line only", "")}
  ${table(["Employee No.","Name","Job Title","Department","Branch","Leave Balance","Status"], team.map(e=>[
    `<span class="mono">${e.id}</span>`, esc(e.name), esc(e.title), esc(e.dept), esc(e.branch), e.leave.annual+" days annual", badge(e.status,"green")
  ]))}
  <div class="action-row">
    ${actionTile("&#128203;","Approve Leave","go('leave')")}
    ${actionTile("&#128179;","View Team Payslips","go('payslips')")}
  </div>
  `;
}

function renderMyDashboard(){
  const emp = state.employees.find(e=>e.id===scope.currentEmployeeId) || companyEmployees()[0];
  const nextPeriod = state.calendar.find(p=>p.status==="Open") || state.calendar[0];
  const net = netFor(emp), gross = grossFor(emp), er = erContribFor(emp);
  const myLeave = state.leaveRequests.filter(l=>l.emp===emp.name);
  const total = emp.leave.annual + emp.leave.sick + emp.leave.family;
  return `
  <div class="hero">
    <h1>Welcome back, ${esc(emp.name.split(' ').slice(-1)[0])}</h1>
    <p>${esc(emp.title)} &bull; ${esc(emp.dept)} &bull; ${esc(emp.branch)}</p>
  </div>
  <div class="kpis">
    ${kpi("Next Pay Date", nextPeriod.pay)}
    ${kpi("Estimated Net Pay", fmt(net), {onclick:"go('payslips')"})}
    ${kpi("Annual Leave Balance", emp.leave.annual+" days", {onclick:"go('leave')"})}
    ${kpi("Employer Is Contributing", fmt(er)+" / period")}
  </div>

  <h2 class="section">Quick Actions</h2>
  <div class="action-row">
    ${actionTile("&#128196;","View Latest Payslip","go('payslips')")}
    ${actionTile("&#127796;","Apply for Leave","openLeaveModal()")}
    ${actionTile("&#128179;","Update Banking Details","openBankingModal()")}
    ${actionTile("&#128190;","Download Tax Certificate","alert('Prototype: would generate IRP5/IT3(a) as PDF from the finalised EMP501 reconciliation for the selected tax year.')")}
  </div>

  <div class="grid2">
    <div class="card">
      <h2 class="section" data-prototype-style="prototype-style-11">This Period's Pay Summary</h2>
      ${table(["Item","Amount"],[
        ["Gross Pay", fmt(gross)],
        ["Total Deductions", fmt(totalDedFor(emp))],
        ["<b>Net Pay</b>", "<b>"+fmt(net)+"</b>"],
      ])}
      <div class="muted" data-prototype-style="prototype-style-28">Pay period ${nextPeriod.start} – ${nextPeriod.end}, paid ${nextPeriod.pay}.</div>
    </div>
    <div class="card">
      <h2 class="section" data-prototype-style="prototype-style-11">Leave Balances</h2>
      <div class="leavebar">
        <div style="width:${(emp.leave.annual/total*100).toFixed(0)}%;background:var(--gold);">${emp.leave.annual}d</div>
        <div style="width:${(emp.leave.sick/total*100).toFixed(0)}%;background:var(--navy);">${emp.leave.sick}d</div>
        <div style="width:${(emp.leave.family/total*100).toFixed(0)}%;background:var(--grey-text);">${emp.leave.family}d</div>
      </div>
      <div class="muted">
        <span data-prototype-style="prototype-style-5">&#9632;</span> Annual &nbsp;
        <span data-prototype-style="prototype-style-14">&#9632;</span> Sick &nbsp;
        <span data-prototype-style="prototype-style-29">&#9632;</span> Family Responsibility
      </div>
    </div>
  </div>

  <h2 class="section">My Notifications</h2>
  <div class="card">
    ${myLeave.length ? myLeave.map(l=>`
      <div class="notif"><div class="ic">${l.status==="Approved"?"&#9989;":l.status==="Declined"?"&#10060;":"&#9203;"}</div>
      <div class="txt">${esc(l.type)} (${l.from} – ${l.to}) is <b>${l.status}</b><div class="t">${l.days} day(s)</div></div></div>
    `).join("") : "<div class='muted'>No recent leave activity.</div>"}
    <div class="notif"><div class="ic">&#128196;</div><div class="txt">Your ${state.payrollRun.period} payslip is ready to view<div class="t">Generated on finalisation</div></div></div>
  </div>

  <h2 class="section">My Benefits</h2>
  ${table(["Benefit","My Contribution","Employer Contribution"], state.benefitTypes.slice(0,2).map(b=>[esc(b.name), b.empC, b.erC]))}

  ${note("What you can see","Your dashboard only shows your own payroll, leave and benefit data — the same self-service permission boundary applies whether you're viewing this on desktop or mobile.","dev")}
  `;
}

function renderPayslips(){
  const pool = state.role==="employee" ? [state.employees.find(e=>e.id===scope.currentEmployeeId)] :
               state.role==="manager" ? teamOf(state.currentManager) : companyEmployees();
  const e = pool.find(x=>x && x.id===scope.currentEmployeeId) || pool[0];
  if(!e) return titleRow("Payslips", "No employees to show.", "");
  const c = calcPayslip(e);
  const pt = c.transactions;
  const earnRows = [["Basic Salary", fmt(e.basic), "PAYE", fmt(c.payeD)], ["Travel Allowance", fmt(e.travel), "UIF", fmt(c.uifD)]];
  const dedExtra = [];
  pt.forEach(t=>{ if(t.type==="earning") earnRows.push([esc(t.label), fmt(t.amount), "", ""]); else dedExtra.push([esc(t.label), fmt(t.amount)]); });
  earnRows.push(["","", "Pension Fund", fmt(c.pension)]);
  earnRows.push(["","", "Medical Aid", c.medical?fmt(c.medical):"—"]);
  dedExtra.forEach(d=>earnRows.push(["","", d[0], d[1]]));
  return `
  ${titleRow(state.role==="employee"?"My Payslip":"Payslip Preview", "Period "+state.payrollRun.period+" — use the employee selector above to switch", "")}
  <div class="card" data-prototype-style="prototype-style-30">
    <div data-prototype-style="prototype-style-31">
      ${esc(getActiveCompany().name.toUpperCase())} — PAYSLIP
    </div>
    <div class="muted" data-prototype-style="prototype-style-32">${esc(e.name)} | ${e.id} | ID: 89**********08 | Tax No: 91********2<br>
    Pay Period: ${state.payrollRun.period} | Pay Date: 25 Sep 2026 | ${esc(e.title)}, ${esc(e.dept)}</div>
    ${table(["Earnings","Amount","Deductions","Amount"], earnRows)}
    <div data-prototype-style="prototype-style-33">Gross Pay: ${fmt(c.gross)}</div>
    <div data-prototype-style="prototype-style-34">Total Deductions: ${fmt(c.totalDed)}</div>
    <div data-prototype-style="prototype-style-35">
      NET PAY: ${fmt(c.net)}
    </div>
  </div>
  <div>
    <button class="btn" onclick="alert('Prototype: PDF generation would render this template server-side and store it against the finalised pay run.')">Download PDF</button>
    <button class="btn secondary" onclick="openTraceModal('${e.id}')">View Calculation Breakdown</button>
    ${state.role!=="employee" ? `<button class="btn secondary" onclick="go('distribution')">View Distribution Status</button>` : ""}
  </div>
  `;
}

function renderLeave(){
  const role = state.role;
  const emp = state.employees.find(e=>e.id===scope.currentEmployeeId) || companyEmployees()[0];
  let requests = state.leaveRequests.slice();
  let showApprove = false, heading = "Leave Management", sub = "Approved leave automatically feeds relevant payroll calculations";
  let kpiHtml = "";

  if(role==="employee"){
    requests = requests.filter(l=>l.emp===emp.name);
    heading = "My Leave"; sub = "Your requests and balances";
    kpiHtml = `<div class="kpis">
      ${kpi("Annual Leave", emp.leave.annual+" days")}
      ${kpi("Sick Leave", emp.leave.sick+" days")}
      ${kpi("Family Responsibility", emp.leave.family+" days")}
    </div>
    <button class="btn" onclick="openLeaveModal()">+ Apply for Leave</button>`;
  } else if(role==="manager"){
    const team = teamOf(state.currentManager);
    requests = requests.filter(l=>team.some(e=>e.name===l.emp));
    showApprove = true;
    heading = "Leave Approvals — Team of "+state.currentManager;
    sub = "Only requests from your direct reports are shown";
    kpiHtml = `<div class="kpis">
      ${kpi("Pending", requests.filter(r=>r.status==="Pending").length)}
      ${kpi("Approved", requests.filter(r=>r.status==="Approved").length)}
      ${kpi("Team Size", team.length)}
    </div>`;
  } else {
    showApprove = true;
    const emps = activeEmployees();
    kpiHtml = `<div class="kpis">
      ${kpi("Pending (This Company)", requests.filter(r=>r.status==="Pending" && emps.some(e=>e.name===r.emp)).length)}
      ${kpi("Approved This Period", requests.filter(r=>r.status==="Approved" && emps.some(e=>e.name===r.emp)).length)}
      ${kpi("Avg. Annual Balance", emps.length ? (emps.reduce((s,e)=>s+e.leave.annual,0)/emps.length).toFixed(1)+" days" : "—")}
    </div>`;
    requests = requests.filter(r=>emps.some(e=>e.name===r.emp));
  }

  return `
  ${titleRow(heading, sub, "")}
  ${kpiHtml}
  <h2 class="section">Requests</h2>
  <table class="data"><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th>${showApprove?"<th>Action</th>":""}</tr>
  ${requests.length ? requests.map(l=>{
    const idx = state.leaveRequests.indexOf(l);
    return `<tr><td>${esc(l.emp)}</td><td>${esc(l.type)}</td><td>${l.from}</td><td>${l.to}</td><td>${l.days}</td>
    <td>${badge(l.status, l.status==="Approved"?"green":l.status==="Declined"?"red":"gold")}</td>
    ${showApprove ? `<td>${l.status==="Pending" ? `<button class="btn small" onclick="leaveAction(${idx},'Approved')">Approve</button> <button class="btn small danger" onclick="leaveAction(${idx},'Declined')">Decline</button>` : "—"}</td>` : ""}
    </tr>`;
  }).join("") : `<tr><td colspan="${showApprove?7:6}" class="muted">No requests to show.</td></tr>`}
  </table>
  ${note("Accrual rule","1.25 days/month annual leave; sick leave on a 36-month cycle; carry-over capped at 5 days into the new leave year.","dev")}
  `;
}

function renderPayrollRun(){
  const pr = state.payrollRun;
  const pop = runPopulation();
  const gross = pop.reduce((s,e)=>s+grossFor(e),0);
  const net = gross - pop.reduce((s,e)=>s+totalDedFor(e),0);
  const unresolvedCritical = pr.exceptions.some(x=>!x.resolved && x.sev==="Critical");
  const finaliseIdx = pr.stages.indexOf("Finalise");
  const lastIdx = pr.stages.length-1;
  const readyToClose = pr.stageIndex>=lastIdx;
  return `
  ${titleRow("Payroll Run — "+pr.period, "Controlled workflow; immutable after finalisation", "")}
  ${stepper(pr.stages, pr.stageIndex)}
  <div data-prototype-style="prototype-style-36">
    <button class="btn" ${pr.stageIndex>=lastIdx?"disabled":""} onclick="advanceRun()">
      Advance to: ${pr.stageIndex<lastIdx?pr.stages[pr.stageIndex+1]:"Complete"}
    </button>
    <button class="btn secondary" onclick="resetRun()">Reset Run</button>
  </div>

  <h2 class="section">Employee Population for This Run — ${pop.length} of ${activeEmployees().length} included</h2>
  <div class="card">
    ${activeEmployees().map(e=>`<label data-prototype-style="prototype-style-37">
      <input type="checkbox" ${state.payrollRun.excludedIds.includes(e.id)?"":"checked"} ${pr.stageIndex>0?"disabled":""} onchange="togglePopulation('${e.id}')"> ${esc(e.name)} <span class="muted">(${e.id})</span>
    </label>`).join("")}
    ${pr.stageIndex>0 ? `<div class="help">Population is locked once the run has moved past Select Population. Reset the run to change it.</div>` : ""}
  </div>

  <h2 class="section">Exception Report — ${pr.exceptions.filter(x=>!x.resolved).length} item(s) require attention</h2>
  ${pr.exceptions.length ? table(["Employee","Exception","Severity","Action","",""], pr.exceptions.map((x,i)=>[
    x.emp, esc(x.issue), badge(x.sev, x.sev==="Critical"?"red":"gold"), esc(x.action), "",
    x.resolved?badge("Resolved","green"):`<button class="btn small secondary" onclick="resolveException(${i})">Resolve</button>`
  ])) : "<div class='muted'>Run Validate to generate the exception report for this population.</div>"}
  <div class="kpis">
    ${kpi("Employees Processed", pop.length+" / "+pop.length)}
    ${kpi("Gross Payroll", fmt(gross))}
    ${kpi("Net Payroll", fmt(net))}
  </div>
  ${unresolvedCritical ? note("Blocked","A Critical exception must be resolved before this run can be approved.","dev") : ""}
  ${note("Immutability rule","A payroll run becomes immutable once finalised; corrections after that point require a controlled adjustment run.","dev")}

  ${readyToClose ? `
  <h2 class="section">Period Close-Out</h2>
  <div class="card">
    <p class="muted">This period has completed the full workflow. Closing it archives the results, carries forward recurring transactions and leave balances, and opens the next payroll period.</p>
    <button class="btn" onclick="openClosePeriodModal()">Close Period &amp; Roll Forward &rarr;</button>
  </div>` : ""}
  `;
}

function renderBulk(){
  const bi = state.bulkImport;
  const errors = bi.rows.filter(r=>r.type==="Error").length;
  const warnings = bi.rows.filter(r=>r.type==="Warning").length;
  const ready = companyEmployees().length - errors;
  return `
  ${titleRow("Bulk Payroll Processing", "Excel/CSV import with pre-validation before entering the payroll", "")}
  <div class="card">
    <div data-prototype-style="prototype-style-34">File: ${esc(bi.fileName)}</div>
    <div class="muted" data-prototype-style="prototype-style-39">249 rows detected &bull; Template: Bulk Salary Update v3</div>
    ${bi.validated ? badge("Validated with warnings","gold") : badge("Not yet validated","navy")}
  </div>
  ${!bi.validated ? `<button class="btn" onclick="runValidation()">Run Validation</button>` : `
  <h2 class="section">Validation Results</h2>
  ${table(["Row","Employee No.","Issue","Type","Resolution"], bi.rows.map(r=>[
    r.row, r.emp, esc(r.issue), badge(r.type, r.type==="Error"?"red":"gold"),
    r.type==="Warning" ? (r.resolved?badge("Overridden","green"):`<button class="btn small secondary" onclick="overrideRow(${r.row})">Override</button>`) : "Row excluded"
  ]))}
  <div class="kpis">
    ${kpi("Ready to Import", ready+" records")}
    ${kpi("Excluded (Errors)", errors+" records")}
    ${kpi("Warnings", warnings+" record(s)")}
  </div>
  <button class="btn" ${bi.imported?"disabled":""} onclick="commitImport()">${bi.imported?"Imported ✓":"Import Valid Rows"}</button>
  `}
  ${note("Validation gate","No row is imported silently past a validation error; rows are staged and validated before any live record is touched.","dev")}
  `;
}

function renderPayments(){
  const pb = state.paymentBatch;
  const emps = runPopulation();
  const net = emps.reduce((s,e)=>s+netFor(e),0);
  const withBanking = emps.filter(hasBanking);
  const missingBanking = emps.filter(e=>!hasBanking(e));
  const banks = [...new Set(withBanking.map(e=>e.banking.bankName))];
  const validationPass = missingBanking.length===0;
  return `
  ${titleRow("Payment Batch "+pb.id, "Payroll Finalised → Payment Batch → Maker Review → Authoriser Approval → Bank File → Bank Upload → Payment Confirmation → Reconciliation", "")}
  ${stepper(pb.stages, pb.stageIndex)}
  <button class="btn" ${pb.stageIndex>=pb.stages.length-1||!validationPass?"disabled":""} onclick="advancePayment()">
    Advance to: ${pb.stageIndex<pb.stages.length-1?pb.stages[pb.stageIndex+1]:"Complete"}
  </button>
  ${!validationPass ? note("Blocked", missingBanking.length+" employee(s) have no banking details captured and cannot be included in a bank file. Capture their banking details on the Employees screen first.","dev") : ""}
  <div class="kpis" data-prototype-style="prototype-style-40">
    ${kpi("Total Payment Value", fmt(net))}
    ${kpi("Employees in Batch", emps.length)}
    ${kpi("Bank Files Required", banks.length+" ("+banks.map(b=>b.split(" ")[0]).join(", ")+")")}
  </div>
  <h2 class="section">Duplicate &amp; Validation Checks</h2>
  ${table(["Check","Result"],[
    ["Duplicate payment protection", badge("Pass — no duplicates found","green")],
    ["Bank account / branch code validation", validationPass?badge("Pass — "+withBanking.length+"/"+emps.length+" valid","green"):badge("Fail — "+missingBanking.length+" missing","red")],
    ["Payment reference uniqueness", badge("Pass","green")],
    ["Authoriser ≠ Maker (segregation of duties)", badge("Pass — K. Tapamo (maker), L. Lekgetho (authoriser)","green")],
  ])}

  <h2 class="section">Bank File Preview — grouped by bank (one file generated per bank)</h2>
  ${banks.length ? banks.map(bankName=>{
    const group = withBanking.filter(e=>e.banking.bankName===bankName);
    const groupTotal = group.reduce((s,e)=>s+netFor(e),0);
    const code = bankCode(bankName);
    return `<div class="card">
      <div data-prototype-style="prototype-style-41">
        <div><b data-prototype-style="prototype-style-14">${esc(bankName)}</b> <span class="muted mono">Universal Branch Code ${esc(code)}</span></div>
        <div>${badge(group.length+" employee(s) — "+fmt(groupTotal),"navy")}</div>
      </div>
      ${table(["Employee","Account Number","Account Type","Amount"], group.map(e=>[
        esc(e.name)+" <span class='muted'>("+e.id+")</span>",
        "•••• "+e.banking.accountNumber.slice(-4), esc(e.banking.accountType), fmt(netFor(e))
      ]))}
    </div>`;
  }).join("") : "<div class='muted'>No employees with complete banking details in this run.</div>"}

  ${missingBanking.length ? `<div class="card" data-prototype-style="prototype-style-42">
    <b data-prototype-style="prototype-style-12">Excluded — Missing Banking Details</b>
    ${table(["Employee","Issue"], missingBanking.map(e=>[esc(e.name)+" ("+e.id+")", "No bank/account captured — will block payment batch"]))}
  </div>` : ""}

  ${note("Bank file format", "Bank-specific salary payment file formats are generated per configured bank profile via a pluggable adapter — one file per bank represented in the batch, not one generic format.","dev")}
  `;
}

function renderSars(){
  return `
  ${titleRow("SARS Reports & Submissions", "Complete submission history retained for audit", "")}
  ${table(["Submission","Period","Status","Reference","Date"], state.sarsSubmissions.map(s=>[
    esc(s.name), s.period, badge(s.status, s.status==="Submitted"||s.status==="Issued"?"green":"gold"), `<span class="mono">${s.ref}</span>`, s.date
  ]))}
  <div class="kpis">
    ${kpi("PAYE This Period", fmt(1014552))}
    ${kpi("UIF This Period", fmt(63240))}
    ${kpi("SDL This Period", fmt(31074.40))}
  </div>
  ${note("Exception handling","2 employees flagged with tax number mismatches against SARS records — routed to Payroll Manager for correction before next EMP201.","dev")}
  `;
}

function renderEE(){
  const emps = activeEmployees();
  const terminated = companyEmployees().filter(e=>e.status==="Terminated");
  const byLevel = OCCUPATIONAL_LEVELS.map(level=>({
    level,
    hc: emps.filter(e=>e.occLevel===level).length,
    term: terminated.filter(e=>e.occLevel===level).length,
  }));
  return `
  ${titleRow("Employment Equity & Workforce Reporting", getActiveCompany().name+" — computed live from each employee's Occupational Level field", "")}
  <div class="kpis">
    ${kpi("Total Headcount", emps.length)}
    ${kpi("Occupational Levels", OCCUPATIONAL_LEVELS.length+" configured")}
    ${kpi("Reporting Period", "Sep 2025 – Aug 2026")}
  </div>
  ${table(["Occupational Level","Headcount","Terminations (retained history)","% of Workforce"], byLevel.map(r=>[
    esc(r.level), r.hc, r.term, emps.length ? ((r.hc/emps.length)*100).toFixed(0)+"%" : "0%"
  ]))}
  <button class="btn" onclick="alert('Prototype: export would generate an EEA2-aligned dataset from employee master data.')">Export EE Report (EEA2)</button>
  ${note("Live data, not a parallel capture","This table reads the Occupational Level set on each Employee record — reassigning an employee's level on the Employees screen updates this report immediately, with no separate EE data entry.","dev")}
  `;
}

function renderReports(){
  const cats = [
    ["Payroll Reports",["Payroll Register","Gross-to-Net Report","Department Payroll","Cost-Centre Payroll"]],
    ["Employee Reports",["Employee Listing","New Employees","Terminations","Salary Changes"]],
    ["Leave Reports",["Leave Balances","Leave Liability","Absence Report"]],
    ["Statutory Reports",["PAYE Summary","EMP201/EMP501","IRP5/IT3(a)"]],
  ];
  const canEditShare = state.role==="admin";
  const shares = state.reportShares || [];
  return `
  ${titleRow("Reports & Analytics Library", canEditShare ? "View, edit or share any report — Exec/Admin has full control" : "View reports available to your role", "")}
  <div class="grid2">
  ${cats.map(([cat,items])=>`
    <div class="card">
      <div data-prototype-style="prototype-style-43">${cat}</div>
      ${items.map(it=>`<div data-prototype-style="prototype-style-44">
        <span>${esc(it)}${state.reportConfigs && state.reportConfigs[it]?" "+badge("Customised","gold"):""}</span>
        <span>
          <button class="btn ghost small" onclick="openReportView('${it.replace(/'/g,"")}')">View</button>
          ${canEditShare?`<button class="btn ghost small" onclick="openReportEdit('${it.replace(/'/g,"")}')">Edit</button>
          <button class="btn ghost small" onclick="openReportShare('${it.replace(/'/g,"")}')">Share</button>`:""}
        </span>
      </div>`).join("")}
    </div>`).join("")}
  </div>
  ${canEditShare ? `<h2 class="section">Recently Shared Reports</h2>
  ${shares.length ? table(["Report","Shared With","Format","Shared By","Date"], shares.map(s=>[esc(s.report), esc(s.to), s.format, esc(s.sharedBy), s.date]))
    : "<div class='muted'>No reports shared yet.</div>"}` : ""}
  ${note("Permission model","View is available to any role with Reports access. Edit and Share require Exec/Admin rights — Managers can view Team Reports but cannot redistribute company-wide data.","dev")}
  `;
}

function renderDistribution(){
  return `
  ${titleRow("Payslip Distribution — "+state.payrollRun.period, "Secure channels only: employee portal, encrypted email, mobile app", "")}
  <div class="kpis">
    ${kpi("Generated", state.distribution.length)}
    ${kpi("Delivered", state.distribution.filter(d=>d.delivered!=="Pending").length)}
    ${kpi("Viewed", state.distribution.filter(d=>d.viewed!=="Not yet viewed" && d.viewed!=="—").length)}
  </div>
  ${table(["Employee","Channel","Generated","Sent","Delivered","Viewed"], state.distribution.map(d=>[
    esc(d.emp), d.channel, d.gen, d.sent, d.delivered, d.viewed
  ]))}
  ${note("Security","No payroll data is sent via unencrypted channels; portal and app remain the default distribution method.","dev")}
  `;
}

function renderSelfService(){
  const emp = state.employees.find(e=>e.id===scope.currentEmployeeId) || companyEmployees()[0];
  return `
  ${titleRow("My Profile — "+emp.name, "Personal, payslip and leave information", "")}
  <div class="tabbar">${["My Payslips","Leave","Tax Certificates","Personal Details","Benefits"].map((t,i)=>`<div class="tab ${i===0?'active':''}">${t}</div>`).join("")}</div>
  ${table(["Period","Pay Date","Net Pay","Status",""],[
    ["Sep 2026","25 Sep 2026", fmt(netFor(emp)), badge("Available","green"), `<button class="btn small secondary" onclick="go('payslips')">View</button>`],
    ["Aug 2026","25 Aug 2026", fmt(netFor(emp)*0.99), badge("Available","green"), `<button class="btn small secondary">View</button>`],
  ])}
  <div class="action-row">
    ${actionTile("&#128179;","Update Banking Details","openBankingModal()")}
    ${actionTile("&#127796;","Apply for Leave","openLeaveModal()")}
  </div>
  `;
}

function renderAccounting(){
  const totalDr = state.journal.reduce((s,j)=>s+j.dr,0);
  const totalCr = state.journal.reduce((s,j)=>s+j.cr,0);
  return `
  ${titleRow("Payroll Journal — Period "+state.payrollRun.period, "Payroll → Payroll Journal → Accounting System → Bank Reconciliation", "")}
  ${table(["GL Account","Description","Debit","Credit"], state.journal.map(j=>[
    esc(j.acc), esc(j.desc), j.dr?fmt(j.dr):"", j.cr?fmt(j.cr):""
  ]))}
  <div class="kpis">
    ${kpi("Total Debits", fmt(totalDr))}
    ${kpi("Total Credits", fmt(totalCr))}
    ${kpi("Balance Check", totalDr.toFixed(2)===totalCr.toFixed(2) ? "Balanced ✓" : "Variance!")}
  </div>
  <button class="btn" onclick="alert('Prototype: would post this journal to the connected accounting/ERP system via API.')">Post to GL</button>
  `;
}

function renderSettings(){
  const me = currentSessionUser();
  const isAdmin = state.role==="admin";
  const prefs = state.notificationPrefs[me.username] || {email:true, sms:false, inapp:true};
  state.notificationPrefs[me.username] = prefs;
  return `
  ${titleRow("Settings", "Account, security and notification preferences for "+me.name, "")}
  <div class="tabbar">
    <div class="tab active">Profile &amp; Security</div>
    ${isAdmin ? `<div class="tab" onclick="go('settingsanalytics')">System Configuration &amp; Analytics</div>` : ""}
  </div>

  <h2 class="section">Profile</h2>
  <div class="card">
    <div class="field-grid">
      <div class="field"><label>Name</label><div class="val">${esc(me.name)}</div></div>
      <div class="field"><label>Email</label><div class="val">${esc(me.email)}</div></div>
      <div class="field"><label>Username</label><div class="val mono">${esc(me.username)}</div></div>
      <div class="field"><label>Role</label><div class="val">${esc(me.role)}</div></div>
    </div>
  </div>

  <h2 class="section">Password &amp; Security</h2>
  <div class="card">
    ${field("Current Password", `<input type="password" id="f_pwcurrent" placeholder="••••••••">`)}
    <div class="field-grid">
      ${field("New Password", `<input type="password" id="f_pwnew" placeholder="••••••••">`, "Min "+state.passwordPolicy.minLength+" characters"+(state.passwordPolicy.requireUpper?", 1 uppercase":"")+(state.passwordPolicy.requireNumber?", 1 number":"")+(state.passwordPolicy.requireSymbol?", 1 symbol":""))}
      ${field("Confirm New Password", `<input type="password" id="f_pwconfirm" placeholder="••••••••">`)}
    </div>
    <button class="btn" onclick="changePassword()">Update Password</button>
    <div data-prototype-style="prototype-style-45">
      <div><b data-prototype-style="prototype-style-46">Two-Factor Authentication</b><div class="muted">${state.twoFactorEnabled&&state.twoFactorEnabled[me.username]?"Enabled — an OTP is required at sign-in":"Not enabled"}</div></div>
      <button class="btn secondary small" onclick="toggleTwoFactor('${me.username}')">${state.twoFactorEnabled&&state.twoFactorEnabled[me.username]?"Disable":"Enable"} 2FA</button>
    </div>
  </div>

  <h2 class="section">Notification Preferences</h2>
  <div class="card">
    <div class="field checkrow"><input type="checkbox" id="f_notifemail" ${prefs.email?"checked":""} onchange="setPref('${me.username}','email',this.checked)"> <label data-prototype-style="prototype-style-22">Email notifications (payslips, approvals, exceptions)</label></div>
    <div class="field checkrow"><input type="checkbox" id="f_notifsms" ${prefs.sms?"checked":""} onchange="setPref('${me.username}','sms',this.checked)"> <label data-prototype-style="prototype-style-22">SMS notifications (critical items only)</label></div>
    <div class="field checkrow"><input type="checkbox" id="f_notifinapp" ${prefs.inapp?"checked":""} onchange="setPref('${me.username}','inapp',this.checked)"> <label data-prototype-style="prototype-style-22">In-app notification bell</label></div>
  </div>

  <h2 class="section">Recent Login &amp; Session Activity</h2>
  ${table(["Timestamp","Action","Verification"], [
    ["Today, 08:02","Signed in ("+esc(state.role)+" role)","Standard login"],
    ["Yesterday, 17:41","Signed out","Session ended by user"],
    ["18 Aug 2026, 09:14","Signed in", "Standard login"],
  ])}
  ${note("Session policy","Sessions time out automatically after "+state.passwordPolicy.sessionTimeoutMins+" minutes of inactivity, per the policy configured under System Configuration.","dev")}
  `;
}

function renderSettingsAnalytics(){
  const pw = state.passwordPolicy;
  const emps = activeEmployees();
  const closedPeriods = state.periodArchive;
  const module = state.analyticsModule || "Payroll";
  return `
  ${titleRow("System Configuration & Analytics", "Exec/Admin controls — policy configuration and deeper analysis per module", `<button class="btn secondary" onclick="go('settings')">&larr; Back to Settings</button>`)}

  <h2 class="section">Password &amp; Session Policy</h2>
  <div class="card">
    <div class="field-grid">
      ${field("Minimum Password Length", `<input type="number" id="f_polminlen" value="${pw.minLength}">`)}
      ${field("Session Timeout (minutes)", `<input type="number" id="f_polsession" value="${pw.sessionTimeoutMins}">`)}
      ${field("Password Expiry (days)", `<input type="number" id="f_polexpiry" value="${pw.expiryDays}">`)}
    </div>
    <div class="field checkrow"><input type="checkbox" id="f_polupper" ${pw.requireUpper?"checked":""}> <label data-prototype-style="prototype-style-22">Require uppercase letter</label></div>
    <div class="field checkrow"><input type="checkbox" id="f_polnumber" ${pw.requireNumber?"checked":""}> <label data-prototype-style="prototype-style-22">Require number</label></div>
    <div class="field checkrow"><input type="checkbox" id="f_polsymbol" ${pw.requireSymbol?"checked":""}> <label data-prototype-style="prototype-style-22">Require special character</label></div>
    <div class="field checkrow"><input type="checkbox" id="f_pol2fa" ${pw.twoFactorRequired?"checked":""}> <label data-prototype-style="prototype-style-22">Require 2FA for all Admin and Payroll Manager accounts</label></div>
    <button class="btn" onclick="savePolicy()">Save Policy</button>
  </div>

  <h2 class="section">Deep Analysis — Drill Down by Module</h2>
  <div class="card">
    <div class="field" data-prototype-style="prototype-style-47">
      <label>Module</label>
      <select onchange="state.analyticsModule=this.value;render();">
        ${["Payroll","Leave","Employees","Payments","Compliance"].map(m=>`<option ${module===m?"selected":""}>${m}</option>`).join("")}
      </select>
    </div>
    ${module==="Payroll" ? `
      <div class="kpis">
        ${kpi("Periods Closed To Date", closedPeriods.length)}
        ${kpi("Avg. Gross / Employee", emps.length?fmt(emps.reduce((s,e)=>s+grossFor(e),0)/emps.length):"—")}
        ${kpi("PAYE as % of Gross", emps.length?((emps.reduce((s,e)=>s+calcPayslip(e).payeD,0)/emps.reduce((s,e)=>s+grossFor(e),0))*100).toFixed(1)+"%":"—")}
      </div>
      ${closedPeriods.length ? table(["Period","Employees","Gross","Net","Closed By"], closedPeriods.map(a=>[a.period,a.employees,fmt(a.gross),fmt(a.net),esc(a.closedBy)])) : "<div class='muted'>No periods closed yet — figures will populate after the first rollover.</div>"}
    ` : ""}
    ${module==="Leave" ? `
      <div class="kpis">
        ${kpi("Avg. Annual Balance", emps.length?(emps.reduce((s,e)=>s+e.leave.annual,0)/emps.length).toFixed(1)+" days":"—")}
        ${kpi("Total Leave Liability", fmt(emps.reduce((s,e)=>s+(e.basic/21.67)*e.leave.annual,0)))}
        ${kpi("Most Common Type", "Annual Leave")}
      </div>
      ${table(["Type","Requests","Approved","Pending"], ["Annual Leave","Sick Leave","Family Responsibility"].map(t=>{
        const rs = state.leaveRequests.filter(l=>l.type===t);
        return [t, rs.length, rs.filter(r=>r.status==="Approved").length, rs.filter(r=>r.status==="Pending").length];
      }))}
    ` : ""}
    ${module==="Employees" ? `
      <div class="kpis">
        ${kpi("Active Headcount", emps.length)}
        ${kpi("Terminated (retained)", companyEmployees().filter(e=>e.status==="Terminated").length)}
        ${kpi("ESS Activation Rate", emps.length?Math.round(emps.filter(e=>e.essAccount&&e.essAccount.status==="Active").length/emps.length*100)+"%":"—")}
      </div>
      ${table(["Department","Headcount","Avg. Basic Salary"], [...new Set(emps.map(e=>e.dept))].map(d=>{
        const g = emps.filter(e=>e.dept===d);
        return [d, g.length, fmt(g.reduce((s,e)=>s+e.basic,0)/g.length)];
      }))}
    ` : ""}
    ${module==="Payments" ? `
      <div class="kpis">
        ${kpi("Banks Represented", [...new Set(emps.filter(hasBanking).map(e=>e.banking.bankName))].length)}
        ${kpi("Employees Missing Banking", emps.filter(e=>!hasBanking(e)).length)}
        ${kpi("Total Net This Period", fmt(emps.reduce((s,e)=>s+netFor(e),0)))}
      </div>
      ${table(["Bank","Employees","Total Value"], [...new Set(emps.filter(hasBanking).map(e=>e.banking.bankName))].map(b=>{
        const g = emps.filter(e=>hasBanking(e) && e.banking.bankName===b);
        return [b, g.length, fmt(g.reduce((s,e)=>s+netFor(e),0))];
      }))}
    ` : ""}
    ${module==="Compliance" ? `
      <div class="kpis">
        ${kpi("Unresolved Exceptions", state.payrollRun.exceptions.filter(x=>!x.resolved).length)}
        ${kpi("Pending Approvals", state.pendingApprovals.filter(p=>p.status==="Pending").length)}
        ${kpi("SARS Submissions Logged", state.sarsSubmissions.length)}
      </div>
      ${table(["Submission","Period","Status"], state.sarsSubmissions.map(s=>[s.name,s.period,s.status]))}
    ` : ""}
  </div>
  ${note("Data note","Every figure here is computed from live application state, the same way the module's own screen computes it — this is a different view of the same data, not a separate analytics database.","dev")}
  `;
}

function renderAudit(){
  const pending = state.pendingApprovals.filter(p=>p.status==="Pending");
  const readOnly = state.role==="auditor";
  return `
  ${titleRow(readOnly?"Audit Trail (Read-Only)":"Audit Trail & Approvals", "Bank account, salary and tax changes trigger additional verification", "")}
  <h2 class="section">${readOnly?"Approvals Queue":"Pending Approvals Queue"}</h2>
  ${pending.length ? table(["Employee","Field","Detail","Requested",readOnly?"Status":"Action"], pending.map(p=>[
    esc(p.emp), esc(p.field), esc(p.detail), p.requested,
    readOnly ? badge("Pending — awaiting Payroll Administrator","gold") :
    `<button class="btn small" onclick="approveRequest(${p.id})">Approve</button> <button class="btn small danger" onclick="rejectRequest(${p.id})">Reject</button>`
  ])) : "<div class='muted'>No pending approvals.</div>"}
  <h2 class="section">Audit Log</h2>
  ${table(["Timestamp","User","Action","Employee","Verification"], state.auditLog.map(a=>[
    a.ts, esc(a.user), esc(a.action), a.emp, esc(a.verify)
  ]))}
  <div class="grid3">
    <div class="card"><div data-prototype-style="prototype-style-34">Role-Based Access</div><div class="muted">Segregation of duties enforced at workflow level</div></div>
    <div class="card"><div data-prototype-style="prototype-style-34">Encryption</div><div class="muted">At rest & in transit; POPIA-aligned data retention</div></div>
    <div class="card"><div data-prototype-style="prototype-style-34">Backup & DR</div><div class="muted">Nightly backup, tested restore, documented RTO/RPO</div></div>
  </div>
  ${note("Append-only", "Audit logs cannot be edited or deleted by any application-level user, including administrators."+(readOnly?" The Auditor role can view every record on this page but cannot approve, reject or modify anything.":""),"dev")}
  `;
}
return {renderDashboard,renderCompany,renderUsers,renderEmployees,renderCalendar,renderEarnings,renderDeductions,renderRules,renderPeriodicCapture,renderManagerDashboard,renderTeam,renderMyDashboard,renderPayslips,renderLeave,renderPayrollRun,renderBulk,renderPayments,renderSars,renderEE,renderReports,renderDistribution,renderSelfService,renderAccounting,renderSettings,renderSettingsAnalytics,renderAudit};
}
