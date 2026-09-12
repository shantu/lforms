import { useEffect, useMemo, useRef, useState } from 'react';
import { LFormsForm, loadLForms } from 'lforms-react';
import type { LFormsOptions, LhcFormElement } from 'lforms-react';
import sampleQuestionnaire from './sample-questionnaire';

// Point this at your own copy of the built LForms assets (the directory that
// contains "webcomponent" and "fhir"), e.g. ../../../../dist/lforms when
// serving a local build.
const LFORMS_BASE_URL =
  import.meta.env.VITE_LFORMS_BASE_URL ?? 'https://clinicaltables.nlm.nih.gov/lforms-versions/44.0.0';

export default function App() {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading the LForms web component\u2026');
  const [changeCount, setChangeCount] = useState(0);
  const formRef = useRef<LhcFormElement | null>(null);

  useEffect(() => {
    loadLForms({ baseUrl: LFORMS_BASE_URL, fhirVersion: 'R4' }).then(
      () => {
        setReady(true);
        setStatus('Web component loaded; rendering the form\u2026');
      },
      (error: Error) => setLoadError(error.message)
    );
  }, []);

  const options: LFormsOptions = useMemo(() => ({ displayScoreWithAnswerText: false }), []);

  if (loadError) {
    return <p role="alert">Could not load LForms: {loadError}</p>;
  }

  return (
    <main style={{ fontFamily: 'sans-serif', margin: '1rem' }}>
      <h1>LForms React wrapper demo</h1>
      <p>
        {status} {changeCount > 0 && <>({changeCount} change events)</>}
      </p>
      {ready && (
        <LFormsForm
          ref={formRef}
          questionnaire={sampleQuestionnaire}
          options={options}
          fhirVersion="R4"
          onFormReady={() => setStatus('Form is ready.')}
          onFormChange={() => setChangeCount((count) => count + 1)}
          onError={(event) => setStatus(`Error: ${String(event.detail)}`)}
        />
      )}
      <button
        type="button"
        onClick={() => {
          // The underlying element is available through the ref, so the global
          // LForms API can still be used for things like data extraction.
          const data = (window as any).LForms?.Util.getFormFHIRData(
            'QuestionnaireResponse',
            'R4',
            formRef.current
          );
          console.log(data);
        }}
      >
        Log QuestionnaireResponse
      </button>
    </main>
  );
}
