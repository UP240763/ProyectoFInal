export type Career = {
  id: number;
  name: string;
  active: boolean;
};

export type UserForm = {
  name: string;
  last_name: string;
  username: string;
  email: string;
  career_id: number | string;
  password: string;
  confirm_password: string;
  rol: 'user' | 'dev' | 'admin';
};

export interface RegisterPayload extends Omit<UserForm, 'confirm_password'> {}

export type User = {
  id: number;
  name: string;
  last_name: string;
  username: string;
  email: string;
  rol: 'user' | 'dev' | 'admin';
  active?: boolean;
  career_id?: number;
  created_at?: string;
};

export type TicketStatus   = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export type TicketType = {
  id: number;
  type: string;
  description: string;
  area: string;
};

export type Ticket = {
  id: number;
  title: string;
  description: string;
  type_id: number;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: number;
  created_at: string;
  creator_name?: string;
  type_name?: string;
};

export type TicketForm = {
  title: string;
  description: string;
  type_id: number | string;
  priority: TicketPriority;
};

export type KpiStatus = { status: string; total: number };
export type KpiUser   = { id: number; name: string; last_name: string; total_tickets: number };
