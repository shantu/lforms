import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { LFormsEventHandler, LFormsFormProps, LhcFormElement } from './types';

/** Tag name of the custom element defined by the LForms Angular module. */
export const LFORMS_ELEMENT_NAME = 'wc-lhc-form';

const EVENT_NAMES = ['onFormReady', 'onFormChange', 'onError'] as const;
type EventName = (typeof EVENT_NAMES)[number];

/**
 * Keeps a mutable ref in sync with the latest value of a prop, so that event
 * listeners registered once can always call the current callback.
 */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Resolves once the `wc-lhc-form` custom element has been defined.  Properties
 * assigned before the element is upgraded would shadow the accessors that
 * Angular Elements installs on the prototype, so the wrapper waits for the
 * definition before assigning any props.
 */
function useElementDefined(): boolean {
  const [defined, setDefined] = useState(
    () => typeof window !== 'undefined' && !!window.customElements?.get(LFORMS_ELEMENT_NAME)
  );

  useEffect(() => {
    if (defined || typeof window === 'undefined' || !window.customElements) {
      return;
    }
    let cancelled = false;
    window.customElements.whenDefined(LFORMS_ELEMENT_NAME).then(() => {
      if (!cancelled) {
        setDefined(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [defined]);

  return defined;
}

/**
 * React wrapper for the LForms `wc-lhc-form` web component.
 *
 * Object props (`questionnaire`, `options`, ...) are assigned as DOM
 * properties rather than as stringified HTML attributes, and the custom events
 * emitted by the web component are bridged to the React callback props.
 *
 * The LForms web component assets must be present on the page before a form
 * can be rendered; see {@link loadLForms}.
 */
export const LFormsForm = forwardRef<LhcFormElement | null, LFormsFormProps>(function LFormsForm(
  {
    questionnaire,
    options,
    prepop,
    fhirVersion,
    onFormReady,
    onFormChange,
    onError,
    className,
    style,
    id,
  },
  ref
) {
  const elementRef = useRef<LhcFormElement | null>(null);
  const defined = useElementDefined();

  useImperativeHandle(ref, () => elementRef.current as LhcFormElement, [defined]);

  const handlers: Record<EventName, LFormsEventHandler | undefined> = {
    onFormReady,
    onFormChange,
    onError,
  };
  const handlersRef = useLatest(handlers);

  // Bridge the custom DOM events to the React callback props.  The listeners
  // are registered once per element so that a changing (e.g. inline) callback
  // does not cause listeners to be removed and re-added.
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
    const listeners = EVENT_NAMES.map((name) => {
      const listener = (event: Event) => {
        handlersRef.current[name]?.(event as CustomEvent);
      };
      element.addEventListener(name, listener);
      return [name, listener] as const;
    });
    return () => {
      listeners.forEach(([name, listener]) => element.removeEventListener(name, listener));
    };
  }, [handlersRef]);

  // Assign the inputs as DOM properties.  Each one is assigned in its own
  // effect so that only the changed property is written back to the element.
  const setProperty = useCallback(
    <K extends keyof LhcFormElement>(name: K, value: LhcFormElement[K]) => {
      const element = elementRef.current;
      if (element && element[name] !== value) {
        element[name] = value;
      }
    },
    []
  );

  useLayoutEffect(() => {
    if (defined) {
      setProperty('options', options ?? undefined);
    }
  }, [defined, options, setProperty]);

  useLayoutEffect(() => {
    if (defined) {
      setProperty('prepop', !!prepop);
    }
  }, [defined, prepop, setProperty]);

  useLayoutEffect(() => {
    if (defined) {
      setProperty('fhirVersion', fhirVersion ?? undefined);
    }
  }, [defined, fhirVersion, setProperty]);

  // `questionnaire` is assigned last: the web component (re)renders the form
  // when it changes, and it should see the other inputs already in place.
  useLayoutEffect(() => {
    if (defined) {
      setProperty('questionnaire', questionnaire ?? undefined);
    }
  }, [defined, questionnaire, setProperty]);

  return createElement(LFORMS_ELEMENT_NAME, { ref: elementRef, className, style, id });
});

export default LFormsForm;
