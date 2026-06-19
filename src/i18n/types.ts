import type { en } from './locales/en'

type Stringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? readonly string[]
      : T[K] extends object
        ? Stringify<T[K]>
        : T[K]
}

export type Messages = Stringify<typeof en>

export type TranslateParams = Record<string, string | number>

export type TranslateFn = (path: string, params?: TranslateParams) => string
