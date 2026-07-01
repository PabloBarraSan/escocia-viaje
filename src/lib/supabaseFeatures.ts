const FEATURES_KEY = 'escocia_supabase_features'

export type CompanionTables = 'suggestions' | 'expenses'

type FeatureFlags = Record<CompanionTables, boolean | null>

function readFlags(): FeatureFlags {
  try {
    const raw = localStorage.getItem(FEATURES_KEY)
    if (!raw) return { suggestions: null, expenses: null }
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>
    return {
      suggestions: parsed.suggestions ?? null,
      expenses: parsed.expenses ?? null,
    }
  } catch {
    return { suggestions: null, expenses: null }
  }
}

function writeFlags(flags: FeatureFlags) {
  localStorage.setItem(FEATURES_KEY, JSON.stringify(flags))
}

export function isCompanionTableEnabled(table: CompanionTables) {
  const flags = readFlags()
  return flags[table] !== false
}

export function markCompanionTablePresent(table: CompanionTables) {
  const flags = readFlags()
  if (flags[table] === true) return
  writeFlags({ ...flags, [table]: true })
}

export function markCompanionTableMissing(table: CompanionTables) {
  const flags = readFlags()
  if (flags[table] === false) return
  writeFlags({ ...flags, [table]: false })
}

export function isMissingTable(error: { code?: string; message?: string; details?: string; hint?: string } | null) {
  if (!error) return false
  const text = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase()
  return error.code === 'PGRST205'
    || error.code === '42P01'
    || text.includes('does not exist')
    || text.includes('could not find')
    || text.includes('schema cache')
    || text.includes('relation')
}

const inflightLoads: Partial<Record<CompanionTables, Promise<unknown[]>>> = {}

export async function fetchCompanionTable<T>(
  table: CompanionTables,
  fetcher: () => PromiseLike<{ data: T[] | null; error: { code?: string; message?: string; details?: string; hint?: string } | null }>,
): Promise<T[]> {
  if (!isCompanionTableEnabled(table)) return []

  const run = async (): Promise<T[]> => {
    const { data, error } = await fetcher()
    if (isMissingTable(error)) {
      markCompanionTableMissing(table)
      return []
    }
    if (!error) markCompanionTablePresent(table)
    return data ?? []
  }

  if (!inflightLoads[table]) {
    inflightLoads[table] = run().finally(() => {
      delete inflightLoads[table]
    })
  }
  return inflightLoads[table] as Promise<T[]>
}
