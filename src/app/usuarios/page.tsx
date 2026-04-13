'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, filterUsers, updateUserStatus, deleteUser } from '../services/service';
import { User } from '../types';

export default function UsuariosPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filters, setFilters] = useState({ name: '', email: '', rol: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.rol !== 'admin') { router.push('/perfil'); return; }
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        try {
            const res = await getUsers();
            setUsers(res.data);
        } catch {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }

    async function handleFilter() {
        setLoading(true);
        try {
            const active = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '')
            );
            const res = await filterUsers(active);
            setUsers(res);
        } catch {
            setError('Error al filtrar usuarios');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatus(id: number, active: boolean) {
        try {
            await updateUserStatus(id, active);
            loadUsers();
        } catch {
            setError('Error al cambiar estado');
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('¿Eliminar este usuario?')) return;
        try {
            await deleteUser(id);
            loadUsers();
        } catch {
            setError('Error al eliminar usuario');
        }
    }

    function handleFilterChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const ROL_COLOR: Record<string, string> = {
        admin: '#ef4444',
        dev: '#3b82f6',
        user: '#10b981',
    };

    return (
        <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>👥 Usuarios</h1>
                <button onClick={() => router.push('/perfil')}
                    style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
                    ← Perfil
                </button>
            </div>

            {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <input name="name" placeholder="Buscar por nombre..." value={filters.name} onChange={handleFilterChange}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
                <input name="email" placeholder="Buscar por email..." value={filters.email} onChange={handleFilterChange}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} />
                <select name="rol" value={filters.rol} onChange={handleFilterChange}
                    style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
                    <option value="">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="dev">Dev</option>
                    <option value="user">User</option>
                </select>
                <button onClick={handleFilter}
                    style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #0070f3', color: '#0070f3', background: '#fff', cursor: 'pointer' }}>
                    🔍 Buscar
                </button>
                <button onClick={loadUsers}
                    style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
                    🔄 Limpiar
                </button>
            </div>

            {loading ? <p style={{ color: '#888' }}>Cargando...</p>
                : users.length === 0 ? <p style={{ color: '#888' }}>No hay usuarios.</p>
                : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>ID</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Nombre</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Username</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Email</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Rol</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Estado</th>
                                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px 12px' }}>#{user.id}</td>
                                    <td style={{ padding: '10px 12px' }}>{user.name} {user.last_name}</td>
                                    <td style={{ padding: '10px 12px', color: '#666' }}>{user.username}</td>
                                    <td style={{ padding: '10px 12px', color: '#666' }}>{user.email}</td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{
                                            background: ROL_COLOR[user.rol] + '20',
                                            color: ROL_COLOR[user.rol],
                                            padding: '3px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600
                                        }}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{ color: user.active ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: 13 }}>
                                            {user.active ? '✅ Activo' : '❌ Inactivo'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleStatus(user.id, !user.active)}
                                                style={{
                                                    padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                                                    background: user.active ? '#fef3c7' : '#d1fae5',
                                                    color: user.active ? '#92400e' : '#065f46'
                                                }}>
                                                {user.active ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button onClick={() => handleDelete(user.id)}
                                                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer', fontSize: 12 }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        </div>
    );
}