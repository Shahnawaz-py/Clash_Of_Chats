const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('coc_token');
  }
  return null;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Battle server request failed');
  }

  return data;
};

export const authApi = {
  signup: (userData: any) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiFetch('/auth/me', { method: 'GET' }),
};

export const userApi = {
  getUsers: (search?: string) => apiFetch(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`, { method: 'GET' }),
  getUserById: (id: string) => apiFetch(`/users/${id}`, { method: 'GET' }),
  updateProfile: (payload: { username?: string; avatar?: string; avatarName?: string; bannerPattern?: string; bannerUrl?: string; bannerTitle?: string; bannerFilter?: string; description?: string }) =>
    apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(payload) }),
};

export const chatApi = {
  getConversations: () => apiFetch('/chat/conversations', { method: 'GET' }),
  createOrGetConversation: (recipientId: string) => apiFetch('/chat/conversations', { method: 'POST', body: JSON.stringify({ recipientId }) }),
  getClanConversation: (clanId: string) => apiFetch(`/chat/clan-conversation/${clanId}`, { method: 'GET' }),
  getMessages: (conversationId: string) => apiFetch(`/chat/messages/${conversationId}`, { method: 'GET' }),
  sendMessage: (payload: { conversationId: string; recipientId?: string; text: string; replyTo?: { messageId?: string; text: string; senderName: string } }) => apiFetch('/chat/messages', { method: 'POST', body: JSON.stringify(payload) }),
  reactMessage: (messageId: string, emoji: string) => apiFetch(`/chat/messages/${messageId}/react`, { method: 'PUT', body: JSON.stringify({ emoji }) }),
  editMessage: (messageId: string, text: string) => apiFetch(`/chat/messages/${messageId}`, { method: 'PUT', body: JSON.stringify({ text }) }),
  deleteMessage: (messageId: string, isUndo: boolean = false) => apiFetch(`/chat/messages/${messageId}${isUndo ? '?undo=true' : ''}`, { method: 'DELETE' }),
  restoreMessage: (messageId: string, text: string) => apiFetch(`/chat/messages/${messageId}?restore=true&text=${encodeURIComponent(text)}`, { method: 'DELETE' }),
  broadcastWarHorn: (text: string) => apiFetch('/chat/warhorn', { method: 'POST', body: JSON.stringify({ text }) }),
  markAsRead: (conversationId: string) => apiFetch(`/chat/read/${conversationId}`, { method: 'PUT' }),
};

export const clanApi = {
  createClan: (payload: { name: string; description?: string; bannerPattern?: string; shieldEmblem?: string; avatar?: string; bannerUrl?: string; bannerTitle?: string; bannerFilter?: string; memberIds?: string[] }) =>
    apiFetch('/clans', { method: 'POST', body: JSON.stringify(payload) }),
  getClans: (search?: string) => apiFetch(`/clans${search ? `?search=${encodeURIComponent(search)}` : ''}`, { method: 'GET' }),
  getClanById: (id: string) => apiFetch(`/clans/${id}`, { method: 'GET' }),
  joinClan: (id: string) => apiFetch(`/clans/${id}/join`, { method: 'POST' }),
  leaveClan: (id: string) => apiFetch(`/clans/${id}/leave`, { method: 'POST' }),
};

export const friendApi = {
  sendRequest: (recipientId: string) => apiFetch('/friends/request', { method: 'POST', body: JSON.stringify({ recipientId }) }),
  getRequests: () => apiFetch('/friends/requests', { method: 'GET' }),
  acceptRequest: (requestId: string) => apiFetch(`/friends/accept/${requestId}`, { method: 'POST' }),
  rejectRequest: (requestId: string) => apiFetch(`/friends/reject/${requestId}`, { method: 'POST' }),
  getFriends: () => apiFetch('/friends', { method: 'GET' }),
  removeFriend: (friendId: string) => apiFetch(`/friends/${friendId}`, { method: 'DELETE' }),
};

