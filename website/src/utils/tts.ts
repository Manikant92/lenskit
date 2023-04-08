import { env } from '@app/env'
import { fetch } from 'undici'
import { AppError } from './errors'
import { removeNonSpoken } from './utils'

let auths = env.TIKTOK_SESSION_IDS.split(',')
    .map((x) => x.trim())
    .filter((x) => x)
let lastUsed = 0

if (!auths.length) {
    throw new AppError('No tiktok session ids provided')
}

function getSessionId() {
    lastUsed = (lastUsed + 1) % auths.length
    return auths[lastUsed]
}

export async function tikTokTTSServer({ text, voice }) {
    let sessionId = getSessionId()
    text = removeNonSpoken(text)

    let url = new URL(
        'https://api16-va.tiktokv.com/media/api/text/speech/invoke/',
    )
    url.searchParams.set('text_speaker', voice)
    url.searchParams.set('req_text', text)
    url.searchParams.set('aid', '1233')
    url.searchParams.set('speaker_map_type', '0')
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            Cookie: `sessionid=${sessionId}`,

            'User-Agent':
                'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
        },
    })
    let resText = await res.text()
    if (!res.ok) {
        throw new AppError(`tiktok tts failed for ${voice}: ${resText}`)
    }
    // console.log('tiktok tts response: ' + resText)
    let json = JSON.parse(resText)
    let base64 = json?.data?.v_str
    if (!base64) {
        throw new AppError(`tiktok tts failed for ${voice}: ${resText}`)
    }
    let audioUrl = `data:audio/mp3;base64,${base64}`
    return { base64, audioUrl }

    // console.log('someone has requested a tts of: ' + text + ' (not formatted)')
    // let fileContents = Buffer.from(base64, 'base64')
    // return { buffer: fileContents }
}
