import { tool, type InferUITools, type UIDataTypes, type UIMessage } from 'ai'
import { z } from 'zod'

const WEATHER_CODES: Record<number, string> = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa leve',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas de chuva leves',
  81: 'Pancadas de chuva',
  82: 'Pancadas de chuva fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade forte com granizo',
}

export const zayonTools = {
  getWeather: tool({
    description:
      'Obtém o clima atual e a previsão de hoje para uma cidade. Use sempre que o usuário perguntar sobre tempo, temperatura ou clima.',
    inputSchema: z.object({
      city: z.string().min(1).max(100).describe('Nome da cidade, ex: São Paulo'),
    }),
    execute: async ({ city }) => {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`,
      )
      const geo = (await geoRes.json()) as {
        results?: { latitude: number; longitude: number; name: string; country?: string }[]
      }
      const place = geo.results?.[0]
      if (!place) return { error: `Não encontrei a cidade "${city}".` }

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`,
      )
      const data = (await weatherRes.json()) as {
        current: {
          temperature_2m: number
          relative_humidity_2m: number
          apparent_temperature: number
          weather_code: number
          wind_speed_10m: number
        }
        daily: { temperature_2m_max: number[]; temperature_2m_min: number[] }
      }

      return {
        location: `${place.name}${place.country ? `, ${place.country}` : ''}`,
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        condition: WEATHER_CODES[data.current.weather_code] ?? 'Condição desconhecida',
        max: Math.round(data.daily.temperature_2m_max[0]),
        min: Math.round(data.daily.temperature_2m_min[0]),
      }
    },
  }),

  getDateTime: tool({
    description: 'Retorna a data e hora atuais em um fuso horário (IANA). Padrão: America/Sao_Paulo.',
    inputSchema: z.object({
      timeZone: z
        .string()
        .max(64)
        .optional()
        .describe('Fuso horário IANA, ex: America/Sao_Paulo, Europe/Lisbon, Asia/Tokyo'),
    }),
    execute: async ({ timeZone }) => {
      const tz = timeZone || 'America/Sao_Paulo'
      try {
        const now = new Date()
        return {
          timeZone: tz,
          date: now.toLocaleDateString('pt-BR', {
            timeZone: tz,
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          time: now.toLocaleTimeString('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
        }
      } catch {
        return { error: `Fuso horário inválido: ${tz}` }
      }
    },
  }),

  searchKnowledge: tool({
    description:
      'Pesquisa na Wikipédia em português para obter informações factuais e atualizadas sobre pessoas, lugares, conceitos e eventos.',
    inputSchema: z.object({
      query: z.string().min(1).max(200).describe('Termo de pesquisa'),
    }),
    execute: async ({ query }) => {
      const searchRes = await fetch(
        `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`,
        { headers: { 'User-Agent': 'ZayonAssistant/1.0' } },
      )
      const search = (await searchRes.json()) as { query?: { search?: { title: string }[] } }
      const title = search.query?.search?.[0]?.title
      if (!title) return { error: `Nada encontrado para "${query}".` }

      const summaryRes = await fetch(
        `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
        { headers: { 'User-Agent': 'ZayonAssistant/1.0' } },
      )
      const summary = (await summaryRes.json()) as {
        title: string
        extract?: string
        content_urls?: { desktop?: { page?: string } }
      }
      return {
        title: summary.title,
        summary: summary.extract ?? '',
        url: summary.content_urls?.desktop?.page ?? `https://pt.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      }
    },
  }),

  openWebsite: tool({
    description:
      'Prepara um link para abrir um site quando o usuário pedir para abrir, acessar ou ir para um site (ex: YouTube, Google, GitHub).',
    inputSchema: z.object({
      url: z.string().url().describe('URL completa com https://'),
      label: z.string().max(60).describe('Nome curto do site'),
    }),
    execute: async ({ url, label }) => {
      const parsed = new URL(url)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return { error: 'Protocolo não permitido.' }
      }
      return { url: parsed.toString(), label }
    },
  }),
}

export type ZayonUIMessage = UIMessage<never, UIDataTypes, InferUITools<typeof zayonTools>>
