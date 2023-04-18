import { signIn, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const App = dynamic(() => import('../components/app').then((x) => x.App), {
    ssr: false,
})

export default function Page({}) {
    const {} = useSession({
        required: true,
        onUnauthenticated() {},
    })
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) {
        return null
    }

    return <App />
}
