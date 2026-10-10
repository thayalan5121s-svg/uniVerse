/**
 * View: User Signup connected to Supabase Auth & Profiles
 * Allows student self-registration; staff and admin roles are assigned by an administrator
 */
import { stateManager } from '../state.js';
import { router } from '../router.js';

export function createSignupView() {
  return {
    render() {
      return `
        <div class="page-container" style="max-width: 520px; padding-top: 36px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div class="brand-icon" style="margin: 0 auto 12px; width: 42px; height: 42px; font-size: 1.2rem;">⚡</div>
            <h1 style="font-size: 1.85rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 6px;">Create Account</h1>
            <p style="color: var(--color-text-muted); font-size: 0.9rem;">Create a student account to report and track campus issues.</p>
          </div>

          <div class="card" style="padding: 28px; border: 1px solid var(--color-border); box-shadow: var(--shadow-card);">
            <!-- Dynamic DOM Error Alert Container -->
            <div id="signup-error-banner" style="display: none; background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 500; margin-bottom: 16px;"></div>
            <div id="signup-status-banner" role="status" style="display: none; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 500; margin-bottom: 16px;"></div>

            <form id="signup-form">
              <p style="margin-bottom: 16px; color: var(--color-text-muted); font-size: 0.875rem;">
                New accounts are registered as students. Staff and admin access must be assigned by an administrator.
              </p>

              <div class="form-group">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input type="text" id="signup-name" class="form-control" placeholder="e.g. Ananya Roy" required>
              </div>

              <div class="form-group">
                <label class="form-label">Campus Email <span class="required">*</span></label>
                <input type="email" id="signup-email" class="form-control" placeholder="name@campus.edu" required>
              </div>

              <div class="form-group">
                <label class="form-label">Password <span class="required">*</span></label>
                <input type="password" id="signup-password" class="form-control" placeholder="Minimum 6 characters" minlength="6" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group" id="roll-group">
                  <label class="form-label" id="roll-label">Roll / Employee ID</label>
                  <input type="text" id="signup-roll" class="form-control" placeholder="2024CS220">
                </div>
                <div class="form-group">
                  <label class="form-label">Department <span class="required">*</span></label>
                  <select id="signup-dept" class="form-control" required>
                    <option value="Computer Science & Engg">Computer Science & Engg</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Electrical & HVAC Maintenance">Electrical & HVAC Maintenance</option>
                    <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                    <option value="IT & Network Infrastructure">IT & Network Infrastructure</option>
                    <option value="Estate & Civil Works">Estate & Civil Works</option>
                  </select>
                </div>
              </div>

              <div id="student-extra-fields" style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label class="form-label">Hostel Residence</label>
                  <select id="signup-hostel" class="form-control">
                    <option value="Hostel Block B (Cauvery)">Hostel Block B (Cauvery)</option>
                    <option value="Hostel Block A (Ganga)">Hostel Block A (Ganga)</option>
                    <option value="Hostel Block C (Godavari)">Hostel Block C (Godavari)</option>
                    <option value="Day Scholar">Day Scholar (Off-Campus)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Room / Office No</label>
                  <input type="text" id="signup-room" class="form-control" placeholder="B-204">
                </div>
              </div>

              <button type="submit" id="signup-submit-btn" class="btn btn-primary w-full" style="margin-top: 14px;">Create Account & Sign In →</button>

              <div style="text-align: center; margin-top: 16px; font-size: 0.85rem; color: var(--color-text-muted);">
                Already have an account? <a href="#/login" style="font-weight: 700;">Sign in here</a>
              </div>
            </form>
          </div>
        </div>
      `;
    },

    onMount() {
      document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('signup-submit-btn');
        const errorBanner = document.getElementById('signup-error-banner');
        const statusBanner = document.getElementById('signup-status-banner');

        if (errorBanner) errorBanner.style.display = 'none';
        if (statusBanner) statusBanner.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '⏳ Creating Account...';
        }

        const role = 'student';
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const rollNo = document.getElementById('signup-roll').value.trim();
        const department = document.getElementById('signup-dept').value;
        const hostel = document.getElementById('signup-hostel')?.value || 'Estate Office';
        const roomNo = document.getElementById('signup-room')?.value.trim() || '';

        try {
          const result = await stateManager.signUp({
            email,
            password,
            name,
            role,
            rollNo,
            department,
            hostel,
            roomNo
          });

          if (!result.session) {
            stateManager.setCurrentUser(null);
            if (statusBanner) {
              statusBanner.textContent = `Account created for ${email}. Check your inbox and confirm your email, then sign in before submitting a report.`;
              statusBanner.style.display = 'block';
            }
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = 'Create Account & Sign In →';
            }
            return;
          }

          window.dispatchEvent(new CustomEvent('campuscare-toast', {
            detail: {
              type: 'success',
              title: 'Account Created!',
              message: `Welcome ${name}! Logged in as ${role.toUpperCase()}.`
            }
          }));

          // Refresh shell and redirect to the appropriate portal
          if (window.__universe_app) {
            window.__universe_app.renderShell();
          }

          if (role === 'admin') {
            router.navigate('/admin');
          } else if (role === 'staff') {
            router.navigate('/staff');
          } else {
            router.navigate('/dashboard');
          }
        } catch (err) {
          console.error('Supabase signup error:', err);
          if (errorBanner) {
            const message = (err.message || '').toLowerCase().includes('rate limit')
              ? 'Supabase has temporarily limited signup emails. Wait before trying again, or sign in if you may already have an account. To avoid this limit during testing, configure custom SMTP in Supabase under Project Settings → Authentication → SMTP Settings.'
              : `Signup Error: ${err.message || 'Registration failed.'}`;
            errorBanner.innerText = `⚠️ ${message}`;
            errorBanner.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Account & Sign In →';
          }
        }
      });
    }
  };
}
