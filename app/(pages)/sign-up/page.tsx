'use client'
import Image from 'next/image'
import React from 'react'
import SignUpForm from './component/sign-up-form'

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white">
            
            <div className="relative h-screen w-full overflow-hidden">
                <Image
                    src="/background_login.png"
                    fill
                    alt="Login Image"
                    style={{ objectFit: 'fill' }}
                />
                <div className="absolute inset-0 flex items-center justify-end px-24">
                    <div className="w-full sm:w-1/2 md:w-1/2 max-w-xl">
                        <SignUpForm />
                    </div>
                </div>
            </div>
        </div>
  )
}

export default SignUp