import { DOWNLOADS_COUNT_COOKIE, FREE_CREDITS, env } from '@app/env'
import { imageSize } from 'image-size'
import * as uuid from 'uuid'
import { type Bucket, Storage, File } from '@google-cloud/storage'
import { wrapMethod } from '@app/utils/sentry'

import {
    generateImagesWithBanana,
    generateImagesWithStability,
    getImageBuffer,
    getJwt,
    getOrgCredits,
    getOrgSubscriptions,
    upscaleWithStability,
} from '@app/utils/ssr'

import cuid from 'cuid'
import { prisma } from 'db'
import { getContext } from 'next-rpc/context'
import {
    Generation,
    buildGenerationRequest,
    executeGenerationRequest,
    isImageArtifact,
    myStabilityMetadata,
    stabilityClient,
} from '@app/utils/stability'
import { removeBackgroundWithReplicate } from '@app/utils/replicate'
import { mimeToExtension } from '@app/utils/utils'
export const config = {
    rpc: true, //

    api: {
        bodyParser: {
            sizeLimit: '6mb', // Set desired value here
        },
    },

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
const storage = new Storage({
    // projectId: env.GOOGLE_PROJECT_ID,
    credentials: {
        client_email: env.GOOGLE_SERVICE_EMAIL,
        private_key: env.GOOGLE_SERVICE_PRIVATE_KEY,
    },
})
export async function uploadFile({ filename }) {
    const { req } = getContext()
    await getJwt({ req })

    const bucket = storage.bucket('generated-ai-uploads')
    const fullName = encodeURIComponent(uuid.v4() + '-' + filename)
    const file = bucket.file(fullName)

    const [response] = await file.generateSignedPostPolicyV4({
        expires: Date.now() + 2 * 60 * 1000,
        conditions: [
            ['content-length-range', 0, 1024 * 1024 * 5], // Content-Length between 0 to 5 Mb
        ],
        fields: { 'x-goog-meta-test': 'data' },
    })

    let publicUrl = getPublicUrl(file)
    console.log('publicUrl', publicUrl, '\n', file.publicUrl())
    return {
        ...response,

        publicUrl,
    }
}

// https://generated-ai-uploads.storage.googleapis.com/9303ecda-205a-42cf-9845-c53d9d19c444CocaLatt%20Background%20Removed.png
// https://generated-ai-uploads.storage.googleapis.com/9303ecda-205a-42cf-9845-c53d9d19c444CocaLatt%2520Background%2520Removed.png
// https://storage.googleapis.com/generated-ai-uploads/9303ecda-205a-42cf-9845-c53d9d19c444CocaLatt%2520Background%2520Removed.png
// https://generated-ai-uploads.storage.googleapis.com/9303ecda-205a-42cf-9845-c53d9d19c444CocaLatt%2520Background%2520Removed.png

// https://kevinsimper.medium.com/google-cloud-storage-cors-not-working-after-enabling-14693412e404
function getPublicUrl(file: File) {
    let publicUrl = new URL(
        // gcp uses %2520 instead of %20, why? boh
        encodeURIComponent(file.name),
        `https://${file.bucket.name}.storage.googleapis.com/`,
    ).toString()
    return publicUrl
}
export type GeneratedImage = {
    publicUrl: string
    aspectRatio: string
    seed: string
    prompt: string
    id: string
}

export async function generateImages({
    samples = 1,
    ids,
    initImageUrl,
    maskImageUrl,
    prompt,
    provider = 'Controlnet' as 'Controlnet' | 'Stability AI',
}) {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req })
    // get image buffer from image data url
    console.log(`downloading images...`)
    const initImage = await getImageBuffer(initImageUrl)
    const maskImage = await getImageBuffer(maskImageUrl)

    const bucket = storage.bucket('generated-ai-uploads')
    console.log(`generating images...`)
    let generator =
        provider === 'Controlnet'
            ? generateImagesWithBanana
            : generateImagesWithStability
    const resultImages = await generator({
        initImage,
        maskImage,
        prompt,
        samples,
    })

    const uploaded = await Promise.all(
        resultImages.map(async (x) => {
            const { buffer, seed, contentType } = x
            const fullName = encodeURIComponent(
                prompt.replace(/\s/g, '-') +
                    '-' +
                    uuid.v4() +
                    '.' +
                    mimeToExtension[contentType] || 'png',
            )
            const file = bucket.file(fullName)
            let size = imageSize(buffer)

            await file.save(buffer, {
                contentType,
                metadata: { contentType, prompt, userId },
                gzip: true,
                timeout: 1000 * 10,
            })

            let publicUrl = getPublicUrl(file)
            return {
                publicUrl,
                aspectRatio: `${size.width / 64}/${size.height / 64}`,
                prompt,
                id: ids.shift(),
                seed: String(seed),
            }
        }),
    )
    console.log('uploaded', uploaded)
    return uploaded
}

export async function removeBackground({ dataUrl }) {
    if (!dataUrl) {
        throw new Error('no data url')
    }
    const { req, res } = getContext()
    const { userId } = await getJwt({ req })
    console.log(`Removing background from ${dataUrl.slice(0, 100)}`)
    // let imageBase64 = dataUrl.split(',')[1]
    let imageBase64 = dataUrl
    const { outputImageUrl } = await removeBackgroundWithReplicate({
        imageBase64,
    })
    return { outputImageUrl }
}

export async function upscaleImage({ dataUrl }) {
    try {
        if (!dataUrl) {
            throw new Error('no data url')
        }
        const { req, res } = getContext()
        const { userId } = await getJwt({ req })
        console.log(`Upscaling ${dataUrl.slice(0, 100)}...`)
        // let imageBase64 = dataUrl.split(',')[1]
        let imageBuffer = await getImageBuffer(dataUrl)
        const images = await upscaleWithStability({
            initImage: imageBuffer,
        })
        const image = images[0]
        if (!image) {
            throw new Error('no upscaled image result')
        }
        const { buffer, contentType } = image
        const outputImageUrl = `data:${contentType};base64,${buffer.toString(
            'base64',
        )}`
        return { outputImageUrl }
    } catch (e) {
        console.error(e)
        throw e
    }
}
