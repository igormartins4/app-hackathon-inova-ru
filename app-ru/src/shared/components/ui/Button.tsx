import { ActivityIndicator, Pressable, Text } from 'react-native'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:opacity-80',
  secondary: 'bg-surface-variant active:opacity-80',
  danger: 'bg-status-error active:opacity-80',
}

const textStyles: Record<ButtonVariant, string> = {
  primary: 'text-text-inverse',
  secondary: 'text-text-primary',
  danger: 'text-text-inverse',
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
      className={`min-h-[48px] min-w-[48px] items-center justify-center rounded-xl px-6 py-3.5 ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' ? '#191C1C' : '#FFFFFF'} />
      ) : (
        <Text className={`text-base font-semibold ${textStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  )
}
