export interface PayrollEmployee { id: string; name: string; companyId: string; manager: string }
export interface PayrollSnapshot {
  state: { role: string; activeCompanyId: string; currentManager: string; companies: { id: string; name: string }[]; employees: PayrollEmployee[] };
  currentRoute: string;
  currentEmployeeId: string | null;
  employee: PayrollEmployee | undefined;
  company: { id: string; name: string };
  nav: { id: string; label: string }[];
  label: string;
  notificationCount: number;
  html: string;
  modal: { title: string; bodyHtml: string; footHtml: string } | null;
  registration: string | null;
  toasts: { id: number; msg: string; isErr: boolean }[];
}
export interface PayrollEngine {
  actions: Record<string, unknown>;
  snapshot: () => PayrollSnapshot;
}