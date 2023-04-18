import {
    Button,
    Divider,
    GoogleLoginButton,
    Input,
    PageContainer,
    useThrowingFn,
} from 'beskar/landing'
import classNames from 'classnames'
import clsx from 'classnames'
import { signIn } from 'next-auth/react'
import { SignInErrorTypes } from 'next-auth/core/pages/signin'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { GetServerSidePropsContext } from 'next/types'
import { getJwt } from '@app/utils/ssr'
import { useRouter } from 'next/dist/client/router'

export default function Login({ ...rest }) {
    const [email, setEmail] = useState('')
    const router = useRouter()
    const callbackUrl = (router.query.callbackUrl as string) || ''
    // console.log('callbackUrl', callbackUrl)
    let errorType = (router.query.error as string) || ''
    // errorType = 'Signin'

    // https://github.com/nextauthjs/next-auth/blob/44f2a47e6e6a54a5495f0e6ea49f19c7b991dce2/packages/next-auth/src/core/pages/signin.tsx#L58
    const errors: Record<SignInErrorTypes, string> = {
        Signin: 'Try signing in with a different account.',
        OAuthSignin: 'Try signing in with a different account.',
        OAuthCallback: 'Try signing in with a different account.',
        OAuthCreateAccount: 'Try signing in with a different account.',
        EmailCreateAccount: 'Try signing in with a different account.',
        Callback: 'Try signing in with a different account.',
        OAuthAccountNotLinked:
            'To confirm your identity, sign in with the same account you used originally.',
        EmailSignin: 'The e-mail could not be sent.',
        CredentialsSignin:
            'Sign in failed. Check the details you provided are correct.',
        SessionRequired: 'Please sign in to access this page.',
        default: 'Unable to sign in.',
    }
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(
        errorType && (errors[errorType] ?? errors.default),
    )
    const login = async () => {
        setLoading(true)
        const res = await signIn('email', {
            callbackUrl: callbackUrl || '/dashboard',
            email,
            redirect: false,
        })
        console.log(res)
        setLoading(false)
        if (res?.url) {
            router.push(res.url)
        }
        if (res?.error) {
            setError(errors[res.error] ?? res.error)
        }
    }
    return (
        <div
            className={clsx(
                'relative px-3 min-h-screen items-stretch flex-col',
                'flex  space-y-[30px]',
            )}
        >
            {/* <MyNavbar hidePricing /> */}
            <NextSeo
                {...{
                    title: 'Login to Notaku',
                }}
            />

            <div
                className={clsx(
                    'space-y-8 py-12 mx-auto justify-center grow flex-col',
                    'flex w-[400px]',
                )}
            >
                <div className='text-4xl font-semibold text-center w-full'>
                    Sign Up or Login
                </div>
                <div className='mt-10'></div>
                {error && <div className='text-red-500 text-sm'>{error}</div>}
                <GoogleLoginButton callbackPath='/' />
                {/* <>
                <Divider heading='or' />
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        login()
                    }}
                    className='space-y-3'
                >
                    <Input
                        type={'email'}
                        label='Your work email'
                        autoComplete='email'
                        // value={email}
                        name='email'
                        placeholder='hello@example.com'
                        // required
                        onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                    />
                    <Button
                        isLoading={loading}
                        type='submit'
                        className='w-full'
                    >
                        Send Login Link
                    </Button>
                </form>
                </> */}
            </div>

            {/* <MyFooter /> */}
        </div>
    )
}

// export async function getServerSideProps({
//     req,
//     res,
// }: GetServerSidePropsContext) {
//     try {
//         const jwt = await getJwt({ req })
//         // return { props: {} }
//         if (jwt) {
//             return {
//                 redirect: {
//                     destination: '/dashboard',
//                     permanent: false,
//                 },
//             }
//         }
//     } catch (e) {}

//     return { props: {} }
// }
