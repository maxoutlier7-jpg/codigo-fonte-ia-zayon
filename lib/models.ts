export type ZayonProvider = 'openrouter' | 'gateway'

export type ZayonModel = {
  id: string
  label: string
  provider: ZayonProvider
  free: boolean
}

export const ZAYON_MODELS: ZayonModel[] = [
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super', provider: 'openrouter', free: true },
  { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B', provider: 'openrouter', free: true },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', label: 'Nemotron 3 Ultra', provider: 'openrouter', free: true },
  { id: 'thinkingmachines/inkling:free', label: 'Inkling', provider: 'openrouter', free: true },
  { id: 'poolside/laguna-s-2.1:free', label: 'Laguna S 2.1', provider: 'openrouter', free: true },
  { id: 'google/gemini-3.5-flash', label: 'Gemini 3.5 Flash', provider: 'gateway', free: false },
]

export const DEFAULT_MODEL_ID = ZAYON_MODELS[0].id

export function findModel(id: unknown): ZayonModel {
  return ZAYON_MODELS.find((m) => m.id === id) ?? ZAYON_MODELS[0]
}
