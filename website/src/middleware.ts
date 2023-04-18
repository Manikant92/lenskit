import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// import {  } from 'next-auth/core'

const isDev = process.env.NODE_ENV === 'development'
const NEXT_AUTH_COOKIE_NAME = isDev
    ? 'next-auth.session-token'
    : '__Secure-next-auth.session-token'

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const base = req.nextUrl.origin
    return
    // ignore next internal requests
    if (
        req.nextUrl.pathname.startsWith('/_next/') ||
        req.nextUrl.pathname.includes('.')
    ) {
        return
    }
    try {
        const { pathname = '', search } = req.nextUrl

        const isBrowserEntry =
            req.method === 'GET' &&
            req.headers.get('accept')?.includes('text/html')

        if (isBrowserEntry && pathname === '/') {
            const jwt = await getToken({
                req: req,
                secret: process.env.SECRET,
            }).catch(() => null)
            if (!jwt || !jwt.userId) {
                console.log(`redirecting not logged in user`)
                // redirect to /
                return new NextResponse(null, {
                    headers: {
                        Location: new URL(
                            '/login',
                            // '/api/auth/signin/google',
                            base,
                        ).toString(),
                        'set-cookie': `${NEXT_AUTH_COOKIE_NAME}=; max-age=0`,
                    },
                    // 307 means "Temporary Redirect"
                    status: 307,
                })
            }
        }
        return
    } catch (e) {
        console.error('middleware', e)
        return NextResponse.next()
    }
}
