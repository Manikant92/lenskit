import { test, expect, describe } from 'vitest'
import fs from 'fs'

import path from 'path'

import { env } from '@app/env'
import {
    Generation,
    buildGenerationRequest,
    executeGenerationRequest,
    getModels,
} from './stability'

let i = 0
test(
    'works',
    async () => {
        const request = buildGenerationRequest('stable-diffusion-v1-5', {
            // type: 'text-to-image',
            type: 'image-to-image-masking',
            initImage: fs.readFileSync('./test-images/init_image_with_bg.png'),
            maskImage: fs.readFileSync('./test-images/mask_image.png'),
            prompts: [
                {
                    text: 'product photography of a lipstick on a rock, surrounded by trees, 4k',
                    weight: 1,
                },
                {
                    text: 'texts, labels, tiny grid, small dots, graphic design, painting, worst, bad, ugly, person, guy',
                    weight: -1,
                },
            ],
            // width: 512,
            // height: 512,
            samples: 2,
            cfgScale: 8,

            steps: 30,
            sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
        })
        console.time('executeGenerationRequest')
        const res = await executeGenerationRequest(request)
        console.timeEnd('executeGenerationRequest')

        // console.log(res)

        for (let art of res.imageArtifacts) {
            i += 1
            console.log(art.getMime())

            let buff = Buffer.from(await art.getBinary_asU8())
            let seed = art.getSeed()
            let p = path.resolve(__dirname, 'test-out', i + '-' + seed + '.png')
            fs.mkdirSync(path.dirname(p), { recursive: true })
            fs.writeFileSync(p, buff)
        }
    },
    1000 * 100,
)

test('getModels', async () => {
    const res = await getModels()
    console.log(JSON.stringify(res, null, 2))
})
