import 'baby-i-am-faded/styles.css'
import { Faded } from 'baby-i-am-faded'
import { signIn, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import BarLoader from 'react-spinners/HashLoader'

const App = dynamic(() => import('../components/app').then((x) => x.App), {
    ssr: false,
})

export default function Page({}) {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            signIn('google', { callbackUrl: window.location.href })
        },
    })
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) {
        return null
    }
    if (!session) return <Splash />
    // return <Splash />

    return <App />
}

function Splash() {
    return (
        <div className='w-screen h-screen text-white flex flex-col items-center justify-center dark  grow gray-800'>
            <BarLoader color='white' size={180} className='' />
        </div>
    )
}
