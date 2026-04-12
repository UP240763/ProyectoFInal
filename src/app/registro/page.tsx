
    'use client';
    import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
    import Input from '../components/ui/input';

    import { getCareers, registerUser } from '../services/service';
    import { Career, UserForm } from '../types';

    interface RolOption {
    value: 'user' | 'dev' | 'admin';
    label: string;
    desc: string;
    }

    const ROLES: RolOption[] = [
    { value: 'user',  label: 'Usuario',       desc: 'Puede crear tickets' },
    { value: 'dev',   label: 'Desarrollador', desc: 'Puede ser asignado a tickets' },
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
    const [form, setForm]       = useState<UserForm>(INITIAL_FORM);
    const [careers, setCareers] = useState<Career[]>([]);
    const [errors, setErrors]   = useState<FormErrors>({});
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
        if (!form.name.trim())      errs.name = 'El nombre es requerido';
        if (!form.last_name.trim()) errs.last_name = 'El apellido es requerido';
        if (!form.username.trim())  errs.username = 'El nombre de usuario es requerido';
        if (!form.email.trim())     errs.email = 'El correo es requerido';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido';
        if (!form.password)         errs.password = 'La contraseña es requerida';
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
        <div>
        <h1>Nuevo usuario</h1>
        <p>Completa los datos para registrar un usuario en el sistema.</p>

        {success && <p>Usuario registrado correctamente.</p>}
        {errors.general && <p>{errors.general}</p>}

        <form onSubmit={handleSubmit} noValidate>
            <p>Información personal</p>
            <div>
            <Input label="Nombre" name="name" required value={form.name} onChange={handleChange} placeholder="Carlos" maxLength={100} />
            {errors.name && <span>{errors.name}</span>}
            </div>
            <div>
            <Input label="Apellido" name="last_name" required value={form.last_name} onChange={handleChange} placeholder="Ramírez" maxLength={100} />
            {errors.last_name && <span>{errors.last_name}</span>}
            </div>
            <div>
            <label>Carrera</label>
            <select name="career_id" value={form.career_id} onChange={handleChange}>
                <option value="">— Sin asignar —</option>
                {careers.map((c: Career) => (
                <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            </div>

            <p>Credenciales</p>
            <div>
            <Input label="Nombre de usuario" name="username" required value={form.username} onChange={handleChange} placeholder="carlos.r" maxLength={50} hint="Único · máx. 50 caracteres" />
            {errors.username && <span>{errors.username}</span>}
            </div>
            <div>
            <Input label="Correo electrónico" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="carlos@uni.mx" maxLength={150} />
            {errors.email && <span>{errors.email}</span>}
            </div>
            <div>
            <Input label="Contraseña" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
            {errors.password && <span>{errors.password}</span>}
            </div>
            <div>
            <Input label="Confirmar contraseña" name="confirm_password" type="password" required value={form.confirm_password} onChange={handleChange} placeholder="••••••••" />
            {errors.confirm_password && <span>{errors.confirm_password}</span>}
            </div>

            <p>Rol y permisos</p>
            <div>
            <label>Rol *</label>
            <select name="rol" value={form.rol} onChange={handleChange}>
                {ROLES.map((r: RolOption) => (
                <option key={r.value} value={r.value}>{r.label}</option>
                ))}
            </select>
            <span>{ROLES.find(r => r.value === form.rol)?.desc}</span>
            </div>

            <div>
            <button type="button" onClick={() => setForm(INITIAL_FORM)}>Limpiar</button>
            <button type="submit" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar usuario'}
            </button>
            </div>
        </form>
        </div>
    );
    }
    