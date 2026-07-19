import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColors } from '@/config'
import { useI18n } from '@/shared/i18n'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { focused: IoniconsName; default: IoniconsName }> = {
  home: { focused: 'home', default: 'home-outline' },
  recharge: { focused: 'refresh-circle', default: 'refresh-circle-outline' },
  cardapio: { focused: 'book', default: 'book-outline' },
  historico: { focused: 'time', default: 'time-outline' },
  profile: { focused: 'person', default: 'person-outline' },
}

export default function TabLayout() {
  const themeColors = useThemeColors()
  const { width } = useWindowDimensions()
  const { t } = useI18n()
  const isExpanded = width >= 768

  const TAB_LABELS: Record<string, string> = {
    home: t.tabHome,
    recharge: t.tabRecharge,
    cardapio: t.tabCardapio,
    historico: t.tabHistorico,
    profile: t.tabProfile,
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeColors.primary,
          tabBarInactiveTintColor: themeColors.textSecondary,
          tabBarStyle: {
            backgroundColor: themeColors.surface,
            borderTopColor: themeColors.outline,
            ...(isExpanded
              ? { width: 96, paddingHorizontal: 8, paddingVertical: 12 }
              : { minHeight: 64, paddingBottom: 8, paddingTop: 8 }),
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          // Cada tela já renderiza seu título estilizado no conteúdo —
          // o header nativo do Expo Router duplicava esse título (Ponto 10 do QA).
          headerShown: false,
          // 'none' aqui (mesmo condicionado a reducedMotion) faz o
          // @react-navigation/bottom-tabs v7 falhar em montar completamente o
          // conteúdo da aba recém-focada — 'fade' é suave o bastante pra ser
          // aceitável mesmo com "reduzir movimento" ativo.
          animation: 'fade',
          tabBarPosition: isExpanded ? 'left' : 'bottom',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: TAB_LABELS.home,
            tabBarLabel: TAB_LABELS.home,
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? TAB_ICONS.home.focused : TAB_ICONS.home.default
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarAccessibilityLabel: TAB_LABELS.home,
          }}
        />
        <Tabs.Screen
          name="balance"
          options={{
            href: null,
            title: t.balanceTitle,
          }}
        />
        <Tabs.Screen
          name="recharge"
          options={{
            title: TAB_LABELS.recharge,
            tabBarLabel: TAB_LABELS.recharge,
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? TAB_ICONS.recharge.focused : TAB_ICONS.recharge.default
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarAccessibilityLabel: TAB_LABELS.recharge,
          }}
        />
        <Tabs.Screen
          name="transfer"
          options={{
            href: null,
            title: t.transferTitle,
          }}
        />
        <Tabs.Screen
          name="cardapio"
          options={{
            title: TAB_LABELS.cardapio,
            tabBarLabel: TAB_LABELS.cardapio,
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? TAB_ICONS.cardapio.focused : TAB_ICONS.cardapio.default
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarAccessibilityLabel: TAB_LABELS.cardapio,
          }}
        />
        <Tabs.Screen
          name="historico"
          options={{
            title: TAB_LABELS.historico,
            tabBarLabel: TAB_LABELS.historico,
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? TAB_ICONS.historico.focused : TAB_ICONS.historico.default
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarAccessibilityLabel: TAB_LABELS.historico,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: TAB_LABELS.profile,
            tabBarLabel: TAB_LABELS.profile,
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? TAB_ICONS.profile.focused : TAB_ICONS.profile.default
              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarAccessibilityLabel: TAB_LABELS.profile,
          }}
        />
      </Tabs>
    </SafeAreaView>
  )
}
