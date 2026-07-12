import { useState } from 'react'
import { View } from 'react-native'
import { Button, ErrorMessage, Input } from '@/shared/components/ui'
import { cleanCpf, formatCpf } from '@/shared/utils'

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

  const handleCpfChange = (text: string) => {
    setCpf(formatCpf(text))
    if (cpfError) setCpfError('')
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    if (passwordError) setPasswordError('')
  }

  const handleSubmit = () => {
    const clean = cleanCpf(cpf)
    let hasError = false

    if (clean.length !== 11) {
      setCpfError('CPF deve conter 11 dígitos.')
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
      <Input
        label="CPF"
        value={cpf}
        onChangeText={handleCpfChange}
        placeholder="000.000.000-00"
        keyboardType="numeric"
        error={cpfError}
        accessibilityLabel="Campo de CPF"
      />
      <Input
        label="Senha"
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="Digite sua senha"
        secureTextEntry
        error={passwordError}
        accessibilityLabel="Campo de senha"
      />
      {error ? <ErrorMessage message={error} /> : null}
      <Button label="Entrar" onPress={handleSubmit} loading={isLoading} disabled={isLoading} />
    </View>
  )
}
