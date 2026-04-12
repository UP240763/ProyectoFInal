import {
    Career, RegisterPayload, Ticket, TicketForm,
    TicketType, User, KpiStatus, KpiUser,
} from '../types';

export interface LoginPayload { username: string; password: string; }

export interface AuthResponse {
    token: string;
    user: User;
}

const API_URL = 'http://localhost:3000';

function getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(err.message || 'Error en la solicitud');
    }
    return res.json();
}

// ── AUTH ──────────────────────────────────────────────────────────
export async function loginUser(data: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
}

export async function getProfile(): Promise<User> {
    const res = await fetch(`${API_URL}/auth/profile`, { headers: getHeaders() });
    return handleResponse<User>(res);
}

// ── USERS ─────────────────────────────────────────────────────────
export async function registerUser(data: RegisterPayload): Promise<void> {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
}

export async function getUsers(page = 1, limit = 10): Promise<{ data: User[]; total: number }> {
    const res = await fetch(`${API_URL}/users?page=${page}&limit=${limit}`, { headers: getHeaders() });
    return handleResponse(res);
}

export async function getUserById(id: number): Promise<User> {
    const res = await fetch(`${API_URL}/users/${id}`, { headers: getHeaders() });
    return handleResponse<User>(res);
}

export async function filterUsers(params: Record<string, string>): Promise<User[]> {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/users/filter?${qs}`, { headers: getHeaders() });
    return handleResponse<User[]>(res);
}

export async function updateUser(id: number, data: Partial<User>): Promise<void> {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
}

export async function updateUserStatus(id: number, active: boolean): Promise<void> {
    const res = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ active }),
    });
    return handleResponse<void>(res);
}

export async function deleteUser(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse<void>(res);
}

// ── CAREERS ───────────────────────────────────────────────────────
export async function getCareers(): Promise<Career[]> {
    const res = await fetch(`${API_URL}/careers`);
    return handleResponse<Career[]>(res);
}

// ── TYPES ─────────────────────────────────────────────────────────
export async function getTypes(): Promise<TicketType[]> {
    const res = await fetch(`${API_URL}/types`);
    return handleResponse<TicketType[]>(res);
}

// ── TICKETS ───────────────────────────────────────────────────────
export async function createTicket(data: TicketForm): Promise<void> {
    const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
}

export async function getTickets(filters?: Record<string, string>): Promise<Ticket[]> {
    const qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    const res = await fetch(`${API_URL}/tickets${qs}`, { headers: getHeaders() });
    return handleResponse<Ticket[]>(res);
}

export async function getTicketById(id: number): Promise<Ticket> {
    const res = await fetch(`${API_URL}/tickets/${id}`, { headers: getHeaders() });
    return handleResponse<Ticket>(res);
}

export async function updateTicketStatus(id: number, status: string): Promise<void> {
    const res = await fetch(`${API_URL}/tickets/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    return handleResponse<void>(res);
}

export async function assignTicket(id_ticket: number, id_user: number): Promise<void> {
    const res = await fetch(`${API_URL}/tickets/assign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ id_ticket, id_user }),
    });
    return handleResponse<void>(res);
}

export async function getTicketsByUser(userId: number): Promise<Ticket[]> {
    const res = await fetch(`${API_URL}/tickets/user/${userId}`, { headers: getHeaders() });
    return handleResponse<Ticket[]>(res);
}

// ── KPI ───────────────────────────────────────────────────────────
export async function getKpiByStatus(): Promise<KpiStatus[]> {
    const res = await fetch(`${API_URL}/kpi/tickets/status`, { headers: getHeaders() });
    return handleResponse<KpiStatus[]>(res);
}

export async function getKpiByUser(): Promise<KpiUser[]> {
    const res = await fetch(`${API_URL}/kpi/tickets/user`, { headers: getHeaders() });
    return handleResponse<KpiUser[]>(res);
}
