import { GeneratedImage } from '@app/pages/api/functions'
import Konva from 'konva'
import { create } from 'zustand'

interface Store {
    stage?: Konva.Stage
    layer?: Konva.Layer
    loadingImages: number
    resultImages: GeneratedImage[]
    addNewImages(images: GeneratedImage[]): void
    init({ stage, layer }): void
    setLoadingImages(loadingImages: number): void
}

export const useStore = create<Store>()((set) => ({
    resultImages: [] as GeneratedImage[],
    loadingImages: 0,
    setLoadingImages(loadingImages: number) {
        set({ loadingImages })
    },
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
