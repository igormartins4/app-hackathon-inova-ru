import { ScaledText as Text } from './ScaledText'

type Situacao = 'A' | 'I' | 'B' | string

interface StatusBadgeProps {
  situacao: Situacao
  /** Tailwind text-size class, e.g. "text-xs" or "text-sm". Defaults to "text-xs". */
  size?: string
}

const LABELS: Record<string, string> = {
  A: 'ATIVO',
  B: 'BLOQUEADO',
}

const COLORS: Record<string, string> = {
  A: 'text-status-success',
  B: 'text-status-error',
}

/** Renders the consumidor.situacao field exactly as caixa alta text, no icon/emoji (Anexo C). */
export function StatusBadge({ situacao, size = 'text-xs' }: StatusBadgeProps) {
  const label = LABELS[situacao] ?? 'INATIVO'
  const color = COLORS[situacao] ?? 'text-status-error'

  return (
    <Text accessibilityRole="text" className={`${size} font-bold uppercase ${color}`}>
      {label}
    </Text>
  )
}
