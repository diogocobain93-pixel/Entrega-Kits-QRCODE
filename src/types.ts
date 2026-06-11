export type UserType = 'ADMIN' | 'ORGANIZADOR';
export type UserStatus = 'ATIVO' | 'INATIVO';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
  status: UserStatus;
  createdAt: string;
}

export interface Event {
  id: string;
  nome: string;
  slug?: string;
  descricao?: string;
  dataEvento: string;
  local: string;
  status: 'ATIVO' | 'INATIVO';
  organizadorId: string;
  organizador?: User;
  imageUrl?: string;
  createdAt: string;
}

export type ParticipantStatus = 'INSCRITO' | 'ENTREGUE';

export interface Participant {
  id: string;
  numero?: string;
  chip?: string;
  nome: string;
  sexo?: string;
  equipe?: string;
  cidade?: string;
  dataNascimento?: string;
  cpf: string;
  modalidade?: string;
  kit?: string;
  tamanhoCamiseta?: string;
  numeroPeito?: string;
  email?: string;
  telefone?: string;
  status: ParticipantStatus;
  eventId: string;
  deliveryRequests?: { id: string; status: string; createdAt: string }[];
  entregueAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
