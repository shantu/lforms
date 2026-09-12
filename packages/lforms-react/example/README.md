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
`https://clinicaltables.nlm.nih.gov/lforms-versions/44.0.0`. To use a local
build of this repository (`npm run build` at the repository root), serve
`dist/lforms` and point the example at it:

```sh
VITE_LFORMS_BASE_URL=http://localhost:8080 npm run dev
```
