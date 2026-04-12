'use client';
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../services/service';

interface LoginForm {
    username: string;
    password: string;
}

export default function Login() {
    const router = useRouter();
    const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.username.trim() || !form.password) {
            setError('Completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            const { token, user } = await loginUser(form);

            // guarda el token y datos del usuario
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // redirige al perfil
            router.push('/profile');

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f0f0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '1rem',
        }}>
            <div style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 16,
                padding: '2.5rem',
                width: '100%',
                maxWidth: 400,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, marginBottom: 12,
                    }}>🎫</div>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>Bienvenido</h1>
                    <p style={{ color: '#666', margin: '6px 0 0', fontSize: 14 }}>Inicia sesión en tu cuenta</p>
                </div>

                {error && (
                    <div style={{
                        background: '#2d1515', border: '1px solid #5c2020',
                        borderRadius: 8, padding: '10px 14px',
                        color: '#f87171', fontSize: 13, marginBottom: 16,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                            USUARIO
                        </label>
                        <input
                            name="username" value={form.username} onChange={handleChange}
                            placeholder="carlos.r"
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 8,
                                background: '#111', border: '1px solid #2a2a2a',
                                color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                            CONTRASEÑA
                        </label>
                        <input
                            name="password" type="password" value={form.password} onChange={handleChange}
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: 8,
                                background: '#111', border: '1px solid #2a2a2a',
                                color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        marginTop: 6, padding: '11px 0', borderRadius: 8, border: 'none',
                        background: loading ? '#3730a3' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    }}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, color: '#555', fontSize: 13 }}>
                    ¿No tienes cuenta?{' '}
                    <span onClick={() => router.push('/registro')}
                        style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 500 }}>
                        Regístrate aquí
                    </span>
                </p>
            </div>
        </div>
    );
}