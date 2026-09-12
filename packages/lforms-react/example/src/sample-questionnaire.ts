import type { FormDefinition } from 'lforms-react';

/** A small FHIR R4 Questionnaire used by the demo. */
const sampleQuestionnaire: FormDefinition = {
  resourceType: 'Questionnaire',
  status: 'draft',
  title: 'React wrapper demo',
  item: [
    {
      linkId: '1',
      text: 'Name',
      type: 'string',
    },
    {
      linkId: '2',
      text: 'Height',
      type: 'decimal',
    },
    {
      linkId: '3',
      text: 'Do you smoke?',
      type: 'choice',
      answerOption: [
        { valueCoding: { code: 'Y', display: 'Yes' } },
        { valueCoding: { code: 'N', display: 'No' } },
      ],
    },
  ],
};

export default sampleQuestionnaire;
