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

- Shared visual finishes are defined as semantic tokens and utilities in src/styles.css, so all wallet screens stay consistent while custom backgrounds continue to work.
- Use the shared Button component for button controls, keeping native form behavior and accessibility consistent.
- Savings goals use stable IDs in a bounded collection, migrating the legacy single goal on load; this preserves existing savings and keeps edits and deposits isolated to the selected goal.
