import { cn } from '@/lib/utils'

export type ZayonState = 'idle' | 'listening' | 'thinking' | 'speaking'

const STATE_LABEL: Record<ZayonState, string> = {
  idle: 'Online',
  listening: 'Ouvindo',
  thinking: 'Processando',
  speaking: 'Falando',
}

const STATE_SPEED: Record<ZayonState, { spin: string; pulse: string }> = {
  idle: { spin: '20s', pulse: '4s' },
  listening: { spin: '8s', pulse: '1.2s' },
  thinking: { spin: '2.5s', pulse: '0.9s' },
  speaking: { spin: '6s', pulse: '0.6s' },
}

export function ReactorOrb({ state, compact = false }: { state: ZayonState; compact?: boolean }) {
  const speed = STATE_SPEED[state]
  const isActive = state !== 'idle'

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn('relative aspect-square', compact ? 'w-28' : 'w-56 md:w-72')}
        style={{ '--zayon-speed': speed.spin, '--zayon-pulse': speed.pulse } as React.CSSProperties}
        role="img"
        aria-label={`Núcleo da Zayon — ${STATE_LABEL[state]}`}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-primary/10 blur-2xl transition-opacity duration-700',
            isActive ? 'opacity-100' : 'opacity-50',
            state === 'listening' && 'bg-accent/15',
          )}
        />

        <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-zayon-spin" aria-hidden="true">
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.5"
            strokeWidth="1"
            strokeDasharray="2 6"
          />
          <path d="M100 4 A96 96 0 0 1 196 100" fill="none" stroke="var(--primary)" strokeWidth="2" />
          <path d="M100 196 A96 96 0 0 1 4 100" fill="none" stroke="var(--primary)" strokeWidth="2" />
        </svg>

        <svg
          viewBox="0 0 200 200"
          className="absolute inset-[10%] size-[80%] animate-zayon-spin-reverse"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke={state === 'listening' ? 'var(--accent)' : 'var(--primary)'}
            strokeOpacity="0.8"
            strokeWidth="6"
            strokeDasharray="30 18"
          />
        </svg>

        <svg viewBox="0 0 200 200" className="absolute inset-[22%] size-[56%] animate-zayon-spin" aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="6"
              x2="100"
              y2={i % 3 === 0 ? 22 : 14}
              stroke="var(--primary)"
              strokeOpacity={i % 3 === 0 ? 0.9 : 0.4}
              strokeWidth="2"
              transform={`rotate(${i * 10} 100 100)`}
            />
          ))}
        </svg>

        <div className="absolute inset-[34%] animate-zayon-pulse rounded-full border border-primary/60 bg-primary/10 shadow-[0_0_40px_var(--primary)]">
          <div
            className={cn(
              'absolute inset-[18%] rounded-full bg-primary/80 blur-[2px] transition-colors duration-500',
              state === 'listening' && 'bg-accent/80',
            )}
          />
          <div className="absolute inset-[34%] rounded-full bg-foreground/90" />
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-mono text-3xl font-semibold tracking-[0.5em] text-primary md:text-4xl">ZAYON</h1>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <span
              className={cn(
                'size-1.5 rounded-full bg-primary',
                isActive && 'animate-pulse',
                state === 'listening' && 'bg-accent',
              )}
              aria-hidden="true"
            />
            <span aria-live="polite">{STATE_LABEL[state]}</span>
          </p>
        </div>
      )}
    </div>
  )
}
