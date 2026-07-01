import { useState, useEffect, useCallback } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import {
  fetchLocalTrip,
  getLocalDaysWithActivities,
  subscribeLocal,
  updateLocalActivity,
  addLocalActivity,
  deleteLocalActivity,
  updateLocalDay,
  updateLocalNote,
  updateLocalTripInfo,
  addLocalIdea,
  toggleLocalIdeaVote,
  addLocalChecklistItem,
  toggleLocalChecklist,
  deleteLocalChecklist,
  addLocalDayMessage,
} from '../lib/localStore'
import type {
  Trip, Day, TripInfo, Idea, ChecklistItem, Suggestion, SuggestionCategory,
  SuggestionStatus, Expense, DayMessage, Activity,
} from '../lib/types'
import { sortActivities, sortOrderForNewActivity } from '../lib/activities'
import {
  buildActivityRow,
  markActivityColumnMissing,
  missingActivityColumnFromError,
  normalizeActivityRow,
  resetActivityColumnFlags,
} from '../lib/activitySchema'
import {
  fetchCompanionTable,
  isCompanionTableEnabled,
} from '../lib/supabaseFeatures'

const REMOTE_CACHE_KEY = 'escocia_remote_cache'

async function runActivityWrite(
  build: () => Record<string, unknown>,
  write: (payload: Record<string, unknown>) => PromiseLike<{
    data: Record<string, unknown> | null
    error: { code?: string; message?: string } | null
  }>,
): Promise<Activity> {
  let payload = build()
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await write(payload)
    if (!error && data) return normalizeActivityRow(data)
    const missing = missingActivityColumnFromError(error)
    if (!missing) throw error
    markActivityColumnMissing(missing)
    payload = build()
  }
  throw new Error('No s’han pogut desar l’activitat. Executa la migració 007 a Supabase.')
}

export function useTrip(code: string) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [days, setDays] = useState<Day[]>([])
  const [tripInfo, setTripInfo] = useState<TripInfo[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dayMessages, setDayMessages] = useState<DayMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSupabase = useCallback(async () => {
    const sb = getSupabase()
    resetActivityColumnFlags()

    const { data: tripData, error: tripErr } = await sb
      .from('trips')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (tripErr || !tripData) throw new Error('Codi de viatge incorrecte')
    setTrip(tripData)

    const { data: daysData } = await sb
      .from('days')
      .select('*')
      .eq('trip_id', tripData.id)
      .order('sort_order')

    const { data: activitiesData } = await sb
      .from('activities')
      .select('*')
      .in('day_id', (daysData ?? []).map((d) => d.id))
      .order('sort_order')

    const { data: notesData } = await sb
      .from('day_notes')
      .select('*')
      .in('day_id', (daysData ?? []).map((d) => d.id))

    const enriched: Day[] = (daysData ?? []).map((day) => ({
      ...day,
      activities: sortActivities(
        (activitiesData ?? [])
          .filter((a) => a.day_id === day.id)
          .map((a) => normalizeActivityRow(a)),
      ),
      note: (notesData ?? []).find((n) => n.day_id === day.id),
    }))
    setDays(enriched)

    const { data: infoData } = await sb
      .from('trip_info')
      .select('*')
      .eq('trip_id', tripData.id)

    setTripInfo(infoData ?? [])

    const { data: ideasData } = await sb
      .from('ideas')
      .select('*')
      .eq('trip_id', tripData.id)
      .order('created_at', { ascending: false })

    setIdeas(ideasData ?? [])

    const { data: checklistData } = await sb
      .from('checklist_items')
      .select('*')
      .eq('trip_id', tripData.id)
      .order('sort_order')

    setChecklist(checklistData ?? [])

    let nextSuggestions: Suggestion[] = []
    if (isCompanionTableEnabled('suggestions')) {
      nextSuggestions = await fetchCompanionTable('suggestions', () =>
        sb.from('suggestions')
          .select('*')
          .eq('trip_id', tripData.id)
          .order('created_at', { ascending: false }),
      )
    }
    setSuggestions(nextSuggestions)

    let nextExpenses: Expense[] = []
    if (isCompanionTableEnabled('expenses')) {
      nextExpenses = await fetchCompanionTable('expenses', () =>
        sb.from('expenses')
          .select('*')
          .eq('trip_id', tripData.id)
          .order('created_at', { ascending: false }),
      )
    }
    setExpenses(nextExpenses)

    let nextMessages: DayMessage[] = []
    if (isCompanionTableEnabled('day_messages')) {
      nextMessages = await fetchCompanionTable('day_messages', () =>
        sb.from('day_messages')
          .select('*')
          .in('day_id', (daysData ?? []).map((day) => day.id))
          .order('created_at', { ascending: true }),
      )
    }
    setDayMessages(nextMessages)

    localStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify({
      trip: tripData,
      days: enriched,
      tripInfo: infoData ?? [],
      ideas: ideasData ?? [],
      checklist: checklistData ?? [],
      suggestions: nextSuggestions,
      expenses: nextExpenses,
      dayMessages: nextMessages,
    }))
  }, [code])

  const loadLocal = useCallback(async () => {
    const data = await fetchLocalTrip(code)
    setTrip(data.trip)
    setDays(getLocalDaysWithActivities(data))
    setTripInfo(data.tripInfo)
    setIdeas(data.ideas)
    setChecklist(data.checklist)
    setSuggestions([])
    setExpenses([])
    setDayMessages(data.messages ?? [])
  }, [code])

  const reload = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        await loadSupabase()
      } else {
        await loadLocal()
      }
      setError(null)
    } catch (e) {
      if (isSupabaseConfigured) {
        try {
          const cached = JSON.parse(localStorage.getItem(REMOTE_CACHE_KEY) ?? '')
          setTrip(cached.trip)
          setDays(cached.days)
          setTripInfo(cached.tripInfo)
          setIdeas(cached.ideas)
          setChecklist(cached.checklist)
          setSuggestions(cached.suggestions ?? [])
          setExpenses(cached.expenses ?? [])
          setDayMessages(cached.dayMessages ?? [])
          setError(null)
        } catch {
          setError(e instanceof Error ? e.message : 'Error carregant el viatge')
        }
      } else {
        setError(e instanceof Error ? e.message : 'Error carregant el viatge')
      }
    } finally {
      setLoading(false)
    }
  }, [loadSupabase, loadLocal])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (isSupabaseConfigured) {
      const sb = getSupabase()
      const channel = sb
        .channel('trip-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'days' }, () => reload())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => reload())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'day_notes' }, () => reload())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_info' }, () => reload())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => reload())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items' }, () => reload())

      if (isCompanionTableEnabled('suggestions')) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, () => reload())
      }
      if (isCompanionTableEnabled('expenses')) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => reload())
      }
      if (isCompanionTableEnabled('day_messages')) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table: 'day_messages' }, () => reload())
      }

      channel.subscribe()
      return () => { sb.removeChannel(channel) }
    } else {
      return subscribeLocal(() => { reload() })
    }
  }, [reload])

  const updateActivity = async (
    id: string,
    updates: {
      time?: string
      text?: string
      kind?: import('../lib/types').ActivityKind
      votes?: string[]
      place_name?: string | null
      place_address?: string | null
      description?: string
      maps_url?: string | null
      duration_minutes?: number | null
    },
    user: string,
  ) => {
    if (isSupabaseConfigured) {
      const sb = getSupabase()
      const updatedAt = new Date().toISOString()
      const existing = days.flatMap((day) => day.activities ?? []).find((a) => a.id === id)
      if (!existing) return
      const merged = { ...existing, ...updates }
      const payload = buildActivityRow(
        {
          time: merged.time,
          updated_by: user,
          updated_at: updatedAt,
        },
        {
          text: merged.text,
          kind: merged.kind ?? 'plan',
          votes: merged.votes ?? [],
          place_name: merged.place_name ?? null,
          place_address: merged.place_address ?? null,
          description: merged.description ?? '',
          maps_url: merged.maps_url ?? null,
          duration_minutes: merged.duration_minutes,
        },
      )
      await runActivityWrite(
        () => payload,
        (row) => sb.from('activities').update(row).eq('id', id).select('*').single(),
      )
      setDays((current) => current.map((day) => ({
        ...day,
        activities: sortActivities(
          (day.activities ?? []).map((activity) =>
            activity.id === id
              ? normalizeActivityRow({ ...activity, ...merged, updated_by: user, updated_at: updatedAt })
              : activity,
          ),
        ),
      })))
    } else {
      await updateLocalActivity(id, updates, user)
    }
  }

  const addActivity = async (
    dayId: string,
    text: string,
    time: string,
    user: string,
    durationMinutes: number | null = null,
    description = '',
    mapsUrl: string | null = null,
    placeName: string | null = null,
    placeAddress: string | null = null,
    kind: import('../lib/types').ActivityKind = 'plan',
  ) => {
    if (isSupabaseConfigured) {
      const sb = getSupabase()
      const { data: existing } = await sb.from('activities').select('*').eq('day_id', dayId)
      const sortOrder = sortOrderForNewActivity(existing ?? [], time || null)
      const created = await runActivityWrite(
        () => buildActivityRow(
          {
            day_id: dayId,
            time: time || null,
            sort_order: sortOrder,
            updated_by: user,
          },
          {
            text,
            kind,
            votes: [],
            place_name: placeName,
            place_address: placeAddress,
            description,
            maps_url: mapsUrl,
            duration_minutes: durationMinutes,
          },
        ),
        (row) => sb.from('activities').insert(row).select('*').single(),
      )
      setDays((current) => current.map((day) =>
        day.id === dayId
          ? { ...day, activities: sortActivities([...(day.activities ?? []), created]) }
          : day,
      ))
    } else {
      await addLocalActivity(
        dayId, text, time, user, durationMinutes, description, mapsUrl, placeName, placeAddress, kind,
      )
    }
  }

  const voteActivity = async (id: string, user: string) => {
    const activity = days.flatMap((d) => d.activities ?? []).find((a) => a.id === id)
    if (!activity || activity.kind !== 'idea') return
    const votes = activity.votes.includes(user)
      ? activity.votes.filter((name) => name !== user)
      : [...activity.votes, user]

    if (isSupabaseConfigured) {
      const sb = getSupabase()
      const { error } = await sb.from('activities').update({ votes }).eq('id', id)
      if (error) throw error
    } else {
      await updateLocalActivity(id, { votes }, user)
    }

    setDays((current) => current.map((day) => ({
      ...day,
      activities: (day.activities ?? []).map((item) =>
        item.id === id ? { ...item, votes } : item,
      ),
    })))
  }

  const removeActivity = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error: deleteError } = await getSupabase().from('activities').delete().eq('id', id)
      if (deleteError) throw deleteError
      setDays((current) => current.map((day) => ({
        ...day,
        activities: day.activities?.filter((activity) => activity.id !== id),
      })))
    } else {
      await deleteLocalActivity(id)
    }
  }

  const updateDay = async (id: string, updates: { lodging?: string }, user: string) => {
    if (isSupabaseConfigured) {
      await getSupabase().from('days').update({ ...updates, updated_by: user, updated_at: new Date().toISOString() }).eq('id', id)
    } else {
      await updateLocalDay(id, updates, user)
    }
  }

  const saveNote = async (dayId: string, text: string, user: string) => {
    if (isSupabaseConfigured) {
      await getSupabase().from('day_notes').upsert({ day_id: dayId, text, updated_by: user, updated_at: new Date().toISOString() })
    } else {
      await updateLocalNote(dayId, text, user)
    }
  }

  const saveTripInfo = async (id: string, value: string, user: string) => {
    if (isSupabaseConfigured) {
      await getSupabase().from('trip_info').update({ value, updated_by: user, updated_at: new Date().toISOString() }).eq('id', id)
    } else {
      await updateLocalTripInfo(id, value, user)
    }
  }

  const createIdea = async (text: string, author: string) => {
    if (!trip) return
    if (isSupabaseConfigured) {
      await getSupabase().from('ideas').insert({ trip_id: trip.id, text, author })
    } else {
      await addLocalIdea(text, author)
    }
  }

  const voteIdea = async (id: string, user: string) => {
    if (isSupabaseConfigured) {
      const sb = getSupabase()
      const idea = ideas.find((i) => i.id === id)
      if (!idea) return
      const votes = idea.votes.includes(user)
        ? idea.votes.filter((v) => v !== user)
        : [...idea.votes, user]
      await sb.from('ideas').update({ votes }).eq('id', id)
    } else {
      await toggleLocalIdeaVote(id, user)
    }
  }

  const createChecklistItem = async (text: string, user: string) => {
    if (!trip) return
    if (isSupabaseConfigured) {
      const sb = getSupabase()
      const maxOrder = Math.max(0, ...checklist.map((c) => c.sort_order))
      await sb.from('checklist_items').insert({ trip_id: trip.id, text, sort_order: maxOrder + 1, author: user })
    } else {
      await addLocalChecklistItem(text, user)
    }
  }

  const toggleChecklistItem = async (id: string, user: string) => {
    if (isSupabaseConfigured) {
      const item = checklist.find((c) => c.id === id)
      if (!item) return
      await getSupabase().from('checklist_items').update({ done: !item.done, updated_by: user, updated_at: new Date().toISOString() }).eq('id', id)
    } else {
      await toggleLocalChecklist(id, user)
    }
  }

  const removeChecklistItem = async (id: string) => {
    if (isSupabaseConfigured) {
      await getSupabase().from('checklist_items').delete().eq('id', id)
    } else {
      await deleteLocalChecklist(id)
    }
  }

  const saveTripInfoByKey = async (key: string, value: string, user: string) => {
    if (!trip || !isSupabaseConfigured) return
    const { error } = await getSupabase().from('trip_info').upsert({
      trip_id: trip.id,
      key,
      value,
      updated_by: user,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'trip_id,key' })
    if (error) throw error
    await reload()
  }

  const createSuggestion = async (input: {
    dayId: string
    title: string
    category: SuggestionCategory
    note: string
    mapsUrl: string
    author: string
  }) => {
    if (!trip || !isSupabaseConfigured) return
    if (!isCompanionTableEnabled('suggestions')) {
      throw new Error('Cal executar la migració 003 a Supabase per usar suggeriments')
    }
    const { error } = await getSupabase().from('suggestions').insert({
      trip_id: trip.id,
      day_id: input.dayId,
      title: input.title,
      category: input.category,
      note: input.note,
      maps_url: input.mapsUrl || null,
      author: input.author,
    })
    if (error) throw error
    await reload()
  }

  const voteSuggestion = async (id: string, user: string) => {
    if (!isSupabaseConfigured) return
    const suggestion = suggestions.find((item) => item.id === id)
    if (!suggestion) return
    const votes = suggestion.votes.includes(user)
      ? suggestion.votes.filter((name) => name !== user)
      : [...suggestion.votes, user]
    const { error } = await getSupabase().from('suggestions').update({ votes }).eq('id', id)
    if (error) throw error
    await reload()
  }

  const setSuggestionStatus = async (id: string, status: SuggestionStatus) => {
    if (!isSupabaseConfigured) return
    const { error } = await getSupabase().from('suggestions').update({ status }).eq('id', id)
    if (error) throw error
    await reload()
  }

  const addSuggestionToItinerary = async (suggestion: Suggestion, user: string) => {
    if (!suggestion.day_id) return
    await addActivity(suggestion.day_id, suggestion.title, '', user)
    await setSuggestionStatus(suggestion.id, 'selected')
  }

  const createExpense = async (input: {
    dayId?: string
    description: string
    amount: number
    paidBy: string
    participants: string[]
  }) => {
    if (!trip || !isSupabaseConfigured) return
    if (!isCompanionTableEnabled('expenses')) {
      throw new Error('Cal executar la migració 003 a Supabase per usar despeses')
    }
    const { error } = await getSupabase().from('expenses').insert({
      trip_id: trip.id,
      day_id: input.dayId || null,
      description: input.description,
      amount: input.amount,
      paid_by: input.paidBy,
      participants: input.participants,
    })
    if (error) throw error
    await reload()
  }

  const removeExpense = async (id: string) => {
    if (!isSupabaseConfigured) return
    const { error } = await getSupabase().from('expenses').delete().eq('id', id)
    if (error) throw error
    await reload()
  }

  const sendDayMessage = async (dayId: string, text: string, author: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (isSupabaseConfigured) {
      if (!isCompanionTableEnabled('day_messages')) {
        throw new Error('Cal executar la migració 004 a Supabase per usar el xat del dia')
      }
      const { error } = await getSupabase().from('day_messages').insert({
        day_id: dayId,
        author,
        text: trimmed,
      })
      if (error) throw error
      await reload()
    } else {
      await addLocalDayMessage(dayId, trimmed, author)
    }
  }

  return {
    trip,
    days,
    tripInfo,
    ideas,
    checklist,
    suggestions,
    expenses,
    dayMessages,
    loading,
    error,
    isLocalMode: !isSupabaseConfigured,
    updateActivity,
    addActivity,
    removeActivity,
    updateDay,
    saveNote,
    saveTripInfo,
    saveTripInfoByKey,
    voteActivity,
    createIdea,
    voteIdea,
    createChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    createSuggestion,
    voteSuggestion,
    setSuggestionStatus,
    addSuggestionToItinerary,
    createExpense,
    removeExpense,
    sendDayMessage,
  }
}
