import 'baby-i-am-faded/styles.css'
import { Faded } from 'baby-i-am-faded'
import { signIn, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import BarLoader from 'react-spinners/HashLoader'

export default function Page({}) {
    return <Splash />
}

export function Splash() {
    return (
        <div className='w-screen h-[90vh] text-white flex flex-col items-center justify-center dark grow gray-800'>
            <Faded
                animationName='fadeIn'
                timingFunction='ease-in'
                delay={100}
                duration={800}
            >
                <BarLoader color='white' size={180} className='' />
            </Faded>
        </div>
    )
}
