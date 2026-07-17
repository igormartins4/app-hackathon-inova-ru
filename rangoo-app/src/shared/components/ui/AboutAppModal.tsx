import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { Linking, Modal, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColors } from '@/config'
import { useI18n } from '@/shared/i18n'
import { useResolvedTheme } from '@/store/themeStore'
import { Button } from './Button'
import { ScaledText as Text } from './ScaledText'

interface AboutAppModalProps {
  visible: boolean
  onClose: () => void
}

export function AboutAppModal({ visible, onClose }: AboutAppModalProps) {
  const themeColors = useThemeColors()
  const { t } = useI18n()
  const resolvedTheme = useResolvedTheme()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Modal do Android abre em janela nativa própria — sem isto, a barra de
          status volta pro padrão do sistema (ícones escuros) e some contra um
          fundo escuro. Reafirma o estilo certo enquanto o modal está aberto. */}
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
        <ScrollView className="flex-1" contentContainerClassName="p-5 gap-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text-primary">Rangoo Universitário</Text>
              <Text className="text-sm text-text-secondary mt-1">
                Hackathon InovaRU 2026/01 · UFMG/FUMP
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t.aboutClose}
              className="w-12 h-12 rounded-full bg-surface-variant items-center justify-center"
            >
              <Ionicons name="close" size={22} color={themeColors.textPrimary} />
            </Pressable>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-outline-variant gap-3">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.aboutHistory}
            </Text>
            <Text className="text-sm text-text-primary">{t.aboutHistoryBody}</Text>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-outline-variant gap-3">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.aboutTeam}
            </Text>
            <Text className="text-sm text-text-primary">{t.aboutTeamBody}</Text>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-outline-variant gap-3">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.aboutFeatures}
            </Text>
            <Text className="text-sm text-text-primary">{t.aboutFeaturesBody}</Text>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-outline-variant gap-3">
            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.aboutTechNotes}
            </Text>
            <Text className="text-sm text-text-primary">{t.aboutTechNotesBody}</Text>
          </View>

          <Button
            label={t.aboutRepo}
            onPress={() =>
              Linking.openURL('https://github.com/igormartins4/app-hackathon-inova-ru')
            }
            variant="secondary"
          />
          <Button label={t.aboutClose} onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}
