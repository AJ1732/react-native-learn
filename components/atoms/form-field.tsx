import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import { View } from "react-native";

import type { TextInputProps } from "react-native";
import { Text } from "./text";
import { TextInput } from "./text-input";

type Props<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: FieldPath<T>;
  rules?: RegisterOptions<T>;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  rules,
  ...inputProps
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="gap-1">
          <TextInput
            value={value}
            onChangeText={onChange}
            variant={error ? "error" : "default"}
            {...inputProps}
          />
          {error && (
            <Text size="sm" className="text-red-500">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
