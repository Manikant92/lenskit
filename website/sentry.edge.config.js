// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever middleware or an Edge route handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
    dsn:
        SENTRY_DSN ||
        'https://ed1eefbcedf7424ab070fed0f3d38d00@o4505039914795008.ingest.sentry.io/4505039915909120',
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.1,
    beforeSend(event) {
        // do not send in development
        if (process.env.NODE_ENV === 'development') {
            return null
        }
        if (event?.name === 'AbortError') {
            return null
        }
        // ignore React mismatch minified errors
        if (
            event?.message &&
            [
                `https://reactjs.org/docs/error-decoder.html?invariant=418`, //
            ].map((x) => event?.message?.includes(x))
        ) {
            console.log('ignoring minified React error', event)
            return null
        }
        return event
    },
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
})
