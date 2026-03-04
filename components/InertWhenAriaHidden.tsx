'use client'

import { useEffect } from 'react'

const IDLE_TIMEOUT_MS = 80

/**
 * Syncs the `inert` attribute with `aria-hidden` on the same element.
 * When Radix (e.g. Dialog) sets aria-hidden on a container, that container
 * must not contain focusable elements; setting `inert` makes descendants
 * non-focusable and satisfies the accessibility rule.
 * Work is deferred with requestIdleCallback (fallback setTimeout) so the
 * main thread is free for the next paint and INP is not blocked.
 */
function syncInert() {
  document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
    if (el instanceof HTMLElement && !el.hasAttribute('inert')) {
      el.setAttribute('inert', '')
    }
  })
  document.querySelectorAll('[aria-hidden="false"]').forEach((el) => {
    if (el instanceof HTMLElement) {
      el.removeAttribute('inert')
    }
  })
}

function scheduleSync() {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(syncInert, { timeout: IDLE_TIMEOUT_MS })
  }
  return window.setTimeout(syncInert, 0) as unknown as number
}

function cancelSchedule(id: number) {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

export default function InertWhenAriaHidden() {
  useEffect(() => {
    let scheduledId: number

    const observer = new MutationObserver(() => {
      cancelSchedule(scheduledId)
      scheduledId = scheduleSync()
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-hidden'],
    })

    // Initial pass (deferred so it doesn't block first paint)
    scheduledId = scheduleSync()

    return () => {
      cancelSchedule(scheduledId)
      observer.disconnect()
    }
  }, [])

  return null
}
