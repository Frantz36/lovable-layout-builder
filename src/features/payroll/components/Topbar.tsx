import { Button } from 'antd';
import { Menu } from 'lucide-react';
import type { PayrollSnapshot } from '../types';

export function Topbar({ snapshot, onRole, onNotifications, onToggleSidebar }: { snapshot: PayrollSnapshot; onRole: (role: string) => void; onNotifications: () => void; onToggleSidebar: () => void }) {
  const { state, employee, company } = snapshot;
  const users: Record<string, string> = { admin: 'admin@sbi.co.za (K. Tapamo)', manager: `${state.currentManager} (Manager)`, employee: `${employee?.name ?? ''} (Employee)`, auditor: 'auditor@sbi.co.za (Read-only)' };
  return <header id="topbar">
    <div className="flex items-center gap-2"><Button className="payroll-button sidebar-toggle" type="text" aria-label="Toggle navigation" onClick={onToggleSidebar} icon={<Menu size={16} />} /><div className="crumb" id="crumb">{snapshot.label}</div></div>
    <div id="roleswitch" aria-label="Demo role">{[['admin', 'Admin / Exec'], ['manager', 'Manager'], ['employee', 'Employee'], ['auditor', 'Auditor']].map(([role, label]) => <Button key={role} className={`payroll-button role-btn ${state.role === role ? 'active' : ''}`} type="text" aria-pressed={state.role === role} onClick={() => role && onRole(role)}>{label}</Button>)}</div>
    <div className="right"><Button type="text" className="payroll-button bell" aria-label="Notifications" onClick={onNotifications}>🔔{snapshot.notificationCount > 0 && <span className="dot" id="notifCount">{snapshot.notificationCount}</span>}</Button><div><span id="userLine">{users[state.role]}</span><br /><span id="companyLine">{company.name}</span></div></div>
  </header>;
}