# templates-shared

The files all four templates share. Edit them here, then run:

```bash
npm run sync:templates
```

`npm run check:templates` fails, in CI too, when a template's copy differs. This folder does not ship in the npm package.

Files that differ per framework stay in `templates/` and `templates-i18n/`. The list lives in `scripts/sync-templates.js`.
