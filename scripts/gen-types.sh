#!/bin/sh
set -e

# Load .env.local and export all non-comment variables
export $(grep -v '^#' .env.local | grep -v '^$' | xargs)

mkdir -p types
supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > types/database.types.ts
