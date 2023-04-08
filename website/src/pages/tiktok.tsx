// images
import splitbee from '@splitbee/web'

import { Crisp } from 'crisp-sdk-web'
import { motion } from 'framer-motion'
import Cookies from 'js-cookie'

import { Sema } from 'async-sema'
import * as env from '@app/env'

import { MyFaq, MyFooter, MyNavbar, MyPricing } from '@app/components/specific'
import {
    Divider,
    Feature,
    Hero,
    PageContainer,
    RootPageContainer,
    Section,
} from 'beskar/landing'
import {
    BrowserWindow,
    Button,
    FeaturesBlocks,
    GoogleLoginButton,
    Modal,
    useDisclosure,
    useThrowingFn,
} from 'beskar/src/landing'

import {
    AtSymbolIcon,
    ChartBarIcon,
    ChartPieIcon,
    CheckIcon,
    LightningBoltIcon,
    ReplyIcon,
} from '@heroicons/react/solid'
import { Faded } from 'baby-i-am-faded'
import colors from 'beskar/colors'
import { BlockWithStep } from 'beskar/dashboard'
import clsx from 'classnames'

import { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { signIn, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { useEffect, useRef, useState } from 'react'
import { Select } from 'beskar/src/Select'
import classNames from 'classnames'
import { tikTokVoices } from 'db/data'
import {
    generateTikTokVoice,
    getSubscriptions,
    getUserCredits,
    getUserOrg,
} from './api/functions'
import { KnownError } from '@app/utils/errors'
import { atom, useAtom } from 'jotai'
import { signupState } from '@app/utils/atoms'
import {
    concatAudioUrls,
    createBuyLink,
    splitTextInParts,
    useSavedState,
} from '@app/utils/utils'
import dynamic from 'next/dynamic'
import { Faqs } from '@app/components/faq'
import { DOWNLOADS_COUNT_COOKIE } from '@app/env'
import useSWR from 'swr'
import { Textarea } from 'beskar/src/landing/form'
import toast from 'react-hot-toast'

let MAX_LEN = 300

const PreviewButton = dynamic(() => import('@app/components/PreviewButton'), {
    loading: () => null,
    ssr: false,
})

let faviconUrl =
    'https://image-forwarder.notaku.so/aHR0cHM6Ly9ub3Rpb24tdGFza3MtYzc2NWM4ZS1oaGxqM2k2ZWlxLXVlLmEucnVuLmFwcC9lbW9qaS8lRjAlOUYlQTQlOTY='

let img = require('@app/../public/og_image.png')
const ogImageUrl = new URL(img.src || img?.default.src, env.BASE_URL).toString()

// console.log('ogImageUrl', ogImageUrl)

function Page({}: InferGetStaticPropsType<typeof getStaticProps>) {
    const { status } = useSession()
    const router = useRouter()
    const degree = 0.1

    return (
        <div className='text-gray-100 dark bg-gray-900 '>
            <style global jsx>{`
                html {
                    color-scheme: dark !important;
                }
            `}</style>
            <GradientBg />
            <NextSeo
                {...{
                    title: 'TikTok text-to-speech online - TikTok TTS',

                    description:
                        'Generate TikTok voices from text without using the app. Can generate the girl siri voice, robot voice, Rocket and all other TikTok voices.',
                    canonical: 'https://tiktoktts.com/tiktok',
                    openGraph: {
                        images: [{ url: ogImageUrl }],
                    },
                    twitter: {
                        cardType: 'summary_large_image',
                    },
                    additionalLinkTags: [
                        {
                            rel: 'icon',
                            href: faviconUrl,
                        },
                        {
                            rel: 'apple-touch-icon',
                            href: faviconUrl,
                            // sizes: '76x76',
                        },
                    ],
                }}
            />
            {/* <div
                className={clsx(
                    'absolute top-0 left-0 w-screen h-screen opacity-50',
                    '',
                )}
            >
                <BlurSvg />
            </div> */}
            <SignupModal />
            <RootPageContainer className='!min-h-screen'>
                <MyNavbar />
                <Hero
                    className='dark'
                    animate={{
                        whenInView: false,
                        delay: 100,
                    }}
                    // bullet='beta'
                    // image={
                    //     <div className='flex h-full items-end'>
                    //         <img
                    //             src={heroImage.src}
                    //             className={clsx(
                    //                 'opacity-80 min-w-screen min-w-[600px] md:min-w-[1000px]',
                    //                 'lg:-ml-[20px]',
                    //             )}
                    //         />
                    //     </div>
                    // }
                    // image=' '
                    // image={
                    //     <div className='p-8 max-w-[360px] relative'>
                    //         <Image
                    //             className='shadow-lg opacity-40 min-w-[200px]'
                    //             alt='video illustration'
                    //             src={videoCta}
                    //         />
                    //         <VideoModal
                    //             className=''
                    //             aspectRatio={14 / 9}
                    //             button={
                    //                 <div className='flex items-center justify-center absolute inset-0'>
                    //                     <VideoModal.PLayButton className='' />
                    //                 </div>
                    //             }
                    //             youtubeVideoId='ItMyDTdRd_c'
                    //         />
                    //     </div>
                    // }
                    heading={
                        <span className='text-6xl font-bold tracking-wide leading-none'>
                            TikTok
                            <br />
                            text to speech
                        </span>
                    }
                    subheading={
                        <div className='leading-relaxed max-w-xl'>
                            Generate TikTok voices from text in your browser
                        </div>
                    }
                    // fingerprint={
                    //     <div className="font-semibold">
                    //         7-day free trial. No credit card needed
                    //     </div>
                    // }
                    cta={null}
                />
                <PageContainer dontContain>
                    <div className='flex flex-col items-center'>
                        <Form />
                    </div>
                </PageContainer>
                <Faqs />
                {/* <Divider
                    animate={{
                        whenInView: false,
                        delay: 300,
                    }}
                    className='[&_div]:border-gray-600'
                    heading='10x your replies and revenue'
                /> */}
                {/* 
                <FeaturesBlocks
                    blocksClassName='bg-blue-200 text-gray-900'
                    features={[
                        {
                            heading: 'Unlimited email accounts',
                            description: 'Use many emails as you want',
                            Icon: AtSymbolIcon,
                        },
                        {
                            heading: 'We provide Email Accounts',
                            description:
                                'We provide you with email accounts (no need for Gmail, Outlook, etc)',
                            Icon: LightningBoltIcon,
                        },
                        {
                            heading: 'Automate Follow-ups',
                            description: 'Automate your follow-ups',
                            Icon: ReplyIcon,
                        },
                        {
                            heading: 'Email warmup',
                            description: 'Keep your emails out of spam',
                            Icon: CheckIcon,
                            // bullet: 'Coming Soon',
                        },
                        {
                            heading: 'A/B test emails',
                            description: 'Experiment with your emails',
                            Icon: ChartPieIcon,
                            bullet: 'Coming Soon',
                        },
                        {
                            heading: 'Unified Inbox & Analytics',
                            description:
                                'Track delivery, opens, clicks, and replies',
                            Icon: ChartBarIcon,
                            // bullet: 'Coming Soon',
                        },
                    ]}
                /> */}

                {/* <Faded
                    whenInView
                    triggerOnce
                    cascade
                    className='relative flex flex-col gap-8 items-center '
                >
                    <h2 className='text-6xl font-extrabold text-gray-100 text-center'>
                        Pricing
                    </h2>

                    <MyPricing
                        animate
                        orgId=''
                        promptLogin={() => signIn()}
                        // products={products}
                        hideUpgradeButton
                    />
                </Faded>
                <MyFaq />
                */}
                <div className='grow'></div>
                <MyFooter />
            </RootPageContainer>
        </div>
    )
}

export default Page

function SignupModal() {
    const [signupOpen, setSignupOpen] = useAtom(signupState)
    return (
        <Modal
            useDefaultContentStyle
            className='md:!top-[300px]'
            maxWidth='800px'
            content={
                <div className={clsx('py-16 flex flex-col items-center gap-8')}>
                    <Modal.CloseButton
                        onClick={() => {
                            setSignupOpen(false)
                        }}
                    />
                    <div className='text-3xl font-bold text-center'>
                        Sign up to continue
                    </div>
                    <div className='text-xl font-medium opacity-80 max-w-sm text-center'>
                        Sign up is required to prevent abuse
                    </div>
                    <GoogleLoginButton
                        onClick={() => {
                            splitbee.track('sign-up')
                        }}
                        callbackPath='/'
                    />
                </div>
            }
            isOpen={signupOpen}
            onClose={() => {
                setSignupOpen(false)
            }}
        ></Modal>
    )
}

let langs = Object.keys(tikTokVoices)

function onError(e: any) {
    toast.error(e.message)
}

function Form() {
    const [lang, setLang] = useSavedState('lang', langs[0])
    const [text, setText] = useSavedState('text', '')
    const [voice, setVoice] = useSavedState(
        'voice',
        tikTokVoices[lang]?.[0]?.id,
    )
    let [audioSource, setAudioSource] = useState('')
    let audioRef = useRef<HTMLAudioElement>(null)
    const [signupOpen, setSignupOpen] = useAtom(signupState)
    useEffect(() => {
        if (!tikTokVoices[lang]?.map((x) => x.id).includes(voice)) {
            setVoice(tikTokVoices[lang]?.[0]?.id)
        }
    }, [lang])

    function play() {
        let playing = !audioRef.current.paused
        if (playing) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
    }
    const { fn: generateClient, isLoading } = useThrowingFn({
        async fn() {
            if (!text) {
                throw new KnownError('Please enter some text')
            }
            {
                let words = text.split(' ').length
                splitbee.track('generate', {
                    words,
                })
            }
            setAudioSource('')
            try {
                const audioSource = await generateComposedAudioUrl({
                    text,
                    voice,
                    onPartStarted({ index, total }) {
                        if (total > 1) {
                            setLoadingMessage(
                                `Generating audio part... ${index}/${total}`,
                            )
                        }
                    },
                })
                mutate()
                setAudioSource(audioSource)
                audioRef.current.src = audioSource
                setTimeout(() => play())
            } finally {
                setLoadingMessage('')
            }
        },
        successMessage: '',
    })
    let [errorMessage, setError] = useState('')
    let [loadingMessage, setLoadingMessage] = useState('')
    const { data: session } = useSession()
    let [isPlaying, setIsPlaying] = useState(false)
    const {
        data: credits,
        mutate,
        error,
    } = useSWR('credits', () => getUserCredits(), { onError })
    let progress = credits?.used / credits?.total
    return (
        <div className='flex flex-col gap-8 w-full items-center'>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    generateClient()
                }}
                className='flex flex-col gap-4 w-full grow md:w-[700px]'
            >
                <div className='text-red-400 text-sm'>{errorMessage}</div>
                <Textarea
                    value={text}
                    autoResize
                    onChange={(e) => {
                        if (errorMessage) {
                            setError('')
                        }
                        if (loadingMessage) {
                            setLoadingMessage('')
                        }
                        let text = e.target.value
                        setText(text)
                        // if (text.length > MAX_LEN) {
                        //     setError('Text too long, max is 300 characters')
                        // }
                    }}
                    className='min-h-[160px] !p-4'
                    placeholder='Write text here'
                />
                <div
                    className={clsx(
                        'flex flex-col w-full grow md:flex-row gap-4',
                    )}
                >
                    <Select
                        // useAutoGradientIcons

                        onChange={(e) => {
                            setLang(e)
                        }}
                        value={lang}
                        className={classNames('z-100 min-w-[16ch] !border-0')}
                        options={langs.map((k) => {
                            return {
                                value: k,
                                name: k,
                            }
                        })}
                    />
                    <Select
                        // useAutoGradientIcons
                        onChange={(e) => {
                            setVoice(e)
                        }}
                        value={voice}
                        className={classNames('min-w-[300px] !border-0')}
                        options={tikTokVoices[lang]?.map((o) => {
                            return {
                                value: String(o.id),
                                whenButton: o.name,
                                name: (
                                    <div className='flex grow gap-1'>
                                        <div className='grow'>{o.name}</div>
                                        <div className='grow'></div>

                                        <PreviewButton
                                            className='mr-1'
                                            voice={o.id}
                                        />
                                    </div>
                                ),
                            }
                        })}
                    />

                    <div className='grow hidden md:block'></div>
                    <Button
                        type='submit'
                        bg='blue.100'
                        icon={<LightningBoltIcon className='h-4' />}
                        disabled={!text || !!errorMessage}
                        className='font-bold text-sm h-[34px]'
                        isLoading={isLoading}
                    >
                        Generate
                    </Button>
                </div>
                <audio
                    src={audioSource}
                    className='!mt-0 hidden'
                    ref={audioRef}
                    onPlay={() => {
                        setIsPlaying(true)
                    }}
                    onPause={() => {
                        setIsPlaying(false)
                    }}
                />
            </form>
            {loadingMessage && (
                <div className='opacity-60'>{loadingMessage}</div>
            )}
            <div className='min-h-[100px]'>
                {audioSource && (
                    <div className='flex flex-col items-center'>
                        <div className='flex gap-3'>
                            <Button className='' onClick={play}>
                                {isPlaying ? 'Pause' : 'Play'}
                            </Button>
                            <Button
                                href={audioSource}
                                // @ts-ignore
                                download='text-to-speech.mp3' // TODO better name for file
                                onClick={(e) => {
                                    let audio = audioRef.current
                                    audio.pause()
                                    if (!session) {
                                        setSignupOpen(true)
                                        e.preventDefault()
                                        return
                                    }
                                    splitbee.track('download')

                                    // download audio file
                                }}
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {session && !!progress && (
                <div className='flex-col items-center flex gap-3'>
                    <div className='text-center font-medium opacity-80'>
                        Used {credits.used} of your {credits.total} words quota{' '}
                        {credits.free && '(free account)'}
                    </div>
                    <div className='flex items-center gap-3'>
                        <ProgressBar
                            className='min-w-[400px] text-xs'
                            progress={progress}
                        />
                        <div className='opacity-70 text-sm font-mono'>
                            {Number(Math.min(progress, 1) * 100).toFixed(0) +
                                '%'}
                        </div>
                    </div>

                    <div className='mt-2 flex gap-1'>
                        <BuyButton ghost={progress < 0.5} />
                        <CancelPlan />
                    </div>
                </div>
            )}
        </div>
    )
}

export const getStaticProps = async (ctx: GetStaticPropsContext) => {
    const locale = (ctx.params?.locale as string) || 'en'

    return {
        props: {
            locale,
        },
    }
}

function GradientBg() {
    return (
        <>
            <style jsx global>{`
                .background_main__HFlNS {
                    width: 100vw;
                    min-height: 100vh;
                    position: absolute;
                    display: flex;
                    justify-content: center;
                    padding: 120px 24px 160px;
                    pointer-events: none;
                }

                // .background_main__HFlNS:before {
                //     background: radial-gradient(
                //         circle,
                //         rgba(2, 0, 36, 0) 0,
                //         #111 100%
                //     );
                //     position: absolute;
                //     content: '';
                //     // z-index: 2;
                //     width: 100%;
                //     height: 100%;
                //     top: 0;
                // }

                // .background_main__HFlNS:after {
                //     content: '';
                //     background-image: url(/_static/grid.svg);
                //     // z-index: 1;
                //     position: absolute;
                //     width: 100%;
                //     height: 100%;
                //     top: 0;
                //     opacity: 0.4;
                //     filter: invert(1);
                // }

                .background_content__pv7b5 {
                    // height: -webkit-fit-content;
                    // height: -moz-fit-content;
                    // height: fit-content;
                    // z-index: 3;
                    transform: translateX(0px) translateY(0px) translateZ(0px);
                    max-width: 1800px;
                    background-image: radial-gradient(
                        at 30% 10%,
                        #1b72f5 0,
                        transparent 100%
                    );
                    position: absolute;
                    content: '';
                    width: 100%;
                    height: 40%;
                    filter: blur(100px) saturate(150%);
                    top: 80px;
                    opacity: 0.13;
                }
            `}</style>
            <div className='background_main__HFlNS'>
                <div className='background_content__pv7b5' />
            </div>
        </>
    )
}

export function TikTokIcon({ ...rest }) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 2859 3333'
            shapeRendering='geometricPrecision'
            textRendering='geometricPrecision'
            imageRendering='optimizeQuality'
            fillRule='evenodd'
            clipRule='evenodd'
            {...rest}
        >
            <path d='M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z' />
        </svg>
    )
}

async function generateComposedAudioUrl({ text, voice, onPartStarted }) {
    let parts = splitTextInParts(text, MAX_LEN)
    console.log(`creating audio from ${parts.length} parts`)
    let sema = new Sema(10)
    let index = 0
    let total = parts.length
    let sources = await Promise.all(
        parts.map(async (part) => {
            await sema.acquire()
            try {
                await onPartStarted({ index: index++, total })
                const { audioUrl } = await generateTikTokVoice({
                    text: part,
                    voice,
                })

                return audioUrl
            } finally {
                sema.release()
            }
        }),
    )
    const merged = await concatAudioUrls(sources)
    let url = URL.createObjectURL(merged)
    return url
    // setText('')
}

function BuyButton({ ghost = true }) {
    const { data: session } = useSession()
    let [href, setHref] = useState('')
    let [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        Promise.resolve().then(async () => {
            const org = await getUserOrg({})
            if (!org) {
                return
            }
            setHref(
                createBuyLink({
                    email: session?.user?.email,
                    orgId: org?.id,
                }),
            )
        })
    }, [])
    if (!href) {
        return null
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
                ref={(r) => {
                    try {
                        // @ts-ignore
                        window.createLemonSqueezy()
                    } catch (e) {
                        console.log('cannot window.createLemonSqueezy', e)
                    }
                }}
                ghost={ghost}
                href={href}
                isLoading={isLoading}
                className='lemonsqueezy-button font-bold text-sm'
                disabled={!href}
                target=''
                onClick={() => {
                    splitbee.track('buy intent')
                    setIsLoading(true)
                    setTimeout(() => {
                        setIsLoading(false)
                    }, 1000 * 5)
                }}
            >
                Increase Quota
            </Button>
        </motion.div>
    )
}

function ProgressBar({ progress, className = '' }) {
    const backgroundColor = (() => {
        if (progress > 0.9) {
            return 'bg-orange-500'
        }
        if (progress > 0.6) {
            return 'bg-yellow-400'
        }

        return 'bg-green-500'
    })()
    return (
        <div
            // style={{ backgroundColor }}
            className={classNames(
                'relative rounded-md overflow-hidden w-full bg-gray-700 flex h-[0.8em]',
                className,
            )}
        >
            <motion.div
                // layout
                transition={{ duration: 0.4 }}
                animate={{
                    width: Number(Math.min(progress, 1) * 100).toFixed(0) + '%',
                }}
                className={classNames(
                    'h-full bg-gray-200 rounded overflow-hidden',
                    backgroundColor,
                )}
            ></motion.div>
        </div>
    )
}

function CancelPlan({}) {
    const { data: subs } = useSWR('cancel plan', () =>
        getSubscriptions({ onError }),
    )
    if (!subs) {
        return null
    }
    let sub = subs?.[0]
    if (!sub) {
        return null
    }
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
                ghost
                className='text-sm'
                onClick={() => {
                    if (typeof $crisp === 'undefined') {
                        console.warn(
                            `FeedbackWithCrisp has not found $crisp variable`,
                        )
                        return
                    }
                    $crisp.push([
                        'set',
                        'session:data',
                        [[['sub', sub.subscriptionId]]],
                    ])
                    $crisp.push([
                        'set',
                        'session:data',
                        [[['email', sub.email || 'unknown']]],
                    ])
                    $crisp.push([
                        'set',
                        'message:text',
                        ['Hi! I want to cancel my plan.'],
                    ])
                    // $crisp.push(["set", "session:data", [[["user-bill-amount", "$200"]]]]);
                    $crisp.push(['set', 'session:event', [[['cancel']]]])
                    $crisp.push(['do', 'chat:open'])
                    // $crisp.push(['do', 'chat:send'])
                }}
            >
                Cancel Plan
            </Button>
        </motion.div>
    )
}
