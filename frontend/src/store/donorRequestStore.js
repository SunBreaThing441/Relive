// src/store/donorRequestStore.js
import { create } from "zustand";
import axios from "axios";

const donorRequestStore = create((set, get) => ({
  isLoading: false,
  error: null,
  message: null,
  donorRequests: [],
  donorRequest: null,

  // Create donor request
  createDonorRequest: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/donorRequest/createDonorRequest`,
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
        donorRequest: res.data.data,
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

  // Get all donor requests (admin only)
  getAllDonorRequests: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/donorRequest/getAllDonorRequests`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          params: filters
        }
      );
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.docs || []);
      set({ donorRequests: list, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Get donor request by ID
  getDonorRequestById: async (requestId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/donorRequest/getDonorRequestById/${requestId}`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      set({ donorRequest: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Confirm donor request (admin only)
  confirmDonorRequest: async (requestId, confirmation) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/donorRequest/confirmDonorRequest/${requestId}`,
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
      const updatedRequests = get().donorRequests.map((req) =>
        req._id === requestId ? { ...req, adminConfirmation: confirmation } : req
      );
      set({ donorRequests: updatedRequests });
      
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Get admin donor requests (for specific admin)
  getAdminDonorRequests: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/donorRequest/getAdminDonorRequests`,
        { 
          headers: { 
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          params: filters
        }
      );
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.docs || []);
      set({ donorRequests: list, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // Reassign donor request to another admin (admin only)
  reassignDonorRequest: async (requestId, adminId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/donorRequest/reassignDonorRequest/${requestId}`,
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

export default donorRequestStore;