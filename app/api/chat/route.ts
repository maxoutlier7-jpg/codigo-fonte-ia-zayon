import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { zayonTools, type ZayonUIMessage } from '@/lib/zayon-tools'
import { findModel } from '@/lib/models'

export const maxDuration = 60

const INSTRUCTIONS = `Você é ZAYON, uma inteligência artificial avançada no estilo do J.A.R.V.I.S.
Personalidade: elegante, leal, confiante, levemente espirituosa e extremamente competente.
Trate o usuário por "senhor" ou "senhora" de forma natural e ocasional, sem exagero.
Responda sempre em português do Brasil, de forma clara e objetiva. Prefira respostas curtas
(2 a 4 frases) a menos que o usuário peça detalhes, pois suas respostas podem ser lidas em voz alta.
Use markdown apenas quando ajudar (listas, código).
Use as ferramentas disponíveis sempre que forem úteis: clima, data/hora, pesquisa de conhecimento
e abertura de sites. Nunca invente dados que uma ferramenta poderia fornecer.`

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

export async function POST(req: Request) {
  const { messages, model: modelId }: { messages: ZayonUIMessage[]; model?: string } = await req.json()
  const selected = findModel(modelId)

  if (selected.provider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: 'Configure a variável OPENROUTER_API_KEY (gratuita em openrouter.ai/keys) para usar este modelo.' },
      { status: 400 },
    )
  }

  const result = streamText({
    model: selected.provider === 'openrouter' ? openrouter(selected.id) : selected.id,
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    tools: zayonTools,
    stopWhen: isStepCount(5),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        const message = error instanceof Error ? error.message : String(error)
        if (/credit card/i.test(message)) {
          return 'O AI Gateway da Vercel exige um cartão de crédito cadastrado para liberar os créditos gratuitos. Adicione um cartão em vercel.com → AI Gateway e tente novamente.'
        }
        if (/rate limit|429/i.test(message)) {
          return 'Este modelo gratuito está congestionado no momento. Escolha outro modelo no seletor e tente novamente.'
        }
        return 'Falha na conexão com o núcleo. Tente outro modelo ou tente novamente.'
      },
    }),
  })
}
