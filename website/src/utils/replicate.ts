import { env } from '@app/env'
import Replicate from 'replicate'
import { getImageBuffer } from './ssr'

const replicate = new Replicate({
    auth: env.REPLICATE_API_TOKEN,
})

export async function removeBackgroundWithReplicate({ imageBase64 }) {
    const model =
        'pollinations/modnet:da7d45f3b836795f945f221fc0b01a6d3ab7f5e163f13208948ad436001e2255'

    const output: any = await replicate.run(model, {
        input: {
            image: imageBase64,
        },
    })
    console.log({ output })
    const buffer = await getImageBuffer(output)
    const outputImageUrl = 'data:image;base64,' +   buffer.toString('base64')
     
    return { outputImageUrl }
}
