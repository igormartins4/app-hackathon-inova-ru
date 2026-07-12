import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { focused: IoniconsName; default: IoniconsName }> = {
  home: { focused: 'home', default: 'home-outline' },
  balance: { focused: 'wallet', default: 'wallet-outline' },
  recharge: { focused: 'card', default: 'card-outline' },
  profile: { focused: 'person', default: 'person-outline' },
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          minHeight: 56,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = focused ? TAB_ICONS.home.focused : TAB_ICONS.home.default
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarAccessibilityLabel: 'Home',
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
