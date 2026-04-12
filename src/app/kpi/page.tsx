'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getKpiByStatus, getKpiByUser } from '../services/service';
import { KpiStatus, KpiUser } from '../types';

const STATUS_LABEL: Record<string, string> = {
    open: '🟡 Abierto',
    in_progress: '🔵 En progreso',
    closed: '🟢 Cerrado',
};

export default function KpiPage() {
    const router = useRouter();
    const [byStatus, setByStatus] = useState<KpiStatus[]>([]);
    const [byUser, setByUser] = useState<KpiUser[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/login'); return; }
        getKpiByStatus().then(setByStatus).catch(() => setError('Error al cargar métricas'));
        getKpiByUser().then(setByUser).catch(() => setError('Error al cargar métricas'));
    }, []);

    return (
        <div style={{ padding: '2rem', maxWidth: 700, margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>📊 KPI — Métricas</h1>
                <button onClick={() => router.push('/perfil')}
                    style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
                    ← Perfil
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Tarjetas por estado */}
            <h2>Tickets por estado</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                {byStatus.length === 0
                    ? <p style={{ color: '#888' }}>Sin datos</p>
                    : byStatus.map(item => (
                        <div key={item.status} style={{
                            border: '1px solid #ddd', borderRadius: 8, padding: '16px 24px',
                            textAlign: 'center', minWidth: 130, background: '#fafafa',
                        }}>
                            <div style={{ fontSize: 32, fontWeight: 700 }}>{item.total}</div>
                            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                                {STATUS_LABEL[item.status] || item.status}
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Tabla por usuario */}
            <h2>Tickets por usuario</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Usuario</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Total tickets</th>
                    </tr>
                </thead>
                <tbody>
                    {byUser.length === 0
                        ? <tr><td colSpan={2} style={{ padding: 12, color: '#888' }}>Sin datos</td></tr>
                        : byUser.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px 12px' }}>{u.name} {u.last_name}</td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>{u.total_tickets}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}
