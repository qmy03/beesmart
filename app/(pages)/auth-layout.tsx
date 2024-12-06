// AuthLayout.js
'use client';
import React from 'react';
import Image from 'next/image';
import { mulish } from '@/app/components/font';

interface AuthLayoutProps {
    children: React.ReactNode;
}
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className={`${mulish.className} flex min-h-screen flex-col overflow-hidden bg-white`}>
            <div className="relative h-screen w-full overflow-hidden">
                <Image
                    src="/background_login.png"
                    fill
                    alt="Background Image"
                    style={{ objectFit: 'fill' }}
                />
                <div className="absolute inset-0 flex items-center justify-end px-24">
                    <div className="w-full sm:w-3/5 md:w-2/5 max-w-lg">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
