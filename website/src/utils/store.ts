import { GeneratedImage } from '@app/pages/api/functions'
import { setMaxListeners } from 'events'
import Konva from 'konva'
import { create } from 'zustand'

interface Store {
    stage?: Konva.Stage
    layer?: Konva.Layer
    // width?: number
    // height?: number
    // setSizes(width: number, height: number): void
    loadingImages: Partial<GeneratedImage>[]
    resultImages: GeneratedImage[]
    addNewImages(images: GeneratedImage[]): void
    init({ stage, layer }): void
    addLoadingImages({ loadingImages, aspectRatio }): void
    removeLoadingImages(n: number): void
}

export const useStore = create<Store>()((set) => ({
    resultImages: [],
    loadingImages: [],

    addLoadingImages({ loadingImages, aspectRatio }) {
        set((state) => ({
            loadingImages: [
                ...state.loadingImages,
                ...Array.from({
                    length: loadingImages,
                })?.map((image, i) => {
                    return { aspectRatio }
                }),
            ],
        }))
    },
    removeLoadingImages(n) {
        set((state) => ({
            loadingImages: state.loadingImages.slice(n),
        }))
    },
    // setSizes(width: number, height: number) {
    //     set({ width, height })
    // },
    addNewImages(images: GeneratedImage[]) {
        set((state) => ({
            ...state,
            resultImages: [...images, ...state.resultImages],
        }))
    },
    init({ stage, layer }) {
        set({ stage, layer })
    },
}))
