// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
    dsn: 'https://ed1eefbcedf7424ab070fed0f3d38d00@o4505039914795008.ingest.sentry.io/4505039915909120',

    tracesSampleRate: 0.1,
    // onFatalError: onUncaughtException,
    beforeSend(event) {
        // do not send in development
        if (process.env.NODE_ENV === 'development') {
            return null
        }
        return event
    },
    integrations(integrations) {
        return integrations.filter(
            (integration) => integration.id !== 'OnUncaughtException',
        )
    },
})

// https://github.com/nodejs/node/issues/42154
global.process.on('uncaughtException', (error) => {
    const hub = Sentry.getCurrentHub()
    hub.withScope(async (scope) => {
        scope.setLevel('fatal')
        hub.captureException(error, { originalException: error })
    })
    if (error?.['code'] === 'ECONNRESET') {
        console.log(`handled ECONNRESET ${error}`)
        return
    }
    console.error('UNCAUGHT EXCEPTION')
    console.error(error)
    // console.error(origin)
    process.exit(1)
})
