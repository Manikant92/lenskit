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

export function splitTextInParts(
    text: string,
    maxLen = 300,
    separators = ['!', '?', '.', ';', ',', ' '],
) {
    text = removeNonSpoken(text)
    let parts = _splitTextInParts(text, maxLen, separators)
    return parts
}

// splits the audio into parts of maxLen, it prefers to split using the first separator, then the second, etc
export function _splitTextInParts(text: string, maxLen, separators) {
    if (!text) {
        return []
    }
    if (text.length <= maxLen) {
        return [text.trim()]
    }
    let remaining = text.slice()
    for (let sep of separators) {
        while (remaining.length > maxLen) {
            let i = remaining.lastIndexOf(sep, maxLen)
            if (i < 0) {
                break
            }
            let part = remaining.slice(0, i)
            remaining = remaining.slice(i + 1)
            if (part.length > maxLen) {
                continue
            }
            return [
                part.trim() + sep,
                ..._splitTextInParts(remaining, maxLen, separators).filter(
                    Boolean,
                ),
            ]
        }
    }
    throw new AppError(`Could not split into ${maxLen} long text: '${text}'`)
}

export function removeNonSpoken(text: string) {
    text = text.replace(/(.)\.(\s|\n)/g, '$1!$2')
    text = text.replace(/[^\x00-\x7F]/g, '')
    text = text.replace(/(\r\n|\n|\r)/gm, '')
    // merge together multiple spaces
    text = text.replace(/\s+/g, ' ')

    return text
}

export async function concatAudioUrls(audioSources: string[]) {
    // creates a new audio block with the merged audio clips
    let blobs = await Promise.all(
        audioSources.map(async (url) => {
            let r = await fetch(url)
            let blob = await r.blob()
            return blob
        }),
    )
    let blob = new Blob(blobs, { type: 'audio/mpeg' })
    return blob
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
