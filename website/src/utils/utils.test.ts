import { test, expect, describe } from 'vitest'
import fs from 'fs'

import path from 'path'

import { env } from '@app/env'
import {
    Generation,
    buildGenerationRequest,
    executeGenerationRequest,
} from './stability'

test('works', async () => {
    const request = buildGenerationRequest('stable-diffusion-512-v2-1', {
        type: 'text-to-image',
        prompts: [
            {
                text: 'A dream of a distant galaxy, by Caspar David Friedrich, matte painting trending on artstation HQ',
            },
        ],
        width: 512,
        height: 512,
        samples: 1,
        cfgScale: 13,
        steps: 25,
        sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
    })
    console.time('executeGenerationRequest')
    const res = await executeGenerationRequest(request)
    console.timeEnd('executeGenerationRequest')

    // console.log(res)
    let i = 0
    for (let art of res.imageArtifacts) {
        i += 1
        console.log(art.getMime())

        let buff = Buffer.from(await art.getBinary_asU8())
        let seed = art.getSeed()
        let p = path.resolve(__dirname, 'test-out', seed + '.png')
        fs.mkdirSync(path.dirname(p), { recursive: true })
        fs.writeFileSync(p, buff)
    }
})
