/**
 * View: Student Dashboard
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';

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
        <div class="page-container dashboard-page">
          <!-- Welcome Banner & Quick Action CTA -->
          <div class="dashboard-hero">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px;">
              <div>
                <div class="dashboard-hero-badge">
                  Logged in as ${user.name} (${user.hostel || 'Campus Student'})
                </div>
                <h1>Campus Infrastructure & Facilities</h1>
                <p>
                  Report campus facility faults, Wi-Fi disturbances, or maintenance requests with automated triage and status tracking.
                </p>
              </div>

              <div class="dashboard-hero-actions">
                ${isStaffOrAdmin ? `
                  <a href="${role === 'admin' ? '#/admin' : '#/staff'}" class="btn btn-secondary btn-lg">
                    ${role === 'admin' ? '🏛️ Admin Console' : '👨‍🔧 Staff Console'}
                  </a>
                  <button class="btn btn-outline btn-lg btn-signout" data-action="signout" style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                ` : ''}
                <a href="#/complaints/new" class="btn btn-primary btn-lg">
                  Report an Issue
                </a>
                <a href="#/chatbot" class="btn btn-outline btn-lg">
                  AI Assistant
                </a>
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="dashboard-metrics">
            <div class="dashboard-stat-card">
              <div>
                <div class="stat-val">${complaints.length}</div>
                <div class="stat-label">Total Campus Tickets</div>
              </div>
              <div class="dashboard-stat-icon">📋</div>
            </div>

            <div class="dashboard-stat-card">
              <div>
                <div class="stat-val" style="color: #D97706;">${activeCount}</div>
                <div class="stat-label">Active / Under Triage</div>
              </div>
              <div class="dashboard-stat-icon" style="background: #FEF3C7; color: #D97706;">⚙️</div>
            </div>

            <div class="dashboard-stat-card">
              <div>
                <div class="stat-val" style="color: #059669;">${resolvedCount}</div>
                <div class="stat-label">Resolved Issues</div>
              </div>
              <div class="dashboard-stat-icon" style="background: #ECFDF5; color: #059669;">✓</div>
            </div>

            <div class="dashboard-stat-card">
              <div>
                <div class="stat-val" style="color: #2563EB;">${myComplaints.length}</div>
                <div class="stat-label">Submitted by You</div>
              </div>
              <div class="dashboard-stat-icon" style="background: #EFF6FF; color: #2563EB;">👤</div>
            </div>
          </div>

          <!-- Filter Pills & Search Bar -->
          <div class="dashboard-tabbar">
            <div class="dashboard-tabs" id="tab-filters-container">
              ${['All', 'My Complaints', 'In Progress', 'Resolved', 'Critical'].map(tab => `
                <button class="dashboard-role-pill ${activeTab === tab ? 'active' : ''}" data-tab="${tab}">
                  ${tab}
                </button>
              `).join('')}
            </div>

            <input type="text" id="dashboard-search-input" class="dashboard-search" placeholder="Search tickets, location..." value="${searchQuery}">
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
                <div class="dashboard-complaint-card card-hoverable" data-complaint-id="${c.id}">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 260px;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                        <span class="badge badge-${statusClass}">● ${c.status}</span>
                        <span class="badge badge-${priorityClass}">${c.priority} Priority</span>
                        <span class="badge badge-category">${c.category}</span>
                        ${c.visibility === 'private' ? '<span class="badge" style="background:#F3E8FF;color:#6B21A8;border:1px solid #D8B4FE;">🔒 Private</span>' : ''}
                        ${c.audioUrl ? `<span class="badge" style="background: #EFF6FF; color: var(--color-primary); border: 1px solid #BFDBFE; font-size: 0.72rem;">🎙️ Audio</span>` : ''}
                        <span style="font-size: 0.75rem; color: var(--color-text-light); font-weight: 700;">#${c.id}</span>
                      </div>

                      <h3>
                        <a href="#/complaints/${c.id}">${c.title}</a>
                      </h3>
                      
                      <div class="meta-row">
                        <span>📍 <strong>${c.location}</strong> ${c.specificSpot ? `• ${c.specificSpot}` : ''}</span>
                        <span>🕒 Logged ${new Date(c.createdAt).toLocaleDateString()}</span>
                        ${c.assignedTo ? `<span style="color: #4F46E5;">👨‍🔧 Assigned: ${c.assignedTo.name}</span>` : ''}
                      </div>

                      <p class="desc">${c.description}</p>
                    </div>

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

                      <div class="track-status">Track Status →</div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    async refresh() {
      const viewRoot = document.getElementById('view-root');
      if (!viewRoot) return;

      viewRoot.innerHTML = await this.render();
      this.onMount();
    },

    onMount() {
      // Tab Filters
      document.querySelectorAll('#tab-filters-container button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeTab = e.currentTarget.getAttribute('data-tab');
          this.refresh();
        });
      });

      // Search Handler
      const searchInput = document.getElementById('dashboard-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
          searchQuery = e.target.value;
          const cursorPosition = searchInput.selectionStart;
          await this.refresh();
          const refreshedSearch = document.getElementById('dashboard-search-input');
          refreshedSearch?.focus();
          if (refreshedSearch && cursorPosition !== null) {
            refreshedSearch.setSelectionRange(cursorPosition, cursorPosition);
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
          await this.refresh();
        });
      });
    }
  };
}
