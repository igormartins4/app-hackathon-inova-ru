import { Ionicons } from '@expo/vector-icons'
import { useRef, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import {
  CPF_MAX_LENGTH,
  firstFieldError,
  loginSchema,
  maskCpf,
  PASSWORD_MAX_LENGTH,
  sanitizeDigits,
  sanitizePassword,
  unmask,
} from '@/shared/utils'
import { useScaledFontStyle } from '@/store/themeStore'

interface LoginFormProps {
  onSubmit: (cpf: string, password: string) => void
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const inputTextStyle = useScaledFontStyle(16)
  const passwordInputRef = useRef<TextInput>(null)

  const handleCpfChange = (text: string) => {
    setCpf(maskCpf(sanitizeDigits(text, 11)))
    if (cpfError) setCpfError('')
  }

  const handlePasswordChange = (text: string) => {
    setPassword(sanitizePassword(text))
    if (passwordError) setPasswordError('')
  }

  const handleSubmit = () => {
    const clean = unmask(cpf)
    const result = loginSchema.safeParse({ cpf: clean, password })

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setCpfError(firstFieldError(errors, 'cpf') ?? '')
      setPasswordError(firstFieldError(errors, 'password') ?? '')
      return
    }

    onSubmit(clean, password)
  }

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.loginCpfLabel}
        </Text>
        <TextInput
          value={cpf}
          onChangeText={handleCpfChange}
          placeholder={t.loginCpfPlaceholder}
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!isLoading}
          maxLength={CPF_MAX_LENGTH}
          accessibilityLabel={t.loginCpfA11yLabel}
          accessibilityHint={t.loginCpfA11yHint}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          style={inputTextStyle}
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        {cpfError ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            className="text-xs text-status-error"
          >
            {cpfError}
          </Text>
        ) : null}
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {t.loginPasswordLabel}
        </Text>
        <View className="relative">
          <TextInput
            ref={passwordInputRef}
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="••••••••"
            placeholderTextColor={themeColors.textDisabled}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            maxLength={PASSWORD_MAX_LENGTH}
            accessibilityLabel={t.loginPasswordA11yLabel}
            accessibilityHint={t.loginPasswordA11yHint}
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={inputTextStyle}
            className="bg-surface border border-outline rounded-xl px-4 py-3.5 pr-12 text-base text-text-primary min-h-[48px]"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? t.loginHidePassword : t.loginShowPassword}
            accessibilityHint={t.loginTogglePasswordHint}
            className="absolute right-2 top-2 w-10 h-10 items-center justify-center"
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={themeColors.textSecondary}
            />
          </Pressable>
        </View>
        {passwordError ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            className="text-xs text-status-error"
          >
            {passwordError}
          </Text>
        ) : null}
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      <Button
        label={t.loginButton}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  )
}
