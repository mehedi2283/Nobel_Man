import { Project, ClientLogo, ProfileData, ContactMessage, ChatLog } from '../types';

// Updated to point to the live Render server
const BASE_URL = 'https://nobelman-server.onrender.com/api';
const API_URL = `${BASE_URL}/projects`;
const LOGO_API_URL = `${BASE_URL}/logos`;
const PROFILE_API_URL = `${BASE_URL}/profile`;
const MESSAGE_API_URL = `${BASE_URL}/messages`;
const CHAT_LOG_API_URL = `${BASE_URL}/chat-logs`;
const AUTH_API_URL = `${BASE_URL}/auth`;

export const projectService = {
  
  // --- Auth Methods ---

  async login(email: string, password: string): Promise<boolean> {
    const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.ok;
  },

  async updateAdminCredentials(email: string, password: string): Promise<void> {
    const response = await fetch(`${AUTH_API_URL}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Failed to update credentials');
  },

  // --- Project Methods ---

  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch projects from server:', error);
      // Return empty array to indicate connection/fetching issue
      return []; 
    }
  },

  async saveProject(project: Project): Promise<Project> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to save project: ${response.statusText}`);
    }
    return await response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
    }
  },

  async reorderProjects(projects: Project[]): Promise<void> {
    const response = await fetch(`${API_URL}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects })
    });
    if (!response.ok) {
        throw new Error(`Failed to reorder projects: ${response.statusText}`);
    }
  },

  async likeProject(id: string): Promise<Project> {
    const response = await fetch(`${API_URL}/${id}/like`, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`Failed to like project: ${response.statusText}`);
    }
    return await response.json();
  },

  async addComment(id: string, comment: { author: string; text: string }): Promise<Project> {
    const response = await fetch(`${API_URL}/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
    });
    if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
    }
    return await response.json();
  },

  async deleteComment(projectId: string, commentId: string): Promise<Project> {
    const response = await fetch(`${API_URL}/${projectId}/comments/${commentId}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.statusText}`);
    }
    return await response.json();
  },


    async markCommentRead(projectId: string, commentId: string): Promise<Project> {
    const response = await fetch(`${API_URL}/${projectId}/comments/${commentId}/read`, {
        method: 'PUT'
    });
    if (!response.ok) {
        throw new Error(`Failed to mark comment read: ${response.statusText}`);
    }
    return await response.json();
  },


  // --- Client Logo Methods ---

  async getClientLogos(): Promise<ClientLogo[]> {
    try {
      const response = await fetch(LOGO_API_URL);
      // If endpoint doesn't exist (404) or server error, return empty to use fallbacks silently
      if (!response.ok) {
          // We don't log an error here to avoid console noise when the feature isn't deployed yet.
          // The About component handles empty arrays by showing default logos.
          return [];
      }
      return await response.json();
    } catch (error) {
      // Silently fail for logos to allow fallback to static list
      return [];
    }
  },

  async addClientLogo(name: string, url: string): Promise<ClientLogo> {
    const response = await fetch(LOGO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url })
    });
    if (!response.ok) throw new Error('Failed to add logo');
    return await response.json();
  },

  async deleteClientLogo(id: string): Promise<void> {
    const response = await fetch(`${LOGO_API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete logo');
  },

  async deleteClientLogos(ids: string[]): Promise<void> {
    const response = await fetch(`${LOGO_API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error('Failed to delete logos');
  },

  // --- Profile Methods ---

  async getProfile(): Promise<ProfileData | null> {
    try {
      const response = await fetch(PROFILE_API_URL);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(profile: Partial<ProfileData>): Promise<ProfileData> {
    const response = await fetch(PROFILE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  },

  // --- Message Methods (Contact Form) ---
  
  async getMessages(): Promise<ContactMessage[]> {
    try {
      const response = await fetch(MESSAGE_API_URL);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async sendMessage(message: { name: string; email: string; message: string }): Promise<ContactMessage> {
    const response = await fetch(MESSAGE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  },


    async markMessageRead(id: string): Promise<ContactMessage> {
    const response = await fetch(`${MESSAGE_API_URL}/${id}/read`, {
        method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to mark message read');
    return await response.json();
  },

  async deleteMessage(id: string): Promise<void> {
    const response = await fetch(`${MESSAGE_API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete message');
  },

  // --- Chat Log Methods ---

  async getChatLogs(): Promise<ChatLog[]> {
    try {
      const response = await fetch(CHAT_LOG_API_URL);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat logs:', error);
      return [];
    }
  },

  async saveChatInteraction(role: 'user' | 'model', text: string): Promise<void> {
    // Fire and forget, don't block UI
    try {
      fetch(CHAT_LOG_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, text })
      });
    } catch (error) {
      // Ignore chat log errors in frontend to not disrupt user experience
      console.warn("Failed to log chat interaction");
    }

     },

  async markChatLogRead(id: string): Promise<ChatLog> {
    const response = await fetch(`${CHAT_LOG_API_URL}/${id}/read`, {
        method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to mark chat log read');
    return await response.json();
  }
};