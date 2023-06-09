import { uploadFile } from '@app/pages/api/functions'
import { Button } from 'beskar/src/landing'
import { UploadIcon } from '@heroicons/react/outline'
import React, { useState, useRef, ComponentPropsWithoutRef } from 'react'
import toast from 'react-hot-toast'

export function UploadButton({
    onUpload,
    bg,
    ...rest
}: {
    onUpload: (a: { publicUrl: string }) => void
    bg?: string
} & ComponentPropsWithoutRef<typeof Button>) {
    const [loading, setLoading] = React.useState(false)
    const [filename, setFilename] = useState('')
    const uploadPhoto = async (e) => {
        setLoading(true)
        try {
            const file = e.target.files[0]
            if (!file) {
                return
            }
            setFilename(file.name)
            const filename = encodeURIComponent(file.name)
            const res = await uploadFile({ filename })
            console.log(res)
            const { url, fields, publicUrl } = res
            const formData = new FormData()

            Object.entries({ ...fields, file }).forEach(([key, value]) => {
                formData.append(key, value as any)
            })

            const upload = await fetch(url, {
                method: 'POST',

                body: formData,
            })
            console.log(upload)

            if (upload.ok) {
                console.log('Uploaded successfully!')
                await onUpload({ publicUrl })
            } else {
                toast.error('Upload failed')
                console.error(
                    'Upload failed.',
                    upload.status,
                    await upload.text(),
                )
            }
        } finally {
            setLoading(false)
        }
    }
    const inputRef = useRef<any>()
    return (
        <div>
            <input
                type='file'
                onChange={uploadPhoto}
                accept='image/*'
                ref={inputRef}
                style={{ display: 'none' }}
            />
            <Button
                bg={bg}
                icon={<UploadIcon className='w-5 h-5' />}
                className='font-bold'
                children={'Upload Product Image'}
                onClick={() => {
                    inputRef.current.click()
                }}
                isLoading={loading}
                {...rest}
            />
            {/* <div className='text-sm opacity-60'>{filename}</div> */}
        </div>
    )
}

export function LocalUploadButton({
    onUpload,
    bg,
    ...rest
}: {
    onUpload: (a: { dataSrc: string }) => void
    bg?: string
} & ComponentPropsWithoutRef<typeof Button>) {
    const [loading, setLoading] = React.useState(false)
    const uploadPhoto = async (e) => {
        setLoading(true)
        console.log(`uploading`)
        try {
            const file = e.target.files[0]
            if (!file) {
                console.log('No file selected')
                return
            }

            const dataSrc = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.addEventListener(
                    'load',
                    function () {
                        resolve(reader.result.toString())
                    },
                    false,
                )
                reader.readAsDataURL(file)
            })
            if (!dataSrc) {
                console.log('No dataSrc')
                return
            }
            console.log(`dataSrc`, dataSrc.slice(0, 100))

            await onUpload({ dataSrc })
        } finally {
            setLoading(false)
            e.target.value = ''
        }
    }
    const inputRef = useRef<any>()
    return (
        <div>
            <input
                type='file'
                onChange={uploadPhoto}
                accept='image/*'
                ref={inputRef}
                style={{ display: 'none' }}
            />
            <Button
                bg={bg}
                icon={<UploadIcon className='w-5 h-5' />}
                className='font-bold'
                children={'Upload Product Image'}
                onClick={() => {
                    inputRef.current.click()
                }}
                {...rest}
                isLoading={loading || rest.isLoading}
            />
            {/* <div className='text-sm opacity-60'>{filename}</div> */}
        </div>
    )
}
