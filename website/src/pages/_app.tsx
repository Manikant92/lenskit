import 'baby-i-am-faded/styles.css'
import '@app/styles/index.css'
import 'react-medium-image-zoom/dist/styles.css'

import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import NextNprogress from 'nextjs-progressbar'

import { AppError } from '@app/utils/errors'
import { BeskarProvider } from 'beskar/src/BeskarProvider'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { mutate } from 'swr'
import { env } from '@app/env'
import { notifyError } from '@app/utils/sentry'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const router = useRouter()
    const isDashboard = router.asPath.startsWith('/board')

    // const updateUpgradeModal = useUpdateAtom(atomUpgradeModal)

    useEffect(() => {
        if (env.NEXT_PUBLIC_ENV !== 'production') {
            window.loginForTests = async ({ name, email }) => {
                if (!email) {
                    throw new AppError('Email is required for test provider')
                }
                // const providers = await getProviders()
                // console.log({ providers })
                return await signIn('test-provider', {
                    name,
                    email,
                    callbackUrl: '/empty',
                    redirect: false,
                })
            }
        }
    }, [])
    // const forcedTheme = !isDashboard ? 'light' : undefined

    return (
        <SessionProvider
            basePath={router.basePath || undefined}
            session={session}
        >
            <Script async src='https://cdn.splitbee.io/sb.js'></Script>

            <Script
                src='https://assets.lemonsqueezy.com/lemon.js'
                strategy='lazyOnload'
                onLoad={() => {
                    try {
                        window.createLemonSqueezy()
                        window.LemonSqueezy.Setup({
                            eventHandler: (event) => {
                                console.log(event)
                                if (event?.event === 'Checkout.Success') {
                                    console.log('Checkout.Success')
                                    mutate('credits')
                                }
                                // Do whatever you want with this event data
                            },
                        })
                    } catch (error) {
                        notifyError(error, 'lemon')
                    }
                }}
            />
            

            <BeskarProvider>
                <ThemeProvider
                    defaultTheme='dark'
                    enableSystem={false}
                    attribute='class'
                    // forcedTheme={forcedTheme}
                >
                    <Toaster
                        containerStyle={{ zIndex: 10000 }}
                        position='top-center'
                    />

                    <InjectCrispEmail />
                    <NextNprogress
                        color='#29D'
                        startPosition={0.3}
                        stopDelayMs={200}
                        height={4}
                        options={{ showSpinner: false }}
                        showOnShallow={true}
                    />

                    <Component {...pageProps} />
                </ThemeProvider>
            </BeskarProvider>
        </SessionProvider>
    )
}
export default MyApp

function InjectCrispEmail() {
    const { data: session } = useSession()
    useEffect(() => {
        const email = session?.user?.email
        if (!email) {
            return
        }
        if (!window.$crisp) {
            console.warn(`Cannot set Crisp email, Crisp not loaded`)
            return
        }
        window.$crisp.push(['set', 'user:email', email])
    }, [session])
    const router = useRouter()
    // set user segments
    // useEffect(() => {
    //     if (!orgId || !session) {
    //         return
    //     }
    //     setTimeout(async () => {
    //         try {
    //             const { subscription, freeTrial } = await getSubscription({
    //                 orgId,
    //             })
    //             if (subscription && !freeTrial) {
    //                 console.log(`Setting Crisp segment to 'paying-user'`)
    //                 $crisp.push(['set', 'session:segments', [['paying-user']]])
    //                 let value = subscription?.unit_amount || ''
    //                 $crisp.push([
    //                     'set',
    //                     'session:data',
    //                     [[['user-plan', '$' + value]]],
    //                 ])
    //             }
    //         } catch (error) {
    //             console.error(error)
    //         }
    //     }, 1000)
    // }, [session, orgId])
    return null
}

// function SignupConversionComponent() {
//     useSignupConversion()
//     useSignupReason({})
//     return null
// }
