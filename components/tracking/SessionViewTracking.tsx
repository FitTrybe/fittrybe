'use client'

import { useEffect } from 'react'
import { fbTrack } from '@/lib/fbq'

type Props = {
  /** The event UUID from the URL, e.g. 5b330a6d-4aba-421f-b77d-5428ebe08968 */
  sessionId: string
  /** e.g. "Casual Badminton Session - Sutton" */
  sessionName: string
  /** Price per spot as a number. Free sessions pass 0. */
  price: number
}

/**
 * Drop this into the session detail page (app/events/[id]/page.tsx).
 * It renders nothing. It just tells Meta someone looked at a session.
 */
export function SessionViewTracking({ sessionId, sessionName, price }: Props) {
  useEffect(() => {
    fbTrack('ViewContent', {
      content_ids: [sessionId],
      content_name: sessionName,
      content_type: 'product',
      content_category: 'Badminton',
      value: price,
      currency: 'GBP',
    })
  }, [sessionId, sessionName, price])

  return null
}
