import { google } from 'googleapis'
import type { calendar_v3 } from 'googleapis'
import { Client } from '@microsoft/microsoft-graph-client'

export type CalendarProvider = 'google' | 'office365'

export async function createOrUpdateGoogleEvent(params: {
  accessToken: string
  refreshToken?: string | null
  clientId?: string
  clientSecret?: string
  calendarId?: string
  eventId?: string | null
  title: string
  description?: string
  dueDate: string // ISO
}) {
  const { accessToken, refreshToken, clientId, clientSecret, calendarId = 'primary', eventId, title, description, dueDate } = params

  const auth = new google.auth.OAuth2(clientId || process.env.GOOGLE_CLIENT_ID, clientSecret || process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken || undefined })
  const cal = google.calendar({ version: 'v3', auth })

  const event: calendar_v3.Schema$Event = {
    summary: title,
    description: description || undefined,
    start: { dateTime: dueDate },
    end:   { dateTime: new Date(new Date(dueDate).getTime() + 60 * 60 * 1000).toISOString() },
  }

  if (eventId) {
    const res = await cal.events.update({ calendarId, eventId, requestBody: event })
    return res.data.id || eventId
  } else {
    const res = await cal.events.insert({ calendarId, requestBody: event })
    return res.data.id as string
  }
}

export async function deleteGoogleEvent(accessToken: string, calendarId: string, eventId: string) {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  auth.setCredentials({ access_token: accessToken })
  const cal = google.calendar({ version: 'v3', auth })
  await cal.events.delete({ calendarId, eventId })
}

export async function createOrUpdateO365Event(params: {
  accessToken: string
  calendarId?: string
  eventId?: string | null
  title: string
  description?: string
  dueDate: string // ISO
}) {
  const { accessToken, calendarId, eventId, title, description, dueDate } = params
  const client = Client.init({ authProvider: (done) => done(null, accessToken) })

  const body = {
    subject: title,
    body: { contentType: 'HTML', content: description || '' },
    start: { dateTime: dueDate, timeZone: 'UTC' },
    end: { dateTime: new Date(new Date(dueDate).getTime() + 60 * 60 * 1000).toISOString(), timeZone: 'UTC' }
  }

  if (eventId) {
    const res = await client.api(calendarId ? `/me/calendars/${calendarId}/events/${eventId}` : `/me/events/${eventId}`).update(body)
    return res?.id || eventId
  } else {
    const res = await client.api(calendarId ? `/me/calendars/${calendarId}/events` : '/me/events').post(body)
    return res.id as string
  }
}

export async function deleteO365Event(accessToken: string, calendarId: string | undefined, eventId: string) {
  const client = Client.init({ authProvider: (done) => done(null, accessToken) })
  await client.api(calendarId ? `/me/calendars/${calendarId}/events/${eventId}` : `/me/events/${eventId}`).delete()
}
