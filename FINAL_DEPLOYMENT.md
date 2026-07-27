# AgriSmart final deployment

This source is configured for GitHub Pages at:

`https://reddirector.github.io/AgriSmart/`

## Local development

```bash
npm ci
npm run dev
```

## Production verification

```bash
npm run check
npm run build
npm run preview
```

The GitHub Pages workflow intentionally deploys the Vite production build. The stricter TypeScript check remains available through `npm run check` and `npm run build:strict`, but it does not block publishing a browser-valid Vite bundle.

## GitHub Pages setting

In repository settings, select **Pages → Source → GitHub Actions**.
