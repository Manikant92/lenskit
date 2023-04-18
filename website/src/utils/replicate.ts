import { env } from '@app/env'
import Replicate from 'replicate'
import { getImageBuffer } from './ssr'

const replicate = new Replicate({
    auth: env.REPLICATE_API_TOKEN,
})

export async function removeBackgroundWithReplicate({ imageBase64 }) {
    const model =
        'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003'

    const output: any = await replicate.run(model, {
        input: {
            image: imageBase64,
        },
    })
    console.log({ output })
    const buffer = await getImageBuffer(output)

    const outputImageUrl = `data:image/png;base64,${buffer.toString('base64')}`

    return { outputImageUrl }
}
