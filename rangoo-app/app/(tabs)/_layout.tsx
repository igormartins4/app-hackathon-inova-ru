import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useThemeColors } from '@/config'

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.outline,
          minHeight: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: themeColors.surface,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: themeColors.textPrimary,
        },
        headerShadowVisible: false,
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.home.focused : TAB_ICONS.home.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          href: null,
          title: 'Saldo',
        }}
      />
      <Tabs.Screen
        name="recharge"
        options={{
          title: 'Recarga',
          tabBarLabel: 'Recarga',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.recharge.focused : TAB_ICONS.recharge.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Recarga',
        }}
      />
      <Tabs.Screen
        name="cardapio"
        options={{
          title: 'Cardápio',
          tabBarLabel: 'Cardápio',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.cardapio.focused : TAB_ICONS.cardapio.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Cardápio',
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.historico.focused : TAB_ICONS.historico.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Histórico',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.profile.focused : TAB_ICONS.profile.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Perfil',
        }}
      />
    </Tabs>
  )
}
