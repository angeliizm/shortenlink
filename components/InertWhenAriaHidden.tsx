'use client'

import { useEffect } from 'react'

/**
 * Syncs the `inert` attribute with `aria-hidden` on the same element.
 * When Radix (e.g. Dialog) sets aria-hidden on a container, that container
 * must not contain focusable elements; setting `inert` makes descendants
 * non-focusable and satisfies the accessibility rule.
 * Work is deferred (requestAnimationFrame) so it does not block INP.
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

export default function InertWhenAriaHidden() {
  useEffect(() => {
    let rafId: number

    const observer = new MutationObserver(() => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        syncInert()
      })
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-hidden'],
    })

    // Initial pass (deferred so it doesn't block first paint)
    rafId = requestAnimationFrame(() => {
      syncInert()
    })

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  return null
}
