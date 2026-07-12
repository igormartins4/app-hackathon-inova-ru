import { View } from 'react-native'

interface CardProps {
  children: React.ReactNode
  className?: string
  accessibilityLabel?: string
  accessibilityRole?: 'none' | 'summary' | 'region' | 'search'
}

export function Card({
  children,
  className = '',
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </View>
  )
}
