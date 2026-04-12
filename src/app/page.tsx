'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/perfil');
        } else {
            router.push('/login');
        }
    }, []);

    return <p style={{ padding: '2rem' }}>Cargando...</p>;
}
