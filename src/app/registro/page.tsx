
'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Input from '../components/ui/input';
import { useRouter } from 'next/navigation';
import Router from 'next/router';


import { getCareers, registerUser } from '../services/service';
import { Career, UserForm } from '../types';

interface RolOption {
    value: 'user' | 'dev' | 'admin';
    label: string;
    desc: string;
}

const ROLES: RolOption[] = [
    { value: 'user', label: 'Usuario', desc: 'Puede crear tickets' },
    { value: 'dev', label: 'Desarrollador', desc: 'Puede ser asignado a tickets' },
    { value: 'admin', label: 'Administrador', desc: 'Acceso total al sistema' },
];

const INITIAL_FORM: UserForm = {
    name: '',
    last_name: '',
    username: '',
    email: '',
    career_id: '',
    password: '',
    confirm_password: '',
    rol: 'user',
};

type FormErrors = Partial<Record<keyof UserForm | 'general', string>>;

export default function Register() {
    const [form, setForm] = useState<UserForm>(INITIAL_FORM);
    const [careers, setCareers] = useState<Career[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        getCareers()
            .then(setCareers)
            .catch(() => setCareers([]));
    }, []);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    }

    function validate(): FormErrors {
        const errs: FormErrors = {};
        if (!form.name.trim()) errs.name = 'El nombre es requerido';
        if (!form.last_name.trim()) errs.last_name = 'El apellido es requerido';
        if (!form.username.trim()) errs.username = 'El nombre de usuario es requerido';
        if (!form.email.trim()) errs.email = 'El correo es requerido';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido';
        if (!form.password) errs.password = 'La contraseña es requerida';
        else if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres';
        if (form.password !== form.confirm_password) errs.confirm_password = 'Las contraseñas no coinciden';
        return errs;
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        try {
            const { confirm_password, ...payload } = form;
            await registerUser(payload);
            setSuccess(true);
            setForm(INITIAL_FORM);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            setErrors({ general: message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#0f0f0f',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", padding: '2rem 1rem',
        }}>
            <div style={{
                background: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 480,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, marginBottom: 12,
                    }}>👤</div>
                    <h1 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>Nuevo usuario</h1>
                    <p style={{ color: '#666', margin: '6px 0 0', fontSize: 14 }}>Completa los datos para registrarte</p>
                </div>

                {success && (
                    <div style={{
                        background: '#0f2a1a', border: '1px solid #166534',
                        borderRadius: 8, padding: '10px 14px',
                        color: '#4ade80', fontSize: 13, marginBottom: 16, textAlign: 'center',
                    }}>
                        ✅ Usuario registrado.{' '}
                        <span onClick={() => router.push('/login')} style={{ color: '#818cf8', cursor: 'pointer' }}>
                            Inicia sesión
                        </span>
                    </div>
                )}

                {errors.general && (
                    <div style={{
                        background: '#2d1515', border: '1px solid #5c2020',
                        borderRadius: 8, padding: '10px 14px',
                        color: '#f87171', fontSize: 13, marginBottom: 16,
                    }}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    <p style={{ color: '#6366f1', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: 0 }}>
                        INFORMACIÓN PERSONAL
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>NOMBRE</label>
                            <input name="name" placeholder="Carlos" value={form.name} onChange={handleChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                            {errors.name && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.name}</span>}
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>APELLIDO</label>
                            <input name="last_name" placeholder="Ramírez" value={form.last_name} onChange={handleChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                            {errors.last_name && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.last_name}</span>}
                        </div>
                    </div>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>CARRERA</label>
                        <select name="career_id" value={form.career_id} onChange={handleChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                            <option value="">— Sin asignar —</option>
                            {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <p style={{ color: '#6366f1', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: '4px 0 0' }}>
                        CREDENCIALES
                    </p>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>NOMBRE DE USUARIO</label>
                        <input name="username" placeholder="carlos.r" value={form.username} onChange={handleChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                        {errors.username && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.username}</span>}
                    </div>

                    <div>
                        <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>CORREO ELECTRÓNICO</label>
                        <input name="email" type="email" placeholder="carlos@uni.mx" value={form.email} onChange={handleChange}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                        {errors.email && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.email}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>CONTRASEÑA</label>
                            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                            {errors.password && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.password}</span>}
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 6 }}>CONFIRMAR</label>
                            <input name="confirm_password" type="password" placeholder="••••••••" value={form.confirm_password} onChange={handleChange}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                            {errors.confirm_password && <span style={{ color: '#f87171', fontSize: 12 }}>{errors.confirm_password}</span>}
                        </div>
                    </div>

                    <p style={{ color: '#6366f1', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: '4px 0 0' }}>
                        ROL Y PERMISOS
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {ROLES.map(r => (
                            <div key={r.value} onClick={() => setForm(prev => ({ ...prev, rol: r.value }))}
                                style={{
                                    flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                                    border: form.rol === r.value ? '1px solid #6366f1' : '1px solid #2a2a2a',
                                    background: form.rol === r.value ? '#1e1b4b' : '#111',
                                    transition: 'all 0.15s',
                                }}>
                                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                                <div style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{r.desc}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button type="button" onClick={() => setForm(INITIAL_FORM)} style={{
                            flex: 1, padding: '10px 0', borderRadius: 8,
                            background: 'transparent', border: '1px solid #2a2a2a',
                            color: '#aaa', fontSize: 14, cursor: 'pointer',
                        }}>
                            Limpiar
                        </button>
                        <button type="submit" disabled={loading} style={{
                            flex: 2, padding: '10px 0', borderRadius: 8, border: 'none',
                            background: loading ? '#3730a3' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                        }}>
                            {loading ? 'Registrando...' : 'Registrar usuario'}
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, color: '#555', fontSize: 13 }}>
                    ¿Ya tienes cuenta?{' '}
                    <span onClick={() => router.push('/login')} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 500 }}>
                        Inicia sesión
                    </span>
                </p>
            </div>
        </div>
    );
}
