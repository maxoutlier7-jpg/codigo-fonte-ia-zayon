'use client'

import { Cpu } from 'lucide-react'
import { ZAYON_MODELS } from '@/lib/models'

type ModelSelectProps = {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function ModelSelect({ value, onChange, disabled }: ModelSelectProps) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-muted-foreground transition-colors focus-within:border-primary/60 hover:border-primary/60">
      <Cpu className="size-3.5 text-primary" aria-hidden="true" />
      <span className="sr-only">Modelo de IA</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="max-w-[9rem] cursor-pointer bg-transparent font-mono text-[10px] uppercase tracking-widest text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-none"
      >
        <optgroup label="OpenRouter · grátis">
          {ZAYON_MODELS.filter((m) => m.provider === 'openrouter').map((m) => (
            <option key={m.id} value={m.id} className="bg-card text-foreground">
              {m.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Vercel AI Gateway">
          {ZAYON_MODELS.filter((m) => m.provider === 'gateway').map((m) => (
            <option key={m.id} value={m.id} className="bg-card text-foreground">
              {m.label}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  )
}
