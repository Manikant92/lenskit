import { FREE_CREDITS } from '@app/env'
import { prisma } from 'db'
import { JWT, getToken } from 'next-auth/jwt'
import { AppError, KnownError } from './errors'
import { variantIdToCredits } from '../env'

export async function getJwt({ req }: { req }): Promise<JWT> {
    const jwt = await getToken({ req, secret: process.env.SECRET })
    if (!jwt || !jwt.userId) {
        throw new KnownError('Forbidden')
    }

    return jwt
}

export async function getOrgSubscriptions({ orgId }) {
    const subs = await prisma.subscription.findMany({
        where: {
            orgId,
            status: 'active',
        },
    })
    return subs
}

export async function getOrgCredits({ orgId }) {
    const [payments, allWords] = await Promise.all([
        prisma.paymentForCredits.findMany({
            where: {
                orgId,
            },
            select: {
                variantId: true,
            },
        }),
        prisma.generation.aggregate({
            where: {
                orgId,
            },
            _sum: {
                creditsUsed: true,
            },
        }),
        // prisma.subscription.findFirst({
        //     where: {
        //         orgId,
        //         status: 'active',
        //     },
        // }),
    ])
    // console.log('recharges', recharges)
    // console.log('allWords', allWords)

    const credits = payments.map((x) => {
        const num = variantIdToCredits[x.variantId]
        if (num == null) {
            throw new AppError(
                `Cannot get credits for variantId ${x.variantId}`,
            )
        }
        return num
    })
    const totalCredits = Math.max(
        credits.reduce((a, b) => a + b, 0),
        FREE_CREDITS,
    )
    let free = !payments?.length
    return {
        remaining: totalCredits - allWords._sum.creditsUsed,
        total: totalCredits,
        used: allWords?._sum?.creditsUsed || 0,
        free,
    }
}
