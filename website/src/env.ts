import path from 'path'
import { AppError } from './utils/errors'

export const env = {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SECRET: process.env.SECRET,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    STABILITY_KEY: process.env.STABILITY_KEY,
    // TIKTOK_SESSION_IDS: process.env.TIKTOK_SESSION_IDS,
    // LEMON_SQUEEZY_KEY: process.env.LEMON_SQUEEZY_KEY,
}

if (typeof window === 'undefined') {
    for (const k in env) {
        if (env[k] == null) {
            // console.error(env)
            throw new AppError(`Missing required ssr env var '${k}'`)
        }
    }
}

for (const k in env) {
    if (k.startsWith('NEXT_PUBLIC') && env[k] == null) {
        throw new AppError(`Missing required client env var '${k}'`)
    }
}

export const BASE_URL = 'https://tiktoktts.com'

export const DOWNLOADS_COUNT_COOKIE = 'tiktoktts-downloads'

export const FREE_CREDITS = 800

export const variantIdToCredits = {
    // production mode
    50792: 8_000, // 1 hour
    50793: 40_000, // 5 hours
    // test mode
    38951: 3000,
    38949: 1000,
}
