import {
    CogIcon,
    LogoutIcon,
    MoonIcon,
    SunIcon,
} from '@heroicons/react/outline'
import {
    Faq,
    Footer,
    Link,
    NavBar,
    PageContainer,
    useColorMode,
    useColorModeValue,
    useThrowingFn,
} from 'beskar/landing'
import NextLink from 'next/link'

import { DropDownMenu } from 'beskar/src/DropDown'
import { AvatarButton } from 'beskar/src/Header'
import {
    PricingSlider,
    PricingSliderProps,
} from 'beskar/src/landing/PricingSlider'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import classNames from 'classnames'
import { signupState } from '@app/utils/atoms'
import { useAtom } from 'jotai'

export function MyNavbar({}) {
    const { data: session } = useSession()
    let canLogout = !!session
    return (
        <NavBar
            logo={' '}
            navs={
                <>
                    <Link href={'https://twitter.com/__morse'}>
                        Who made this?
                    </Link>
                    {/* <Link href={'/blog'}>Blog</Link>
                    <Link
                        href='https://changelog.salespack.io'
                        target={'_blank'}
                    >
                        Changelog
                    </Link> */}
                    {canLogout ? (
                        <Link
                            href=''
                            onClick={(e) => {
                                e.preventDefault()
                                signOut({ callbackUrl: '/', redirect: true })
                            }}
                        >
                            Sign Out
                        </Link>
                    ) : (
                        <LoginLink />
                    )}
                </>
            }
        />
    )
}

export function MyFooter({}) {
    return (
        <Footer
            justifyAround
            columns={{
                'Other projects': (
                    <>
                        <Link href='https://notaku.so'>Notaku</Link>
                    </>
                ),
                // 'Other languages': (
                //     <>
                //         <Link href='https://notaku.so'>Notaku</Link>
                //     </>
                // ),
                'Who made this?': (
                    <>
                        <Link href='https://twitter.com/__morse'>
                            My Twitter
                        </Link>
                        {/* <Link href='mailto:tommy@salespack.io'>Contact me</Link> */}
                    </>
                ),
            }}
        />
    )
}

function AvatarMenu({ imgSrc = '' }) {
    const { toggleColorMode, isDark } = useColorMode()
    const router = useRouter()
    const { data: session } = useSession()

    let avatar = (
        <div className=''>
            <AvatarButton
                // squared
                // textColor={'white'}
                // color='gradient'
                className={'border'}
                name={session?.user?.name}
            />
        </div>
    )

    return (
        <DropDownMenu button={avatar}>
            <DropDownMenu.Item
                onClick={toggleColorMode}
                icon={useColorModeValue(
                    <MoonIcon className='w-5 h-5 opacity-60' />,
                    <SunIcon className='w-5 h-5 opacity-60' />,
                )}
            >
                {!isDark ? 'Dark mode' : 'Light Mode'}
            </DropDownMenu.Item>
            <NextLink legacyBehavior href={`/board/settings`}>
                <DropDownMenu.Item
                    icon={<CogIcon className='w-5 h-5 opacity-60' />}
                >
                    Settings
                </DropDownMenu.Item>
            </NextLink>
            <DropDownMenu.Item
                onClick={() => signOut({ callbackUrl: '/' })}
                icon={<LogoutIcon className='w-5 h-5 opacity-60' />}
            >
                Sign out
            </DropDownMenu.Item>
        </DropDownMenu>
    )
}

export function Logo({ className = '' }) {
    // const { status } = useSession()
    return (
        <NextLink legacyBehavior href={'/'} passHref>
            <a
                className={classNames(
                    'text-4xl space-x-3 items-center font-medium',
                    'flex',
                    className,
                )}
            >
                <LogoIcon className='h-[24px]' />
                <div className=''>Salespack</div>
            </a>
        </NextLink>
    )
}

function LogoIcon({ ...rest }) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width={30}
            height={32}
            viewBox='0 0 30 32'
            {...rest}
        >
            <path
                fill='currentColor'
                d='M9.9,29.7840402 L0.93,13.9973735 C0.345,13.0221354 0,11.9402307 0,10.7364211 C0.00276767676,7.67006673 2.24801082,5.08341757 5.24237876,4.69689945 C8.2367467,4.31038133 11.0474327,6.24440255 11.805,9.21261161 L18,9.21261161 L18,5.4030878 C18,3.72689732 19.35,2.35546875 21,2.35546875 L21,6.30213542 L23.385,3.87927827 L30,3.87927827 L30,6.92689732 L24.615,6.92689732 L21,10.5992783 L21,10.873564 L24.615,14.5459449 L30,14.5459449 L30,17.593564 L23.385,17.593564 L21,15.1707068 L21,19.1173735 C19.3431458,19.1173735 18,17.752908 18,16.0697545 L18,12.2602307 L11.805,12.2602307 C11.655,12.8545164 11.415,13.4183259 11.115,13.9364211 L20.115,29.7840402 L27,29.7840402 C28.6568542,29.7840402 30,31.1485057 30,32.8316592 L30,34.3554688 L0,34.3554688 L0,32.8316592 C0,31.1554687 1.35,29.7840402 3,29.7840402 L9.9,29.7840402 Z M8.865,16.0697545 C8.025,16.5573735 7.05,16.8316592 6,16.8316592 L13.365,29.7840402 L16.65,29.7840402 L8.865,16.0697545 M6,7.68880208 C4.34314575,7.68880208 3,9.05326761 3,10.7364211 C3,12.4278497 4.335,13.7840402 6,13.7840402 C7.665,13.7840402 9,12.4278497 9,10.7364211 C9,9.05326761 7.65685425,7.68880208 6,7.68880208 Z'
                transform='translate(0 -2.355)'
            />
        </svg>
    )
}

export function LoginLink({}) {
    const { status } = useSession()
    const router = useRouter()
    const [signupOpen, setSignupOpen] = useAtom(signupState)
    if (status === 'authenticated') {
        return null
    }
    return (
        <div key={status} className='max-w-[14ch] text-left md:text-center'>
            <Link data-name='login' onClick={() => setSignupOpen(true)}>
                Login or Sign Up
            </Link>
        </div>
    )
}

export function MyPricing({
    onCheckout,
    orgId: orgId,
    ...rest
}: Partial<PricingSliderProps> & { orgId: string }) {
    const { fn: createPortalClient, isLoading: isLoadingPortal } =
        useThrowingFn({
            fn: async () => {
                if (!orgId) {
                    window.location.href = `/board`
                    return {
                        skipToast: true,
                    }
                }
                // const { url } = await createStripePortal({
                //     orgId: orgId,
                // })
                // window.location.href = url
                // return {
                //     skipToast: true,
                // }
            },
        })
    const router = useRouter()
    return (
        <PricingSlider
            {...{
                products: [],
                allowYearlyBilling: false,
                features: [
                    'Connect unlimited accounts',
                    'Priority Support   ',
                    'Email warmup',
                    'Unified inbox',
                    'Delivery analytics',
                    // 'Delivery analytics',
                    // 'Password protection',
                    // 'Password protection',
                    // 'Password protection',
                ],
                needMoreEmail: 'tommy@salespack.io',
                trialDays: 7,
                async getSubscription() {
                    return null
                    // const d = await getSubscription({ orgId: orgId })
                    // let sub: Subscription = d?.subscription
                    // if (!sub) {
                    //     return null
                    // }
                    // return {
                    //     id: sub?.id,
                    //     productId: sub?.priceId,
                    //     unit_price: sub?.unit_amount,
                    // }
                    
                },

                async updatePlan({ planId, subscriptionId }) {
                    await createPortalClient()
                },

                manageSubscriptionHandler: createPortalClient,
                async onCheckout(arg) {
                    // const { sessionId } = await createStripeCheckoutSession({
                    //     orgId: orgId,
                    //     priceId: arg.productId, // productId here means price id
                    // })
                    // const stripe = await getStripe()
                    // await stripe?.redirectToCheckout({ sessionId })
                    // onCheckout && onCheckout(arg)
                },
                ...rest,
            }}
        />
    )
}

export function MyFaq({ className = '' }) {
    return (
        <PageContainer
            className={classNames(
                'max-w-5xl px-4 w-full',
                'lg:px-0',
                className,
            )}
        >
            <div className='text-3xl font-semibold text-center'>
                Frequently asked questions
            </div>
            <Faq
                className='min-w-full text-gray-800'
                items={[
                    {
                        heading: 'Can i use Salespack for my agency?',
                        content: (
                            <div>
                                Yes! We have a members system that lets you
                                invite members to your org and let them monitor
                                the campaigns analytics and stats.
                                <br />
                                <br />
                                Usually we recommend that you create a separate
                                org for each client.
                            </div>
                        ),
                    },
                    {
                        heading: 'Do you have a free trial?',
                        content: (
                            <div>Yes! All plans have a 7 days free trial.</div>
                        ),
                    },
                    {
                        heading: 'What email accounts can i use?',
                        content: (
                            <div>
                                You can use any email accounts supporting SMTP
                                and IMAP (basically all providers, Google
                                requires some additional steps to enabled SMTP)
                                <br />
                                <br />
                                You can also create a new email account using
                            </div>
                        ),
                    },
                    {
                        heading: 'What is email warmup?',
                        content: (
                            <div className=''>
                                If you enable warmup for your email accounts we
                                will send emails from your account to other
                                Salespack users.
                                <br />
                                <br />
                                This lets you monitor if your emails end up in
                                spam and makes ISPs increase the trust scores of
                                your email accounts.
                                <br />
                                <br />
                                We will also move emails that end up in spam to
                                the main inbox.
                                <br />
                                <br />
                                All warmup emails you receive will be moved to a
                                separate folder to not clutter your inbox.
                            </div>
                        ),
                    },
                    {
                        heading: 'How are emails counted?',
                        content: (
                            <div className=''>
                                Every email you send in a campaign (counting
                                follow ups) increments your org emails count.
                                <br />
                                Warmup emails are not counted.
                            </div>
                        ),
                    },

                    {
                        heading: 'Who is behind Salespack?',
                        content: (
                            <span className=''>
                                I am Tommy, a software engineer living in Italy.
                                you can chat with me on{` `}
                                <Link
                                    underline
                                    href={'https://twitter.com/__morse'}
                                >
                                    Twitter
                                </Link>{' '}
                                :).
                            </span>
                        ),
                    },
                ]}
            />
        </PageContainer>
    )
}
