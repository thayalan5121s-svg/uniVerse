/**
 * View: Staff Ticket Detail & Resolution Workbench
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';
import { router } from '../router.js';

export function createStaffComplaintDetailView(params) {
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
            <a href="#/staff" class="btn btn-primary">Return to Staff Queue</a>
          </div>
        `;
      }

      const isResolved = complaint.status === 'Resolved';
      const isInProgress = complaint.status === 'In Progress';

      return `
        <div class="page-container" style="max-width: 960px;">
          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <a href="#/staff">Staff Work Orders</a>
            <span class="separator">/</span>
            <span class="current">Ticket #${complaint.id}</span>
          </div>

          <div class="page-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span class="badge ${complaint.priorityMetrics.badgeClass}">${complaint.priorityMetrics.tier} Priority</span>
                <span class="badge badge-${complaint.status.toLowerCase().replace(/\s+/g, '-')}">● ${complaint.status}</span>
                <span class="badge badge-category">${complaint.category}</span>
              </div>
              <h1 class="page-title" style="font-size: 1.8rem;">#${complaint.id}: ${complaint.title}</h1>
            </div>

            <div style="display: flex; gap: 10px; align-items: center;">
              <a href="#/staff" class="btn btn-outline btn-sm">← Back to Staff Queue</a>
              <button class="btn btn-outline btn-sm btn-signout" data-action="signout" id="staff-detail-signout-btn" style="box-shadow: none; color: #DC2626; border-color: #FECACA; background: #FEF2F2; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px;">
            
            <!-- Left: Fault Details -->
            <div>
              <div class="card card-chunky" style="margin-bottom: 24px;">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">Fault Information</h3>
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
                    <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Student Attached Photo:</div>
                    <img src="${complaint.photoUrl}" alt="Fault" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                  </div>
                ` : ''}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.85rem; background: var(--color-bg-alt); padding: 14px; border-radius: var(--radius-md); border: 1.5px solid var(--color-border);">
                  <div>
                    <span style="color: var(--color-text-muted);">Exact Location:</span>
                    <strong style="display: block; color: var(--color-secondary);">${complaint.location}</strong>
                    <span style="color: var(--color-text-muted); font-size: 0.8rem;">${complaint.specificSpot || ''}</span>
                  </div>
                  <div>
                    <span style="color: var(--color-text-muted);">Contact Student:</span>
                    <strong style="display: block; color: var(--color-secondary);">${complaint.submittedBy?.name}</strong>
                    <span style="color: var(--color-text-muted); font-size: 0.8rem;">${complaint.submittedBy?.email}</span>
                  </div>
                </div>
              </div>

              <!-- Activity Log -->
              <div class="card">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 14px;">Recent Work Order Updates</h3>
                <div class="timeline">
                  ${(complaint.timeline || []).map(t => `
                    <div class="timeline-step completed">
                      <div class="timeline-icon-wrap">✓</div>
                      <div class="timeline-body">
                        <div class="timeline-title">${t.title}</div>
                        <div class="timeline-time">${new Date(t.timestamp).toLocaleTimeString()} • ${t.actor}</div>
                        <div class="timeline-desc">${t.description}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Right: Technician Action Box -->
            <div>
              <div class="card card-chunky" style="background: #FFFFFF;">
                <div class="card-header" style="border-bottom: 2px solid var(--color-border); padding-bottom: 12px; margin-bottom: 20px;">
                  <h3 class="card-title" style="font-size: 1.1rem;">⚡ Field Actions</h3>
                  <span class="badge ${isResolved ? 'badge-resolved' : 'badge-in-progress'}">
                    ${isResolved ? 'Resolved' : 'Active Ticket'}
                  </span>
                </div>

                ${isResolved ? `
                  <div style="background: #F0FDF4; border: 2px solid #86EFAC; border-radius: var(--radius-md); padding: 20px; text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 8px;">✅</div>
                    <h3 style="color: #166534; font-size: 1.15rem; margin-bottom: 6px;">Ticket Marked as Resolved</h3>
                    <p style="font-size: 0.85rem; color: #15803D; margin-bottom: 14px;">
                      Resolution details and closure notice sent to student.
                    </p>
                    <div style="font-size: 0.825rem; background: #FFFFFF; padding: 10px; border-radius: var(--radius-sm); border: 1px solid #86EFAC; text-align: left;">
                      <strong>Note logged:</strong> ${complaint.resolutionProof || 'No additional notes'}
                    </div>
                  </div>
                ` : `
                  <!-- In-Progress Quick Trigger -->
                  ${!isInProgress ? `
                    <div style="margin-bottom: 20px;">
                      <button type="button" class="btn btn-secondary w-full" id="staff-mark-in-progress-btn">
                        🚚 Mark "In Progress" (On-Site Arrival)
                      </button>
                    </div>
                  ` : ''}

                  <!-- Resolution Form -->
                  <form id="staff-resolution-form">
                    <h4 style="font-size: 0.95rem; color: var(--color-secondary); margin-bottom: 10px;">
                      📝 Complete & Mark Resolved
                    </h4>

                    <div class="form-group">
                      <label class="form-label">Work Done & Fix Details <span class="required">*</span></label>
                      <textarea id="staff-fix-notes" class="form-control" placeholder="e.g. Replaced split capacitor, flushed drain line, and pressure tested unit." required></textarea>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Replacement Parts Used (Optional)</label>
                      <input type="text" id="staff-parts-used" class="form-control" placeholder="e.g. 1x Capacitor 45uF, 2m CPVC Pipe">
                    </div>

                    <div style="padding: 12px; background: var(--color-bg-alt); border-radius: var(--radius-md); font-size: 0.775rem; color: var(--color-text-muted); margin-bottom: 18px;">
                      📧 <strong>Automated Student Notification:</strong> Submitting will trigger an instant email notification to <em>${complaint.submittedBy?.email}</em>.
                    </div>

                    <button type="submit" class="btn btn-primary w-full" id="staff-resolve-submit-btn" style="background: #059669; border-color: #047857; box-shadow: 0 4px 0 #047857;">
                      🎉 Mark as Resolved & Close Ticket
                    </button>
                  </form>
                `}
              </div>
            </div>

          </div>
        </div>
      `;
    },

    onMount() {
      // Mark In Progress
      document.getElementById('staff-mark-in-progress-btn')?.addEventListener('click', async () => {
        const staff = stateManager.getState().currentUser;
        await api.updateStatus(complaintId, 'In Progress', 'Technician arrived on-site with replacement components.', staff.name);
        
        window.dispatchEvent(new CustomEvent('campuscare-toast', {
          detail: {
            type: 'success',
            title: 'Status Updated: In Progress',
            message: 'Student notified that technician is working on-site.'
          }
        }));

        router.handleRoute();
      });

      // Mark Resolved Form
      document.getElementById('staff-resolution-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('staff-resolve-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '⏳ Closing Ticket...';

        const notes = document.getElementById('staff-fix-notes').value.trim();
        const parts = document.getElementById('staff-parts-used')?.value.trim();
        const fullNote = parts ? `${notes} (Parts replaced: ${parts})` : notes;

        const staff = stateManager.getState().currentUser;
        await api.updateStatus(complaintId, 'Resolved', fullNote, `${staff.name} (Technician)`);

        // Confetti celebration
        if (window.confetti) {
          window.confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        window.dispatchEvent(new CustomEvent('campuscare-toast', {
          detail: {
            type: 'success',
            title: 'Issue Resolved! 🎉',
            message: `Ticket #${complaintId} closed. Student notified via email.`
          }
        }));

        router.handleRoute();
      });
    }
  };
}
