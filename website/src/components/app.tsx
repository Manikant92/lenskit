import classNames from 'classnames'
import Konva from 'konva'

import Masonry from 'react-masonry-css'

import { useRef, useEffect, useState } from 'react'

// import "fabric-history"
import { Pane } from 'tweakpane'

import { objFromArr } from '@app/utils/utils'
import { UploadButton } from './upload'
import { atom, useAtom } from 'jotai'
import { Button } from 'beskar/landing'
import { env } from '@app/env'

export function LeftPane() {
    const className =
        'flex-shrink-0 h-full max-h-full bg-[color:var(--tweakpane-bg)] w-[300px] lg:w-[500px] flex flex-col'

    return (
        <div className={className}>
            <LeftPaneTop />

            <div className='flex-auto'></div>
        </div>
    )
}

const imageUrlAtom = atom<string>('')
let debugMask = env.NEXT_PUBLIC_ENV !== 'production' && false
let layer: Konva.Layer
let stage: Konva.Stage
function LeftPaneTop() {
    const [imageUrl, setImageUrl] = useAtom(imageUrlAtom)
    const container = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (layer) {
            return
        }
        Promise.resolve().then(async () => {
            console.log('konva')
            const width = container.current.clientWidth
            const height = container.current.clientHeight

            stage = new Konva.Stage({
                container: container.current,
                width: width,
                height: height,
            })

            layer = new Konva.Layer({ height, width })

            stage.add(layer)

            let image = await addImage(
                'https://storage.googleapis.com/generated-ai-uploads/2fa9e1d5-ca86-4e74-8688-cfb1b27106a54419983029_bd466f7019_b%2520Background%2520Removed.png',
            )
        })
    }, [])

    const [maskImageUrl, setMaskImageUrl] = useState('')
    return (
        <div className='dark:bg-gray-900 p-4 flex-shrink-0 flex flex-col gap-2 w-full'>
            <UploadButton
                className='text-sm w-full'
                onUpload={({ publicUrl }) => {
                    setImageUrl(publicUrl)
                }}
            />
            <div
                ref={container}
                className='w-full aspect-square border rounded-md overflow-hidden'
            ></div>
            {debugMask && (
                <>
                    <Button
                        onClick={() => {
                            setMaskImageUrl(getMaskFromCanvas())
                        }}
                    >
                        Generate debug mask image
                    </Button>
                    <img
                        src={maskImageUrl}
                        alt=''
                        className='border w-full aspect-square'
                    />
                </>
            )}
        </div>
    )
}

function getMaskFromCanvas() {
    let cloned: Konva.Stage = stage.clone()
    // cloned.cache()
    let image = cloned.findOne((node: Konva.Image) => {
        return node.id() === 'init'
    })
    console.log(image.id())
    image = image.cache()
    image.filters([Konva.Filters.Grayscale, Konva.Filters.Brighten])
    image.brightness(100)
    image.contrast(0.1)
    let url = cloned.toDataURL({ quality: 1, pixelRatio: 1 })
    return url
}

function addImage(publicUrl) {
    return new Promise<Konva.Image>((resolve) => {
        var imageObj = new Image()
        imageObj.onload = function (img) {
            let width = 200
            let height = 137
            var imgNode = new Konva.Image({
                id: 'init',
                image: imageObj,
                x: layer.width() / 2 - width / 2,
                y: layer.height() / 2 - height / 2,
                width,
                height,
                draggable: true,
            })

            // darthNode.draggable(true)
            layer.add(imgNode)
            var tr1 = new Konva.Transformer({
                nodes: [imgNode],
                centeredScaling: true,
            })
            layer.add(tr1)
            resolve(imgNode)
        }
        imageObj.crossOrigin = 'Anonymous'
        imageObj.src = publicUrl
    })
}

export function App({}) {
    let generations = []
    return (
        <div className='w-screen h-screen flex flex-col dark'>
            <div className='relative bg-gray-600 h-full flex'>
                <LeftPane />
                <style jsx global>{`
                    .my-masonry-grid {
                        display: flex;
                        margin-left: -30px; /* gutter size offset */
                        width: 100%;
                    }
                    .my-masonry-grid_column {
                        padding-left: 30px; /* gutter size */
                        background-clip: padding-box;
                    }

                    /* Style your items */
                    .my-masonry-grid_column > div {
                        /* change div to reference your elements you put in <Masonry> */
                        background: grey;
                        margin-bottom: 30px;
                    }
                `}</style>
                <Masonry
                    breakpointCols={3}
                    className='my-masonry-grid overflow-y-auto p-[40px]'
                    columnClassName='my-masonry-grid_column'
                >
                    {!generations?.length &&
                        Array.from({ length: 12 }).map((_, i) => (
                            <div
                                style={{
                                    aspectRatio: i >= 4 ? '1/1' : '16/9',
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
                </Masonry>
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
    let gcd = getGCD(above, below)
    above /= gcd
    below /= gcd
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
