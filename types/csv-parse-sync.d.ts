declare module 'csv-parse/sync' {
  import type { Options } from 'csv-parse'

  export function parse<TRecord = Record<string, unknown>>(
    input: string,
    options?: Options,
  ): TRecord[]
}
