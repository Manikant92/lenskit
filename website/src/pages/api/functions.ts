import { DOWNLOADS_COUNT_COOKIE, FREE_CREDITS } from '@app/env'
import { wrapMethod } from '@app/utils/sentry'

import { getJwt, getOrgCredits, getOrgSubscriptions } from '@app/utils/ssr'
import { tikTokTTSServer } from '@app/utils/tts'
import { removeNonSpoken } from '@app/utils/utils'

import cuid from 'cuid'
import { prisma } from 'db'
import { getContext } from 'next-rpc/context'
export const config = {
    rpc: true, //
    wrapMethod,
}

export async function example({}) {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req })
}

export async function generateTikTokVoice({ text, voice }) {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req }).catch(() => {
        return { userId: null }
    })
    if (!text) {
        return
    }
    text = removeNonSpoken(text)
    if (userId) {
        await prisma.generation.create({
            data: {
                chars: text.length,
                words: text.split(' ').length,
                // TODO use orgId after next auth has a way to refresh JWT
                orgId: userId,
            },
        })
    }

    return await tikTokTTSServer({ text, voice })
}

export async function getSubscriptions({}) {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req }).catch(() => {
        return { userId: null }
    })
    if (!userId) {
        return []
    }
    return await getOrgSubscriptions({ orgId: userId })
}

export async function getUserCredits() {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req }).catch(() => {
        return { userId: null }
    })
    let freeAcc = !userId
    // freeAcc = true
    if (freeAcc) {
        console.log('computing based on free account')
        const freeCredits = FREE_CREDITS
        const used = Number(req['cookies'][DOWNLOADS_COUNT_COOKIE] || 0)
        return {
            remaining: freeCredits - used,
            total: freeCredits,
            used: used,
            free: true,
            subscriptionId: null,
        }
    }
    return await getOrgCredits({ orgId: userId })
}

export async function getUserOrg({}) {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req }).catch(() => {
        return { userId: null }
    })
    if (!userId) {
        return null
    }

    const org = await prisma.org.findFirst({
        where: {
            users: {
                some: {
                    userId,
                },
            },
        },
    })
    if (org) {
        return org
    }

    let newOrg = await prisma.org.upsert({
        where: {
            id: userId,
        },
        create: {
            name: 'Default Org',
            id: userId,
            users: { create: { userId, role: 'ADMIN' } },
        },
        update: {},
    })
    return newOrg
}

export const updateOrg = async ({ orgId, name }) => {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req })
    const org = await prisma.org.updateMany({
        where: {
            id: orgId,
            users: {
                some: { userId },
            },
        },
        data: {
            name,
        },
    })
    return org
}

// export const createOrg = async ({ name, setAsDefault = false }) => {
//     const { req, res } = getContext()
//     const { userId } = await getJwt({ req })
//     const orgId = cuid()
//     const org = await prisma.org.create({
//         data: {
//             name,
//             id: orgId,
//             users: {
//                 create: {
//                     role: 'ADMIN',
//                     userId,
//                 },
//             },
//         },
//     })
//     return org
// }
