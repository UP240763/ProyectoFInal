'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getTickets, createTicket, updateTicketStatus, getTypes } from '../services/service';
import { Ticket, TicketForm, TicketType } from '../types';

const STATUS_LABEL: Record<string, string> = {
    open: '🟡 Abierto',
    in_progress: '🔵 En progreso',
    closed: '🟢 Cerrado',
};

const PRIORITY_LABEL: Record<string, string> = {
    low: '🟢 Baja',
    medium: '🟡 Media',
    high: '🔴 Alta',
};

const EMPTY_FORM: TicketForm = { title: '', description: '', type_id: '', priority: 'medium' };

export default function TicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [types, setTypes] = useState<TicketType[]>([]);
    const [form, setForm] = useState<TicketForm>(EMPTY_FORM);
    const [filters, setFilters] = useState({ status: '', priority: '', type_id: '' });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/login'); return; }
        getTypes().then(setTypes).catch(() => { });
        loadTickets();
    }, []);

    async function loadTickets() {
        try {
            const active = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== '')
            );
            setTickets(await getTickets(active));
        } catch {
            setError('Error al cargar tickets');
        }
    }

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleFilterChange(e: ChangeEvent<HTMLSelectElement>) {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!form.title.trim()) { setError('El título es requerido'); return; }
        setLoading(true);
        try {
            await createTicket(form);
            setForm(EMPTY_FORM);
            setShowForm(false);
            loadTickets();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al crear ticket');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(id: number, status: string) {
        try {
            await updateTicketStatus(id, status);
            loadTickets();
        } catch {
            setError('Error al cambiar estado');
        }
    }

    const inputStyle = { padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as const };
    const selectStyle = { padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd' };

    return (
        <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>🎫 Tickets</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => router.push('/perfil')}
                        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
                        ← Perfil
                    </button>
                    <button onClick={() => { setShowForm(!showForm); setError(''); }}
                        style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
                        {showForm ? 'Cancelar' : '+ Nuevo ticket'}
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

            {/* Formulario */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Nuevo ticket</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input name="title" placeholder="Título *" value={form.title} onChange={handleChange} style={inputStyle} />
                        <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} rows={3} style={inputStyle} />
                        <select name="type_id" value={form.type_id} onChange={handleChange} style={inputStyle}>
                            <option value="">— Tipo —</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
                        </select>
                        <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
                            <option value="low">Baja</option>
                            <option value="medium">Media</option>
                            <option value="high">Alta</option>
                        </select>
                        <button type="submit" disabled={loading}
                            style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                            {loading ? 'Creando...' : 'Crear ticket'}
                        </button>
                    </div>
                </form>
            )}

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <select name="status" value={filters.status} onChange={handleFilterChange} style={selectStyle}>
                    <option value="">Todos los estados</option>
                    <option value="open">Abierto</option>
                    <option value="in_progress">En progreso</option>
                    <option value="closed">Cerrado</option>
                </select>
                <select name="priority" value={filters.priority} onChange={handleFilterChange} style={selectStyle}>
                    <option value="">Todas las prioridades</option>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                </select>
                <select name="type_id" value={filters.type_id} onChange={handleFilterChange} style={selectStyle}>
                    <option value="">Todos los tipos</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
                </select>
                <button onClick={loadTickets}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #0070f3', color: '#0070f3', background: '#fff', cursor: 'pointer' }}>
                    Filtrar
                </button>
            </div>

            {/* Lista */}
            {tickets.length === 0
                ? <p style={{ color: '#888' }}>No hay tickets.</p>
                : tickets.map(ticket => (
                    <div key={ticket.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 14, marginBottom: 10, background: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <strong>#{ticket.id} — {ticket.title}</strong>
                                {ticket.description && (
                                    <p style={{ margin: '4px 0', color: '#555', fontSize: 13 }}>{ticket.description}</p>
                                )}
                                <span style={{ fontSize: 12, color: '#888' }}>
                                    {PRIORITY_LABEL[ticket.priority]} · {ticket.type_name || 'Sin tipo'} · Por: {ticket.creator_name || '—'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                                <span style={{ fontSize: 13 }}>{STATUS_LABEL[ticket.status]}</span>
                                <select value={ticket.status} onChange={e => handleStatusChange(ticket.id, e.target.value)}
                                    style={{ fontSize: 12, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc' }}>
                                    <option value="open">Abierto</option>
                                    <option value="in_progress">En progreso</option>
                                    <option value="closed">Cerrado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );}