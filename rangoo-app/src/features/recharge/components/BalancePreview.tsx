import { Ionicons } from '@expo/vector-icons'
import { useThemeColors } from '@/config'
import { Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency } from '@/shared/utils'

interface BalancePreviewProps {
  currentBalance: number
  amount: number
}

export function BalancePreview({ currentBalance, amount }: BalancePreviewProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const projectedBalance = currentBalance + amount
  const hasAmount = amount > 0

  return (
    <Card
      accessibilityRole="summary"
      accessibilityLabel={
        hasAmount
          ? t.balancePreviewA11yWithAmount
              .replace('{current}', formatCurrency(currentBalance))
              .replace('{projected}', formatCurrency(projectedBalance))
          : t.balancePreviewA11yNoAmount.replace('{current}', formatCurrency(currentBalance))
      }
      className="mb-5"
    >
      <Text className="text-sm text-text-secondary">{t.balancePreviewAvailable}</Text>
      <Text className="text-3xl font-bold text-text-primary mt-1">
        {formatCurrency(currentBalance)}
      </Text>
      {hasAmount && (
        <>
          <Text className="text-sm text-text-secondary mt-4">{t.balancePreviewAfter}</Text>
          <Text className="text-xl font-bold text-primary mt-1">
            {formatCurrency(projectedBalance)}
          </Text>
          <Text className="text-xs text-text-secondary mt-3">
            <Ionicons name="information-circle" size={12} color={themeColors.textSecondary} />{' '}
            {t.balancePreviewNote}
          </Text>
        </>
      )}
    </Card>
  )
}
