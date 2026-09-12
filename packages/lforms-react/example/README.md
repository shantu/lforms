# lforms-react example

A minimal React + Vite app that renders a FHIR Questionnaire with the
`lforms-react` wrapper.

## Running

```sh
cd packages/lforms-react
npm install
npm run build          # build the wrapper the example depends on

cd example
npm install
npm run dev
```

Then open the URL printed by Vite.

By default the example loads the LForms assets from
`https://clinicaltables.nlm.nih.gov/lforms-versions/44.0.0`. That version may
not be published to the CDN yet (e.g. while it is still under development), in
which case the example will fail with an error like "Could not load LForms:
Failed to load LForms script: ...". To work around this, build LForms locally
and point the example at that build instead.

### Using a local LForms build

From the repository root, build the web component and FHIR assets:

```sh
npm install
npm run build:language
npm run build:lforms-dev
npm run build:fhir-dev
```

This produces `dist/lforms` (containing `webcomponent` and `fhir`). Serve it
with any static file server, disabling caching so rebuilds are picked up:

```sh
npx http-server dist/lforms -p 8080 --cors -c-1
```

Then point the example at it:

```sh
cd packages/lforms-react/example
VITE_LFORMS_BASE_URL=http://localhost:8080 npm run dev
```

If you change any shared LForms source (e.g. `src/lib/lforms/lhc-form-utils.js`),
re-run **both** `npm run build:lforms-dev` and `npm run build:fhir-dev` — that
code is bundled separately into `dist/lforms/webcomponent` and
`dist/lforms/fhir`, so rebuilding only one of them can leave the other stale.
Do a full reload (not just a soft refresh) of the browser tab after rebuilding,
since the assets aren't cache-busted by version.
