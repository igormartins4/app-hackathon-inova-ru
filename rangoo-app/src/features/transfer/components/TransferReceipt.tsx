import * as Sharing from 'expo-sharing'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Share, View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { Button, Card, Text } from '@/shared/components/ui'
import { useI18n } from '@/shared/i18n'
import { formatCurrency, maskRecipientDocument } from '@/shared/utils'
import type { TransferResponse } from '../types/transfer.types'

interface TransferReceiptProps {
  transfer: TransferResponse
  onBack: () => void
}

export function TransferReceipt({ transfer, onBack }: TransferReceiptProps) {
  const { t, locale } = useI18n()
  const receiptRef = useRef<View>(null)
  const [sharing, setSharing] = useState(false)
  const document = maskRecipientDocument(transfer.destinatario_documento)
  const dateTime = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(transfer.data_hora))
  const details = useMemo(
    () => [
      [t.transferReceiptRecipient, transfer.destinatario_nome],
      [t.transferReceiptDocument, document],
      [t.transferReceiptAmount, formatCurrency(transfer.valor)],
      [t.transferReceiptDateTime, dateTime],
      [t.transferReceiptId, String(transfer.transfer_id)],
    ],
    [
      document,
      dateTime,
      t.transferReceiptAmount,
      t.transferReceiptDateTime,
      t.transferReceiptDocument,
      t.transferReceiptId,
      t.transferReceiptRecipient,
      transfer.destinatario_nome,
      transfer.transfer_id,
      transfer.valor,
    ],
  )
  const shareText = useCallback(
    () =>
      Share.share({
        message: [
          t.transferReceiptTitle,
          ...details.map(([label, value]) => `${label}: ${value}`),
        ].join('\n'),
      }),
    [details, t.transferReceiptTitle],
  )
  const handleShare = useCallback(async () => {
    setSharing(true)
    try {
      const uri = await captureRef(receiptRef, { format: 'png', quality: 1, result: 'tmpfile' })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t.transferShareReceipt,
        })
      } else {
        await shareText()
      }
    } catch {
      await shareText()
    } finally {
      setSharing(false)
    }
  }, [shareText, t.transferShareReceipt])

  return (
    <View className="gap-4">
      <View ref={receiptRef} collapsable={false}>
        <Card
          accessibilityRole="summary"
          accessibilityLabel={t.transferReceiptTitle}
          className="gap-4"
        >
          <Text className="text-xl font-bold text-text-primary">{t.transferReceiptTitle}</Text>
          {details.map(([label, value]) => (
            <View key={label} className="flex-row justify-between gap-3">
              <Text className="flex-1 text-sm text-text-secondary">{label}</Text>
              <Text className="flex-1 text-right text-sm font-bold text-text-primary">{value}</Text>
            </View>
          ))}
        </Card>
      </View>
      <Button
        label={t.transferShareReceipt}
        onPress={handleShare}
        loading={sharing}
        disabled={sharing}
      />
      <Button label={t.transferBackHome} onPress={onBack} variant="secondary" />
    </View>
  )
}
