import { test, expect, describe } from 'vitest'
import fs from 'fs'
import { tikTokTTSServer } from './tts'
import path from 'path'
import { concatAudioUrls, splitTextInParts } from './utils'

test('tiktok works', async () => {
    const { base64 } = await tikTokTTSServer({
        text: 'hello world',
        voice: 'en_us_001',
    })
    let tempFile = path.resolve('temp.mp3')
    console.log('writing tts to', tempFile)
    fs.writeFileSync(tempFile, base64, 'base64')
})
test('concatAudioUrls', async () => {
    const { audioUrl: one } = await tikTokTTSServer({
        text: 'one',
        voice: 'en_us_c3po',
    })
    const { audioUrl: two } = await tikTokTTSServer({
        text: 'two',
        voice: 'en_us_c3po',
    })
    let concat = await concatAudioUrls([one, two])
    let tempFile = path.resolve('concat.mp3')
    console.log('writing concat to', tempFile)
    fs.writeFileSync(tempFile, Buffer.from(await concat.arrayBuffer()))
})

describe('splitTextInParts', () => {
    test('dots are kept', () => {
        // 30 * 5 = 150
        expect(
            splitTextInParts(
                `This is how you today.
You go to this website and click the button to become a seller!`,
                30,
            ),
        ).toMatchInlineSnapshot(`
          [
            "This is how you today!",
            "You go to this website and ",
            "click the button to become a ",
            "seller!",
          ]
        `)
    })
    test('long with dots every 30 chars', () => {
        let phrase = `long with dots every 100 chars` // 30 chars
        // 30 * 5 = 150
        expect(
            splitTextInParts(
                `${phrase}. ${phrase}. ${phrase}. ${phrase}. ${phrase}. `,
                40,
            ),
        ).toMatchInlineSnapshot(`
          [
            "long with dots every 100 chars!",
            "long with dots every 100 chars!",
            "long with dots every 100 chars!",
            "long with dots every 100 chars!",
            "long with dots every 100 chars!",
          ]
        `)
    })
    test('long with dots and commas every 30 chars', () => {
        let phrase = `long with dots every 100 chars` // 30 chars
        // 30 * 5 = 150
        expect(
            splitTextInParts(
                `${phrase}. ${phrase}, ${phrase}, ${phrase} ${phrase}. `,
                40,
            ),
        ).toMatchInlineSnapshot(`
          [
            "long with dots every 100 chars!",
            "long with dots every 100 chars,",
            "long with dots every 100 chars,",
            "long with dots every 100 chars long ",
            "with dots every 100 chars!",
          ]
        `)
    })
    test('long with dots 40 chars', () => {
        let phrase = `long with dots every 100 chars xxxxxxxxx`
        // 30 * 5 = 150
        expect(
            splitTextInParts(
                `${phrase}. ${phrase}, ${phrase}, ${phrase} ${phrase}. `,
                40,
            ),
        ).toMatchInlineSnapshot(`
          [
            "long with dots every 100 chars xxxxxxxxx!",
            "long with dots every 100 chars ",
            "xxxxxxxxx,",
            "long with dots every 100 chars ",
            "xxxxxxxxx,",
            "long with dots every 100 chars ",
            "xxxxxxxxx long with dots every 100 chars ",
            "xxxxxxxxx!",
          ]
        `)
    })
    test('dots every 14 chars are merged', () => {
        let phrase = `long with dots` //
        // 30 * 5 = 150
        expect(
            splitTextInParts(
                `${phrase}. ${phrase}. ${phrase}. ${phrase}. ${phrase}. `,
                40,
            ),
        ).toMatchInlineSnapshot(`
          [
            "long with dots! long with dots!",
            "long with dots! long with dots!",
            "long with dots!",
          ]
        `)
    })
    test('real use case text', () => {
        let phrase = `This is how you can make $5,580 using artificial intelligence today!
        You go to Fiverr and click this button to become a seller!
        You create a service to say that you will write beauty articles.
        You go to THIS secret website and click THIS purple button to sign up!
        You search for the "Beauty Article Writer" prompt!
        You follow the 3 steps on how to use the prompt to make money!
        You sit back and watch artificial intelligence do all the work for you in less than 1 minute!
        This is Daniella!
        She charges $45 to write a beauty article and already has 124 reviews!
        Which means she has made over five thousand five hundred and eighty dollars writing beauty articles!  And so can you!
        You just go to THIS secret website and click the purple button to sign up.  And you can start getting paid right away!`
        // 30 * 5 = 150
        expect(splitTextInParts(phrase, 300)).toMatchInlineSnapshot(`
          [
            "This is how you can make $5,580 using artificial intelligence today! You go to Fiverr and click this button to become a seller! You create a service to say that you will write beauty articles! You go to THIS secret website and click THIS purple button to sign up!",
            "You search for the \\"Beauty Article Writer\\" prompt! You follow the 3 steps on how to use the prompt to make money! You sit back and watch artificial intelligence do all the work for you in less than 1 minute! This is Daniella! She charges $45 to write a beauty article and already has 124 reviews!",
            "Which means she has made over five thousand five hundred and eighty dollars writing beauty articles! And so can you! You just go to THIS secret website and click the purple button to sign up! And you can start getting paid right away!",
          ]
        `)
    })
})
