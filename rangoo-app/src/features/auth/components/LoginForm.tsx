import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { useThemeColors } from '@/config'
import { Button, ErrorMessage, Text } from '@/shared/components/ui'
import { isValidCpf, maskCpf, unmask } from '@/shared/utils'

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

  const handleCpfChange = (text: string) => {
    setCpf(maskCpf(text))
    if (cpfError) setCpfError('')
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (passwordError) setPasswordError('')
  }

  const handleSubmit = () => {
    const clean = unmask(cpf)
    let hasError = false

    if (!isValidCpf(cpf)) {
      setCpfError('CPF inválido.')
      hasError = true
    }

    if (!password.trim()) {
      setPasswordError('Senha é obrigatória.')
      hasError = true
    }

    if (hasError) return

    onSubmit(clean, password)
  }

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">CPF</Text>
        <TextInput
          value={cpf}
          onChangeText={handleCpfChange}
          placeholder="000.000.000-00"
          placeholderTextColor={themeColors.textDisabled}
          keyboardType="numeric"
          editable={!isLoading}
          accessibilityLabel="Campo de CPF"
          accessibilityHint="Digite os 11 números do seu CPF institucional"
          className="bg-surface border border-outline rounded-xl px-4 py-3.5 text-base text-text-primary min-h-[48px]"
        />
        {cpfError ? (
          <Text accessibilityRole="alert" className="text-xs text-status-error">
            {cpfError}
          </Text>
        ) : null}
      </View>

      <View className="gap-1.5">
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">Senha</Text>
        <View className="relative">
          <TextInput
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="minhaSenha"
            placeholderTextColor={themeColors.textDisabled}
            secureTextEntry={!showPassword}
            editable={!isLoading}
            accessibilityLabel="Campo de senha"
            accessibilityHint="Digite sua senha institucional"
            className="bg-surface border border-outline rounded-xl px-4 py-3.5 pr-12 text-base text-text-primary min-h-[48px]"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityHint="Alterna a visibilidade da senha digitada"
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
          <Text accessibilityRole="alert" className="text-xs text-status-error">
            {passwordError}
          </Text>
        ) : null}
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      <Button label="Entrar" onPress={handleSubmit} loading={isLoading} disabled={isLoading} />
    </View>
  )
}
