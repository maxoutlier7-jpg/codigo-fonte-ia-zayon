'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Clock, CloudSun, ExternalLink, Loader2, BookOpen } from 'lucide-react'
import type { ZayonUIMessage } from '@/lib/zayon-tools'
import { cn } from '@/lib/utils'

type Part = ZayonUIMessage['parts'][number]

function ToolShell({ icon: Icon, label, children }: { icon: typeof Clock; label: string; children?: React.ReactNode }) {
  return (
    <div className="my-2 rounded-md border border-border bg-background/60 p-3">
      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      {children}
    </div>
  )
}

function ToolLoading({ label }: { label: string }) {
  return (
    <p className="my-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden="true" />
      {label}
    </p>
  )
}

function ToolError({ message }: { message: string }) {
  return <p className="my-2 text-xs text-destructive">{message}</p>
}

function renderPart(part: Part, key: string) {
  switch (part.type) {
    case 'text':
      return (
        <div
          key={key}
          className="prose-zayon text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5"
        >
          <ReactMarkdown>{part.text}</ReactMarkdown>
        </div>
      )

    case 'tool-getWeather': {
      if (part.state === 'input-streaming' || part.state === 'input-available')
        return <ToolLoading key={key} label="Consultando satélites meteorológicos..." />
      if (part.state === 'output-error') return <ToolError key={key} message={part.errorText} />
      if (part.state !== 'output-available') return null
      const out = part.output
      if ('error' in out) return <ToolError key={key} message={out.error ?? 'Erro'} />
      return (
        <ToolShell key={key} icon={CloudSun} label={out.location}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-4xl text-foreground">{out.temperature}°C</p>
              <p className="text-xs text-muted-foreground">{out.condition}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-right font-mono text-[11px] text-muted-foreground">
              <dt>Sensação</dt>
              <dd className="text-foreground">{out.feelsLike}°</dd>
              <dt>Mín/Máx</dt>
              <dd className="text-foreground">
                {out.min}°/{out.max}°
              </dd>
              <dt>Umidade</dt>
              <dd className="text-foreground">{out.humidity}%</dd>
              <dt>Vento</dt>
              <dd className="text-foreground">{out.wind} km/h</dd>
            </dl>
          </div>
        </ToolShell>
      )
    }

    case 'tool-getDateTime': {
      if (part.state !== 'output-available') {
        if (part.state === 'output-error') return <ToolError key={key} message={part.errorText} />
        return <ToolLoading key={key} label="Sincronizando relógio atômico..." />
      }
      const out = part.output
      if ('error' in out) return <ToolError key={key} message={out.error ?? 'Erro'} />
      return (
        <ToolShell key={key} icon={Clock} label={out.timeZone}>
          <p className="font-mono text-3xl text-foreground">{out.time}</p>
          <p className="text-xs capitalize text-muted-foreground">{out.date}</p>
        </ToolShell>
      )
    }

    case 'tool-searchKnowledge': {
      if (part.state !== 'output-available') {
        if (part.state === 'output-error') return <ToolError key={key} message={part.errorText} />
        return <ToolLoading key={key} label="Acessando base de conhecimento..." />
      }
      const out = part.output
      if ('error' in out) return <ToolError key={key} message={out.error ?? 'Erro'} />
      return (
        <ToolShell key={key} icon={BookOpen} label="Base de conhecimento">
          <a
            href={out.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
          >
            {out.title}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </ToolShell>
      )
    }

    case 'tool-openWebsite': {
      if (part.state !== 'output-available') {
        if (part.state === 'output-error') return <ToolError key={key} message={part.errorText} />
        return <ToolLoading key={key} label="Preparando conexão..." />
      }
      const out = part.output
      if ('error' in out) return <ToolError key={key} message={out.error ?? 'Erro'} />
      return (
        <a
          key={key}
          href={out.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-2 inline-flex items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <ExternalLink className="size-3.5" aria-hidden="true" />
          Abrir {out.label}
        </a>
      )
    }

    default:
      return null
  }
}

export function MessageList({ messages, thinking }: { messages: ZayonUIMessage[]; thinking: boolean }) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, thinking])

  return (
    <div className="flex flex-col gap-5" role="log" aria-live="polite" aria-label="Conversa com Zayon">
      {messages.map((message) => {
        const isUser = message.role === 'user'
        return (
          <article key={message.id} className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {isUser ? 'Você' : 'Zayon'}
            </span>
            <div
              className={cn(
                'max-w-[90%] rounded-md px-4 py-2.5',
                isUser
                  ? 'border border-accent/30 bg-accent/10 text-foreground'
                  : 'border-l-2 border-primary bg-card/60 text-foreground/90',
              )}
            >
              {message.parts.map((part, i) => renderPart(part, `${message.id}-${i}`))}
            </div>
          </article>
        )
      })}

      {thinking && (
        <div className="flex items-center gap-2 font-mono text-xs text-primary">
          <span className="flex gap-1" aria-hidden="true">
            <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-primary" />
          </span>
          Processando...
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
