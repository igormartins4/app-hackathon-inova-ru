import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useThemeColors } from '@/config'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { focused: IoniconsName; default: IoniconsName }> = {
  home: { focused: 'home', default: 'home-outline' },
  balance: { focused: 'wallet', default: 'wallet-outline' },
  recharge: { focused: 'refresh-circle', default: 'refresh-circle-outline' },
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
          title: 'Saldo',
          tabBarLabel: 'Saldo',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.balance.focused : TAB_ICONS.balance.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Saldo',
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
