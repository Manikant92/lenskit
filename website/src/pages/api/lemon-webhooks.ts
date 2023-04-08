import { nodejsWebHookHandler } from 'lemonsqueezy-webhooks'
import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma, prisma } from 'db'

import { env } from '@app/env'
import { AppError } from '@app/utils/errors'
import { notifyError } from '@app/utils/sentry'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await nodejsWebHookHandler({
        onError(e) {
            notifyError(e, 'lemon-webhooks')
        },
        async onData(payload) {
            console.log(JSON.stringify(payload, null, 2))
            let customData = payload.meta.custom_data
            let orgId = customData.orgId
            if (payload.event_name === 'order_created') {
                let data = payload.data
                let item = data.attributes.first_order_item
                let create: Prisma.PaymentForCreditsCreateManyInput = {
                    id: String(data.id),
                    // price: 0,
                    email: data.attributes.user_email,
                    variantName: item.variant_name,
                    orderId: String(data.id),
                    orgId,
                    productId: String(item.product_id),
                    variantId: String(item.variant_id),
                }
                await prisma.paymentForCredits.upsert({
                    where: { id: String(data.id) },
                    create,
                    update: create,
                })
            } else if (
                payload.event_name === 'subscription_created' ||
                payload.event_name === 'subscription_cancelled' ||
                payload.event_name === 'subscription_expired' ||
                payload.event_name === 'subscription_paused' ||
                payload.event_name === 'subscription_resumed' ||
                payload.event_name === 'subscription_unpaused'
            ) {
                let data = payload.data
                let create: Prisma.SubscriptionCreateManyInput = {
                    orgId: orgId,
                    orderId: String(data.attributes.order_id),
                    productId: String(data.attributes.product_id),
                    variantId: String(data.attributes.variant_id),
                    subscriptionId: String(data.id),
                    email: data.attributes.user_email || undefined,
                    endsAt: data.attributes.ends_at
                        ? new Date(data.attributes.ends_at)
                        : undefined,
                    status: data.attributes.status || undefined,
                    variantName: data.attributes.variant_name || undefined,
                    createdAt: new Date(data.attributes.created_at),
                }

                let sub = await prisma.subscription.upsert({
                    where: { subscriptionId: String(data.id) },
                    create,
                    update: create,
                })
            } else if (payload.event_name === 'subscription_payment_success') {
                let data = payload.data
                let sub = await prisma.subscription.findUnique({
                    where: {
                        subscriptionId: String(data.attributes.subscription_id),
                    },
                })
                if (!sub) {
                    throw new AppError(
                        `Subscription not found for payment ${data.id}`,
                    )
                }
                let create: Prisma.PaymentForCreditsCreateManyInput = {
                    id: String(data.id),
                    orgId: orgId,
                    productId: String(sub.productId),
                    // price: data.attributes.total,
                    email: sub.email,
                    orderId: String(sub.orderId),
                    variantId: sub.variantId,
                    variantName: sub.variantName,
                }
                await prisma.paymentForCredits.upsert({
                    where: { id: String(data.id) },
                    create,
                    update: create,
                })
            }
        },
        req,
        res,
        secret: env.SECRET,
    })
}
