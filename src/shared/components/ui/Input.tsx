import { Text, TextInput, View } from "react-native";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  accessibilityLabel?: string;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = "default",
  accessibilityLabel,
}: InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: false }}
        className={`min-h-[48px] rounded-lg border px-4 py-3 text-base ${error ? "border-red-500" : "border-gray-300"}`}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" className="text-sm text-red-600">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
