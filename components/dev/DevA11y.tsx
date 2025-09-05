"use client"

import { useEffect } from 'react'

/**
 * DevA11y loads axe-core in development and runs accessibility checks,
 * logging violations to the console without impacting production bundles.
 */
export default function DevA11y() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return

    let cancelled = false

    const loadAxe = async () => {
      try {
        // Avoid double-injecting
        if (!document.getElementById('axe-core-cdn')) {
          const script = document.createElement('script')
          script.id = 'axe-core-cdn'
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js'
          script.async = true
          document.head.appendChild(script)
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load axe-core'))
          })
        }

        // Give the app a tick to hydrate
        setTimeout(async () => {
          try {
            const axe: any = (window as any).axe
            if (!axe || cancelled) return

            await axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa']
              }
            }, (err: any, results: any) => {
              if (err) {
                // eslint-disable-next-line no-console
                console.error('[a11y] axe-core error:', err)
                return
              }
              if (results?.violations?.length) {
                // eslint-disable-next-line no-console
                console.warn(`[a11y] ${results.violations.length} accessibility issue(s) found`)
                for (const v of results.violations) {
                  // eslint-disable-next-line no-console
                  console.groupCollapsed(`a11y: ${v.id} – ${v.help}`)
                  // eslint-disable-next-line no-console
                  console.log('Impact:', v.impact)
                  // eslint-disable-next-line no-console
                  console.log('Help:', v.helpUrl)
                  // eslint-disable-next-line no-console
                  console.log('Nodes:', v.nodes)
                  // eslint-disable-next-line no-console
                  console.groupEnd()
                }
              } else {
                // eslint-disable-next-line no-console
                console.info('[a11y] No accessibility violations detected by axe-core')
              }
            })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.debug('[a11y] axe-core not available or failed to run', e)
          }
        }, 1000)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.debug('[a11y] Failed to load axe-core', e)
      }
    }

    loadAxe()

    return () => { cancelled = true }
  }, [])

  return null
}

