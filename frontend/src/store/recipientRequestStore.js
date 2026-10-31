// src/store/recipientRequestStore.js
import { create } from "zustand";
import axios from "axios";

const recipientRequestStore = create((set, get) => ({
  isLoading: false,
  error: null,
  message: null,
  recipientRequests: [],
  recipientRequest: null,

  // Create recipient request
  createRecipientRequest: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/createRecipientRequest`,
        data,
        { 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          } 
        }
      );

      set({
        isLoading: false,
        recipientRequest: res.data.data,
        message: res.data.message,
      });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Get all recipient requests (admin only)
  getAllRecipientRequests: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/getAllRecipientRequests`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          params: filters
        }
      );
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.docs || []);
      set({ recipientRequests: list, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Get urgent recipient requests
  getUrgentRecipientRequests: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/getUrgentRecipientRequests`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          params: filters
        }
      );
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.docs || []);
      set({ recipientRequests: list, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Get recipient request by ID
  getRecipientRequestById: async (requestId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/getRecipientRequestById/${requestId}`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      set({ recipientRequest: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Confirm recipient request (admin only)
  confirmRecipientRequest: async (requestId, confirmation) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/confirmRecipientRequest/${requestId}`,
        { confirmation },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          } 
        }
      );
      
      set({ message: res.data.message, isLoading: false });

      // Update local state if needed
      const updatedRequests = get().recipientRequests.map((req) =>
        req._id === requestId ? { ...req, adminConfirmation: confirmation } : req
      );
      set({ recipientRequests: updatedRequests });
      
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Get admin recipient requests (for specific admin)
  getAdminRecipientRequests: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/getAdminRecipientRequests`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          params: filters
        }
      );
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.docs || []);
      set({ recipientRequests: list, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Reassign recipient request to another admin (admin only)
  reassignRecipientRequest: async (requestId, adminId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/recipientRequest/reassignRecipientRequest/${requestId}`,
        { adminId },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          } 
        }
      );
      
      set({ 
        message: res.data.message, 
        isLoading: false 
      });
      
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Clear error message
  clearError: () => set({ error: null }),
  
  // Clear success message
  clearMessage: () => set({ message: null }),
}));

export default recipientRequestStore;