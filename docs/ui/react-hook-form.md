# React Hook Form in React Native

## Why React Hook Form over useState

| | `useState` | React Hook Form |
|---|---|---|
| Re-renders | Every keystroke | None while typing (uncontrolled) |
| Validation | Manual, scattered | Centralized via schema |
| Error state | Manual `useState` | Built-in `formState.errors` |
| Best for | 1-2 fields | 3+ fields with validation |

---

## Why Not `register()` Like on Web

On web, RHF uses `register()` to attach a `ref` directly to a DOM input.
React Native inputs don't expose DOM refs — they use `value` + `onChangeText`.
So all RHF fields in React Native use the `Controller` component instead.

```tsx
// Web (DOM ref approach) — does NOT work in React Native
<input {...register("email")} />

// React Native — must use Controller
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value } }) => (
    <TextInput value={value} onChangeText={onChange} />
  )}
/>
```

---

## The `FormField` Component — Reusable Controller Pattern

Repeating `Controller` + error message for every field is bloated and breaks DRY.
The solution is a generic `FormField` atom that encapsulates the pattern.

```tsx
// components/atoms/form-field.tsx
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

type Props<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: FieldPath<T>;
};

export function FormField<T extends FieldValues>({ control, name, ...inputProps }: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="gap-1">
          <TextInput
            value={value}
            onChangeText={onChange}
            variant={error ? "error" : "default"}
            {...inputProps}
          />
          {error && <Text size="sm" className="text-red-500">{error.message}</Text>}
        </View>
      )}
    />
  );
}
```

**Before (bloated — 15 lines per field):**
```tsx
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, value }, fieldState: { error } }) => (
    <View className="gap-1">
      <TextInput value={value} onChangeText={onChange} variant={error ? "error" : "default"} />
      {error && <Text size="sm" className="text-red-500">{error.message}</Text>}
    </View>
  )}
/>
```

**After (clean — 1 line per field):**
```tsx
<FormField control={control} name="email" placeholder="Enter email" keyboardType="email-address" />
```

---

## Schema Validation with Zod

Define the schema outside the component — it's a constant, not component state.

```ts
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],   // error appears on this field
  });

// Derive the TypeScript type from the schema — single source of truth
type FormValues = z.infer<typeof signupSchema>;
```

---

## Full Setup Pattern

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const MyForm = () => {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    // values is fully typed and validated — safe to send to API
    mutate(values);
  };

  return (
    <View>
      <FormField control={control} name="email" placeholder="Email" />
      <FormField control={control} name="password" placeholder="Password" secureTextEntry />

      {/* handleSubmit validates before calling onSubmit */}
      <Button label="Submit" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};
```

**Key points:**
- `handleSubmit` runs Zod validation before calling `onSubmit` — invalid forms never reach the API
- `defaultValues` prevents uncontrolled → controlled input warnings
- `FormValues` is inferred from the Zod schema — no duplicate type definitions
- `control` is passed directly to each `FormField` — no context provider needed

---

## Stripping Fields Before Sending to API

Fields like `confirm_password` exist for UX validation only — never send them to the API.

```ts
const onSubmit = async ({ confirm_password, ...dto }: FormValues) => {
  await mutate(dto); // confirm_password excluded
};
```

---

## Server Error Handling

Use `mutate` (not `mutateAsync`) — errors go to `onError`, never throw.

```ts
const onSubmit = (dto: FormValues) => {
  mutate(dto, {
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 401) {
        // Map HTTP status to a user-friendly message
        setError("root", { message: "Invalid email or password." });
      } else if (message?.toLowerCase().includes("email")) {
        // Map server message to a specific field
        setError("email", { message });
      } else {
        // Fallback — display below all fields
        setError("root", {
          message: message ?? "Something went wrong. Please try again.",
        });
      }
    },
  });
};
```

### `setError("root")` vs `setError("fieldName")`

| Use | When |
|---|---|
| `setError("root")` | Error isn't tied to a field (wrong credentials, server error) |
| `setError("email")` | Server confirms the email is the problem (already taken, not found) |

### Displaying root errors

```tsx
{errors.root && (
  <Text size="sm" className="text-center text-red-500">
    {errors.root.message}
  </Text>
)}
```

Place this between the last field and the submit button.

### Why `mutate` over `mutateAsync`

`mutateAsync` throws on error — if unhandled it becomes an unhandled promise
rejection and crashes with a red screen in dev. `mutate` never throws;
all errors route through `onError` only.

---

## When to Use What

| Scenario | Solution |
|---|---|
| 1-2 fields, no validation | `useState` |
| 3+ fields, validation rules | React Hook Form + Zod |
| Cross-field validation (password confirm) | Zod `.refine()` |
| Reusable field with error display | `FormField` component |
| Server error on a field | `setError("fieldName", { message })` |
| Server error not tied to a field | `setError("root", { message })` |
