<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Payroll architecture
- Keep the application in the existing TanStack Start React/Vite runtime; it supplies routing and SSR without introducing another router.
- Organize the payroll shell, views and model under `src/features/payroll`; separate sidebar, topbar, contextbar and dashboard to keep layout responsibilities independent.
- Preserve supplied prototype view templates behind a React renderer and a constrained event interpreter; this keeps all original demo flows without iframe embedding, injected scripts or eval.
- Keep prototype data in memory only until persistent functionality is requested; role switching and account setup are simulations, not real authentication.
- Define prototype visual roles in the global stylesheet and use Ant Design controls for actions; fidelity must not depend on inline color literals.
