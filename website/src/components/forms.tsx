import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Portal,
} from '@chakra-ui/react'

import React, { useRef, useState } from 'react'

import { UploadIcon } from '@heroicons/react/outline'
import toast from 'react-hot-toast'
import { useThrowingFn } from 'beskar/landing'

export function UploadStringButton({
    onUpload,
    bg,
    accept,
}: {
    onUpload: (a: { string: string; file: File }) => void
    bg?: string
    accept: string
}) {
    const [filename, setFilename] = useState('')
    const { fn: upload, isLoading } = useThrowingFn({
        fn: async (e) => {
            const target: HTMLInputElement = e.target
            const file = target.files[0]

            if (!file) {
                console.log('no file')
                return
            }
            setFilename(file.name)
            const filename = encodeURIComponent(file.name)
            const string = await file.text()
            await onUpload({ string, file })
        },
        successMessage: 'Uploaded',
    })
    const inputRef = useRef<any>()
    return (
        <div className='text-center'>
            <input
                type='file'
                onChange={upload}
                accept={accept}
                ref={inputRef}
                style={{ display: 'none' }}
            />
            {/* @ts-ignore */}
            <Button
                bg={bg}
                leftIcon={<UploadIcon className='w-5 h-5' />}
                size='sm'
                shadow={'sm' as any}
                children={'Upload'}
                onClick={() => {
                    inputRef.current.click()
                }}
                isLoading={isLoading}
            />
            <div className='mt-2 text-sm opacity-60'>{filename}</div>
        </div>
    )
}
