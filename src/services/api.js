/**
 * TaxShield Central REST API Client
 * 
 * Communicates with the Node.js + Express backend connected to MongoDB Atlas.
 * Integrates seamlessly with existing client-side Firebase Auth sessions.
 */
import { auth } from '../config/firebase';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken().catch(() => null);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      headers['x-user-id'] = user.uid;
      headers['x-user-email'] = user.email || '';
      headers['x-user-name'] = user.displayName || '';
    }
  } catch {
    // If running in environment without auth or guest session
  }

  return headers;
}

export const api = {
  /**
   * Health Check
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      console.warn('API health check failed:', err.message);
      return { status: 'offline' };
    }
  },

  /**
   * Fetch all bills from MongoDB
   */
  async getBills(params = {}) {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (auth?.currentUser?.uid) query.append('userId', auth.currentUser.uid);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/bills${qs}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch bills: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || [];
  },

  /**
   * Fetch single bill by ID from MongoDB
   */
  async getBillById(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/bills/${id}`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch bill: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Save a new bill to MongoDB
   */
  async createBill(billData) {
    const headers = await getAuthHeaders();
    const userId = auth?.currentUser?.uid || billData.userId || 'guest';

    const res = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...billData,
        userId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to save bill: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Update a bill in MongoDB
   */
  async updateBill(id, updateData) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/bills/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      throw new Error(`Failed to update bill: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Delete a bill from MongoDB (and Cloudinary image)
   */
  async deleteBill(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/bills/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to delete bill: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  },

  /**
   * Get analytics overview from MongoDB
   */
  async getAnalyticsOverview() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/bills/analytics/overview`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch analytics: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Create a formal complaint in MongoDB
   */
  async createComplaint(complaintData) {
    const headers = await getAuthHeaders();
    const userId = auth?.currentUser?.uid || complaintData.userId || 'guest';

    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...complaintData,
        userId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create complaint: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  },

  /**
   * Fetch complaints from MongoDB
   */
  async getComplaints() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch complaints: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || [];
  },
};

export default api;
