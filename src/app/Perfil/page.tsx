'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '../services/service';
import { User } from '../types';

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/login'); return; }
        getProfile()
            .then(setUser)
            .catch(() => setError('Error al cargar perfil'));
    }, []);

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }

    if (!user) return <p style={{ padding: '2rem' }}>Cargando...</p>;

    return (
        <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>👤 Perfil</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => router.push('/tickets')}
                        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #0070f3', color: '#0070f3', background: '#fff', cursor: 'pointer' }}>
                        🎫 Tickets
                    </button>

                    {user.rol === 'admin' && (
                        <button onClick={() => router.push('/usuarios')}
                            style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #6366f1', color: '#6366f1', background: '#fff', cursor: 'pointer' }}>
                            👥 Usuarios
                        </button>
                    )}

                    <button onClick={() => router.push('/kpi')}
                        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #059669', color: '#059669', background: '#fff', cursor: 'pointer' }}>
                        📊 KPI
                    </button>
                    <button onClick={handleLogout}
                        style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 24, background: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: 12 }}>NOMBRE</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{user.name} {user.last_name}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: 12 }}>USUARIO</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{user.username}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: 12 }}>CORREO</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{user.email}</p>
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: 12 }}>ROL</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{user.rol}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}