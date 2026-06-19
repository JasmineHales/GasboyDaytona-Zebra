export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}

export function getNestedValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[segment]
  }, source)
}
