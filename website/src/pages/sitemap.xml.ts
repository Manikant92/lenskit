import {
    NextApiRequest,
    NextApiHandler,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
} from 'next'
import * as env from '@app/env'

import React from 'react'
import { DOMParser } from 'xmldom'

const paths = [
    '/', //
    '/tiktok',

    // '/comparisons/popsy',
    // '/comparisons/potion',
]

const parser = new DOMParser()

function Sitemap() {
    return null
}

export async function getServerSideProps({
    req,
    res,
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> {
    const myUrls = paths
        .map((relativeP) => {
            const u = new URL(relativeP, env.BASE_URL).toString()
            return `<url><loc>${u}</loc></url>`
        })
        .join('\n')

    // const [docsUrls, blogUrls] = await Promise.all([
    //     getUrlsFromSitemap({
    //         url: new URL('/docs/sitemap.xml', BASE).toString(),
    //     }),
    //     getUrlsFromSitemap({
    //         url: new URL('/blog/sitemap.xml', BASE).toString(),
    //     }),
    // ])

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${myUrls}
    </urlset>
    `

    res.setHeader('Content-Type', 'text/xml')
    res.write(sitemap)
    res.end()
    return { props: {} }
}

async function getUrlsFromSitemap({ url }) {
    const docsSitemap = await (
        await fetch(url, {
            headers: {
                accept: 'text/xml',
            },
        })
    ).text()

    const xml = parser.parseFromString(docsSitemap, 'text/xml')

    const urls = Array.from(xml.getElementsByTagName('loc'))
        .map((x) => x!.textContent!)
        .map((url) => {
            const u = new URL(new URL(url).pathname, env.BASE_URL).toString()
            return `<url><loc>${u}</loc></url>`
        })
        .join('\n')
    return urls
}

export default Sitemap
