import { test, expect, describe } from 'vitest'
import fs from 'fs'
import banana from '@banana-dev/banana-dev'

import path from 'path'

import { env } from '@app/env'
import {
    Generation,
    buildGenerationRequest,
    executeGenerationRequest,
    getModels,
} from './stability'
import { aspectRatios, getImageSizeFromAspectRatio } from './utils'

test.skip(
    'banana webui',
    async () => {
        let modelKey = `10401989-f5d1-4273-bb76-bf547acc3702`
        console.time(`banana`)
        let out: any = await banana.run(env.BANANA_API_KEY, modelKey, {
            endpoint: 'txt2img',
            params: {
                prompt: 'product photography of a lipstick in front of the grand canyon',
                negative_prompt: 'cartoonish, low quality',
                steps: 25,
                sampler_name: 'Euler a',
                cfg_scale: 7.5,
                seed: 42,
                batch_size: 2,
                n_iter: 1,
                width: 512,
                height: 512,
                tiling: false,
            },
        })
        console.timeEnd(`banana`)
        // console.log(JSON.stringify(out, null, 2))
        const images: string[] = out.modelOutputs[0].images

        for (let [i, img] of images.entries()) {
            fs.writeFileSync(
                path.resolve(`test-images/banana-${i}.png`),
                Buffer.from(img, 'base64'),
            )
        }
    },
    1000 * 100,
)

test(
    'banana controlnet',
    async () => {
        let modelKey = `0d215f97-7569-4596-a15b-10df76fa3aa2`
        console.time(`banana`)
        const encoded = fs
            .readFileSync('./test-images/init_image.png')
            .toString('base64')

        let out: any = await banana.run(env.BANANA_API_KEY, modelKey, {
            prompt: 'product photography, extremely detailed',
            negative_prompt:
                'monochrome, lowres, bad anatomy, worst quality, low quality',
            num_inference_steps: 20,
            image_data: encoded,
        })
        console.timeEnd(`banana`)
        const { image_base64, canny_base64 } = out.modelOutputs[0].outputs
        // console.log(out.modelOutputs)

        fs.writeFileSync(
            path.resolve(`test-images/banana-controlnet-image.png`),
            Buffer.from(image_base64, 'base64'),
        )
        fs.writeFileSync(
            path.resolve(`test-images/banana-controlnet-canny.png`),
            Buffer.from(canny_base64, 'base64'),
        )
    },
    1000 * 1000,
)

test(
    'banana webui',
    async () => {
        let modelKey = `bffe7148-0f3e-4554-bcda-aa44d77b01e0`
        console.time(`banana`)
        const encoded = fs
            .readFileSync('./test-images/init_image.png')
            .toString('base64')

        let out: any = await banana.run(env.BANANA_API_KEY, modelKey, {
            endpoint: 'txt2img',
            params: {
                prompt: 'banana',
                // negative_prompt: 'low quality',
                // steps: 25,
                // sampler_name: 'Euler a',
                // cfg_scale: 7.5,
                // seed: 42,
                // batch_size: 1,
                // n_iter: 1,
                // width: 768,
                // height: 768,
                // tiling: false,
            },
        })
        console.timeEnd(`banana`)

        const { images } = out.modelOutputs[0]
        // console.log(out.modelOutputs)

        fs.writeFileSync(
            path.resolve(`test-images/banana-webui-image.png`),
            Buffer.from(images[0], 'base64'),
        )
    },
    1000 * 1000,
)
