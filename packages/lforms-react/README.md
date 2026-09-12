# lforms-react

A thin React wrapper around the LForms (LHC-Forms) `wc-lhc-form` web component.

The wrapper does **not** reimplement any form rendering: the Angular-based web
component built from this repository remains the source of truth. The wrapper
only

- renders the `wc-lhc-form` custom element,
- assigns `questionnaire`, `options`, `prepop` and `fhirVersion` as **DOM
  properties** (so objects are not stringified into HTML attributes),
- bridges the `onFormReady`, `onFormChange` and `onError` custom DOM events to
  React callback props,
- optionally loads the LForms assets for you (`loadLForms`).

## Installation

The package is published from `packages/lforms-react` in the
[lforms](https://github.com/lhncbc/lforms) repository.

```sh
npm install lforms-react react react-dom
```

`react` and `react-dom` (>= 17) are peer dependencies.

## Loading the LForms assets

The web component and its FHIR support files must be on the page before a form
can render. You can add them with `<script>`/`<link>` tags as described in the
[main README](../../README.md#using), or let the wrapper load them:

```ts
import { loadLForms } from 'lforms-react';

await loadLForms({
  // directory containing "webcomponent" and "fhir"
  baseUrl: 'https://clinicaltables.nlm.nih.gov/lforms-versions/44.0.0',
  fhirVersion: 'R4', // 'all' (default), a version, or 'none'
  includeZone: true, // set to false if zone.js is already loaded
});
```

`loadLForms` resolves once `wc-lhc-form` has been defined, and repeated calls
with the same options reuse the same promise.

## Usage

```tsx
import { LFormsForm } from 'lforms-react';

function MyForm({ questionnaire }) {
  return (
    <LFormsForm
      questionnaire={questionnaire}
      options={{ displayScoreWithAnswerText: false }}
      fhirVersion="R4"
      prepop={false}
      onFormReady={() => console.log('ready')}
      onFormChange={(event) => console.log('changed', event.detail)}
      onError={(event) => console.error(event.detail)}
    />
  );
}
```

### Props

| Prop            | Type                              | Description                                                       |
| --------------- | --------------------------------- | ----------------------------------------------------------------- |
| `questionnaire` | `object \| string \| null`        | FHIR Questionnaire or LForms form definition (required).           |
| `options`       | `object`                          | LForms display/behavior options.                                   |
| `prepop`        | `boolean`                         | Run pre-population (needs a FHIR context). Defaults to `false`.    |
| `fhirVersion`   | `'R5' \| 'R4B' \| 'R4' \| 'STU3'` | FHIR version of the questionnaire.                                 |
| `onFormReady`   | `(event: CustomEvent) => void`    | Fired once the form's view and data are rendered.                  |
| `onFormChange`  | `(event: CustomEvent) => void`    | Fired when form data changes.                                      |
| `onError`       | `(event: CustomEvent) => void`    | Fired on initialization/rendering errors.                          |
| `className`     | `string`                          | Class applied to the custom element.                               |
| `style`         | `CSSProperties`                   | Inline styles applied to the custom element.                       |
| `id`            | `string`                          | `id` attribute of the custom element.                              |

### Accessing the element / the LForms API

The component forwards a ref to the `wc-lhc-form` element, which can be passed
to the global `LForms` API (for example for data extraction):

```tsx
const formRef = useRef<LhcFormElement | null>(null);

<LFormsForm ref={formRef} questionnaire={q} fhirVersion="R4" />;

const qr = window.LForms.Util.getFormFHIRData('QuestionnaireResponse', 'R4', formRef.current);
```

## Development

```sh
cd packages/lforms-react
npm install
npm run typecheck
npm run build      # emits dist/ with JS + type declarations
```

## Example

A runnable React demo lives in [`example/`](./example). See its
[README](./example/README.md).
