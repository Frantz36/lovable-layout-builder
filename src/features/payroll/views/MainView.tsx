import { PrototypeMarkup } from '../components/PrototypeMarkup';
import { Dashboard } from './Dashboard';
export function MainView({ route, html, actions }: { route: string; html: string; actions: Record<string, unknown> }) {
  return <main id="content">{route.endsWith('dashboard') ? <Dashboard html={html} actions={actions} /> : <PrototypeMarkup html={html} actions={actions} />}</main>;
}