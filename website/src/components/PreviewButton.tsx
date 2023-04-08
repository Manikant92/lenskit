import previewsJson from '@app/../public/tiktok-previews.json'
import { PauseIcon, PlayIcon } from '@heroicons/react/solid'
import { Button, PlayButton } from 'beskar/landing'
import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'

let audio: HTMLAudioElement

let playingVoice = atom('')

export function PreviewButton({ voice, className = '' }) {
    const [playingVoiceId, setPlayingVoice] = useAtom(playingVoice)
    const isPlaying = playingVoiceId === voice

    const Icon = isPlaying ? PauseIcon : PlayIcon
    useEffect(() => {
        audio = document.createElement('audio')
        audio.loop = false
        audio.src = ''
        audio.autoplay = false
        document.body.appendChild(audio)
        audio.addEventListener('ended', () => {
            audio.src = ''
            setPlayingVoice('')
        })
    }, [])
    return (
        <button
            className={'appearance-none ' + className}
            type='button'
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const base64 = previewsJson[voice]
                if (!base64) {
                    return
                }
                // console.log(base64)
                const src = `data:audio/mp3;base64,${base64}`
                
                if (!audio) {
                    return
                }
                if (isPlaying) {
                    audio.pause()
                    setPlayingVoice('')
                    return
                }
                // if (audio.src === src) {
                //     audio.pause()
                //     setIsPlaying(false)
                //     return
                // }
                setPlayingVoice(voice)
                audio.src = src
                audio.play()
            }}
        >
            <Icon className='w-[1.5em]' />
        </button>
    )
}

export default PreviewButton
