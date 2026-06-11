import { AuthResponse, User, Event, Participant } from '../types';

const API_URL = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('reirakits-token');
  },
  
  setToken(token: string) {
    localStorage.setItem('reirakits-token', token);
  },
  
  clearToken() {
    localStorage.removeItem('reirakits-token');
  },

  async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    // If it's not FormData, default to application/json
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge any explicit headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
      
      // If Content-Type was explicitly set to an empty string, delete it to let the browser set the boundary
      if (headers['Content-Type'] === '') {
        delete headers['Content-Type'];
      }
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = `Erro no servidor (${response.status})`;
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error('API Error (Not JSON):', text.substring(0, 200));
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('API Response JSON Parse Error:', text.substring(0, 200));
      throw new Error('Erro ao processar dados do servidor: Resposta malformatada');
    }
  },

  // Auth
  async login(credentials: any): Promise<AuthResponse> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  },

  async me(): Promise<{ user: User }> {
    return this.request('/auth/me');
  },

  // Admin
  async getOrganizadores(): Promise<User[]> {
    return this.request('/admin/organizadores');
  },

  async criarOrganizador(data: any): Promise<User> {
    return this.request('/admin/organizadores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async atualizarOrganizador(id: string, data: any): Promise<User> {
    return this.request(`/admin/organizadores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Events
  async getEventos(): Promise<Event[]> {
    return this.request('/eventos');
  },

  async getEvento(id: string): Promise<Event> {
    return this.request(`/eventos/${id}`);
  },

  async criarEvento(data: any): Promise<Event> {
    return this.request('/eventos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async atualizarEvento(id: string, data: any): Promise<Event> {
    return this.request(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletarEvento(id: string): Promise<any> {
    return this.request(`/eventos/${id}`, {
      method: 'DELETE',
    });
  },

  // Participants
  async getParticipantes(eventId: string, search?: string): Promise<Participant[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/eventos/${eventId}/participantes${query}`);
  },

  async criarParticipante(eventId: string, data: any): Promise<Participant> {
    return this.request(`/eventos/${eventId}/participantes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async importarParticipantes(eventId: string, csvContent: string): Promise<{ imported: number, ignored: number, errors: number }> {
    return this.request(`/eventos/${eventId}/participantes/importar`, {
      method: 'POST',
      body: JSON.stringify({ csvContent }),
    });
  },

  async atualizarStatusParticipante(id: string, status: string): Promise<Participant> {
    return this.request(`/participantes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deletarParticipante(id: string): Promise<any> {
    return this.request(`/participantes/${id}`, {
      method: 'DELETE',
    });
  },

  // Totem & Delivery
  async getTotemEvento(slug: string): Promise<Event> {
    return this.request(`/totem/${slug}`);
  },

  async buscarParticipantesTotem(slug: string, search: string): Promise<Participant[]> {
    return this.request(`/totem/${slug}/participantes/buscar?search=${encodeURIComponent(search)}`);
  },

  async entregarKit(participantId: string): Promise<Participant> {
    return this.request(`/participantes/${participantId}/entregar`, {
      method: 'POST',
    });
  },
  
  async getEntregasRecentes(): Promise<(Participant & { event: { nome: string } })[]> {
    return this.request('/entregas/recentes');
  },

  async buscarPorCpf(cpf: string): Promise<{ alreadyDelivered: boolean, deliveryRequest?: any, participant?: Participant, event?: { nome: string } }> {
    return this.request(`/entregas/buscar-por-cpf/${encodeURIComponent(cpf)}`);
  },

  async separarEntrega(id: string): Promise<any> {
    return this.request(`/entregas/${id}/separar`, {
      method: 'POST',
    });
  },

  async cancelarSeparacao(id: string): Promise<any> {
    return this.request(`/entregas/${id}/cancelar`, {
      method: 'POST',
    });
  },

  async confirmarEntrega(id: string): Promise<any> {
    return this.request(`/entregas/${id}/confirmar`, {
      method: 'POST',
    });
  },

  async getParticipantesPaginado(params: { page: number, limit: number, search?: string, eventId?: string }): Promise<{ participants: (Participant & { eventName: string, deliveryRequests: { id: string }[] })[], total: number, pages: number }> {
    const { page, limit, search, eventId } = params;
    let url = `/organizador/participantes?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (eventId) url += `&eventId=${eventId}`;
    return this.request(url);
  },

  async getDashboardStats(): Promise<any> {
    return this.request('/organizador/dashboard');
  },

  async getAReceber(organizadorId?: string): Promise<any[]> {
    const url = organizadorId ? `/admin/a-receber?organizadorId=${organizadorId}` : '/admin/a-receber';
    return this.request(url);
  },

  async atualizarPagamentoEvento(id: string, pagamentoStatus: string): Promise<any> {
    return this.request(`/admin/eventos/${id}/pagamento`, {
      method: 'PATCH',
      body: JSON.stringify({ pagamentoStatus }),
    });
  },

  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Fetch will set the correct Content-Type with boundary for FormData
        'Content-Type': '', 
      },
    });
  },
};
