import { env } from '@app/env'
import { useState, useEffect, useRef } from 'react'
import { AppError } from './errors'

let keyPrefix = 'saved-state-'

export function useSavedState(key, defaultValue) {
    key = keyPrefix + key
    const [value, setValue] = useState(defaultValue)
    useEffect(() => {
        const saved = localStorage.getItem(key)
        if (saved) {
            let parsed = safeJsonParse(saved)
            if (parsed) {
                setValue(parsed)
            }
        }
    }, [])

    useDebouncedEffect(
        () => {
            try {
                localStorage.setItem(key, JSON.stringify(value))
            } catch (e) {}
        },
        [value],
        200,
    )
    return [value, setValue]
}

export function useDebouncedEffect(callback, deps = [], delay = 120) {
    const data = useRef({ firstTime: true, clearFunc: null })
    useEffect(() => {
        const { firstTime, clearFunc } = data.current

        if (firstTime) {
            data.current.firstTime = false
            return
        }

        const handler = setTimeout(() => {
            if (clearFunc && typeof clearFunc === 'function') {
                clearFunc()
            }
            data.current.clearFunc = callback()
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [delay, ...deps])
}

function safeJsonParse(json) {
    try {
        return JSON.parse(json)
    } catch (e) {
        return null
    }
}

export function createBuyLink({ email, orgId }) {
    let productId =
        env.NEXT_PUBLIC_ENV === 'production'
            ? '5e71789f-c727-4f2e-81f4-dfab3daa5c89'
            : 'a7f8fc54-1979-49ce-bb73-3bbfe57e1c20'
    let url = new URL(
        `https://tiktoktts.lemonsqueezy.com/checkout/buy/${productId}`,
    )
    if (orgId) {
        url.searchParams.set('checkout[custom][orgId]', orgId)
    }
    url.searchParams.set('embed', '1')
    url.searchParams.set('logo', '0')
    url.searchParams.set('dark', '0')

    if (email) {
        url.searchParams.set('checkout[email]', email)
    }
    return url.toString()
}

export function objFromArr(arr: any[]) {
    return Object.fromEntries(arr.map((x) => [x, x]))
}

export function getImageSizeFromAspectRatio(
    aspectRatio: typeof aspectRatios[number],
) {
    // all sizes must be divisible by 64
    if (aspectRatio === '1/1') {
        return [768, 768]
    }
    // if (aspectRatio === '4/3') {
    //     return [768, 576 + 32]
    // }
    if (aspectRatio === '16/9') {
        return [896, 512]
    }
    if (aspectRatio === '9/16') {
        // all sizes must be divisible by 64
        return [512, 896]
    }
    return [768, 768]
}

export const aspectRatios = ['1/1', '16/9', '9/16'] as const

export const mimeToExtension = {
    'audio/x-mpeg': 'mpega',
    'application/postscript': 'ps',
    'audio/x-aiff': 'aiff',
    'application/x-aim': 'aim',
    'image/x-jg': 'art',
    'video/x-ms-asf': 'asx',
    'audio/basic': 'ulw',
    'video/x-msvideo': 'avi',
    'video/x-rad-screenplay': 'avx',
    'application/x-bcpio': 'bcpio',
    'application/octet-stream': 'exe',
    'image/bmp': 'dib',
    'text/html': 'html',
    'application/x-cdf': 'cdf',
    'application/pkix-cert': 'cer',
    'application/java': 'class',
    'application/x-cpio': 'cpio',
    'application/x-csh': 'csh',
    'text/css': 'css',
    'application/msword': 'doc',
    'application/xml-dtd': 'dtd',
    'video/x-dv': 'dv',
    'application/x-dvi': 'dvi',
    'application/vnd.ms-fontobject': 'eot',
    'text/x-setext': 'etx',
    'image/gif': 'gif',
    'application/x-gtar': 'gtar',
    'application/x-gzip': 'gz',
    'application/x-hdf': 'hdf',
    'application/mac-binhex40': 'hqx',
    'text/x-component': 'htc',
    'image/ief': 'ief',
    'text/vnd.sun.j2me.app-descriptor': 'jad',
    'application/java-archive': 'jar',
    'text/x-java-source': 'java',
    'application/x-java-jnlp-file': 'jnlp',
    'image/jpeg': 'jpg',
    'application/javascript': 'js',
    'text/plain': 'txt',
    'application/json': 'json',
    'audio/midi': 'midi',
    'application/x-latex': 'latex',
    'audio/x-mpegurl': 'm3u',
    'image/x-macpaint': 'pnt',
    'text/troff': 'tr',
    'application/mathml+xml': 'mathml',
    'application/x-mif': 'mif',
    'video/quicktime': 'qt',
    'video/x-sgi-movie': 'movie',
    'audio/mpeg': 'mpa',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpg',
    'video/mpeg2': 'mpv2',
    'application/x-wais-source': 'src',
    'application/x-netcdf': 'nc',
    'application/oda': 'oda',
    'application/vnd.oasis.opendocument.database': 'odb',
    'application/vnd.oasis.opendocument.chart': 'odc',
    'application/vnd.oasis.opendocument.formula': 'odf',
    'application/vnd.oasis.opendocument.graphics': 'odg',
    'application/vnd.oasis.opendocument.image': 'odi',
    'application/vnd.oasis.opendocument.text-master': 'odm',
    'application/vnd.oasis.opendocument.presentation': 'odp',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.oasis.opendocument.graphics-template': 'otg',
    'application/vnd.oasis.opendocument.text-web': 'oth',
    'application/vnd.oasis.opendocument.presentation-template': 'otp',
    'application/vnd.oasis.opendocument.spreadsheet-template': 'ots',
    'application/vnd.oasis.opendocument.text-template': 'ott',
    'application/ogg': 'ogx',
    'video/ogg': 'ogv',
    'audio/ogg': 'spx',
    'application/x-font-opentype': 'otf',
    'audio/flac': 'flac',
    'application/annodex': 'anx',
    'audio/annodex': 'axa',
    'video/annodex': 'axv',
    'application/xspf+xml': 'xspf',
    'image/x-portable-bitmap': 'pbm',
    'image/pict': 'pict',
    'application/pdf': 'pdf',
    'image/x-portable-graymap': 'pgm',
    'audio/x-scpls': 'pls',
    'image/png': 'png',
    'image/x-portable-anymap': 'pnm',
    'image/x-portable-pixmap': 'ppm',
    'application/vnd.ms-powerpoint': 'pps',
    'image/vnd.adobe.photoshop': 'psd',
    'image/x-quicktime': 'qtif',
    'image/x-cmu-raster': 'ras',
    'application/rdf+xml': 'rdf',
    'image/x-rgb': 'rgb',
    'application/vnd.rn-realmedia': 'rm',
    'application/rtf': 'rtf',
    'text/richtext': 'rtx',
    'application/font-sfnt': 'sfnt',
    'application/x-sh': 'sh',
    'application/x-shar': 'shar',
    'application/x-stuffit': 'sit',
    'application/x-sv4cpio': 'sv4cpio',
    'application/x-sv4crc': 'sv4crc',
    'image/svg+xml': 'svgz',
    'application/x-shockwave-flash': 'swf',
    'application/x-tar': 'tar',
    'application/x-tcl': 'tcl',
    'application/x-tex': 'tex',
    'application/x-texinfo': 'texinfo',
    'image/tiff': 'tiff',
    'text/tab-separated-values': 'tsv',
    'application/x-font-ttf': 'ttf',
    'application/x-ustar': 'ustar',
    'application/voicexml+xml': 'vxml',
    'image/x-xbitmap': 'xbm',
    'application/xhtml+xml': 'xhtml',
    'application/vnd.ms-excel': 'xls',
    'application/xml': 'xsl',
    'image/x-xpixmap': 'xpm',
    'application/xslt+xml': 'xslt',
    'application/vnd.mozilla.xul+xml': 'xul',
    'image/x-xwindowdump': 'xwd',
    'application/vnd.visio': 'vsd',
    'audio/x-wav': 'wav',
    'image/vnd.wap.wbmp': 'wbmp',
    'text/vnd.wap.wml': 'wml',
    'application/vnd.wap.wmlc': 'wmlc',
    'text/vnd.wap.wmlsc': 'wmls',
    'application/vnd.wap.wmlscriptc': 'wmlscriptc',
    'video/x-ms-wmv': 'wmv',
    'application/font-woff': 'woff',
    'application/font-woff2': 'woff2',
    'model/vrml': 'wrl',
    'application/wspolicy+xml': 'wspolicy',
    'application/x-compress': 'z',
    'application/zip': 'zip',
}
