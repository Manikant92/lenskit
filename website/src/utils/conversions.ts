import splitbee from '@splitbee/web'

const redditStandardEvents = [
    'SignUp',
    'AddToCart',
    'Lead',
    'Purchase',
] as const
const facebookStandardEvents = [
    'Lead',
    'Purchase', // {currency: "USD", value: 30.00}
    'AddToCart',
    'InitiateCheckout',
    'StartTrial',
] as const

declare global {
    const gtag: Function
    const rdt: Function
    const fbq: Function
    const Reflio: any
}

function conversionFunction(
    {
        gtagId = '',
        redditId = '',
        facebook = '' as typeof facebookStandardEvents[number],
        splitbee: splitbeeId = '',
        crispId = '',
    },
    params = {},
): Function {
    return (otherParams = {}) => {
        console.log('conversion', { gtagId, redditId, splitbeeId })
        if (process.env.NODE_ENV !== 'production') {
            return
        }
        if (gtagId) {
            try {
                gtag('event', 'conversion', {
                    send_to: gtagId,
                    ...params,
                    ...otherParams,
                })
            } catch {
                console.warn(`Could not track google conversion`)
            }
        }
        if (facebook) {
            try {
                fbq('track', facebook, { ...params, ...otherParams })
            } catch {
                console.warn(`Could not track facebook conversion`)
            }
        }
        if (redditId) {
            const part = redditStandardEvents.includes(redditId as any)
                ? [redditId, { ...params, ...otherParams }]
                : [
                      'Custom',
                      { customEventName: redditId, ...params, ...otherParams },
                  ]
            try {
                rdt('track', ...part)
            } catch {
                console.warn(`Could not track reddit conversion`)
            }
        }
        if (splitbeeId) {
            try {
                splitbee.track(splitbeeId, { ...params, ...otherParams })
            } catch {
                console.warn(`Could not track splitbee conversion`)
            }
        }
        if (crispId) {
            try {
                $crisp.push([
                    'set',
                    'session:event',
                    [[[crispId, { ...params, ...otherParams }]]],
                ])
            } catch {
                console.warn(`Could not track crisp conversion`)
            }
        }
    }
}

export const conversionSignUp = conversionFunction({
    splitbee: 'signup',
    // facebook: 'Lead',
})
