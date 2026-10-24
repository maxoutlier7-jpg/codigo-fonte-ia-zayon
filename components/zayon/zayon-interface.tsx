'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { ZayonUIMessage } from '@/lib/zayon-tools'
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/use-speech'
import { ReactorOrb, type ZayonState } from './reactor-orb'
import { ClockPanel, CommandsPanel, SystemsPanel } from './hud-panels'
import { MessageList } from './message-list'
import { CommandInput } from './command-input'
import { cn } from '@/lib/utils'
import { DEFAULT_MODEL_ID } from '@/lib/models'
import { ModelSelect } from './model-select'

function readError(message: string) {
  try {
    return (JSON.parse(message) as { error?: string }).error ?? message
  } catch {
    return message
  }
}

export function ZayonInterface() {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID)
  const voiceEnabledRef = useRef(voiceEnabled)
  const { speaking, speak, cancel } = useSpeechSynthesis()

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled
  }, [voiceEnabled])

  const { messages, sendMessage, status, stop, setMessages, error } = useChat<ZayonUIMessage>({
    onFinish: ({ message, isAbort, isError }) => {
      if (isAbort || isError || !voiceEnabledRef.current) return
      const text = message.parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join(' ')
      speak(text)
    },
  })

  const busy = status === 'submitted' || status === 'streaming'

  const send = useCallback(
    (text: string) => {
      cancel()
      sendMessage({ text }, { body: { model: modelId } })
    },
    [cancel, sendMessage, modelId],
  )

  const recognition = useSpeechRecognition(send)

  const state: ZayonState = recognition.listening
    ? 'listening'
    : busy
      ? 'thinking'
      : speaking
        ? 'speaking'
        : 'idle'

  const hasMessages = messages.length > 0

  return (
    <div className="hud-grid relative flex min-h-dvh flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-zayon-scan bg-gradient-to-b from-transparent via-primary/5 to-transparent"
        aria-hidden="true"
      />

      <header className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-[0.4em] text-primary">ZAYON</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:inline">
            v1.0 · Sistema de IA
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ModelSelect value={modelId} onChange={setModelId} disabled={busy} />
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) cancel()
              setVoiceEnabled((v) => !v)
            }}
            aria-pressed={voiceEnabled}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          >
            {voiceEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voz ativa' : 'Voz desativada'}</span>
          </button>
          {hasMessages && (
            <button
              type="button"
              onClick={() => {
                stop()
                cancel()
                setMessages([])
              }}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Reiniciar</span>
            </button>
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[260px_1fr_260px]">
        <aside className="hidden flex-col gap-4 lg:flex" aria-label="Status do sistema">
          <ClockPanel />
          <SystemsPanel />
        </aside>

        <main className="flex min-h-0 flex-col">
          <div
            className={cn(
              'flex flex-col items-center justify-center transition-all duration-700',
              hasMessages ? 'py-2' : 'flex-1 py-8',
            )}
          >
            {!hasMessages && (
              <>
                <ReactorOrb state={state} />
                <p className="mt-6 max-w-md text-balance text-center text-sm text-muted-foreground">
                  Bom dia. Todos os sistemas estão operacionais. Fale ou digite um comando para começar.
                </p>
              </>
            )}
          </div>

          {hasMessages && (
            <div className="mb-4 max-h-[calc(100dvh-16rem)] flex-1 overflow-y-auto pr-1">
              <MessageList messages={messages} thinking={status === 'submitted'} />
            </div>
          )}

          {error && (
            <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {readError(error.message) || 'Falha na conexão com o núcleo. Tente novamente.'}
            </p>
          )}

          <div className="mt-auto">
            <CommandInput
              onSubmit={send}
              onStop={stop}
              busy={busy}
              listening={recognition.listening}
              interim={recognition.interim}
              voiceSupported={recognition.supported}
              onToggleMic={() => {
                if (recognition.listening) recognition.stop()
                else {
                  cancel()
                  recognition.start()
                }
              }}
            />
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              Enter para enviar · Shift + Enter para nova linha
            </p>
          </div>
        </main>

        <aside className="hidden flex-col gap-4 lg:flex" aria-label="Comandos rápidos">
          <CommandsPanel onCommand={send} disabled={busy} />
        </aside>
      </div>
    </div>
  )
}
