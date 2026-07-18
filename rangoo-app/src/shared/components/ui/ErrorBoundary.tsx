import { Component, type ReactNode } from 'react'
import { View } from 'react-native'
import { useI18n } from '@/shared/i18n'
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
      // Class component — can't use the useI18n() hook, so read the zustand
      // store directly via getState(). Won't reactively update mid-crash if
      // the locale changes, an acceptable tradeoff for a fallback screen.
      const { t } = useI18n.getState()
      return (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          className="flex-1 items-center justify-center bg-background px-6"
        >
          <Text accessibilityRole="text" className="text-lg font-semibold text-text-primary mb-2">
            {t.errorBoundaryTitle}
          </Text>
          <Text accessibilityRole="text" className="text-center text-base text-text-secondary mb-6">
            {this.props.fallbackMessage ?? t.errorBoundaryMessage}
          </Text>
          <Button label={t.retry} onPress={this.handleRetry} />
        </View>
      )
    }

    return this.props.children
  }
}
