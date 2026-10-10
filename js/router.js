/**
 * CampusCare SPA Hash-Based Router
 * Handles dynamic route dispatching, param parsing, and client-side role guards
 */
import { stateManager } from './state.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
    this.init();
  }

  register(path, viewHandler, options = {}) {
    this.routes[path] = {
      handler: viewHandler,
      allowedRoles: options.allowedRoles || ['student', 'admin', 'staff', 'guest'],
      title: options.title || 'UniVerse'
    };
  }

  init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.handleRoute());
      window.addEventListener('load', () => this.handleRoute());
    }
  }

  navigate(hash) {
    if (typeof window !== 'undefined') {
      window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
    }
  }

  parseRoute(hash) {
    const cleanHash = hash.replace(/^#\/?/, '') || '';
    const parts = cleanHash.split('/');

    // Check exact matches
    if (this.routes[cleanHash]) {
      return { route: this.routes[cleanHash], path: cleanHash, params: {} };
    }

    // Pattern matching: e.g. complaints/:id, admin/complaints/:id, staff/complaints/:id
    for (const routePattern in this.routes) {
      const patternParts = routePattern.split('/');
      if (patternParts.length === parts.length) {
        let isMatch = true;
        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
          if (patternParts[i].startsWith(':')) {
            const paramName = patternParts[i].slice(1);
            params[paramName] = parts[i];
          } else if (patternParts[i] !== parts[i]) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          return { route: this.routes[routePattern], path: routePattern, params };
        }
      }
    }

    // Default fallback
    return { route: this.routes['login'] || this.routes[''], path: 'login', params: {} };
  }

  async handleRoute() {
    const appState = stateManager.getState();
    const userRole = appState.currentRole || 'guest';
    const defaultRoute = userRole === 'guest' ? '#/login' : (userRole === 'admin' ? '#/admin' : (userRole === 'staff' ? '#/staff' : '#/dashboard'));
    const rawHash = window.location.hash || defaultRoute;
    const { route, path, params } = this.parseRoute(rawHash);

    // Route Guard Verification
    if (route && route.allowedRoles && !route.allowedRoles.includes('guest')) {
      if (!route.allowedRoles.includes(userRole)) {
        if (userRole === 'guest') {
          this.navigate('/login');
          return;
        }
        console.warn(`Access Denied: Role "${userRole}" cannot access "${path}". Redirecting.`);
        
        // Show notification toast
        const event = new CustomEvent('campuscare-toast', {
          detail: {
            type: 'error',
            title: 'Restricted Access',
            message: `Your current role (${userRole.toUpperCase()}) does not have permission to access ${path}.`
          }
        });
        window.dispatchEvent(event);

        // Redirect appropriately
        if (userRole === 'admin') {
          this.navigate('/admin');
        } else if (userRole === 'staff') {
          this.navigate('/staff');
        } else {
          this.navigate('/dashboard');
        }
        return;
      }
    }

    // Set Document Title
    document.title = `${route?.title || 'Smart Complaint System'} | UniVerse`;

    // Render View Container
    const mainContainer = document.getElementById('main-content');
    if (!mainContainer) return;

    if (this.currentView && typeof this.currentView.onDestroy === 'function') {
      try {
        this.currentView.onDestroy();
      } catch (err) {
        console.error('Error in view onDestroy:', err);
      }
    }

    try {
      // Show smooth fade container
      mainContainer.innerHTML = `
        <div class="view-container" id="view-root">
          <div class="skeleton skeleton-title" style="margin: 20px auto;"></div>
          <div class="skeleton skeleton-card" style="margin: 20px auto;"></div>
        </div>
      `;

      const viewInstance = await route.handler(params);
      this.currentView = viewInstance;

      const viewRoot = document.getElementById('view-root');
      if (viewRoot && viewInstance && viewInstance.render) {
        const renderedHtml = await viewInstance.render();
        viewRoot.innerHTML = renderedHtml;
        if (typeof viewInstance.onMount === 'function') {
          viewInstance.onMount();
        }
      }

      // Update Navigation Active States & Breadcrumbs
      this.updateActiveNavs(rawHash);
      this.updateFloatingBotVisibility(rawHash, userRole);

    } catch (err) {
      console.error('Error rendering route view:', err);
      mainContainer.innerHTML = `
        <div class="page-container">
          <div class="card" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">⚠️</div>
            <h2 style="color: var(--color-primary); margin-bottom: 8px;">Failed to Load Page</h2>
            <p style="color: var(--color-text-muted); margin-bottom: 20px;">${err.message || 'An unexpected error occurred.'}</p>
            <a href="#/dashboard" class="btn btn-primary">Return to Dashboard</a>
          </div>
        </div>
      `;
    }
  }

  updateActiveNavs(currentHash) {
    const currentRoute = currentHash.replace(/^#\/?/, '').replace(/\/+$/, '');
    const navLinks = document.querySelectorAll('[data-route]');
    navLinks.forEach(link => {
      const targetRoute = (link.getAttribute('data-route') || '').replace(/^#\/?/, '').replace(/\/+$/, '');
      if (currentRoute === targetRoute && targetRoute !== '') {
        link.classList.add('active');
      } else if (targetRoute === '' && (!currentRoute || currentRoute === 'dashboard')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  updateFloatingBotVisibility(currentHash, role) {
    const floatingBot = document.getElementById('floating-carebot-btn');
    if (!floatingBot) return;

    // Show floating mascot only for student role on student pages
    if (role === 'student' && !currentHash.includes('/chatbot') && !currentHash.includes('/login') && !currentHash.includes('/signup')) {
      floatingBot.style.display = 'flex';
    } else {
      floatingBot.style.display = 'none';
    }
  }
}

export const router = new Router();
