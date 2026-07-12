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
  primary: 'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-gray-200 active:bg-gray-300',
  danger: 'bg-red-600 active:bg-red-700',
}

const textStyles: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  danger: 'text-white',
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
      className={`min-h-[48px] min-w-[48px] items-center justify-center rounded-lg px-6 py-3 ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'secondary' ? '#111827' : '#fff'} />
      ) : (
        <Text className={`text-base font-semibold ${textStyles[variant]}`}>{label}</Text>
      )}
    </Pressable>
  )
}
