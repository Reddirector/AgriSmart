# AgriSmart Rename Patch

This patch renames the application from KisanTrust to AgriSmart across the user interface, metadata, demo identities, package metadata, exports, browser storage, and project documentation.

## Compatibility

- Existing saved sessions are migrated from `kisantrust-store` to `agrismart-store`.
- Existing farmer marketplace drafts are read from the legacy key and copied to the new AgriSmart key.
- Routes and role-based behavior are unchanged.

## Apply

```bash
git apply --check /path/to/agrismart-rename.patch
git apply /path/to/agrismart-rename.patch
npm ci
npm run check
npm run build
npm run dev
```
