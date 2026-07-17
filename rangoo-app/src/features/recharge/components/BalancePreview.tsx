import { Ionicons } from '@expo/vector-icons'
import { useThemeColors } from '@/config'
import { Card, Text } from '@/shared/components/ui'
import { formatCurrency } from '@/shared/utils'

interface BalancePreviewProps {
  currentBalance: number
  amount: number
}

export function BalancePreview({ currentBalance, amount }: BalancePreviewProps) {
  const themeColors = useThemeColors()
  const projectedBalance = currentBalance + amount
  const hasAmount = amount > 0

  return (
    <Card
      accessibilityRole="summary"
      accessibilityLabel={
        hasAmount
          ? `Saldo atual ${formatCurrency(currentBalance)}. Após a recarga, saldo previsto ${formatCurrency(projectedBalance)}.`
          : `Saldo atual ${formatCurrency(currentBalance)}.`
      }
      className="mb-5"
    >
      <Text className="text-sm text-text-secondary">Saldo disponível</Text>
      <Text className="text-3xl font-bold text-text-primary mt-1">
        {formatCurrency(currentBalance)}
      </Text>
      {hasAmount && (
        <>
          <Text className="text-sm text-text-secondary mt-4">Depois desta recarga</Text>
          <Text className="text-xl font-bold text-primary mt-1">
            {formatCurrency(projectedBalance)}
          </Text>
          <Text className="text-xs text-text-secondary mt-3">
            <Ionicons name="information-circle" size={12} color={themeColors.textSecondary} /> O
            saldo só muda depois da confirmação do PIX.
          </Text>
        </>
      )}
    </Card>
  )
}
