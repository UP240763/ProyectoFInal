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
    const [form, setForm]     = useState<LoginForm>({ username: '', password: '' });
    const [error, setError]   = useState<string>('');
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
        <div>
        <h1>Iniciar sesión</h1>

        {error && <p>{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
            <div>
            <label>Usuario</label>
            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="carlos.r"
            />
            </div>
            <div>
            <label>Contraseña</label>
            <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
            />
            </div>
            <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>


        </form>
            <button type="button" onClick={() => router.push('/Registro')}>
            Regístrate aquí
            </button>
        </div>
    );
    }