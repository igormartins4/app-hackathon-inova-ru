import { Text, View } from "react-native";
import { Button } from "./Button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      className="items-center gap-4 py-8"
    >
      <Text className="text-center text-base text-red-600">{message}</Text>
      {onRetry ? (
        <Button label="Tentar novamente" onPress={onRetry} variant="secondary" />
      ) : null}
    </View>
  );
}
