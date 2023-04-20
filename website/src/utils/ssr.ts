import { FREE_CREDITS, env } from '@app/env'
import * as banana from '@banana-dev/banana-dev/index'

import { prisma } from 'db'
import { JWT, getToken } from 'next-auth/jwt'
import { AppError, KnownError } from './errors'
import { variantIdToCredits } from '../env'
import {
    buildGenerationRequest,
    stabilityClient,
    myStabilityMetadata,
    isImageArtifact,
    Generation,
    executeGenerationRequest,
} from './stability'

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

export async function getImageBuffer(url) {
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

type GeneratedImageData = {
    buffer: Buffer
    contentType: string
    seed: string
    // dataUrl?: string
}
const negativePrompt =
    'texts, labels, tiny grid, small dots, graphic design, painting, worst, bad, ugly, person, guy'
export async function generateImagesWithStability({
    initImage,
    maskImage,
    prompt,
    samples,
}) {
    const request = buildGenerationRequest('stable-diffusion-v1-5', {
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
                text: negativePrompt,
                weight: -1,
            },
        ],
        // width: 512,
        // height: 512,
        samples: samples,
        cfgScale: 8,

        steps: 10,
        // sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
    })
    // console.time('executeGenerationRequest')
    console.log('generating images')

    let arts = await executeGenerationRequest(request)
    const resultImages: GeneratedImageData[] = await Promise.all(
        arts.imageArtifacts.map(async (artifact) => {
            let buffer = Buffer.from(await artifact.getBinary_asU8())

            let contentType = await artifact.getMime()
            return {
                buffer,
                contentType,
                seed: String(artifact.getSeed()),
            }
        }),
    )
    return resultImages
}

export async function upscaleWithStability({
    initImage,
}: {
    initImage: Buffer
}) {
    const request = buildGenerationRequest('esrgan-v1-x2plus', {
        type: 'upscaling',
        upscaler: Generation.Upscaler.UPSCALER_ESRGAN,
        initImage,
    })
    let arts = await executeGenerationRequest(request)
    const resultImages: GeneratedImageData[] = await Promise.all(
        arts.imageArtifacts.map(async (artifact) => {
            let buffer = Buffer.from(await artifact.getBinary_asU8())

            let contentType = await artifact.getMime()
            return {
                buffer,
                contentType,
                seed: String(artifact.getSeed()),
            }
        }),
    )
    return resultImages
}
export let bananaModelKey = `779fe437-83b5-43c7-8578-e2b56f3f8822`
export async function generateImagesWithBanana({
    initImage,
    maskImage,
    prompt,
    samples,
}: {
    initImage: Buffer
    maskImage: Buffer
    prompt: string
    samples: number
}) {
    try {
        let id = Math.random().toString(36).substring(7)
        console.time(`banana ${id}`)
        let [out]: any = await Promise.all([
            banana.run(env.BANANA_API_KEY, bananaModelKey, {
                prompt,
                negative_prompt: negativePrompt,
                init_image: initImage.toString('base64'),
                mask_image: maskImage.toString('base64'),
                control_image: initImage.toString('base64'),
                guidance_scale: 7,
                num_inference_steps: 10,
                num_images_per_prompt: samples,
                controlnet_conditioning_scale: 0.6,
            }),
        ])

        console.timeEnd(`banana ${id}`)

        console.log(JSON.stringify(out, null, 2).slice(0, 1000))
        const data = out.modelOutputs[0]
        // console.log(out.modelOutputs)
        if (data.error) {
            throw new AppError(data.error)
        }
        const { images_base64 } = data
        return images_base64.map((x) => {
            const buffer = Buffer.from(x, 'base64')
            return {
                buffer,
                contentType: 'image/png',
                seed: Math.random().toString(36),
            }
        })
    } catch (e) {
        // console.log(e?.jsonOutput, e)
        throw e
    }
}
