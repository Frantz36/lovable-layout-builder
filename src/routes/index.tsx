import { createFileRoute } from "@tanstack/react-router";
import { PayrollApp } from '@/features/payroll/PayrollApp';

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'SBI Payroll — Payroll Management' },
    { name: 'description', content: 'SBI Payroll: company payroll, employee records, payslips, leave and compliance management.' },
    { property: 'og:title', content: 'SBI Payroll — Payroll Management' },
    { property: 'og:description', content: 'Manage company payroll, employee records, payslips, leave and compliance with SBI Payroll.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: PayrollApp,
});
