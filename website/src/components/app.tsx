import classNames from 'classnames'
import Zoom from 'react-medium-image-zoom'

import Konva from 'konva'

import Masonry from 'react-masonry-css'

import { useRef, useEffect, useState, Fragment } from 'react'

// import "fabric-history"
import { Pane } from 'tweakpane'

import { objFromArr } from '@app/utils/utils'
import { UploadButton } from './upload'
import { atom, useAtom } from 'jotai'
import { Button, Input, useThrowingFn } from 'beskar/landing'
import { env } from '@app/env'
import { LightningBoltIcon } from '@heroicons/react/solid'
import { GeneratedImage, generateImages } from '@app/pages/api/functions'
import { useStore } from '@app/utils/store'

let debugMask = env.NEXT_PUBLIC_ENV !== 'production' && true

const imageUrlAtom = atom<string>('')

function LeftPaneTop() {
    const [addNewImages, init, stage, layer] = useStore((state) => [
        state.addNewImages,
        state.init,
        state.stage,
        state.layer,
    ])
    const [w, h] = useStore((state) => [state.width, state.height])
    let aspectRatio = `${w}/${h}`
    const [imageUrl, setImageUrl] = useAtom(imageUrlAtom)
    const container = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (layer) {
            return
        }
        Promise.resolve().then(async () => {
            console.log('konva')
            const width = w
            const height = h

            let stage = new Konva.Stage({
                container: container.current,
                width: width,
                height: height,
            })

            let layer = new Konva.Layer({ height, width })
            init({ stage, layer })

            stage.add(layer)

            let image = await setInitImage({
                publicUrl:
                    'https://generated-ai-uploads.storage.googleapis.com/6214c553-a7ce-4a9d-8179-e34edbf91d12-CocaLatt%252520Background%252520Removed.png',
                layer,
            })
        })
    }, [])

    const [debugImageUrl, setDebugImageUrl] = useState('')
    const [selectedTemplateIndex, setSelectedTemplate] = useState(0)
    const [prompt, setPrompt] = useState(
        templateImages[selectedTemplateIndex]?.prompt || '',
    )
    const setLoadingImages = useStore((state) => state.setLoadingImages)
    const { fn: generate, isLoading } = useThrowingFn({
        async fn() {
            try {
                let samples = 3
                setLoadingImages(samples)
                const results = await generateImages({
                    samples,
                    initImageUrl: getInitFromCanvas(stage),
                    maskImageUrl: getMaskFromCanvas(stage),
                    prompt,
                })
                addNewImages(results)
            } finally {
                setLoadingImages(0)
            }
        },
        errorMessage: 'Failed to generate image',
    })
    useEffect(() => {
        addNewImages([
            {
                publicUrl:
                    'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/bde9a717-e664-4d4a-df9c-cdf587f86500/public',
            },
        ])
    }, [])
    return (
        <div className='h-full w-[300px] lg:w-[500px] overflow-y-auto max-h-full dark:bg-gray-900 p-6 pt-[30px] flex-shrink-0 flex flex-col gap-3 '>
            <div className='flex flex-col gap-3'>
                <svg
                    style={{
                        aspectRatio: aspectRatio,
                    }}
                    className='w-full aspect-square rounded'
                    viewBox={`0 0 ${w} ${h}`}
                >
                    <foreignObject x='0' y='0' width='100%' height='100%'>
                        <div
                            ref={container}
                            style={{
                                width: w + 'px',
                                height: h + 'px',
                            }}
                            className=' bg-white border rounded-md '
                        ></div>
                    </foreignObject>
                </svg>
            </div>

            <div className='space-y-2 text-sm'>
                <UploadButton
                    className='text-sm w-full'
                    onUpload={({ publicUrl }) => {
                        setImageUrl(publicUrl)
                        setInitImage({ publicUrl, layer })
                    }}
                />
                <div className=''>Object type</div>
                <Input placeholder='bottle' />
            </div>

            {debugMask && (
                <>
                    <div className='flex gap-2'>
                        <Button
                            onClick={() => {
                                setDebugImageUrl(getMaskFromCanvas(stage))
                            }}
                        >
                            Debug mask image
                        </Button>
                        <Button
                            onClick={() => {
                                setDebugImageUrl(getInitFromCanvas(stage))
                            }}
                        >
                            Debug init image
                        </Button>
                    </div>
                    <img
                        src={debugImageUrl}
                        alt='debug mask'
                        style={{
                            aspectRatio: aspectRatio,
                        }}
                        className='border w-full '
                    />
                </>
            )}
            <div className=''>
                <div className=''>Templates</div>
                <div className=' grid place-content-start grid-cols-3 overflow-y-auto gap-4 max-h-[300px] p-2 -mx-2'>
                    {templateImages.map((img, i) => {
                        return (
                            <button
                                className={classNames(
                                    'appereance-none bg-white rounded active:opacity-40 transition-transform',
                                    selectedTemplateIndex === i &&
                                        'ring-4 ring-blue-500',
                                )}
                                key={img.url + i}
                                onClick={() => {
                                    setSelectedTemplate(i)
                                    setPrompt(img.prompt)
                                }}
                            >
                                <img
                                    src={img.url}
                                    alt='template'
                                    className='w-full aspect-square rounded'
                                />
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className='space-y-2'>
                <div className=''>Prompt</div>
                <Input
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value)
                    }}
                    placeholder='Can on top of a rock in a forest'
                    className='text-sm'
                />
            </div>

            <Button
                className='mt-12 font-semibold'
                bg='blue.500'
                icon={<LightningBoltIcon className='w-4' />}
                isLoading={isLoading}
                onClick={async () => {
                    generate()
                    //
                }}
            >
                Generate
            </Button>
        </div>
    )
}

// aspect ratio is width / height
function stageToDataURL(_stage: Konva.Stage) {
    // let width = 512
    // let height = 512 * aspectRatio
    let clone: Konva.Stage = _stage.clone()
    // let adjust = width / clone.width()

    // clone.size({ height, width })

    clone.draw()
    // clone.scale({ x: adjust, y: adjust })

    // needed to apply filters
    clone.find('Image').forEach((image) => {
        image.cache()
    })
    let url = clone.toDataURL({
        pixelRatio: 1,
        // quality: 100,
        // width,
        // height,
        mimeType: 'image/png',
    })
    clone.destroy()
    return url
}

const templateImages = [
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/ae81fc3e-7363-4357-4e5a-34e8ef6fab00/public',
        prompt: 'product photography, cocacola can on top of a rock platform, surrounded by the canyon rocks, 4k',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/bde9a717-e664-4d4a-df9c-cdf587f86500/public',
        prompt: 'Can on top of a rock in a forest',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/ae81fc3e-7363-4357-4e5a-34e8ef6fab00/public',
        prompt: 'Can on top of a rock in a forest',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/bde9a717-e664-4d4a-df9c-cdf587f86500/public',
        prompt: 'Can on top of a rock in a forest',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/ae81fc3e-7363-4357-4e5a-34e8ef6fab00/public',
        prompt: 'Can on top of a rock in a forest',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/bde9a717-e664-4d4a-df9c-cdf587f86500/public',
        prompt: 'Can on top of a rock in a forest',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/ae81fc3e-7363-4357-4e5a-34e8ef6fab00/public',
        prompt: 'Can on top of a rock in a forest',
    },
    {
        url: 'https://imagedelivery.net/i1XPW6iC_chU01_6tBPo8Q/bde9a717-e664-4d4a-df9c-cdf587f86500/public',
        prompt: 'Can on top of a rock in a forest',
    },
]

function getMaskFromCanvas(_stage: Konva.Stage) {
    // stage = useStore.getState().stage
    let cloned: Konva.Stage = _stage.clone()
    // cloned.cache()
    let image = cloned.findOne((node: Konva.Image) => {
        return node.id() === 'init'
    })

    if (!image) {
        alert('no image')
        return
    }
    var layer: Konva.Layer = cloned.findOne('Layer')

    // another solution is to use rectangle shape
    var background = new Konva.Rect({
        x: 0,
        y: 0,
        width: cloned.width(),
        height: cloned.height(),
        fill: '#000',
        listening: false,
    })
    layer.add(background)
    background.moveToBottom()
    // console.log(image.id())
    image = image.cache()

    // image.scale({ x: 0.99, y: 0.99,  })
    image.filters([
        Konva.Filters.Grayscale,
        Konva.Filters.Brighten,
        Konva.Filters.Contrast,
        Konva.Filters.Blur,
    ])
    image.brightness(5)
    image.contrast(0.1)
    image.blurRadius(1)
    let url = stageToDataURL(cloned)
    cloned.destroy()

    return url
}

function getInitFromCanvas(_stage: Konva.Stage) {
    // stage = useStore.getState().stage
    let cloned: Konva.Stage = _stage.clone()
    // cloned.cache()
    let image = cloned.findOne((node: Konva.Image) => {
        return node.id() === 'init'
    })

    if (!image) {
        alert('no image')
        return
    }
    var layer: Konva.Layer = cloned.findOne('Layer')

    // another solution is to use rectangle shape
    var background = new Konva.Rect({
        x: 0,
        y: 0,
        width: cloned.width(),
        height: cloned.height(),
        fill: '#fff',
        listening: false,
    })
    layer.add(background)
    background.moveToBottom()
    // console.log(image.id())
    image = image.cache()

    let url = stageToDataURL(cloned)
    cloned.destroy()

    return url
}

function setInitImage({
    publicUrl,
    layer,
}: {
    publicUrl: string
    layer: Konva.Layer
}) {
    // layer = useStore.getState().layer
    return new Promise<Konva.Image>((resolve) => {
        var imageObj = new Image()
        imageObj.onload = function (img) {
            let adjust = imageObj.width / layer.width() / 0.5
            // ratio should turn image heigt to half of canvas height
            // console.log(adjust)
            let width = imageObj.width / adjust
            // adapt sizes to be half of canvas
            let height = imageObj.height / adjust
            var imgNode = new Konva.Image({
                id: 'init',
                image: imageObj,
                x: layer.width() / 2 - width / 2,
                y: layer.height() / 2 - height / 2,
                width,
                height,
                draggable: true,
            })
            layer.removeChildren()
            // darthNode.draggable(true)
            layer.add(imgNode)
            var tr1 = new Konva.Transformer({
                nodes: [imgNode],
                centeredScaling: true,
                anchorStrokeWidth: 4,
                borderStrokeWidth: 4,
            })

            layer.add(tr1)
            resolve(imgNode)
        }
        imageObj.crossOrigin = 'Anonymous'
        imageObj.src = publicUrl
    })
}

function Images({}) {
    const images = useStore((store) => store.resultImages)
    const loadingImages = useStore((store) => store.loadingImages)
    const aspectRatio = useStore((store) => `${store.width}/${store.height}`)
    return (
        <div className='px-[40px] pt-[30px] w-full h-full overflow-y-auto '>
            <style jsx global>{``}</style>
            <Masonry
                breakpointCols={{
                    default: 3,
                    1000: 2,
                    500: 1,
                }}
                className='flex w-full -ml-[30px] '
                columnClassName='space-y-8 pl-[30px]'
            >
                {Array.from({ length: loadingImages })?.map((image, i) => {
                    return (
                        <GenImage
                            aspectRatio={aspectRatio}
                            isLoading
                            key={'loading' + i}
                            src={''}
                        />
                    )
                })}
                {images?.map((image, i) => {
                    return (
                        <GenImage
                            aspectRatio={aspectRatio}
                            key={image.publicUrl}
                            src={image.publicUrl}
                        />
                    )
                })}
                {Array.from({ length: 6 }).map((_, i) => (
                    <GenImage
                        aspectRatio={aspectRatio}
                        key={'placeholder' + i}
                    />
                ))}
            </Masonry>
        </div>
    )
}

function GenImage({ aspectRatio, isLoading = false, src = '' }) {
    //  aspectRatio = '1/1'
    return (
        <div
            style={{
                aspectRatio,
            }}
            className={classNames(
                'flex text-2xl shadow-xl text-white flex-col items-center justify-center rounded-md bg-gray-700 ',
                isLoading ? 'animate-pulse' : '',
            )}
        >
            {src && (
                <Zoom>
                    <img
                        src={src}
                        alt=''
                        style={{
                            aspectRatio,
                        }}
                        className='w-full rounded'
                    />
                </Zoom>
            )}
        </div>
    )
}

export function App({}) {
    return (
        <div className='w-screen h-screen flex flex-col dark'>
            <div className='relative bg-gray-600 h-full flex'>
                <LeftPaneTop />
                <Images />
                {/* 
                <div
                    className={classNames(
                        'flex-1 relative items-start gap-[40px]  space-y-12 place-content-start p-[40px] columns-4 w-full h-full min-w-0 bg-gray-600',
                    )}
                >
                    {!generations?.length &&
                        Array.from({ length: 8 }).map((_, i) => (
                            <div
                                style={{
                                    aspectRatio: '1/1',
                                    // if aspect ratio is 1/2 then it takes 2 rows
                                    // if aspect ratio is 1/1 then it takes 1 row
                                    // gridRow: i == 2 ? 'span 2' : 'span 1',
                                    // gridTemplateRows:
                                    //     i == 2 ? '1fr 1fr' : '1fr',
                                }}
                                key={i}
                                className='flex text-2xl text-white flex-col items-center justify-center rounded-md bg-gray-700 '
                            >
                                {i}
                            </div>
                        ))}
                </div> */}
            </div>
        </div>
    )
}

function aspectRatioToStyle(aspectRatio: number) {
    // aspectRatio is width / height
    if (!aspectRatio) {
        return
    }
    let above = aspectRatio * 100
    let below = 100
}

// function from https://stackoverflow.com/a/15832662/512042
function downloadURI(uri, name) {
    var link = document.createElement('a')
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // delete link;
}
