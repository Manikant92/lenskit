const path = require('path')

const { withSuperjson } = require('next-superjson')
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//     enabled: Boolean(process.env.ANALYZE),
// })

const { withSentryConfig } = require('@sentry/nextjs')

const withRpc = require('next-rpc')({
    experimentalContext: true,
})

const piped = pipe(withRpc, withSuperjson(), (c) =>
    withSentryConfig(c, {
        org: 'tiktoktts',
        project: 'javascript',
        dryRun: process.env.NODE_ENV === 'development',
        
        silent: true, //
    }),
)

const isPreview =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENV === 'preview'

/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    productionBrowserSourceMaps: true,
    output: 'standalone',
    outputFileTracing: true,
    experimental: {
        externalDir: true,
        externalDir: true,
        outputFileTracingRoot: path.join(__dirname, '../'),
    },
    transpilePackages: ['beskar'],
    swcMinify: true,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
    },
    webpack: (config, { isServer, dev: isDev }) => {
        if (isPreview) {
            config.resolve.alias = {
                ...config.resolve.alias,
                'react-dom$': 'react-dom/profiling',
                'scheduler/tracing': 'scheduler/tracing-profiling',
            }
        }
        config.externals = config.externals.concat([])
        return config
    },
    // add rewrites for /blog
    // async rewrites() {
    //     let url = 'https://mono.framer.media'
    //     return [
    //         {
    //             source: '/blog/:slug*',
    //             destination: url + '/:slug*',
    //         },
    //         {
    //             source: '/blog',
    //             destination: url,
    //         },
    //     ]
    // },
}

module.exports = piped(config)

function pipe(...fns) {
    return (x) => fns.reduce((v, f) => f(v), x)
}
