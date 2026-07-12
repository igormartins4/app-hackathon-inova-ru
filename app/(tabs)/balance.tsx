import { View, Text, StyleSheet } from 'react-native'

export default function BalanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saldo</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
})
