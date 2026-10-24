'use client'

import { useState } from 'react'
import { ArrowUp, Mic, MicOff, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  onSubmit: (text: string) => void
  onStop: () => void
  busy: boolean
  listening: boolean
  interim: string
  voiceSupported: boolean
  onToggleMic: () => void
}

export function CommandInput({ onSubmit, onStop, busy, listening, interim, voiceSupported, onToggleMic }: Props) {
  const [value, setValue] = useState('')

  const submit = () => {
    const text = value.trim()
    if (!text || busy) return
    onSubmit(text)
    setValue('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="relative flex items-end gap-2 rounded-md border border-input bg-card/70 p-2 backdrop-blur-md focus-within:border-primary/60"
    >
      <span className="absolute -left-px -top-px size-3 border-l-2 border-t-2 border-primary" aria-hidden="true" />
      <span className="absolute -bottom-px -right-px size-3 border-b-2 border-r-2 border-primary" aria-hidden="true" />

      <label htmlFor="zayon-input" className="sr-only">
        Comando para Zayon
      </label>
      <textarea
        id="zayon-input"
        rows={1}
        value={listening ? interim : value}
        readOnly={listening}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            submit()
          }
        }}
        placeholder={listening ? 'Ouvindo...' : 'Digite um comando ou fale com a Zayon...'}
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground field-sizing-content"
      />

      {voiceSupported && (
        <button
          type="button"
          onClick={onToggleMic}
          aria-pressed={listening}
          aria-label={listening ? 'Parar de ouvir' : 'Falar com a Zayon'}
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors',
            listening
              ? 'animate-pulse border-accent bg-accent/20 text-accent'
              : 'border-border text-muted-foreground hover:border-primary/60 hover:text-primary',
          )}
        >
          {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
      )}

      {busy ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Interromper resposta"
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/80 text-foreground transition-colors hover:bg-destructive"
        >
          <Square className="size-3.5 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Enviar comando"
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </form>
  )
}
