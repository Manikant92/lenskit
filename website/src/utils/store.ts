import { GeneratedImage } from '@app/pages/api/functions'
import { setMaxListeners } from 'events'
import Konva from 'konva'
import { create } from 'zustand'

type GeneratedImageWithState = Partial<GeneratedImage> & {
    isLoading?: boolean
}
const defaultInitImage =
    'https://generated-ai-uploads.storage.googleapis.com/6214c553-a7ce-4a9d-8179-e34edbf91d12-CocaLatt%252520Background%252520Removed.png'
interface Store {
    stage?: Konva.Stage
    layer?: Konva.Layer
    // width?: number
    // height?: number
    // setSizes(width: number, height: number): void

    image: string
    setImage(image: string): void
    resultImages: GeneratedImageWithState[]
    addNewImages(images: GeneratedImageWithState[]): void
    init({ stage, layer }): void
}

export const useStore = create<Store>()((set) => ({
    resultImages: [],
    loadingImages: [],
    image: defaultInitImage,
    setImage(image) {
        set({ image })
    },
    // setSizes(width: number, height: number) {
    //     set({ width, height })
    // },
    addNewImages(images) {
        set((state) => {
            let ids = new Set(images.map((i) => i.id))
            return {
                ...state,
                resultImages: [
                    ...images,
                    ...state.resultImages.filter((i) => !ids.has(i.id)),
                ],
            }
        })
    },
    init({ stage, layer }) {
        set({ stage, layer })
    },
}))
