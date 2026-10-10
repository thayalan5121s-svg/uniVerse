/**
 * CampusCare Global Shared State & Supabase Auth Manager
 * Handles Supabase session synchronization, profiles, and state
 */
import { INITIAL_USERS, INITIAL_COMPLAINTS } from './mockData.js';
import { supabase } from './supabaseClient.js';

const STORAGE_KEY = 'campuscare_state_v1';

class StateManager {
  constructor() {
    this.listeners = [];
    this.session = null;
    this.state = this.loadState();
    this.initSupabaseAuth();
  }

  loadState() {
    try {
      const cached = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          currentUser: parsed.currentUser || null,
          currentRole: parsed.currentRole || 'guest',
          complaints: (parsed.complaints && parsed.complaints.length > 0) ? parsed.complaints : [...INITIAL_COMPLAINTS],
          users: (parsed.users && parsed.users.length > 0) ? parsed.users : [...INITIAL_USERS]
        };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, falling back to defaults:', e);
    }

    return {
      currentUser: null,
      currentRole: 'guest',
      complaints: [...INITIAL_COMPLAINTS],
      users: [...INITIAL_USERS]
    };
  }

  async initSupabaseAuth() {
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.session = session;
        await this.syncProfile(session.user);
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        this.session = session;
        if (session && session.user) {
          await this.syncProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.state.currentUser = null;
          this.state.currentRole = 'guest';
          this.saveState();
        }
      });
    } catch (err) {
      console.warn('Supabase auth initialization skipped or failed:', err);
    }
  }

  async syncProfile(authUser) {
    if (!supabase || !authUser) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile && !error) {
        this.state.currentUser = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          rollNo: profile.roll_no,
          department: profile.department,
          hostel: profile.hostel,
          roomNo: profile.room_no,
          phone: profile.phone,
          avatar: profile.avatar || profile.name.substring(0, 2).toUpperCase()
        };
        this.state.currentRole = profile.role;
        this.saveState();
      }
    } catch (err) {
      console.warn('Error fetching Supabase user profile:', err);
    }
  }

  // Supabase Auth Actions
  async signUp({ email, password, name, role = 'student', rollNo, department, hostel, roomNo }) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          roll_no: rollNo,
          department,
          hostel,
          room_no: roomNo,
          avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        }
      }
    });

    if (error) throw error;
    if (data.user) {
      await this.syncProfile(data.user);
    }
    return data;
  }

  async signIn({ email, password }) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (data.user) {
      await this.syncProfile(data.user);
    }
    return data;
  }

  async signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    this.state.currentUser = null;
    this.state.currentRole = 'guest';
    this.saveState();
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('State subscriber error:', err);
      }
    });
  }

  getState() {
    return this.state;
  }

  setCurrentUser(user) {
    this.state.currentUser = user;
    this.state.currentRole = user ? user.role : 'guest';
    this.saveState();
  }

  setRole(role) {
    this.state.currentRole = role;
    this.saveState();
  }

  getComplaints() {
    return this.state.complaints;
  }

  setComplaints(complaints) {
    this.state.complaints = complaints;
    this.saveState();
  }

  getComplaintById(id) {
    if (!id) return null;
    return this.state.complaints.find(c => c.id === id || c.ticket_number === id || c.dbId === id) || null;
  }

  addComplaint(complaint) {
    this.state.complaints.unshift(complaint);
    this.saveState();
    return complaint;
  }

  updateComplaint(id, updates) {
    if (!id) return null;
    const index = this.state.complaints.findIndex(c => c.id === id || c.ticket_number === id || c.dbId === id);
    if (index !== -1) {
      this.state.complaints[index] = {
        ...this.state.complaints[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveState();
      return this.state.complaints[index];
    }
    return null;
  }

  toggleUpvote(complaintId, userId) {
    const complaint = this.getComplaintById(complaintId);
    if (!complaint) return null;

    if (!Array.isArray(complaint.upvotedBy)) {
      complaint.upvotedBy = [];
    }
    const index = complaint.upvotedBy.indexOf(userId);

    if (index > -1) {
      complaint.upvotedBy.splice(index, 1);
      complaint.upvotes = Math.max(0, (complaint.upvotes || 1) - 1);
    } else {
      complaint.upvotedBy.push(userId);
      complaint.upvotes = (complaint.upvotes || 0) + 1;
    }

    this.updateComplaint(complaintId, {
      upvotes: complaint.upvotes,
      upvotedBy: complaint.upvotedBy
    });

    return complaint;
  }

  resetToDefaults() {
    this.state = {
      currentUser: null,
      currentRole: 'guest',
      complaints: [],
      users: []
    };
    this.saveState();
  }
}

export const stateManager = new StateManager();
