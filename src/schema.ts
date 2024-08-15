import * as I from './types'

// cat file.txt | spadar mediator spadar-openai.GPT.string.string --model gpt-4 | spadar

const optionsSchema: I.ModelOptionsSchema = {
  model: {
    type: 'stringUnion',
    required: true,
    of: [
      'gpt-4o',
      'gpt-4o-2024-05-13',
      'gpt-4o-2024-08-06',
      'gpt-4o-mini',
      'gpt-4o-mini-2024-07-18',
      'gpt-4-turbo',
      'gpt-4-turbo-2024-04-09',
      'gpt-4-0125-preview',
      'gpt-4-turbo-preview',
      'gpt-4-1106-preview',
      'gpt-4-vision-preview',
      'gpt-4',
      'gpt-4-0314',
      'gpt-4-0613',
      'gpt-4-32k',
      'gpt-4-32k-0314',
      'gpt-4-32k-0613',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-0301',
      'gpt-3.5-turbo-0613',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-0125',
      'gpt-3.5-turbo-16k-0613',
    ],
    default: 'gpt-4o',
  },
  temperature: {
    type: 'number',
    description:
      'The value for the `temperature` parameter should be a floating' +
      'point number in the range of 0.0 to 1.0. This parameter helps ' +
      'control the randomness of the prediction. A lower temperature ' +
      'value results in less randomness, while a higher temperature ' +
      'will increase the randomness.',
    min: 0,
    max: 1,
  },
  topP: {
    type: 'number',
    description:
      "The value for the `top_p` parameter, often used in 'nucleus " +
      "sampling', can also be a floating point number between 0.0 and 1.0, " +
      "both inclusive. It's used to limit the token selection pool " +
      'to only the most likely tokens. A higher value means more randomness, ' +
      'lower values make the output more deterministic.',
    min: 0,
    max: 1,
  },
  maxTokens: {
    type: 'number',
    description:
      'This integer value specifies the maximum number of tokens in the ' +
      'output. The minimum value is 1. The maximum can depend on the ' +
      "model used: gpt3's models allow generation up to 4096 tokens",
    min: 1,
  },
}

export const chatMessageUnit: I.UnitSchema = {
  unitId: { type: 'stringUnion', required: true, of: ['chatMessage'] },
  role: {
    type: 'stringUnion',
    of: ['system', 'assistant', 'user'],
    required: true,
  },
  payload: 'string',
}

const connectorSchemas: I.ConnectorSchema[] = [
  {
    // FIXME: rename to `GPT`
    id: 'openai',
    description: 'CLI and CHAT compatible adapter for OpenAI LLMs',
    options: optionsSchema,
    keys: [
      {
        key: 'OPENAI_API_KEY',
        description: 'https://www.google.com/search?q=how+to+get+openai',
      },
    ],
    supportedIO: [
      {
        type: 'textToText',
        io: {
          staticInStreamOut: [[[chatMessageUnit], 'string']],
          staticInStaticOut: [['string', 'string']],
        },
      },
    ],
  },
]

export default connectorSchemas
