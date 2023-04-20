import classNames from 'classnames'
import BarLoader from 'react-spinners/HashLoader'
import { Leva, useControls } from 'leva'
import { LevaCustomTheme } from 'leva/dist/declarations/src/styles'
import { levaStore } from 'leva'
import { Controlled as Zoom } from 'react-medium-image-zoom'

import { Modal } from 'beskar/landing'
import templateImages from '@app/../public/templates.json'

import Konva from 'konva'

import Masonry from 'react-masonry-css'

import { useRef, useEffect, useState, Fragment } from 'react'

// import "fabric-history"
import { Pane } from 'tweakpane'

import {
    aspectRatios,
    getImageSizeFromAspectRatio,
    objFromArr,
} from '@app/utils/utils'
import { LocalUploadButton, UploadButton } from './upload'
import { atom, useAtom } from 'jotai'
import { Button, Input, useThrowingFn } from 'beskar/landing'
import { env } from '@app/env'
import {
    StarIcon as UpscaleIcon,
    DownloadIcon,
    LightningBoltIcon,
    ZoomInIcon,
} from '@heroicons/react/solid'
import {
    GeneratedImage,
    generateImages,
    removeBackground,
    upscaleImage,
} from '@app/pages/api/functions'
import { useStore } from '@app/utils/store'
import { ChakraProvider, IconButton, Select } from '@chakra-ui/react'
import colors from 'beskar/colors'
import cuid from 'cuid'

let debugMask = env.NEXT_PUBLIC_ENV !== 'production' && true

// https://github.com/pmndrs/leva/blob/main/packages/leva/src/styles/stitches.config.ts#L3
const levaTheme: LevaCustomTheme = {
    colors: {
        // elevation1: colors.gray[800], // bg color of the root panel (main title bar)
        elevation2: colors.gray[900], // bg color of the rows (main panel color)
        elevation3: '#373c4b', // bg color of the inputs
        accent1: '#0066dc',
        accent2: '#007bff',
        accent3: '#3c93ff',
        highlight1: '#535760',
        highlight2: '#8c92a4',
        highlight3: '#fefefe',
        vivid1: '#ffcc00',
        folderWidgetColor: '$highlight2',
        folderTextColor: '$highlight3',
        toolTipBackground: '$highlight3',
        toolTipText: '$elevation2',
    },
    fontSizes: {
        root: '14px',
        toolTip: '$root',
    },
    sizes: {
        // rootWidth: '280px',
        controlWidth: '280px',
    },
}

const defaultProduct = 'can'

function LeftPane() {
    const [addNewImages, init, stage, layer, image, setImage] = useStore(
        (state) => [
            state.addNewImages,
            state.init,
            state.stage,
            state.layer,
            state.image,
            state.setImage,
        ],
    )

    // const [w, h] = useStore((state) => [state.width, state.height])

    const container = useRef<HTMLDivElement>(null)

    const [debugImageUrl, setDebugImageUrl] = useState('')
    const [selectedTemplateIndex, setSelectedTemplate] = useState(0)
    // const [prompt, setPrompt] = useState(
    //     templateImages[selectedTemplateIndex]?.prompt || '',
    // )

    const { fn: generate, isLoading } = useThrowingFn({
        async fn() {
            let ids = Array.from({ length: samples }, () => cuid())
            try {
                addNewImages(
                    ids.map((id) => {
                        return {
                            id,
                            aspectRatio,
                            isLoading: true,
                        }
                    }),
                )
                const results = await generateImages({
                    samples,
                    ids,
                    initImageUrl: getInitFromCanvas(stage),
                    maskImageUrl: getMaskFromCanvas(stage),
                    provider: provider as any,
                    prompt: prompt.replace('[product]', product),
                })
                addNewImages(results)
            } catch (e) {
                addNewImages(
                    ids.map((id) => {
                        return {
                            id,
                            aspectRatio,
                            isLoading: false,
                        }
                    }),
                )
                throw e
            }
        },
        errorMessage: 'Failed to generate image',
    })

    const [prompt, setPrompt] = useState(
        templateImages[selectedTemplateIndex]?.prompt || '',
    )
    const [{ samples, product, aspectRatio, provider }, set] = useControls(
        () => ({
            product: {
                value: defaultProduct,
            },

            samples: {
                value: 3,
                min: 1,
                max: 10,
                step: 1,
                label: 'image count',
            },
            // seed: {
            //     value: '',
            //     label: 'seed',
            // },
            lowRes: {
                label: 'low resolution',
                value: true,
            },
            provider: {
                label: 'provider',
                options: ['Controlnet', 'Stability AI'],
                value: 'Stability AI',
            },
            aspectRatio: {
                value: '1/1',
                options: aspectRatios,
            },
        }),
    )
    let wantedH = 440
    useEffect(() => {
        console.log('konva')
        let width = w
        let height = h

        let stage = new Konva.Stage({
            container: container.current,
            width: width,
            height: height,
        })

        let layer = new Konva.Layer({ height, width })

        enableSmoothing(layer)
        init({ stage, layer })

        stage.add(layer)
        setInitImage({
            publicUrl: image,
            layer,
        })
        let parent = container.current.parentElement
        let maxW = parent?.clientWidth || 0

        let scaleFactorH = wantedH / h
        let scaleFactorW = maxW / w
        let scaleFactor = Math.min(scaleFactorH, scaleFactorW)
        let paddingLeft = (maxW - w * scaleFactor) / 2
        let paddingTop = (wantedH - h * scaleFactor) / 2

        // needed to use high quality downsampling of browser instead of canvas
        container.current.style.transform = `translate(${paddingLeft}px, ${paddingTop}px) scale(${scaleFactor})`

        return () => {
            layer.destroy()
            stage.destroy()
            container.current.innerHTML = ''
        }
    }, [aspectRatio])

    const [w, h] = getImageSizeFromAspectRatio(aspectRatio as any)
    const { fn: processImage, isLoading: isRemovingBg } = useThrowingFn({
        async fn(imageWithBg) {
            const { outputImageUrl } = await removeBackground({
                dataUrl: imageWithBg,
            })
            setImage(outputImageUrl)
            setInitImage({ layer, publicUrl: outputImageUrl })
        },
    })
    return (
        <div className='h-full w-[500px] overflow-y-scroll max-h-full dark:bg-gray-900 p-6 pt-[30px] flex-shrink-0 flex flex-col gap-3 '>
            <div
                style={{
                    aspectRatio,
                    height: wantedH,
                }}
                className='flex relative items-center shrink-0 w-full flex-col gap-3 '
            >
                <div
                    ref={container}
                    className='absolute left-0 top-0 origin-top-left bg-white rounded-md '
                ></div>
            </div>

            <div className='space-y-2 text-sm'>
                <LocalUploadButton
                    className='text-sm font-semibold w-full'
                    isLoading={isRemovingBg && 'Removing background...'}
                    onUpload={({ dataSrc }) => {
                        processImage(dataSrc)
                    }}
                />
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
            <div className='space-y-2'>
                <div className='font-mono text-sm opacity-70'>Templates</div>
                <div className=' rounded-lg grid place-content-start grid-cols-3 overflow-y-auto gap-4 max-h-[300px] p-2 -mx-2'>
                    {templateImages.map((img, i) => {
                        return (
                            <button
                                className={classNames(
                                    'appereance-none bg-white rounded active:opacity-40 transition-transform',
                                    selectedTemplateIndex === i &&
                                        'ring-4 ring-blue-500',
                                )}
                                key={img.name + i}
                                onClick={() => {
                                    setSelectedTemplate(i)
                                    setPrompt(img.prompt)
                                }}
                            >
                                <img
                                    src={'/templates/' + img.name + '.png'}
                                    style={{
                                        aspectRatio: '1/1',
                                    }}
                                    alt='template'
                                    className='w-full aspect-square rounded'
                                />
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className='-mx-3'>
                <Leva
                    collapsed={false}
                    hideCopyButton
                    flat
                    neverHide
                    titleBar={false}
                    fill
                    // isRoot

                    theme={levaTheme}
                />
            </div>
            <Button
                className='mt-12 font-semibold'
                bg='blue.500'
                icon={<LightningBoltIcon className='w-4' />}
                // isLoading={isLoading}
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
    // const { width, height } = state
    // let width = 512
    // let height = 512 * aspectRatio
    const lowRes = levaStore.getData()?.lowRes?.['value']
    let clone: Konva.Stage = _stage.clone()
    enableSmoothing(clone.findOne('Layer'))
    // let adjust = width / clone.width()

    // clone.size({ height, width })

    // clone.scale({ x: adjust, y: adjust })

    // needed to apply filters
    clone.find('Image').forEach((image) => {
        image.cache()
    })
    let url = clone.toDataURL({
        pixelRatio: lowRes ? 0.5 : 1,
        // quality: 100,
        // width,
        // height,
        quality: 1,

        mimeType: 'image/png',
    })
    clone.destroy()
    return url
}

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
        // Konva.Filters.Threshold,
    ])
    // image.scale({ x: 0.99, y: 0.99 })
    image.brightness(5)
    image.contrast(0.1)
    // image.threshold(0.2)
    // image = image.cache()
    // image.brightness(500)
    image.blurRadius(30)
    let url = stageToDataURL(cloned)
    cloned.destroy()

    return url
}

function getInitFromCanvas(_stage: Konva.Stage) {
    // stage = useStore.getState().stage
    let clone: Konva.Stage = _stage.clone()
    enableSmoothing(clone.findOne('Layer'))
    // cloned.cache()
    let image = clone.findOne((node: Konva.Image) => {
        return node.id() === 'init'
    })

    if (!image) {
        alert('no image')
        return
    }
    var layer: Konva.Layer = clone.findOne('Layer')

    // another solution is to use rectangle shape
    var background = new Konva.Rect({
        x: 0,
        y: 0,
        width: clone.width(),
        height: clone.height(),
        fill: '#fff',
        listening: false,
    })
    layer.add(background)
    background.moveToBottom()
    // console.log(image.id())
    image = image.cache()

    let url = stageToDataURL(clone)
    clone.destroy()

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
            let adjustW = imageObj.width / layer.width() / 0.5
            let adjustH = imageObj.height / layer.height() / 0.5
            let adjust = Math.max(adjustW, adjustH)
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

    // const aspectRatio = levaStore.useStore(
    //     (store) => store.data['aspectRatio']?.['value'],
    // )

    return (
        <div className='px-[40px] pt-[30px] w-full h-full overflow-y-auto '>
            <Masonry
                breakpointCols={{
                    default: 4,
                    2000: 3,
                    1000: 2,
                    500: 1,
                }}
                className='flex w-full -ml-[30px] pb-[100px]'
                columnClassName='space-y-8 pl-[30px]'
            >
                {images?.map((image, i) => {
                    // console.log('image',image.aspectRatio)

                    return (
                        <GenImage
                            aspectRatio={image.aspectRatio}
                            isLoading={image.isLoading}
                            key={image.id}
                            filename={`${image.prompt
                                ?.replace(/ /g, '-')
                                .replace(/,/g, '')
                                .replace(/./g, '')}-${image.seed}.png`}
                            id={image.id}
                            prompt={image.prompt}
                            seed={image.seed}
                            src={image.publicUrl}
                        />
                    )
                })}
                {Array.from({ length: 3 }).map((_, i) => (
                    <GenImage
                        id={i}
                        prompt={'placeholder'}
                        seed={i}
                        // isLoading
                        aspectRatio={'1/1'}
                        key={'placeholder' + i}
                    />
                ))}
            </Masonry>
        </div>
    )
}

function GenImage({
    aspectRatio = '1/1',
    filename = '',
    isLoading = false,
    src = '',
    id,
    seed,
    prompt,
}) {
    const addNewImages = useStore((store) => store.addNewImages)
    let image = useRef<HTMLImageElement>(null)
    const { isLoading: isUpscaling, fn: upscale } = useThrowingFn({
        async fn() {
            const { outputImageUrl } = await upscaleImage({
                dataUrl: src,
            })
            console.log('outputImageUrl', outputImageUrl)
            addNewImages([
                {
                    aspectRatio,
                    id,
                    isLoading,
                    prompt,
                    publicUrl: outputImageUrl,
                    seed,
                },
            ])
            setIsZoomed(true)
        },
        successMessage: 'Upscaled image',
    })
    const [isZoomed, setIsZoomed] = useState(false)
    //  aspectRatio = '1/1'
    return (
        <div
            style={{
                aspectRatio,
            }}
            className={classNames(
                'flex w-full group relative text-2xl shadow-xl text-white flex-col items-stretch justify-center rounded-md bg-gray-700 ',
                isLoading ? 'animate-pulse' : '',
            )}
        >
            {src && (
                <Zoom
                    onZoomChange={(z) => setIsZoomed(z)}
                    isZoomed={isZoomed}
                    wrapElement='div'
                >
                    <img
                        ref={image}
                        src={src}
                        alt='generated image'
                        style={{
                            aspectRatio,
                        }}
                        className='w-full h-full grow rounded'
                    />
                </Zoom>
            )}
            {isLoading && (
                <div className='flex items-center justify-center'>
                    <BarLoader color='white' className='' />
                </div>
            )}
            <div className='flex items-center gap-3 absolute right-3 bottom-3 '>
                {src && (
                    <ImageButton
                        isLoading={isUpscaling}
                        icon={<div className=''>Upscale</div>}
                        onClick={() => {
                            upscale()
                        }}
                    />
                )}
                {src && (
                    <ImageButton
                        icon={<DownloadIcon className=' text-white w-5 ' />}
                        onClick={async () => {
                            // download attribute doesn't work with cross origin images
                            // https://javascript.plainenglish.io/how-to-download-files-with-javascript-996b8a025d3f
                            fetch(src, {
                                method: 'get',
                                // mode: 'no-cors',
                                referrerPolicy: 'no-referrer',
                            })
                                .then((res) => res.blob())
                                .then((res) => {
                                    const aElement = document.createElement('a')
                                    aElement.setAttribute('download', filename)
                                    const href = URL.createObjectURL(res)
                                    aElement.href = href
                                    aElement.setAttribute('target', '_blank')
                                    aElement.click()
                                    URL.revokeObjectURL(href)
                                })
                        }}
                    />
                )}
            </div>
        </div>
    )
}

function ImageButton({ icon, ...rest }) {
    return (
        <Button
            bg='gray.800'
            className='shadow-xl text-white gap-2 items-center text-sm hover:scale-105 block opacity-0 transition-all duration-200 group-hover:opacity-100'
            {...rest}
        >
            {icon}
            {/* <span className=''>download</span> */}
        </Button>
    )
}

export function App({}) {
    return (
        <div className='w-screen h-screen flex flex-col dark'>
            <div className='relative bg-gray-600 h-full flex'>
                <LeftPane />
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
                {/* <UploadModal /> */}
            </div>
        </div>
    )
}

// function UploadModal({}) {
//     // after image is uploaded
//     // remove background
//     //
//     const layer = useStore((store) => store.layer)
//     const [isOpen, toggle, imageWithBg] = useStore((store) => [
//         store.bgModalIsOpen,
//         store.toggleBgModal,
//         store.imageWithBg,
//     ])
//     const { fn, isLoading } = useThrowingFn({
//         async fn() {
//             const { imageUrl } = await removeBackground({
//                 imageBase64: imageWithBg,
//             })
//             console.log('imageUrl', imageUrl)
//             setInitImage({ layer, publicUrl: imageUrl })
//         },
//     })
//     return (
//         <Modal
//             useDefaultContentStyle
//             isOpen={isOpen}
//             onClose={toggle}
//             maxWidth='600px'
//             className='ring ring-gray-600'
//             content={
//                 <div className='w-full p-8 gap-6 flex flex-col items-center'>
//                     <div className='gap-6 flex flex-col items-center'>
//                         <div className='text-4xl font-semibold'>
//                             Remove Background
//                         </div>
//                         <img
//                             src={imageWithBg}
//                             alt='image with bg'
//                             className='rounded-md max-h-[700px]'
//                         />
//                         <div className='flex w-full gap-4'>
//                             <Button
//                                 className='grow'
//                                 isLoading={isLoading}
//                                 onClick={() => {}}
//                             >
//                                 Yes
//                             </Button>
//                             {/* <div className="grow"></div> */}
//                             <Button
//                                 className='grow'
//                                 onClick={() => {
//                                     setInitImage({
//                                         layer,
//                                         publicUrl: imageWithBg,
//                                     })
//                                     toggle('')
//                                 }}
//                                 bg='blue.500'
//                             >
//                                 No
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             }
//         />
//     )
// }

function enableSmoothing(layer) {
    layer.canvas.context._context.imageSmoothingEnabled = true
    layer.canvas.context._context['imageSmoothingQuality'] = 'high'
}
