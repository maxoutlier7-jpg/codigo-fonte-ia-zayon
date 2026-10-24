'use client'

import { useEffect, useState } from 'react'
import { Activity, Cpu, Globe, Shield } from 'lucide-react'

function HudFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative rounded-md border border-border bg-card/40 p-4 backdrop-blur-sm">
      <span className="absolute -left-px -top-px size-3 border-l-2 border-t-2 border-primary" aria-hidden="true" />
      <span
        className="absolute -bottom-px -right-px size-3 border-b-2 border-r-2 border-primary"
        aria-hidden="true"
      />
      <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">{title}</h2>
      {children}
    </section>
  )
}

export function ClockPanel() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <HudFrame title="Tempo local">
      <p className="font-mono text-3xl tabular-nums text-foreground">
        {now ? now.toLocaleTimeString('pt-BR') : '--:--:--'}
      </p>
      <p className="mt-1 text-xs capitalize text-muted-foreground">
        {now ? now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : '\u00a0'}
      </p>
    </HudFrame>
  )
}

const SYSTEMS = [
  { label: 'Núcleo neural', value: 98, icon: Cpu },
  { label: 'Rede global', value: 100, icon: Globe },
  { label: 'Segurança', value: 100, icon: Shield },
  { label: 'Sincronização', value: 94, icon: Activity },
]

export function SystemsPanel() {
  return (
    <HudFrame title="Diagnóstico">
      <ul className="flex flex-col gap-3">
        {SYSTEMS.map(({ label, value, icon: Icon }) => (
          <li key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-3.5 text-primary" aria-hidden="true" />
                {label}
              </span>
              <span className="font-mono tabular-nums text-foreground">{value}%</span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={label}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </HudFrame>
  )
}

const COMMANDS = [
  'Como está o clima no Rio de Janeiro?',
  'Que horas são em Tóquio?',
  'Quem foi Santos Dumont?',
  'Abra o YouTube',
  'Me dê 3 ideias de projetos com IA',
]

export function CommandsPanel({ onCommand, disabled }: { onCommand: (text: string) => void; disabled: boolean }) {
  return (
    <HudFrame title="Protocolos rápidos">
      <ul className="flex flex-col gap-1.5">
        {COMMANDS.map((command) => (
          <li key={command}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCommand(command)}
              className="w-full rounded-sm border border-transparent px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-border hover:bg-primary/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="mr-2 font-mono text-primary" aria-hidden="true">
                {'>'}
              </span>
              {command}
            </button>
          </li>
        ))}
      </ul>
    </HudFrame>
  )
}
