import { Button } from 'antd';
import type { PayrollSnapshot } from '../types';

export function Sidebar({ snapshot, collapsed, onNavigate, onReset }: { snapshot: PayrollSnapshot; collapsed: boolean; onNavigate: (id: string) => void; onReset: () => void }) {
  return <aside id="sidebar" className={collapsed ? 'collapsed' : ''}>
    <div className="brand"><div><b>SBI • PAYROLL</b><span>Interactive Prototype</span></div><Button type="text" className="payroll-button reset" onClick={onReset}>Reset demo</Button></div>
    <nav id="navlist" aria-label="Main navigation">{snapshot.nav.map(item => <Button key={item.id} type="text" className={`payroll-button nav-item ${snapshot.currentRoute === item.id ? 'active' : ''}`} aria-current={snapshot.currentRoute === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>{item.label}</Button>)}</nav>
  </aside>;
}