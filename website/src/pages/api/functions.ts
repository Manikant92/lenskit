import { DOWNLOADS_COUNT_COOKIE, FREE_CREDITS, env } from '@app/env'
import * as uuid from 'uuid'
import { Storage } from '@google-cloud/storage'
import { wrapMethod } from '@app/utils/sentry'

import { getJwt, getOrgCredits, getOrgSubscriptions } from '@app/utils/ssr'

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

export async function uploadFile({ filename }) {
    const { req } = getContext()
    await getJwt({ req })
    const storage = new Storage({
        // projectId: env.GOOGLE_PROJECT_ID,
        credentials: {
            client_email: env.GOOGLE_SERVICE_EMAIL,
            private_key: env.GOOGLE_SERVICE_PRIVATE_KEY,
        },
    })

    const bucket = storage.bucket('generated-ai-uploads')
    const fullName = uuid.v4() + filename
    const file = bucket.file(fullName)

    const [response] = await file.generateSignedPostPolicyV4({
        expires: Date.now() + 2 * 60 * 1000,
        conditions: [
            ['content-length-range', 0, 1024 * 1024 * 5], // Content-Length between 0 to 5 Mb
        ],
        fields: { 'x-goog-meta-test': 'data' },
    })
    return {
        ...response,
        publicUrl: file.publicUrl(),
    }
}
