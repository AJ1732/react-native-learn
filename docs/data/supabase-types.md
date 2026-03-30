# Supabase Type Generation

Auto-generate TypeScript types from your Supabase database schema — no manual typing.

---

## Installation

```bash
npm install supabase --save-dev
npx supabase login
```

---

## Project ID — Keep It Out of Source

Add your project ID to `.env.local` (already git-ignored):

```bash
# .env.local
SUPABASE_PROJECT_ID=your-project-id
```

> The project ID alone cannot access your data — your `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are the actual secrets. Still, keeping it in `.env.local` avoids hardcoding environment-specific values in `package.json`.

---

## Generate Types

A shell script is used instead of an inline npm script because the shell expands `$SUPABASE_PROJECT_ID` to an empty string **before** any env-loading tool can set it. Sourcing the env file inside the script ensures the variable is available at expansion time.

```sh
# scripts/gen-types.sh
#!/bin/sh
set -e

export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

mkdir -p types
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > types/database.types.ts
```

```json
{
  "scripts": {
    "types:gen": "sh scripts/gen-types.sh"
  }
}
```

```bash
npm run types:gen
```

> Never edit `types/database.types.ts` manually — it is always overwritten on the next generation.

---

## File Structure

```
types/
  database.types.ts   # auto-generated — do not edit
  index.ts            # helper extractors — edit this
```

---

## Type Extractors — `types/index.ts`

The generated file exposes a `Database` type with verbose nested paths. Create extractors to keep usage clean:

```ts
import { Database } from "./database.types"

// Full row returned from a SELECT
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

// Payload for INSERT (optional fields have ?)
export type InsertDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

// Payload for UPDATE (all fields optional)
export type UpdateDTO<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
```

Usage:

```ts
import { Tables, InsertDTO, UpdateDTO } from "@/types"

type Beneficiary    = Tables<"beneficiaries">
type NewBeneficiary = InsertDTO<"beneficiaries">
type EditBeneficiary = UpdateDTO<"beneficiaries">
```

---

## Wiring into Hooks

Replace `unknown` / manual types in your TanStack Query hooks with the generated ones:

```ts
// hooks/use-beneficiaries.ts
import { Tables, InsertDTO } from "@/types"
import { BeneficiaryService } from "@/services/beneficiary.service"
import { queryKeys } from "@/lib/query-keys"

type Beneficiary = Tables<"beneficiaries">

export function useBeneficiaries() {
  return useQuery({
    queryKey: queryKeys.beneficiaries.all,
    queryFn: async () => {
      const response = await BeneficiaryService.getAll()
      return response.data as Beneficiary[]
    },
  })
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InsertDTO<"beneficiaries">) =>
      BeneficiaryService.create({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beneficiaries.all })
    },
  })
}
```

---

## When to Re-generate

Run `npm run types:gen` after any of these:

- Adding or removing a table
- Adding, removing, or renaming a column
- Changing a column's type or nullability
- Adding enums or views
