import { View } from 'react-native'
import { useThemeStore } from '@/store/themeStore'

interface CardProps {
  children: React.ReactNode
  className?: string
  accessibilityLabel?: string
  accessibilityRole?: 'none' | 'summary' | 'search' | 'alert'
}

export function Card({
  children,
  className = '',
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  const highContrast = useThemeStore((s) => s.highContrast)

  // shadow-sm não produz nenhuma separação visível sobre um fundo preto puro
  // (sombra é um gradiente escuro — invisível contra preto). Em alto
  // contraste, `surface` e `background` também são a mesma cor de propósito,
  // então o card precisa de uma borda real pra não se fundir com a tela.
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      className={`rounded-2xl bg-surface p-4 shadow-sm border ${
        highContrast ? 'border-outline' : 'border-outline-variant'
      } ${className}`}
    >
      {children}
    </View>
  )
}
