/**
 * View: Landing & Sign In View
 */
import { stateManager } from '../state.js';
import { router } from '../router.js';

export function createLandingView() {
  return {
    render() {
      return `
        <div class="page-container signin-shell" style="max-width: 1180px; padding: 48px 20px 80px;">
          <div class="signin-panel">
            <div class="signin-copy">
              <div class="signin-badge">Campus Operations & Facilities Management</div>
              <h1>Sign In to <span>UniVerse</span></h1>
              <p>
                Centralized complaint tracking, intelligent duplicate resolution, and dispatch workflow.
              </p>
            </div>

            <div class="signin-card">
              <h2>Account Sign In</h2>

              <div id="login-error-banner" class="login-error-banner" style="display: none;"></div>

              <form id="custom-login-form" class="signin-form">
                <div class="form-group">
                  <label class="form-label">Campus Email <span class="required">*</span></label>
                  <input type="email" id="login-email" class="form-control" placeholder="name@campus.edu" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Password <span class="required">*</span></label>
                  <input type="password" id="login-pass" class="form-control" placeholder="Enter your password" required>
                </div>
                <button type="submit" id="login-submit-btn" class="btn btn-primary w-full login-submit">Sign In</button>
              </form>
            </div>
          </div>
        </div>
      `;
    },

    onMount() {
      document.getElementById('custom-login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('login-submit-btn');
        const errorBanner = document.getElementById('login-error-banner');

        if (errorBanner) errorBanner.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '⏳ Signing In...';
        }

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-pass').value;

        try {
          await stateManager.signIn({ email, password });
          const user = stateManager.getState().currentUser;

          if (window.__universe_app) {
            window.__universe_app.renderShell();
          }

          if (user?.role === 'admin') router.navigate('/admin');
          else if (user?.role === 'staff') router.navigate('/staff');
          else router.navigate('/dashboard');
        } catch (err) {
          console.error('Supabase sign-in error:', err);
          if (errorBanner) {
            errorBanner.innerText = `⚠️ Sign In Error: ${err.message || 'Invalid email or password.'}`;
            errorBanner.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign In';
          }
        }
      });
    }
  };
}
