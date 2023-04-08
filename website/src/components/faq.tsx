import Image from 'next/image'

import classNames from 'classnames'
import { FREE_CREDITS } from '@app/env'

const faqs = [
    [
        {
            question:
                'Can you generate the TikTok girl voice that sound like siri?',
            answer: 'Yes, choose the English US Female voice.',
        },
        {
            question: 'Can you generate the robot voice?',
            answer: 'Yes, you can choose C3P0 in the Characters voices.',
        },
        {
            question: 'Can you generate Rocket voice?',
            answer: 'Yes, choose Rocket in the Characters category.',
        },
    ],
    [
        {
            question: 'What languages are supported?',
            answer: 'English, Italian, Japanese, German, Spanish, Portuguese and more.',
        },
        {
            question: 'What voices are supported?',
            answer: "This tool supports 100+ voices in 20+ languages. Sometimes TikTok doesn't show all voices in the app, you can use this tool in those cases.",
        },
        {
            question: 'Do you support TikTok Disney tts?',
            answer: 'Yes, Disney voices are in the Characters category.',
        },
    ],
    [
        {
            question: 'How does pricing work?',
            answer: `You can generate up to ${FREE_CREDITS} words for free. After that you can buy credits.`,
        },
        {
            question: 'How can i change the tts voice on TikTok?',
            answer: 'I have no idea, after spending hours trying i finally made this tool. Sometimes TikTok voice effects not showing up',
        },
        {
            question: 'Do you support other TikTok voice effects?',
            answer: 'Currently only TikTok tts is supported.',
        },
    ],
]

export function Faqs() {
    return (
        <section
            id='faq'
            aria-labelledby='faq-title'
            className='relative overflow-hidden  py-20 sm:py-32'
        >
            {/* <div className='absolute top-0 left-1/2 -translate-x-[30%] -translate-y-[25%]'>
                <Image
                    src={backgroundImage}
                    alt=''
                    width={1558}
                    height={946}
                    layout='fixed'
                    unoptimized
                />
            </div> */}
            <Container className='relative'>
                <div className='mx-auto max-w-2xl lg:mx-0'>
                    {/* <p className='font-display text-3xl tracking-tight sm:text-4xl'>
                        Frequently asked questions
                    </p> */}
                    {/* <p
                        className='mt-4 text-lg tracking-tight '
                    >
                        If you can’t find what you’re looking for, email our
                        support team and if you’re lucky someone will get back
                        to you.
                    </p> */}
                </div>
                <ul className='mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-3'>
                    {faqs.map((column, columnIndex) => (
                        <li key={columnIndex}>
                            <ul className='space-y-12'>
                                {column.map((faq, faqIndex) => (
                                    <li key={faqIndex}>
                                        <h3 className='font-display font-semibold text-lg leading-7 '>
                                            {faq.question}
                                        </h3>
                                        <p className='mt-4 opacity-80'>
                                            {faq.answer}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    )
}

function Container({ className, ...props }) {
    return (
        <div
            className={classNames(
                'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
                className,
            )}
            {...props}
        />
    )
}
