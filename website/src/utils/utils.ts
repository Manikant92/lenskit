import { env } from '@app/env'
import { useState, useEffect, useRef } from 'react'
import { AppError } from './errors'

let keyPrefix = 'saved-state-'

export function useSavedState(key, defaultValue) {
    key = keyPrefix + key
    const [value, setValue] = useState(defaultValue)
    useEffect(() => {
        const saved = localStorage.getItem(key)
        if (saved) {
            let parsed = safeJsonParse(saved)
            if (parsed) {
                setValue(parsed)
            }
        }
    }, [])

    useDebouncedEffect(
        () => {
            try {
                localStorage.setItem(key, JSON.stringify(value))
            } catch (e) {}
        },
        [value],
        200,
    )
    return [value, setValue]
}

export function useDebouncedEffect(callback, deps = [], delay = 120) {
    const data = useRef({ firstTime: true, clearFunc: null })
    useEffect(() => {
        const { firstTime, clearFunc } = data.current

        if (firstTime) {
            data.current.firstTime = false
            return
        }

        const handler = setTimeout(() => {
            if (clearFunc && typeof clearFunc === 'function') {
                clearFunc()
            }
            data.current.clearFunc = callback()
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [delay, ...deps])
}

function safeJsonParse(json) {
    try {
        return JSON.parse(json)
    } catch (e) {
        return null
    }
}

export function createBuyLink({ email, orgId }) {
    let productId =
        env.NEXT_PUBLIC_ENV === 'production'
            ? '5e71789f-c727-4f2e-81f4-dfab3daa5c89'
            : 'a7f8fc54-1979-49ce-bb73-3bbfe57e1c20'
    let url = new URL(
        `https://tiktoktts.lemonsqueezy.com/checkout/buy/${productId}`,
    )
    if (orgId) {
        url.searchParams.set('checkout[custom][orgId]', orgId)
    }
    url.searchParams.set('embed', '1')
    url.searchParams.set('logo', '0')
    url.searchParams.set('dark', '0')

    if (email) {
        url.searchParams.set('checkout[email]', email)
    }
    return url.toString()
}

export function objFromArr(arr: any[]) {
    return Object.fromEntries(arr.map((x) => [x, x]))
  }
  