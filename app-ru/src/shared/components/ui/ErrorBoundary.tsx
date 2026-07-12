import { Component, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackMessage?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          className="flex-1 items-center justify-center bg-gray-50 px-6"
        >
          <Text accessibilityRole="text" className="text-lg font-semibold text-gray-900 mb-2">
            Algo deu errado
          </Text>
          <Text accessibilityRole="text" className="text-center text-base text-gray-600 mb-6">
            {this.props.fallbackMessage ?? 'Ocorreu um erro. Tente novamente em instantes.'}
          </Text>
          <Button label="Tentar novamente" onPress={this.handleRetry} />
        </View>
      )
    }

    return this.props.children
  }
}
