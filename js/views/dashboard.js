/**
 * View: Student Dashboard
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';
import { router } from '../router.js';

export function createDashboardView() {
  let activeTab = 'All';
  let searchQuery = '';

  return {
    async render() {
      const state = stateManager.getState();
      const user = state.currentUser || { id: 'usr_student_1', name: 'Student', hostel: 'Campus Student', role: 'student' };
      const role = (user.role || state.currentRole || 'student').toLowerCase();
      const isStaffOrAdmin = role === 'admin' || role === 'staff' || role === 'teacher' || role === 'faculty';
      const res = await api.getComplaints();
      const complaints = res.data || [];

      const myComplaints = complaints.filter(c => c.submittedBy?.email === user.email);
      const activeCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Rejected').length;
      const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

      // Filter complaints based on activeTab & search
      let filtered = [...complaints];
      if (activeTab === 'My Complaints') {
        filtered = filtered.filter(c => c.submittedBy?.email === user.email);
      } else if (activeTab === 'In Progress') {
        filtered = filtered.filter(c => c.status === 'In Progress' || c.status === 'Assigned');
      } else if (activeTab === 'Resolved') {
        filtered = filtered.filter(c => c.status === 'Resolved');
      } else if (activeTab === 'Critical') {
        filtered = filtered.filter(c => c.priority === 'Critical');
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        );
      }

      return `
        <div class="page-container">
          <!-- Welcome Banner & Quick Action CTA -->
          <div class="card" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #FFFFFF; margin-bottom: 24px; padding: 28px; border: 1px solid #1E293B;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
              <div>
                <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(37, 99, 235, 0.2); color: #93C5FD; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">
                  Logged in as ${user.name} (${user.hostel || 'Campus Student'})
                </div>
                <h1 style="color: #FFFFFF; font-size: 1.85rem; font-weight: 700; margin-bottom: 6px;">Campus Infrastructure & Facilities</h1>
                <p style="color: #94A3B8; font-size: 0.925rem; max-width: 560px;">
                  Report campus facility faults, Wi-Fi disturbances, or maintenance requests with automated triage and status tracking.
                </p>
              </div>

              <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                ${isStaffOrAdmin ? `
                  <a href="${role === 'admin' ? '#/admin' : '#/staff'}" class="btn btn-secondary btn-lg" style="background: rgba(255,255,255,0.15); color: #FFFFFF; border-color: rgba(255,255,255,0.3);">
                    ${role === 'admin' ? '🏛️ Admin Console' : '👨‍🔧 Staff Console'}
                  </a>
                  <button class="btn btn-outline btn-lg btn-signout" data-action="signout" style="background: rgba(239,68,68,0.2); color: #FCA5A5; border-color: rgba(239,68,68,0.4); display: inline-flex; align-items: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                ` : ''}
                <a href="#/complaints/new" class="btn btn-primary btn-lg">
                  Report an Issue
                </a>
                <a href="#/chatbot" class="btn btn-outline btn-lg" style="background: rgba(255,255,255,0.06); color: #FFFFFF; border-color: rgba(255,255,255,0.2); box-shadow: none;">
                  AI Assistant
                </a>
              </div>
            </div>
          </div>

          <!-- Stats Grid: Visible ONLY to Teachers and Admins -->
          ${isStaffOrAdmin ? `
            <div class="stats-grid">
              <div class="stat-card">
                <div>
                  <div class="stat-val">${complaints.length}</div>
                  <div class="stat-label">Total Campus Tickets</div>
                </div>
                <div class="stat-icon-wrap">📋</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: #D97706;">${activeCount}</div>
                  <div class="stat-label">Active / Under Triage</div>
                </div>
                <div class="stat-icon-wrap" style="background: #FEF3C7; color: #D97706;">⚙️</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: #059669;">${resolvedCount}</div>
                  <div class="stat-label">Resolved Issues</div>
                </div>
                <div class="stat-icon-wrap" style="background: #ECFDF5; color: #059669;">✓</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: var(--color-primary);">${myComplaints.length}</div>
                  <div class="stat-label">Submitted by You</div>
                </div>
                <div class="stat-icon-wrap" style="background: var(--color-bg-alt); color: var(--color-secondary);">👤</div>
              </div>
            </div>
          ` : ''}

          <!-- Filter Pills & Search Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 20px;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="tab-filters-container">
              ${['All', 'My Complaints', 'In Progress', 'Resolved', 'Critical'].map(tab => `
                <button class="role-pill-btn ${activeTab === tab ? 'active' : ''}" data-tab="${tab}" style="font-size: 0.825rem; padding: 6px 14px; background: ${activeTab === tab ? 'var(--color-primary)' : '#FFFFFF'}; color: ${activeTab === tab ? '#FFFFFF' : 'var(--color-text-muted)'}; border: 1px solid ${activeTab === tab ? 'var(--color-primary)' : 'var(--color-border)'};">
                  ${tab}
                </button>
              `).join('')}
            </div>

            <div style="position: relative; min-width: 260px;">
              <input type="text" id="dashboard-search-input" class="form-control" placeholder="Search tickets, location..." value="${searchQuery}" style="padding-left: 14px;">
            </div>
          </div>

          <!-- Complaints Feed List -->
          <div style="display: flex; flex-direction: column; gap: 14px;" id="complaints-list-feed">
            ${filtered.length === 0 ? `
              <div class="card" style="text-align: center; padding: 48px 20px;">
                <div style="font-size: 2.2rem; margin-bottom: 10px; color: var(--color-text-light);">🔍</div>
                <h3 style="color: var(--color-secondary); margin-bottom: 6px;">No complaints match this filter</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 16px;">Try switching tabs or report a new infrastructure issue.</p>
                <a href="#/complaints/new" class="btn btn-primary btn-sm">Report New Issue</a>
              </div>
            ` : filtered.map(c => {
              const hasUpvoted = c.upvotedBy && c.upvotedBy.includes(user.id);
              const statusClass = c.status.toLowerCase().replace(/\s+/g, '-');
              const priorityClass = c.priority.toLowerCase();

              return `
                <div class="card card-hoverable" style="padding: 20px;" data-complaint-id="${c.id}">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 260px;">
                      <!-- Header Badges -->
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                        <span class="badge badge-${statusClass}">● ${c.status}</span>
                        <span class="badge badge-${priorityClass}">${c.priority} Priority</span>
                        <span class="badge badge-category">${c.category}</span>
                        ${c.visibility === 'private' ? '<span class="badge" style="background:#F3E8FF;color:#6B21A8;border:1px solid #D8B4FE;">🔒 Private</span>' : ''}
                        ${c.audioUrl ? `<span class="badge" style="background: #EFF6FF; color: var(--color-primary); border: 1px solid #BFDBFE; font-size: 0.72rem;">🎙️ Audio</span>` : ''}
                        <span style="font-size: 0.75rem; color: var(--color-text-light); font-weight: 700;">#${c.id}</span>
                      </div>

                      <!-- Title & Location -->
                      <h3 style="font-size: 1.15rem; color: var(--color-secondary); margin-bottom: 6px;">
                        <a href="#/complaints/${c.id}" style="color: inherit; text-decoration: none;">${c.title}</a>
                      </h3>
                      
                      <div style="display: flex; align-items: center; gap: 12px; font-size: 0.825rem; color: var(--color-text-muted); margin-bottom: 12px; flex-wrap: wrap;">
                        <span>📍 <strong>${c.location}</strong> ${c.specificSpot ? `• ${c.specificSpot}` : ''}</span>
                        <span>🕒 Logged ${new Date(c.createdAt).toLocaleDateString()}</span>
                        ${c.assignedTo ? `<span style="color: #4F46E5;">👨‍🔧 Assigned: ${c.assignedTo.name}</span>` : ''}
                      </div>

                      <p style="font-size: 0.88rem; color: var(--color-text-main); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 14px;">
                        ${c.description}
                      </p>
                    </div>

                    <!-- Right Column: Upvote & Detail Action -->
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0;">
                      ${c.visibility === 'private' ? `
                        <span style="font-size:0.8rem;color:var(--color-text-muted);">🔒 Private to you and admins</span>
                      ` : `
                        <button class="upvote-btn ${hasUpvoted ? 'upvoted' : ''}" data-upvote-id="${c.id}">
                          <span>▲</span>
                          <span class="upvote-count">${c.upvotes || 0}</span>
                          <span>${hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                        </button>
                      `}

                      <a href="#/complaints/${c.id}" class="btn btn-outline btn-sm">
                        Track Status →
                      </a>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    onMount() {
      // Tab Filters
      document.querySelectorAll('#tab-filters-container button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeTab = e.currentTarget.getAttribute('data-tab');
          router.handleRoute();
        });
      });

      // Search Handler
      const searchInput = document.getElementById('dashboard-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          // Re-render complaints list without full page reload
          const feed = document.getElementById('complaints-list-feed');
          if (feed) {
            router.handleRoute();
          }
        });
      }

      // Upvote Action Handlers
      document.querySelectorAll('[data-upvote-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const complaintId = e.currentTarget.getAttribute('data-upvote-id');
          const countEl = btn.querySelector('.upvote-count');
          const isUpvoted = btn.classList.contains('upvoted');
          const currentVal = parseInt(countEl?.innerText || '0', 10);
          if (isUpvoted) {
            btn.classList.remove('upvoted');
            if (countEl) countEl.innerText = Math.max(0, currentVal - 1);
          } else {
            btn.classList.add('upvoted');
            if (countEl) countEl.innerText = currentVal + 1;
          }
          await api.upvoteComplaint(complaintId);
          router.handleRoute();
        });
      });
    }
  };
}
