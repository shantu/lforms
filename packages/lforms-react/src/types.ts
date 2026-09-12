/**
 * Shared types for the React wrapper around the LForms `wc-lhc-form` web
 * component.  The property and event names below mirror the inputs and outputs
 * declared by `LhcFormComponent` (src/app/lhc-form/lhc-form.component.ts).
 */
import type { CSSProperties } from 'react';

/** FHIR versions for which LForms provides support files. */
export type FhirVersion = 'R5' | 'R4B' | 'R4' | 'STU3';

/**
 * A form definition: either a FHIR Questionnaire resource or an LForms form
 * definition object.  The shape is validated by LForms itself, so it is kept
 * loose here.
 */
export type FormDefinition = Record<string, any>;

/** Display/behavior options passed to the web component's `options` input. */
export type LFormsOptions = Record<string, any>;

/**
 * The DOM interface of the `wc-lhc-form` custom element.  Complex values must
 * be assigned as DOM properties (not attributes), which is what this type
 * describes.
 */
export interface LhcFormElement extends HTMLElement {
  questionnaire?: FormDefinition | string | null;
  options?: LFormsOptions | null;
  prepop?: boolean;
  fhirVersion?: FhirVersion | string | null;
  /** The internal LhcFormData object, available once the form is rendered. */
  lhcFormData?: any;
}

/** Event handler for the custom events emitted by `wc-lhc-form`. */
export type LFormsEventHandler<T = any> = (event: CustomEvent<T>) => void;

export interface LFormsFormProps {
  /** FHIR Questionnaire or LForms form definition to render. */
  questionnaire: FormDefinition | string | null;
  /** LForms display/behavior options. */
  options?: LFormsOptions | null;
  /** Whether to run pre-population (requires a configured FHIR context). */
  prepop?: boolean;
  /** FHIR version of the questionnaire, e.g. "R4". */
  fhirVersion?: FhirVersion | string | null;
  /** Called when the form's view and data have initially been rendered. */
  onFormReady?: LFormsEventHandler;
  /** Called when the form data changes at any level. */
  onFormChange?: LFormsEventHandler;
  /** Called when an error occurs while initializing or rendering the form. */
  onError?: LFormsEventHandler;
  /** Class name applied to the custom element. */
  className?: string;
  /** Inline styles applied to the custom element. */
  style?: CSSProperties;
  /** `id` attribute of the custom element. */
  id?: string;
}
