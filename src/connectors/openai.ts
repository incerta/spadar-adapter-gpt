import OpenAI from 'openai'

import signature from './openai.signature'

signature.textToText.string.string = async (_keys, _options, unit) => {
  return 'HELLO FROM ADAPTER' + ' ' + unit
}

signature.textToText.chatMessageArr.stringStream = async (
  keys,
  options,
  chatMessages
) => {
  const formattedMessages = chatMessages.map(
    (
      message
    ): {
      role: 'user' | 'assistant' | 'system'
      content: string
    } => ({
      role: message.role,
      content: message.payload,
    })
  )

  const openAI = new OpenAI({ apiKey: keys.OPENAI_API_KEY })
  const originalStream = await openAI.chat.completions.create({
    model: options.model,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
    top_p: options.topP,
    messages: formattedMessages,
    stream: true,
  })

  const alternativeStream = {
    [Symbol.asyncIterator]: async function* () {
      for await (const chunk of originalStream) {
        yield chunk.choices[0]?.delta?.content || ''
      }
    },
  }

  return {
    stream: alternativeStream,
  }
}

export default signature
