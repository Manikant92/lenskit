import { GeneratedImage } from '@app/pages/api/functions'
import { setMaxListeners } from 'events'
import Konva from 'konva'
import { create } from 'zustand'

type GeneratedImageWithState = Partial<GeneratedImage> & {
    isLoading?: boolean
}

interface Store {
    stage?: Konva.Stage
    layer?: Konva.Layer
    // width?: number
    // height?: number
    // setSizes(width: number, height: number): void

    resultImages: GeneratedImageWithState[]
    addNewImages(images: GeneratedImageWithState[]): void
    init({ stage, layer }): void
}

export const useStore = create<Store>()((set) => ({
    resultImages: [],
    loadingImages: [],

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
