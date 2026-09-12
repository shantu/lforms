import type { FhirVersion } from './types';
import { LFORMS_ELEMENT_NAME } from './LFormsForm';

export interface LoadLFormsOptions {
  /**
   * Base URL of the built LForms assets, i.e. the directory that contains the
   * `webcomponent` and `fhir` directories.  For the pre-built releases this is
   * something like
   * `https://clinicaltables.nlm.nih.gov/lforms-versions/<version>`.
   */
  baseUrl: string;
  /**
   * FHIR support library to load.  Use a version (e.g. `"R4"`) to load only
   * that version, `"all"` to load the combined file, or `false`/`"none"` to
   * skip loading FHIR support.  Defaults to `"all"`.
   */
  fhirVersion?: FhirVersion | 'all' | 'none' | false;
  /**
   * Whether to load zone.js.  Set to false if zone.js is already on the page.
   * Defaults to true.
   */
  includeZone?: boolean;
  /** Whether to load `webcomponent/styles.css`.  Defaults to true. */
  includeStyles?: boolean;
  /** Document to load the assets into.  Defaults to the global `document`. */
  document?: Document;
}

const loaded = new Map<string, Promise<void>>();

function joinUrl(baseUrl: string, path: string): string {
  let end = baseUrl.length;
  while (end > 0 && baseUrl[end - 1] === '/') {
    end--;
  }
  return `${baseUrl.slice(0, end)}/${path}`;
}

function loadScript(doc: Document, url: string): Promise<void> {
  const existing = doc.querySelector<HTMLScriptElement>(`script[data-lforms-src="${CSS.escape(url)}"]`);
  if (existing) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const script = doc.createElement('script');
    script.src = url;
    script.async = false; // preserve execution order
    script.dataset.lformsSrc = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load LForms script: ${url}`));
    doc.head.appendChild(script);
  });
}

function loadStylesheet(doc: Document, url: string): void {
  if (doc.querySelector(`link[data-lforms-href="${CSS.escape(url)}"]`)) {
    return;
  }
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.dataset.lformsHref = url;
  doc.head.appendChild(link);
}

function fhirFile(fhirVersion: LoadLFormsOptions['fhirVersion']): string | null {
  if (fhirVersion === false || fhirVersion === 'none') {
    return null;
  }
  if (!fhirVersion || fhirVersion === 'all') {
    return 'fhir/lformsFHIRAll.min.js';
  }
  return `fhir/${fhirVersion}/lformsFHIR.min.js`;
}

/**
 * Loads the LForms web component assets (styles, the web component scripts and
 * optionally the FHIR support library) and resolves once the `wc-lhc-form`
 * custom element has been defined.
 *
 * This is a convenience helper for React apps that do not bundle the LForms
 * assets themselves; applications that already include the assets (e.g. via
 * script tags) do not need it.  Repeated calls with the same options reuse the
 * same promise.
 */
export function loadLForms(options: LoadLFormsOptions): Promise<void> {
  const {
    baseUrl,
    fhirVersion = 'all',
    includeZone = true,
    includeStyles = true,
    document: doc = typeof document === 'undefined' ? undefined : document,
  } = options;

  if (!doc) {
    return Promise.reject(new Error('loadLForms() requires a browser document.'));
  }
  if (!baseUrl) {
    return Promise.reject(new Error('loadLForms() requires a baseUrl.'));
  }

  const key = JSON.stringify([baseUrl, fhirVersion, includeZone, includeStyles]);
  const cached = loaded.get(key);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    if (includeStyles) {
      loadStylesheet(doc, joinUrl(baseUrl, 'webcomponent/styles.css'));
    }

    const scripts = [
      ...(includeZone ? ['webcomponent/assets/lib/zone.min.js'] : []),
      'webcomponent/runtime.js',
      'webcomponent/polyfills.js',
      'webcomponent/main.js',
    ];
    const fhir = fhirFile(fhirVersion);
    if (fhir) {
      scripts.push(fhir);
    }

    for (const script of scripts) {
      await loadScript(doc, joinUrl(baseUrl, script));
    }

    await doc.defaultView?.customElements.whenDefined(LFORMS_ELEMENT_NAME);
  })();

  // Do not cache failures, so that a later call can retry.
  promise.catch(() => loaded.delete(key));
  loaded.set(key, promise);
  return promise;
}

export default loadLForms;
