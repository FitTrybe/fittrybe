'use client'

import { useEffect } from 'react'
import { fbTrackOnce } from '@/lib/fbq'

type Props = {
  /** Your own booking id. This is the dedupe key against the server event. */
  bookingId: string
  sessionId: string
  sessionName: string
  /**
   * What the person actually paid, AFTER any discount code such as TRYBE10.
   * A number, not a string. 5.85, not "£5.85".
   */
  amountPaid: number
}

/**
 * Render this on the page someone lands on once payment has succeeded.
 */
export function BookingConfirmedTracking({
  bookingId,
  sessionId,
  sessionName,
  amountPaid,
}: Props) {
  useEffect(() => {
    fbTrackOnce(
      bookingId,
      'Purchase',
      {
        content_ids: [sessionId],
        content_name: sessionName,
        content_type: 'product',
        value: amountPaid,
        currency: 'GBP',
        num_items: 1,
      },
      bookingId, // eventID, must match event_id on the server call
    )
  }, [bookingId, sessionId, sessionName, amountPaid])

  return null
}
