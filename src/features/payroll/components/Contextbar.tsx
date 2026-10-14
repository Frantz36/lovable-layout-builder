import { Button } from 'antd';
import type { PayrollSnapshot } from '../types';

export function Contextbar({ snapshot, onCompany, onEmployee, onManager, onSwitchUser }: { snapshot: PayrollSnapshot; onCompany: (id: string) => void; onEmployee: (id: string) => void; onManager: (name: string) => void; onSwitchUser: () => void }) {
  const { state, currentRoute, currentEmployeeId } = snapshot;
  const employees = state.employees.filter(e => e.companyId === state.activeCompanyId);
  const pool = state.role === 'manager' ? employees.filter(e => e.manager === state.currentManager) : employees;
  const showPicker = (state.role === 'admin' && ['payslips', 'employees', 'mydashboard'].includes(currentRoute)) || (state.role === 'manager' && currentRoute === 'payslips');
  const managers = [...new Set(employees.map(e => e.manager).filter(m => m && m !== '—'))];
  return <div id="contextbar">
    {state.role === 'admin' && <span><label htmlFor="active-company">Company:</label><select id="active-company" value={state.activeCompanyId} onChange={e => onCompany(e.target.value)}>{state.companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></span>}
    {showPicker && pool.length > 0 && <span><label htmlFor="viewing-employee">Viewing employee:</label><select id="viewing-employee" value={currentEmployeeId ?? pool[0]?.id} onChange={e => onEmployee(e.target.value)}>{pool.map(employee => <option key={employee.id} value={employee.id}>{employee.name} ({employee.id})</option>)}</select></span>}
    {state.role === 'employee' && <span><label>Signed in as:</label><b className="signed-in-name">{snapshot.employee?.name}</b> <Button type="link" className="payroll-button switch-user" onClick={onSwitchUser}>(switch demo user)</Button></span>}
    {state.role === 'manager' && <span><label htmlFor="active-manager">Team:</label><select id="active-manager" value={state.currentManager} onChange={e => onManager(e.target.value)}>{managers.map(name => <option key={name}>{name}</option>)}</select></span>}
    {state.role === 'auditor' && <span><b className="read-only-label">READ-ONLY</b> Auditor access — historical payroll, submissions and audit information only. No edit, approve or process actions are available in this role.</span>}
  </div>;
}