import classNames from 'classnames'
import Masonry from 'react-masonry-css'

import { useRef, useEffect } from 'react'

// import "fabric-history"
import { Pane } from 'tweakpane'

import { objFromArr } from '@app/utils/utils'

export function LeftPane() {
    const className =
        'flex-shrink-0 h-full max-h-full bg-[color:var(--tweakpane-bg)] w-[300px] flex flex-col'

    return (
        <div className={className}>
            <LeftPaneTop />

            <div className='flex-auto'></div>
            <LeftPaneBottom />
        </div>
    )
}

const presets = {
    opengraph: {
        width: 1200,
        height: 630,
    },
    twitter: {
        width: 1200,
        height: 670,
    },
    facebook: {
        width: 1200,
        height: 670,
    },
    story: {
        height: 1920,
        width: 1080,
    },
    pinterest: {
        width: 1000,
        height: 1500,
    },
    square: {
        width: 1000,
        height: 1000,
    },
}

function LeftPaneTop() {
    const container = useRef()

    useEffect(() => {
        const pane = new Pane({ title: 'canvas', container: container.current })
        const params = new Proxy(
            {},
            {
                set(target, prop, value) {
                    try {
                        target[prop] = value
                    } finally {
                        return true
                    }
                },
                get(target, prop) {
                    if (prop === 'preset') {
                        //   return "none"
                        return (
                            Object.keys(presets).find((key) => {
                                const p = presets[key]
                                // return (
                                //     p.width === canvas.canvasBg?.width &&
                                //     p.height === canvas.canvasBg?.height
                                // )
                            }) || 'none'
                        )
                    }
                    return target[prop] || 0
                },
            },
        )
        pane.addInput(params, 'preset' as any, {
            options: objFromArr(['none', ...Object.keys(presets)]),
        }).on('change', (e) => {
            // @ts-ignore
            document.activeElement?.blur()
            pane.refresh()
            // e.target.controller_.view.element.blur()
        })

        pane.addInput(params, 'width')
        pane.addInput(params, 'height')

        return () => {
            pane.dispose()
        }
    }, [])
    return (
        <div className='flex-shrink-0'>
            <div ref={container} className=''></div>
        </div>
    )
}

function LeftPaneBottom() {
    const container = useRef()
    useEffect(() => {
        const pane = new Pane({ title: 'demo', container: container.current })
        const params = { 'some text': 'sdf' }
        pane.addInput(params, 'some text', { alpha: true, view: 'color' })
        return () => {
            pane.dispose()
        }
    }, [])
    return (
        <div className='flex-shrink-0'>
            <div ref={container} className=''></div>
        </div>
    )
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

function GenerationImage({ aspectRatio }) {}

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
