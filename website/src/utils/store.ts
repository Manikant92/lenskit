import { GeneratedImage } from '@app/pages/api/functions'
import { setMaxListeners } from 'events'
import Konva from 'konva'
import { create } from 'zustand'

interface Store {
    stage?: Konva.Stage
    layer?: Konva.Layer
    width?: number
    height?: number
    setSizes(width: number, height: number): void
    loadingImages: number
    resultImages: GeneratedImage[]
    addNewImages(images: GeneratedImage[]): void
    init({ stage, layer }): void
    setLoadingImages(loadingImages: number): void
}

export const useStore = create<Store>()((set) => ({
    resultImages: [] as GeneratedImage[],
    loadingImages: 0,
    width: 512 + 512 / 2,
    height: 512,
    setLoadingImages(loadingImages: number) {
        set({ loadingImages })
    },
    setSizes(width: number, height: number) {
        set({ width, height })
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
