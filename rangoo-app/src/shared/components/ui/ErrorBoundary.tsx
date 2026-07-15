import { Component, type ReactNode } from 'react'
import { View } from 'react-native'
import { Button } from './Button'
import { ScaledText as Text } from './ScaledText'

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
          className="flex-1 items-center justify-center bg-background px-6"
        >
          <Text accessibilityRole="text" className="text-lg font-semibold text-text-primary mb-2">
            Algo deu errado
          </Text>
          <Text accessibilityRole="text" className="text-center text-base text-text-secondary mb-6">
            {this.props.fallbackMessage ?? 'Ocorreu um erro. Tente novamente em instantes.'}
          </Text>
          <Button label="Tentar novamente" onPress={this.handleRetry} />
        </View>
      )
    }

    return this.props.children
  }
}
