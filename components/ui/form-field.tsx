import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import { View, type TextInputProps } from "react-native";

import { Text } from "../atoms/text";
import { TextInput } from "../atoms/text-input";

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
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        let variant: "error" | "disabled" | "default" = "default";
        if (error) variant = "error";
        else if (inputProps.editable === false) variant = "disabled";

        return (
          <View className="gap-1">
            <TextInput
              value={value}
              onChangeText={onChange}
              variant={variant}
              {...inputProps}
            />
            {error && (
              <Text size="sm" className="text-red-500">
                {error.message}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
