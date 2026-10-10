/**
 * View: Admin Complaint Detail & Triage Console
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';
import { router } from '../router.js';

export function createAdminComplaintDetailView(params) {
  const complaintId = params.id;

  return {
    async render() {
      let complaint = null;
      try {
        const res = await api.getComplaintById(complaintId);
        complaint = res.data;
      } catch {
        return `
          <div class="page-container" style="text-align: center; padding-top: 60px;">
            <h2 style="color: var(--color-primary);">Ticket Not Found</h2>
            <a href="#/admin" class="btn btn-primary">Return to Admin Queue</a>
          </div>
        `;
      }

      const state = stateManager.getState();
      const staffList = state.users.filter(u => u.role === 'staff');
      const p = complaint.priorityMetrics;

      return `
        <div class="page-container" style="max-width: 980px;">
          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <a href="#/admin">Admin Queue</a>
            <span class="separator">/</span>
            <span class="current">Triage #${complaint.id}</span>
          </div>

          <div class="page-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="badge ${p.badgeClass}">${p.tier} Priority (${p.score} pts)</span>
                <span class="badge badge-${complaint.status.toLowerCase().replace(/\s+/g, '-')}">● ${complaint.status}</span>
                <span class="badge badge-category">${complaint.category}</span>
              </div>
              <h1 class="page-title" style="font-size: 1.8rem;">#${complaint.id}: ${complaint.title}</h1>
            </div>

            <div style="display: flex; gap: 10px; align-items: center;">
              <a href="#/admin" class="btn btn-outline btn-sm">← Back to Queue</a>
              <button class="btn btn-outline btn-sm btn-signout" data-action="signout" id="admin-detail-signout-btn" style="box-shadow: none; color: #DC2626; border-color: #FECACA; background: #FEF2F2; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px;">
            
            <!-- Left Column: Details & Audit Trail -->
            <div>
              <div class="card card-chunky" style="margin-bottom: 24px;">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">Reported Details</h3>
                <p style="font-size: 0.95rem; line-height: 1.5; color: var(--color-text-main); margin-bottom: 20px;">
                  ${complaint.description}
                </p>

                ${complaint.audioUrl ? `
                  <div style="margin-bottom: 16px; padding: 14px; background: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--color-secondary); margin-bottom: 8px;">
                      🎙️ Student Voice Note Recording:
                    </div>
                    <audio controls src="${complaint.audioUrl}" style="width: 100%; display: block; border-radius: 6px;"></audio>
                  </div>
                ` : ''}

                ${complaint.photoUrl ? `
                  <div style="margin-bottom: 16px;">
                    <img src="${complaint.photoUrl}" alt="Proof" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                  </div>
                ` : ''}

                <!-- AI Score Factor Breakdown Box -->
                <div style="background: var(--color-bg-alt); border: 2px solid var(--color-secondary); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px;">
                  <div style="font-weight: 800; font-family: var(--font-display); font-size: 0.9rem; color: var(--color-secondary); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>⚡</span> AI Smart Priority Diagnostic Breakdown
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; font-size: 0.8rem;">
                    <div>Keyword Urgency: <strong>+${p.factors.keywordScore} pts</strong></div>
                    <div>Wait Delay: <strong>+${p.factors.waitScore} pts</strong></div>
                    <div>Upvotes (${complaint.upvotes || 0}): <strong>+${p.factors.upvoteScore} pts</strong></div>
                    <div>Subsystem Base: <strong>+${p.factors.categoryBase} pts</strong></div>
                  </div>
                </div>

                <!-- Meta Table -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem; color: var(--color-text-muted);">
                  <div>
                    <span>Location:</span>
                    <strong style="display: block; color: var(--color-secondary);">${complaint.location} (${complaint.specificSpot || 'N/A'})</strong>
                  </div>
                  <div>
                    <span>Submitted By:</span>
                    <strong style="display: block; color: var(--color-secondary);">${complaint.submittedBy?.name} (${complaint.submittedBy?.email})</strong>
                  </div>
                </div>
              </div>

              <!-- Complete Audit Timeline -->
              <div class="card">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 14px;">📜 Ticket Audit Trail</h3>
                <div class="timeline">
                  ${(complaint.timeline || []).map(t => `
                    <div class="timeline-step completed">
                      <div class="timeline-icon-wrap">✓</div>
                      <div class="timeline-body">
                        <div class="timeline-title">${t.title}</div>
                        <div class="timeline-time">${new Date(t.timestamp).toLocaleString()} • ${t.actor || 'System'}</div>
                        <div class="timeline-desc">${t.description}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Right Column: Admin Actions Workbench -->
            <div>
              <div class="card card-chunky" style="background: #FFFFFF;">
                <div class="card-header" style="border-bottom: 2px solid var(--color-border); padding-bottom: 12px; margin-bottom: 20px;">
                  <h3 class="card-title" style="font-size: 1.1rem;">🛠️ Triage Actions</h3>
                </div>

                <form id="admin-triage-form">
                  <!-- Update Status -->
                  <div class="form-group">
                    <label class="form-label">Update Ticket Status</label>
                    <select id="admin-update-status" class="form-control">
                      <option value="Submitted" ${complaint.status === 'Submitted' ? 'selected' : ''}>Submitted (New)</option>
                      <option value="Acknowledged" ${complaint.status === 'Acknowledged' ? 'selected' : ''}>Acknowledged (Triaged)</option>
                      <option value="Assigned" ${complaint.status === 'Assigned' ? 'selected' : ''}>Assigned to Tech</option>
                      <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress (On-site)</option>
                      <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved (Complete)</option>
                      <option value="Rejected" ${complaint.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                  </div>

                  <!-- Assign Technician -->
                  <div class="form-group">
                    <label class="form-label">Assign Technician</label>
                    <select id="admin-assign-staff" class="form-control">
                      <option value="">-- Select Technician --</option>
                      ${staffList.map(s => `
                        <option value="${s.id}" ${complaint.assignedTo?.id === s.id ? 'selected' : ''}>
                          ${s.name} (${s.department})
                        </option>
                      `).join('')}
                    </select>
                  </div>

                  <!-- Estimated SLA -->
                  <div class="form-group">
                    <label class="form-label">Estimated SLA Turnaround</label>
                    <select id="admin-sla-select" class="form-control">
                      <option value="Within 4 Hours">Emergency: Within 4 Hours</option>
                      <option value="Within 24 Hours" selected>Standard: Within 24 Hours</option>
                      <option value="Within 48 Hours">Moderate: Within 48 Hours</option>
                      <option value="Next Scheduled Maintenance Window">Preventive: Scheduled Window</option>
                    </select>
                  </div>

                  <!-- Internal Note -->
                  <div class="form-group">
                    <label class="form-label">Triage & Resolution Note</label>
                    <textarea id="admin-note-input" class="form-control" placeholder="Add dispatch instructions or reason for status update..."></textarea>
                  </div>

                  <div style="padding: 12px; background: var(--color-bg-alt); border-radius: var(--radius-md); font-size: 0.775rem; color: var(--color-text-muted); margin-bottom: 20px;">
                    📧 <strong>Simulated Email Trigger:</strong> Saving changes will automatically dispatch an email update to <em>${complaint.submittedBy?.email}</em>.
                  </div>

                  <button type="submit" class="btn btn-primary w-full" id="admin-save-triage-btn">
                    💾 Save Changes & Notify Student
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      `;
    },

    onMount() {
      document.getElementById('admin-triage-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('admin-save-triage-btn');
        btn.disabled = true;
        btn.innerHTML = '⏳ Applying Triage...';

        const newStatus = document.getElementById('admin-update-status').value;
        const staffId = document.getElementById('admin-assign-staff').value;
        const sla = document.getElementById('admin-sla-select').value;
        const note = document.getElementById('admin-note-input').value.trim();

        if (staffId) {
          const staff = stateManager.getState().users.find(u => u.id === staffId);
          if (staff) {
            await api.assignTechnician(complaintId, staff, sla);
          }
        }

        await api.updateStatus(complaintId, newStatus, note, 'Dr. Radhika Menon (Admin)');

        window.dispatchEvent(new CustomEvent('campuscare-toast', {
          detail: {
            type: 'success',
            title: 'Triage Updated Successfully',
            message: `Ticket #${complaintId} status changed to ${newStatus}. Simulated email sent.`
          }
        }));

        router.navigate(`/admin`);
      });
    }
  };
}
