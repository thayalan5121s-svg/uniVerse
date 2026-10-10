/**
 * View: Complaint Detail & Live Status Tracking
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';
import { router } from '../router.js';

export function createComplaintDetailView(params) {
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
            <h2 style="color: var(--color-primary);">Complaint Not Found</h2>
            <p style="color: var(--color-text-muted); margin-bottom: 20px;">Ticket #${complaintId} could not be located in the database.</p>
            <a href="#/dashboard" class="btn btn-primary">Return to Dashboard</a>
          </div>
        `;
      }

      const currentUser = stateManager.getState().currentUser || { id: 'usr_student_1', name: 'Student' };
      const hasUpvoted = complaint.upvotedBy && complaint.upvotedBy.includes(currentUser.id);
      
      const TRACKING_STEPS = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved'];
      const currentStepIdx = TRACKING_STEPS.indexOf(complaint.status);
      const isResolved = complaint.status === 'Resolved';

      return `
        <div class="page-container" style="max-width: 960px;">
          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <a href="#/dashboard">Dashboard</a>
            <span class="separator">/</span>
            <span class="current">Ticket #${complaint.id}</span>
          </div>

          <div class="page-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                <span class="badge ${complaint.priorityMetrics.badgeClass}">
                  ${complaint.priorityMetrics.tier} Priority (${complaint.priorityMetrics.score} pts)
                </span>
                <span class="badge badge-${complaint.status.toLowerCase().replace(/\s+/g, '-')}">
                  ● ${complaint.status}
                </span>
                <span class="badge badge-category">${complaint.category}</span>
                ${complaint.visibility === 'private' ? '<span class="badge" style="background:#F3E8FF;color:#6B21A8;border:1px solid #D8B4FE;">🔒 Private report</span>' : ''}
              </div>
              <h1 class="page-title" style="font-size: 1.75rem;">${complaint.title}</h1>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              ${complaint.visibility === 'private' ? '' : `<button class="upvote-btn ${hasUpvoted ? 'upvoted' : ''}" id="detail-upvote-btn" style="padding: 8px 16px;">
                <span>▲</span>
                <span class="upvote-count">${complaint.upvotes || 0}</span>
                <span>${hasUpvoted ? 'Upvoted' : 'Upvote Issue'}</span>
              </button>`}
              <a href="#/dashboard" class="btn btn-outline btn-sm">← Back</a>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: flex-start;">
            
            <!-- Left Column: Details & Comments -->
            <div>
              <!-- Issue Card -->
              <div class="card" style="margin-bottom: 24px;">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 12px;">Issue Description</h3>
                <p style="font-size: 0.95rem; color: var(--color-text-main); line-height: 1.6; margin-bottom: 20px;">
                  ${complaint.description}
                </p>

                ${complaint.audioUrl ? `
                  <div style="margin-bottom: 20px; padding: 16px; background: #F8FAFC; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-weight: 600; font-size: 0.875rem; color: var(--color-secondary); display: flex; align-items: center; gap: 6px;">
                        <span>🎙️</span> Attached Voice Recording
                      </span>
                      <span class="badge" style="background: #EFF6FF; color: var(--color-primary); border: 1px solid #BFDBFE; font-size: 0.72rem;">Audio Note</span>
                    </div>
                    <audio controls src="${complaint.audioUrl}" style="width: 100%; display: block; border-radius: 6px;"></audio>
                  </div>
                ` : ''}

                ${complaint.photoUrl ? `
                  <div style="margin-bottom: 20px;">
                    <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-secondary); margin-bottom: 6px;">Attached Media / Proof:</div>
                    <img src="${complaint.photoUrl}" alt="Fault preview" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                  </div>
                ` : ''}

                <!-- Key Meta Table -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--color-bg-alt); padding: 14px 18px; border-radius: var(--radius-md); border: 1px solid var(--color-border); font-size: 0.85rem;">
                  <div>
                    <span style="color: var(--color-text-muted);">Campus Location:</span>
                    <div style="font-weight: 700; color: var(--color-secondary);">${complaint.location}</div>
                  </div>
                  <div>
                    <span style="color: var(--color-text-muted);">Specific Spot:</span>
                    <div style="font-weight: 700; color: var(--color-secondary);">${complaint.specificSpot || 'N/A'}</div>
                  </div>
                  <div>
                    <span style="color: var(--color-text-muted);">Submitted By:</span>
                    <div style="font-weight: 700; color: var(--color-secondary);">${complaint.submittedBy?.name || 'Student'} (${complaint.submittedBy?.rollNo || '2024CS108'})</div>
                  </div>
                  <div>
                    <span style="color: var(--color-text-muted);">Assigned Technician:</span>
                    <div style="font-weight: 700; color: #4F46E5;">${complaint.assignedTo ? complaint.assignedTo.name : 'Awaiting Assignment'}</div>
                  </div>
                </div>
              </div>

              <!-- Discussion & Updates Thread -->
              <div class="card">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 16px;">
                  💬 Activity & Technician Notes (${(complaint.comments || []).length})
                </h3>

                <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;" id="comments-thread-container">
                  ${(complaint.comments || []).length === 0 ? `
                    <div style="font-size: 0.85rem; color: var(--color-text-muted); font-style: italic;">
                      No notes yet. Technician updates will appear here.
                    </div>
                  ` : (complaint.comments || []).map(comm => `
                    <div style="background: ${comm.role === 'staff' ? '#F0FDF4' : 'var(--color-bg-alt)'}; border: 1px solid ${comm.role === 'staff' ? '#86EFAC' : 'var(--color-border)'}; border-radius: var(--radius-md); padding: 12px 16px;">
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-weight: 800; font-size: 0.85rem; color: var(--color-secondary);">
                          ${comm.author} ${comm.role === 'staff' ? '<span class="badge badge-resolved" style="font-size: 0.65rem; margin-left: 6px;">Staff / Technician</span>' : ''}
                        </span>
                        <span style="font-size: 0.75rem; color: var(--color-text-muted);">
                          ${new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style="font-size: 0.88rem; color: var(--color-text-main); margin: 0;">${comm.text}</p>
                    </div>
                  `).join('')}
                </div>

                <!-- Add Comment Input -->
                <form id="add-comment-form" style="display: flex; gap: 10px;">
                  <input type="text" id="comment-text-input" class="form-control" placeholder="Post a comment or update for the technician..." required>
                  <button type="submit" class="btn btn-primary btn-sm" style="flex-shrink: 0;">Send</button>
                </form>
              </div>
            </div>

            <!-- Right Column: Vertical Live Status Timeline -->
            <div>
              <div class="card" style="background: #FFFFFF;">
                <div class="card-header" style="border-bottom: 1px solid var(--color-border); padding-bottom: 10px; margin-bottom: 16px;">
                  <h3 class="card-title" style="font-size: 1.1rem;">📍 Live Status Tracker</h3>
                  <span class="badge ${isResolved ? 'badge-resolved' : 'badge-in-progress'}">
                    ${isResolved ? 'Resolved' : 'In Motion'}
                  </span>
                </div>

                <div class="timeline">
                  ${TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIdx > idx || isResolved;
                    const isActive = currentStepIdx === idx && !isResolved;
                    const logEntry = (complaint.timeline || []).find(t => t.step === step);

                    return `
                      <div class="timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}">
                        <div class="timeline-icon-wrap">
                          ${isCompleted ? '✓' : (idx + 1)}
                        </div>
                        <div class="timeline-body">
                          <div class="timeline-title">${step}</div>
                          <div class="timeline-time">
                            ${logEntry ? new Date(logEntry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : (isCompleted ? 'Completed' : 'Pending')}
                          </div>
                          <div class="timeline-desc">
                            ${logEntry ? logEntry.description : (isActive ? 'Currently undergoing work order triage.' : '')}
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- Emergency Escalation Box -->
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--color-border); text-align: center;">
                  <button class="btn btn-outline btn-sm w-full" id="escalate-ticket-btn" style="color: #DC2626; border-color: #FCA5A5;">
                    ⚠️ Escalate to Senior Warden
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    },

    onMount() {
      // Upvote action with immediate optimistic update
      document.getElementById('detail-upvote-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('detail-upvote-btn');
        if (!btn) return;
        const countSpan = btn.querySelector('.upvote-count');
        const spans = btn.querySelectorAll('span');
        const labelSpan = spans.length > 2 ? spans[2] : null;
        const isUpvoted = btn.classList.contains('upvoted');

        if (isUpvoted) {
          btn.classList.remove('upvoted');
          if (countSpan) countSpan.textContent = Math.max(0, parseInt(countSpan.textContent || '0', 10) - 1);
          if (labelSpan) labelSpan.textContent = 'Upvote Issue';
        } else {
          btn.classList.add('upvoted');
          if (countSpan) countSpan.textContent = parseInt(countSpan.textContent || '0', 10) + 1;
          if (labelSpan) labelSpan.textContent = 'Upvoted';
        }

        await api.upvoteComplaint(complaintId);
      });

      // Add Comment form
      document.getElementById('add-comment-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('comment-text-input');
        const text = input.value.trim();
        if (!text) return;

        const state = stateManager.getState();
        const user = state.currentUser || { name: 'Student', role: 'student' };
        const complaint = stateManager.getComplaintById(complaintId);

        const newComment = {
          id: `c_${Date.now()}`,
          author: user.name,
          role: user.role,
          text,
          timestamp: new Date().toISOString()
        };

        const updatedComments = [...(complaint.comments || []), newComment];
        stateManager.updateComplaint(complaintId, { comments: updatedComments });
        input.value = '';
        router.handleRoute();
      });

      // Escalate Ticket
      document.getElementById('escalate-ticket-btn')?.addEventListener('click', () => {
        api.updateStatus(complaintId, 'In Progress', 'Ticket escalated by student due to prolonged delay.', 'Chief Warden Office');
        window.dispatchEvent(new CustomEvent('campuscare-toast', {
          detail: {
            type: 'warning',
            title: 'Ticket Escalated',
            message: `Priority boost applied for #${complaintId}. Notification sent to Chief Warden.`
          }
        }));
        router.handleRoute();
      });
    }
  };
}
