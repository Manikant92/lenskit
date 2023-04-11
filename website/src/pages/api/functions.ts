import { DOWNLOADS_COUNT_COOKIE, FREE_CREDITS, env } from '@app/env'
import { imageSize } from 'image-size'
import * as uuid from 'uuid'
import { type Bucket, Storage, File } from '@google-cloud/storage'
import { wrapMethod } from '@app/utils/sentry'

import { getJwt, getOrgCredits, getOrgSubscriptions } from '@app/utils/ssr'

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

async function getImageBuffer(url) {
    if (url.startsWith('data')) {
        return Buffer.from(url.split(',')[1], 'base64')
    }
    const response = await fetch(url, {
        headers: {
            accept: 'image/*',
        },
    })
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer
}

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
}

export async function generateImages({
    samples = 1,
    initImageUrl,
    maskImageUrl,
    prompt,
}) {
    const { req, res } = getContext()
    const { userId } = await getJwt({ req })
    // get image buffer from image data url
    console.log(`downloading images...`)
    const initImage = await getImageBuffer(initImageUrl)
    const maskImage = await getImageBuffer(maskImageUrl)

    const request = buildGenerationRequest('stable-diffusion-768-v2-1', {
        // type: 'text-to-image',
        type: 'image-to-image-masking',
        initImage,
        maskImage,

        prompts: [
            {
                text: prompt,
                weight: 1,
            },
            {
                text: 'texts, labels, tiny grid, small dots, graphic design, painting, worst, bad, ugly, person, guy',
                weight: -1,
            },
        ],
        // width: 512,
        // height: 512,
        samples: samples,
        cfgScale: 8,

        steps: 30,
        sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
    })
    // console.time('executeGenerationRequest')
    console.log('generating images')
    const stream = stabilityClient.generate(request, myStabilityMetadata)
    const bucket = storage.bucket('generated-ai-uploads')

    let resultImages = await new Promise<GeneratedImage[]>(
        (resolve, reject) => {
            let uploadTasks: Promise<any>[] = []
            let results: GeneratedImage[] = []
            stream.on('data', async (data: Generation.Answer) => {
                try {
                    let list = data.getArtifactsList()

                    await Promise.all(
                        list.map(async (artifact) => {
                            const isImage = isImageArtifact(artifact)
                            if (!isImage) {
                                return
                            }

                            let buffer = Buffer.from(
                                await artifact.getBinary_asU8(),
                            )
                            let contentType = await artifact.getMime()
                            let filename = String(artifact.getSeed())
                            // let prompt = String(artifact.getPrompt())
                            const fullName = encodeURIComponent(
                                uuid.v4() + '-' + filename,
                            )
                            const file = bucket.file(fullName)
                            let size = imageSize(buffer)
                            console.log(
                                'saving',
                                filename,
                                contentType,
                                JSON.stringify(size),
                            )
                            uploadTasks.push(
                                file.save(buffer, {
                                    contentType,
                                    metadata: { contentType, prompt, userId },
                                    gzip: true,
                                    timeout: 1000 * 10,
                                }),
                            )
                            let publicUrl = getPublicUrl(file)
                            results.push({
                                publicUrl,
                                aspectRatio: `${size.width / 64}:${
                                    size.height / 64
                                }`,
                                // prompt,
                            })
                            // const file = bucket.file(fullName)
                            // file.createResumableUpload({})
                        }),
                    )
                    results.length &&
                        console.log(
                            'uploaded all result images',
                            results.length,
                        )
                } catch (e) {
                    reject(e)
                }

                // upload to gcp
            })
            stream.on('end', async () => {
                console.log('stability stream ended')
                await Promise.all(uploadTasks)
                resolve(results)
            })

            stream.on('status', (status) => {
                if (status.code === 0) return
                reject(new Error(status.details))
            })
        },
    )
    // console.timeEnd('executeGenerationRequest')
    console.log('generated images', JSON.stringify(resultImages, null, 2))
    return resultImages
}
