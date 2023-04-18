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
import { aspectRatios, getImageSizeFromAspectRatio } from './utils'

test(
    'make template images',
    async () => {
        let samples = 6
        let prodName = 'lipstick'
        const templatePrompts = [
            //
            {
                name: 'canyon',
                // path: '',
                prompt: `product photography of a [product] on a rock platform surrounded by the gran canyon`,
            },
            {
                name: 'tundra',
                // path: '',
                prompt: `product photography of a [product] on a circular platform in front of a glacial tundra background full of snow and ice`,
            },

            {
                name: 'water',
                // path: '',
                prompt: 'product photography of a [product] emerging from rippling water, with the sea in the background',
            },
            {
                name: 'yellow-flowers',
                // path: '',
                prompt: 'product photography of a "[product] on a translucent yellow platform surrounded by yellow flowers, with sunlight streaming down"',
            },
            {
                name: 'flowers',
                // path: '',
                prompt: 'product photography of a [product] on top of a natural hill and rocks surrounded by flowers',
            },
            {
                name: 'bark',
                // path: '',
                prompt: 'product photography of a "[product] balancing on piece of bark surrounded by flowers"',
            },
        ]
        const alreadyCreated = fs
            .readdirSync(path.resolve('public/templates'))
            .map((f) => f.replace('.png', ''))

        for (let [index, { prompt, name }] of templatePrompts.entries()) {
            if (alreadyCreated.includes(name)) {
                console.log('skipping', name)
                continue
            }
            console.log('generating templates for ', prompt)
            let i = 0
            const request = buildGenerationRequest(
                'stable-diffusion-xl-beta-v2-2-2',
                {
                    // type: 'text-to-image',
                    type: 'image-to-image-masking',
                    initImage: fs.readFileSync('./test-images/init_image.png'),
                    maskImage: fs.readFileSync('./test-images/mask_image.png'),
                    prompts: [
                        {
                            text: prompt.replace('[product]', prodName),
                            weight: 1,
                        },
                        {
                            text: 'texts, labels, tiny grid, small dots, graphic design, painting, worst, bad, ugly, person, guy',
                            weight: -1,
                        },
                    ],
                    // width: 512,
                    // height: 512,
                    samples,
                    cfgScale: 8,

                    steps: 30,
                    sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
                },
            )
            console.time('executeGenerationRequest')
            const res = await executeGenerationRequest(request)
            console.timeEnd('executeGenerationRequest')

            // console.log(res)

            for (let art of res.imageArtifacts) {
                i += 1
                console.log(art.getMime())

                let buff = Buffer.from(await art.getBinary_asU8())
                let seed = art.getSeed()
                let p = path.resolve(
                    'public/templates',
                    '0-' + name + '-' + i + '-' + seed + '.png',
                )
                fs.mkdirSync(path.dirname(p), { recursive: true })
                fs.writeFileSync(p, buff)
                // templatePrompts[index].path =
                //     '/' + path.relative(path.resolve('public/'), p)
            }
        }
        fs.writeFileSync(
            path.resolve('public/templates.json'),
            JSON.stringify(templatePrompts, null, 2),
        )
    },
    1000 * 1000,
)

test('getModels', async () => {
    const res = await getModels()
    console.log(JSON.stringify(res, null, 2))
})

test('getImageSizeFromAspectRatio', () => {
    const allSizes = aspectRatios.map((a) => getImageSizeFromAspectRatio(a))
    for (let [w, h] of allSizes) {
        if (w % 64) {
            throw new Error('width not divisible by 64: ' + w)
        }
        if (h % 64) {
            throw new Error('height not divisible by 64: ' + h)
        }
        if ((w / 2) % 64) {
            throw new Error('width/2 not divisible by 64: ' + w)
        }
        if ((h / 2) % 64) {
            throw new Error('height/2 not divisible by 64: ' + h)
        }
    }
})
