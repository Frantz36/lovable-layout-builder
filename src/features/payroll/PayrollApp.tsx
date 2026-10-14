import { useEffect, useReducer, useRef, useState } from 'react';
import { ConfigProvider, App as AntApp, Modal, Button } from 'antd';
import { createPayrollEngine } from './model/payroll-engine.js';
import type { PayrollEngine } from './types';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Contextbar } from './components/Contextbar';
import { PrototypeMarkup } from './components/PrototypeMarkup';
import { MainView } from './views/MainView';

export function PayrollApp() {
  const [theme, setTheme] = useState<Record<string, string | number>>({ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', fontSize: 12, borderRadius: 5 });
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setTheme(previous => ({ ...previous, colorPrimary: css.getPropertyValue('--gold').trim(), colorText: css.getPropertyValue('--dark').trim(), colorBorder: css.getPropertyValue('--grey-line').trim(), colorError: css.getPropertyValue('--red').trim() }));
  }, []);
  return <ConfigProvider theme={{ token: theme }}><AntApp><PayrollWorkspace /></AntApp></ConfigProvider>;
}

function PayrollWorkspace() {
  const [, refresh] = useReducer(value => value + 1, 0);
  const engineRef = useRef<PayrollEngine | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [dialog, setDialog] = useState<{ text: string; onConfirm?: () => void } | null>(null);
  if (!engineRef.current) engineRef.current = createPayrollEngine(refresh, {
    alert: text => setDialog({ text }),
    confirm: (text, onConfirm) => { setDialog(onConfirm ? { text, onConfirm } : { text }); return false; },
  });
  const engine = engineRef.current;
  const snapshot = engine.snapshot();
  function action(name: string, ...args: unknown[]) { const fn = engine.actions[name]; if (typeof fn === 'function') fn(...args); }
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { const close = engine.actions['closeModal']; if (typeof close === 'function') close(); } };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [engine]);
  return <>
    <div id="app">
      <Sidebar snapshot={snapshot} collapsed={collapsed} onNavigate={id => { action('go', id); setCollapsed(true); }} onReset={() => action('resetDemo')} />
      <div id="main"><Topbar snapshot={snapshot} onRole={role => action('switchRole', role)} onNotifications={() => action('toggleNotif')} onToggleSidebar={() => setCollapsed(value => !value)} /><Contextbar snapshot={snapshot} onCompany={id => action('switchCompany', id)} onEmployee={id => action('viewEmployee', id)} onManager={name => action('switchManager', name)} onSwitchUser={() => action('openSwitchDemoUser')} /><MainView key={snapshot.currentRoute} route={snapshot.currentRoute} html={snapshot.html} actions={engine.actions} /></div>
    </div>
    {snapshot.modal && <div id="modalOverlay" onClick={event => { if (event.target === event.currentTarget) action('closeModal'); }}><section className="modal" id="modalBox" role="dialog" aria-modal="true" aria-label={snapshot.modal.title}><div className="modal-head"><h3>{snapshot.modal.title}</h3><Button type="text" className="payroll-button x" aria-label="Close dialog" onClick={() => action('closeModal')}>×</Button></div><div className="modal-body"><PrototypeMarkup html={snapshot.modal.bodyHtml} actions={engine.actions} /></div><div className="modal-foot"><PrototypeMarkup html={snapshot.modal.footHtml} actions={engine.actions} /></div></section></div>}
    {snapshot.registration && <div id="regPageOverlay"><PrototypeMarkup html={snapshot.registration} actions={engine.actions} /></div>}
    <div id="toastWrap" role="status" aria-live="polite">{snapshot.toasts.map(toast => <div key={toast.id} className={`toast ${toast.isErr ? 'err' : ''}`}>{toast.msg}</div>)}</div>
    <Modal open={Boolean(dialog)} title="SBI Payroll" onCancel={() => setDialog(null)} onOk={() => { dialog?.onConfirm?.(); setDialog(null); }} cancelButtonProps={{ hidden: !dialog?.onConfirm }}><p className="prototype-dialog">{dialog?.text}</p></Modal>
  </>;
}