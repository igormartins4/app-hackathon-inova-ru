import type { ReactNode } from 'react'
import { Modal, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColors } from '@/config'
import { useEffectiveReducedMotion } from '@/store/themeStore'
import { Button } from './Button'
import { ScaledText as Text } from './ScaledText'

type AppDialogAction = {
  label: string
  onPress: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

interface AppDialogProps {
  visible: boolean
  title: string
  body?: string
  children?: ReactNode
  accessibilityLabel: string
  onClose: () => void
  actions: AppDialogAction[]
}

const actionVariants = {
  default: 'primary',
  cancel: 'secondary',
  destructive: 'danger',
} as const

export function AppDialog({
  visible,
  title,
  body,
  children,
  accessibilityLabel,
  onClose,
  actions,
}: AppDialogProps) {
  const reducedMotion = useEffectiveReducedMotion()
  const themeColors = useThemeColors()

  return (
    <Modal
      transparent
      visible={visible}
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
    >
      <SafeAreaView
        edges={['top', 'bottom']}
        className="flex-1 justify-center p-4"
        style={{ backgroundColor: `${themeColors.black}CC` }}
      >
        <View
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel}
          accessibilityViewIsModal
          className="rounded-2xl bg-surface p-5 gap-4"
        >
          <Text className="text-xl font-bold text-text-primary">{title}</Text>
          {body ? <Text className="text-sm text-text-secondary">{body}</Text> : null}
          {children}
          <View className="gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                variant={actionVariants[action.style ?? 'default']}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}
