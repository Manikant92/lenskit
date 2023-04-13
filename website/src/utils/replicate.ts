import { env } from '@app/env'
import Replicate from 'replicate'

const replicate = new Replicate({
    auth: env.REPLICATE_API_TOKEN,
})

export async function inpaintReplicate({
    samples,
    ids,
    initImageUrl,
    maskImageUrl,
    prompt,
}) {
    const model =
        'andreasjansson/stable-diffusion-inpainting:e490d072a34a94a11e9711ed5a6ba621c3fab884eda1665d9d3a282d65a21180'

    const output = await replicate.run(model, {
        input: {
            prompt: 'a 19th century portrait of a raccoon gentleman wearing a suit',
        },
    })
    console.log(output)
}
