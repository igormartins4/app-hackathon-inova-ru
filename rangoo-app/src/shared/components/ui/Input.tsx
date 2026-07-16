import { TextInput, View } from 'react-native'
import { useThemeColors } from '@/config'
import { useScaledFontStyle } from '@/store/themeStore'
import { ScaledText as Text } from './ScaledText'

interface InputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  accessibilityLabel?: string
  maxLength?: number
  sanitize?: (text: string) => string
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  accessibilityLabel,
  maxLength,
  sanitize,
}: InputProps) {
  const themeColors = useThemeColors()
  const inputTextStyle = useScaledFontStyle(16)

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-primary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(sanitize ? sanitize(text) : text)}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textDisabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: false }}
        style={inputTextStyle}
        className={`min-h-[48px] rounded-xl border px-4 py-3 text-base text-text-primary ${error ? 'border-status-error' : 'border-outline'}`}
      />
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          className="text-sm text-status-error"
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}
