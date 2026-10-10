/**
 * CampusCare Main Application Bootstrapper
 * Connects Router, Views, Global Reactive State, Floating Mascot, and Toast System
 */
import { stateManager } from './state.js';
import { router } from './router.js';

// Import Views
import { createLandingView } from './views/landing.js';
import { createSignupView } from './views/signup.js';
import { createDashboardView } from './views/dashboard.js';
import { createNewComplaintView } from './views/newComplaint.js';
import { createComplaintDetailView } from './views/complaintDetail.js';
import { createChatbotView } from './views/chatbot.js';
import { createAdminDashboardView } from './views/adminDashboard.js';
import { createAdminAnalyticsView } from './views/adminAnalytics.js';
import { createAdminComplaintDetailView } from './views/adminComplaintDetail.js';
import { createStaffDashboardView } from './views/staffDashboard.js';
import { createStaffComplaintDetailView } from './views/staffComplaintDetail.js';
import { createStudentCommunityView } from './views/studentCommunity.js';

class App {
  constructor() {
    this.initToastSystem();
    this.initEmailListener();
    this.initGlobalAuthListeners();
    this.registerRoutes();
    this.renderShell();
  }

  initGlobalAuthListeners() {
    document.addEventListener('click', async (e) => {
      const signoutBtn = e.target.closest('[data-action="signout"], #signout-btn, .btn-signout');
      if (signoutBtn) {
        e.preventDefault();
        await stateManager.signOut();
        this.renderShell();
        router.navigate('/login');
      }
    });
  }

  registerRoutes() {
    // Public / Auth
    router.register('', createLandingView, { allowedRoles: ['guest', 'student', 'admin', 'staff'], title: 'Welcome' });
    router.register('login', createLandingView, { allowedRoles: ['guest', 'student', 'admin', 'staff'], title: 'Sign In' });
    router.register('signup', createSignupView, { allowedRoles: ['guest', 'student'], title: 'Student Sign Up' });

    // Student & Campus Dashboard Routes
    router.register('dashboard', createDashboardView, { allowedRoles: ['student', 'staff', 'admin'], title: 'Campus Dashboard' });
    router.register('complaints/new', createNewComplaintView, { allowedRoles: ['student'], title: 'Report Issue' });
    router.register('complaints/:id', (params) => createComplaintDetailView(params), { allowedRoles: ['student', 'admin', 'staff'], title: 'Ticket Tracking' });
    router.register('chatbot', createChatbotView, { allowedRoles: ['student'], title: 'CareBot AI Assistant' });
    router.register('community', createStudentCommunityView, { allowedRoles: ['student'], title: 'Student Community' });

    // Admin Routes
    router.register('admin', createAdminDashboardView, { allowedRoles: ['admin'], title: 'Admin AI Queue' });
    router.register('admin/reports', createAdminDashboardView, { allowedRoles: ['admin'], title: 'Campus Reports' });
    router.register('admin/analytics', createAdminAnalyticsView, { allowedRoles: ['admin'], title: 'Predictive Analytics' });
    router.register('admin/complaints/:id', (params) => createAdminComplaintDetailView(params), { allowedRoles: ['admin'], title: 'Admin Ticket Triage' });

    // Staff Routes
    router.register('staff', createStaffDashboardView, { allowedRoles: ['staff'], title: 'Staff Field Queue' });
    router.register('staff/complaints/:id', (params) => createStaffComplaintDetailView(params), { allowedRoles: ['staff'], title: 'Staff Resolution Workbench' });
  }

  renderShell() {
    const state = stateManager.getState();
    const user = state.currentUser;
    const role = state.currentRole;

    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    appRoot.innerHTML = `
      <!-- 1. Student Top Navbar (Visible on Student & Public pages) -->
      ${role === 'student' ? `
        <nav class="top-navbar">
          <a href="#/dashboard" class="brand-logo">
            <div class="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
            </div>
            <span class="brand-title">Uni<span>Verse</span></span>
          </a>

          <ul class="nav-links">
            <li><a href="#/dashboard" class="nav-link-item" data-route="/dashboard">Dashboard</a></li>
            <li><a href="#/complaints/new" class="nav-link-item" data-route="/complaints/new">Report Issue</a></li>
            <li><a href="#/chatbot" class="nav-link-item" data-route="/chatbot">UniVerse Assistant</a></li>
            <li><a href="#/community" class="nav-link-item" data-route="/community">Student Community</a></li>
          </ul>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="user-profile-badge">
              <div class="user-avatar-circle">${user ? user.avatar : 'AS'}</div>
              <span>${user ? user.name : 'Student'}</span>
            </div>
            <button id="signout-btn" class="btn btn-outline btn-sm" style="box-shadow: none; font-size: 0.8rem; padding: 5px 12px;">Sign Out</button>
          </div>
        </nav>
      ` : ''}

      <!-- 3. Dynamic Page View Container -->
      <main id="main-content" style="flex: 1; display: flex; flex-direction: column;"></main>

      <!-- 4. Mobile Bottom Navigation (Students) -->
      ${role === 'student' ? `
        <nav class="mobile-bottom-nav">
          <ul class="mobile-nav-items">
            <li>
              <a href="#/dashboard" class="mobile-nav-link" data-route="/dashboard">
                <span class="icon">📋</span>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#/complaints/new" class="mobile-nav-link" data-route="/complaints/new">
                <span class="icon">➕</span>
                <span>Report</span>
              </a>
            </li>
            <li>
              <a href="#/chatbot" class="mobile-nav-link" data-route="/chatbot">
                <span class="icon">💬</span>
                <span>Assistant</span>
              </a>
            </li>
            <li>
              <a href="#/community" class="mobile-nav-link" data-route="/community">
                <span class="icon">🤝</span>
                <span>Community</span>
              </a>
            </li>
          </ul>
        </nav>
      ` : ''}

      <!-- 5. Floating AI Assistant Button (Student Pages) -->
      <a href="#/chatbot" id="floating-carebot-btn" class="floating-bot-btn" title="UniVerse Assistant">
        <div class="bot-avatar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <span>UniVerse Assistant</span>
      </a>

      <!-- 6. Global Toast Notifications Queue -->
      <div id="toast-container"></div>
    `;

    // Bind sign-out button
    document.getElementById('signout-btn')?.addEventListener('click', async () => {
      await stateManager.signOut();
      this.renderShell();
      router.navigate('/login');
    });
  }

  initToastSystem() {
    window.addEventListener('campuscare-toast', (e) => {
      this.showToast(e.detail);
    });
  }

  initEmailListener() {
    // Listen for simulated email dispatches and surface as a specialized email toast
    window.addEventListener('campuscare-email-sent', (e) => {
      const { to, subject, message } = e.detail;
      this.showToast({
        type: 'email',
        title: '📧 Simulated Email Dispatched',
        message: `To: ${to} | ${subject} — ${message.substring(0, 45)}...`,
        duration: 5000
      });
    });
  }

  showToast({ type = 'success', title, message, duration = 4000 }) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '🔔';
    if (type === 'email') icon = '📧';
    else if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'error') icon = '❌';

    toast.innerHTML = `
      <div style="font-size: 1.3rem;">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" title="Dismiss">✕</button>
      <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Reliable Bootstrap on DOM ready or immediate if already interactive
function bootstrapApp() {
  try {
    const app = new App();
    window.__universe_app = app;
    router.handleRoute();

    // Preserve shell DOM on data updates
    stateManager.subscribe(() => {
      // Data change events do not destroy shell DOM
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    const appRoot = document.getElementById('app');
    if (appRoot) {
      appRoot.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
          <h2 style="color: #DC2626; margin-bottom: 8px;">Initialization Error</h2>
          <p style="color: #64607D; margin-bottom: 16px;">${err.message || 'Failed to start UniVerse application.'}</p>
          <button onclick="localStorage.clear(); window.location.reload();" style="padding: 10px 20px; background: #FF5733; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🔄 Clear Cache & Reload
          </button>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
