'use client'

import { useEffect } from 'react'

/**
 * Syncs the `inert` attribute with `aria-hidden` on the same element.
 * When Radix (e.g. Dialog) sets aria-hidden on a container, that container
 * must not contain focusable elements; setting `inert` makes descendants
 * non-focusable and satisfies the accessibility rule.
 */
export default function InertWhenAriaHidden() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
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
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-hidden'],
    })

    // Initial pass
    document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
      if (el instanceof HTMLElement) {
        el.setAttribute('inert', '')
      }
    })

    return () => observer.disconnect()
  }, [])

  return null
}
