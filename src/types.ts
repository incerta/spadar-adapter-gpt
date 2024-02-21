/**
 * Each `ObjectPropSchema` extends `PropSchemaBase<T>`
 **/
type PropSchemaBase<T> = {
  description?: string
  required?: boolean

  /**
   * If the property schema has a `default` value, the result
   * property type must be optional at MEDIATOR PUBLIC API.
   * In the absence of a value, the MEDIATOR will use the default
   * specified in the property schema.
   **/
  default?: T
}

/**
 * @example { type: 'string' }
 *
 * result type: string
 **/
export type StringPropSchema = PropSchemaBase<string> & {
  type: 'string'
  minLength?: number /* >= */
  maxLength?: number /* <= */
}

/**
 * @example { type: 'number' }
 *
 * result type: number
 **/
export type NumberPropSchema = PropSchemaBase<number> & {
  type: 'number'
  min?: number /* >= */
  max?: number /* <= */
}

/**
 * @example { type: 'boolean' }
 *
 * result type: boolean
 **/
export type BooleanPropSchema = PropSchemaBase<boolean> & {
  type: 'boolean'
}

/**
 * @example { type: 'Buffer' }
 *
 * result type: Buffer
 **/
export type BufferPropSchema = PropSchemaBase<Buffer> & {
  type: 'Buffer'
  /* Buffer.length */
  minLength?: number /* >= */
  maxLength?: number /* <= */

  // TODO: allow to add `default: string` value which is should be
  //       absolute path to the file or HTTP link to desired resource
}

/**
 * Specified strings will be transformed into union/literal type
 *
 * @example
 * { type: 'stringUnion', of: ['one', 'two'] }
 *
 * result type: 'one' | 'two'
 **/
export type StringUnionPropSchema = PropSchemaBase<string> & {
  type: 'stringUnion'
  of: Array<string>
}

export type ObjectPropSchema =
  | StringPropSchema
  | NumberPropSchema
  | BooleanPropSchema
  | BufferPropSchema
  | StringUnionPropSchema

export type RequiredPropSchema = 'Buffer' | 'string' | 'number' | 'boolean'

// TODO: use this optional payload schema
export type OptionalPropSchema = '?Buffer' | '?string' | '?number' | '?boolean'

// TODO: Array<string> as required `StringUnionPropertySchema` */
//       [string] as required `string` literal required `StringUnionPropertySchema`
//       with only singular `of` memeber

export type PropSchema = ObjectPropSchema | RequiredPropSchema

/**
 * Object IO Unit schema: `unitId`, `payload` + meta information
 *
 * In the context of connector API the given type will be used
 * as IO literal: `[Transformation][unitId + suffixes][unitId + suffixes]`
 * for `chatMessage` value result could be:
 *
 *   - textToText.chatMessageStream.chatMessage
 *   - textToText.chatMessage.string
 *   - textToText.string.chatMessageArr
 *   - textToText.chatMessageArrStream.buffer
 *
 * We will generate `export type ChatMessageUnit` so `unitId` should be
 * the unique identifier of the specified schema
 *
 * The suffix will be added by the following rules:
 *
 *   - `Arr`: if API expects the Array of Units
 *   - `Stream`: if API expects `StreamOf<ChatMessageUnit>`
 *   - `ArrStream`: if API expects `StreamOf<ChatMessageUnit[]>`
 **/
export type ObjectUnitSchema = {
  // TODO: not sure if `unitId` property should be required
  //       we could allow user to omit `unitId` entirely from
  //       the MEDIATOR PUBLIC API entirely depending on `required` value
  unitId: StringUnionPropSchema & { required: true; of: [string] }
  payload: 'Buffer' | 'string'
  [key: string]: PropSchema
}

export type PayloadUnitSchema = 'string' | 'Buffer'
export type UnitSchema = ObjectUnitSchema | PayloadUnitSchema

// TODO: consider OrderSchema entity existence as representation of
//       given list of UNITs wrapped by Object with meta information

/**
 * Options schema for desired set of models
 *
 * @example
 * {
 *   model: {
 *     type: 'union',
 *     of: ['gpt-4', 'gpt-3.5-turbo'],
 *     required: true
 *     description: 'Desired LLM'
 *   },
 *   maxTokens: {
 *     type: 'number',
 *     min: 1,
 *     max: 2000,
 *     default: 2000,
 *   },
 *   temperature: number
 * }
 *
 * Generated type:
 * {
 *   model: 'gpt-4' | 'gpt-3.5-turbo'
 *   temperature: number
 *   maxTokens?: number
 * }
 *
 * TODO:
 *       `ObjectPropSchema` property values should be used to annotate
 *       result typings
 *
 * TODO:
 *       Values of `min`, `max`, `minLength`, `maxLength`,
 *       including `StreamOf<T>` streams chunks. Should be used
 *       for runtime type check handled by SPADAR
 **/
export type ModelOptionsSchema = {
  model: StringUnionPropSchema & { required: true; of: string[] }
  [key: string]: PropSchema
}

// TODO: Support Array<UnitSchema | [UnitSchema]>
//       as syntax for functional overloads generation
//       for each given in/out pare

export type Transformation =
  | 'textToText'
  | 'textToImage'
  | 'textToAudio'
  | 'textToVideo'
  | 'imageToText'
  | 'imageToImage'
  | 'imageToAudio'
  | 'imageToVideo'
  | 'videoToText'
  | 'videoToImage'
  | 'videoToAudio'
  | 'videoToVideo'

/* Singular UNIT or ORDER of units (Array<Unit>) */
export type IOUnitSchema = UnitSchema | [UnitSchema]

/**
 * Result `ConnectorAPI` function type
 *
 * @example ['string', 'string']
 *
 * result function type:
 *   (secrets: Secrets, options: Options, unit: string) => string
 **/
export type IOSchema = [inputUnit: IOUnitSchema, outputUnit: IOUnitSchema]

export type TransferMethod =
  | 'streamInStaticOut'
  | 'streamInStreamOut'
  | 'staticInStaticOut'
  | 'staticInStreamOut'

/**
 * IO types that will be transformed into the API
 *
 * @example
 * {
 *   type: 'textToText',
 *   io: {
 *     staticInStaticOut: [['number', 'string']],
 *     streamInStreamOut: [['number', 'string']]
 *   }
 * }
 *
 * Will be transformed into the API [Transformation][inUnitType][outUnitType]:
 *   - signature.textToText.number.string
 *   - signature.textToText.numberStream.stringStream
 **/
export type TransformationIOSchema = {
  type: Transformation
  io: { [k in TransferMethod]?: IOSchema[] }
}

export type ConnectorKeysSchema = Array<{ key: string; description?: string }>

/**
 * Schema for `ConnectorAPI` narrow type/structure generation
 **/
export type ConnectorSchema = {
  /**
   * The `id` is used by `spadar adapter --generate` command
   * for generation of the following files in the ADAPTER module:
   *
   * - `src/connectors/${toKebabCase(connectorId)}.typings.ts/`
   * - `src/connectors/${toKebabCase(connectorId)}.signature.ts/`
   * - `src/connectors/${toKebabCase(connectorId)}.ts`
   **/
  id: string

  /* Explain specifics of the Connector */
  description?: string

  /**
   * @example
   *
   * ```js
   * [{ key: 'SOME_VENDOR_API_KEY', description: 'One might get the key there and there' }]
   * ```
   **/
  keys: ConnectorKeysSchema

  /**
   * Values will be available for all functional calls and used as CLI model parameters
   * Only one property is required in the `options` schema is `model` list of literals
   **/
  options: ModelOptionsSchema

  /**
   * Types of IO following CONNECTOR going to support
   **/
  supportedIO: TransformationIOSchema[]

  // TODO: add `modelNameToPayloadLimit: Record<string, number>` property
  //       as upper bound of payload size for a singular API function call
  //       we support `max/max` on `ObjectSchemaProp` level but it is not
  //       enough when we taking into the account ORDER as function input type
  //       (array of units specified by user). Since connector schema is just
  //       a bunch of models that share same `options` and `keys` schema it
  //       would be ok to have the limits definition on this level.
}

/* Broadcast streams using the following format */
export type StreamOf<T> = {
  stop?: () => void
  pause?: () => void
  resume?: () => void

  /* Stream that can be processed by `for await (const token of stream)` syntax */
  stream: AsyncIterable<T>
}

/**
 * Result adapter module index object type
 **/
export type Adapter = {
  name: string
  version: string
  schema: ConnectorSchema[]
  connectors: { [connectorId: string]: unknown }
}

/**
 * TODO: specification for external usage is not yet ready
 *
 * Each requirement should handle specific feature of
 * the adapter consumer module and therefore must be
 * described.
 *
 * The adapter connector schema must support everything
 * that specified in requirement schema in order to be
 * considered as compatible
 **/
export type Requirement = {
  id: string
  description: string
  schema: TransformationIOSchema
  required?: boolean
}

/**
 * TODO: specification for external usage is not yet ready
 *
 * Feature is something that should work if one or many
 * adapters satisfy one ore many requirement schemas
 **/
export type Feature = {
  id: string
  description: string
  requirements: Requirement[]
}
