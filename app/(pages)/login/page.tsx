'use client';
import Image from 'next/image';
import React from 'react';
import LoginForm from './component/login-form';
import { mulish } from '@/app/components/font';

const LoginPage = () => {
    return (
        <div className={`${mulish.className} flex min-h-screen flex-col overflow-hidden bg-white`}>
            
            <div className="relative h-screen w-full overflow-hidden">
                <Image
                    src="/background_login.png"
                    fill
                    alt="Login Image"
                    style={{ objectFit: 'fill' }}
                />
                <div className="absolute inset-0 flex items-center justify-end px-24">
                    <div className="w-full sm:w-3/5 md:w-2/5 max-w-lg">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
