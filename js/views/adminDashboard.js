/**
 * View: Admin Dashboard with AI Prioritized Queue
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';
import { CATEGORIES } from '../mockData.js';
import { router } from '../router.js';

export function createAdminDashboardView() {
  let statusFilter = 'All';
  let categoryFilter = 'All';
  let searchQuery = '';
  let sortBy = 'priority'; // 'priority' | 'date' | 'upvotes'

  return {
    async render() {
      const state = stateManager.getState();
      const adminUser = state.currentUser || { name: 'Admin', designation: 'Chief Estate Officer' };
      const staffList = state.users.filter(u => u.role === 'staff');

      const res = await api.getComplaints({
        status: statusFilter,
        category: categoryFilter,
        sortByPriority: sortBy === 'priority'
      });

      let complaints = res?.data || [];

      // Search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        complaints = complaints.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        );
      }

      if (sortBy === 'date') {
        complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'upvotes') {
        complaints.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      }

      const totalActive = complaints.filter(c => c.status !== 'Resolved').length;
      const criticalCount = complaints.filter(c => c.priorityMetrics?.tier === 'Critical').length;
      const highCount = complaints.filter(c => c.priorityMetrics?.tier === 'High').length;
      const totalTickets = complaints.length;
      const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

      return `
        <div class="admin-layout-container">
          <!-- Left Sidebar -->
          <aside class="sidebar">
            <div>
              <div class="sidebar-header">
                <div class="brand-logo" style="margin-bottom: 8px;">
                  <div class="brand-icon" style="width: 32px; height: 32px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                  </div>
                  <span class="brand-title" style="font-size: 1.15rem;">Uni<span>Verse</span></span>
                </div>
                <div class="sidebar-role-tag">Admin Console</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 6px;">
                  ${adminUser.name}
                </div>
              </div>

              <ul class="sidebar-menu">
                <li>
                  <a href="#/admin" class="sidebar-link active" data-route="/admin">
                    <span class="icon">📊</span> AI Queue Triage
                  </a>
                </li>
                <li>
                  <a href="#/admin/analytics" class="sidebar-link" data-route="/admin/analytics">
                    <span class="icon">📈</span> Predictive Analytics
                  </a>
                </li>
                <li>
                  <a href="#/dashboard" class="sidebar-link">
                    <span class="icon">🎓</span> Student View
                  </a>
                </li>
              </ul>
            </div>

            <div style="padding-top: 16px; border-top: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 8px;">
              <button class="btn btn-outline btn-sm w-full" id="admin-export-pdf-sidebar-btn" style="box-shadow: none;">
                Export PDF Audit
              </button>
              <button class="btn btn-outline btn-sm w-full btn-signout" data-action="signout" id="admin-sidebar-signout-btn" style="box-shadow: none; color: #DC2626; border-color: #FECACA; background: #FEF2F2; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </aside>

          <!-- Main Admin Content Area -->
          <main class="admin-main-content">
            <div class="page-header">
              <div>
                <h1 class="page-title">AI-Prioritized Complaint Queue</h1>
                <p class="page-subtitle">
                  Sorted dynamically by Urgency Keywords + Wait Duration + Student Upvote Impact
                </p>
              </div>

              <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <button class="btn btn-primary btn-sm" id="admin-export-report-btn">
                  Export PDF Report
                </button>
                <a href="#/admin/analytics" class="btn btn-secondary btn-sm">
                  View Recurring Issues
                </a>
                <button class="btn btn-outline btn-sm btn-signout" data-action="signout" id="admin-top-signout-btn" style="box-shadow: none; color: #DC2626; border-color: #FECACA; background: #FEF2F2; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            </div>

            <!-- 4 Priority & Overview Columns (Visible to Admins & Teachers) -->
            <div class="stats-grid" style="margin-bottom: 24px;">
              <div class="stat-card">
                <div>
                  <div class="stat-val">${totalTickets}</div>
                  <div class="stat-label">Total Campus Tickets</div>
                </div>
                <div class="stat-icon-wrap">📋</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: #D97706;">${totalActive}</div>
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

              <div class="stat-card" style="border-left: 4px solid var(--priority-critical);">
                <div>
                  <div class="stat-val" style="color: var(--priority-critical);">${criticalCount}</div>
                  <div class="stat-label">Critical Priority (Flagged)</div>
                </div>
                <div class="stat-icon-wrap" style="background: #FEF2F2; color: #DC2626;">🚨</div>
              </div>
            </div>

            <!-- Filters & Sort Bar -->
            <div class="card" style="padding: 16px; margin-bottom: 20px; background: #FFFFFF;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
                
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); display: block; margin-bottom: 2px;">STATUS</label>
                    <select id="admin-status-filter" class="form-control" style="padding: 6px 12px; font-size: 0.85rem; width: auto; min-width: 130px;">
                      <option value="All" ${statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                      <option value="Submitted" ${statusFilter === 'Submitted' ? 'selected' : ''}>Submitted</option>
                      <option value="Acknowledged" ${statusFilter === 'Acknowledged' ? 'selected' : ''}>Acknowledged</option>
                      <option value="Assigned" ${statusFilter === 'Assigned' ? 'selected' : ''}>Assigned</option>
                      <option value="In Progress" ${statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                      <option value="Resolved" ${statusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); display: block; margin-bottom: 2px;">CATEGORY</label>
                    <select id="admin-category-filter" class="form-control" style="padding: 6px 12px; font-size: 0.85rem; width: auto; min-width: 150px;">
                      <option value="All">All Categories</option>
                      ${CATEGORIES.map(c => `
                        <option value="${c.name}" ${categoryFilter === c.name ? 'selected' : ''}>${c.icon} ${c.name}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); display: block; margin-bottom: 2px;">SORT BY</label>
                    <select id="admin-sort-select" class="form-control" style="padding: 6px 12px; font-size: 0.85rem; width: auto; font-weight: 700; color: var(--color-primary);">
                      <option value="priority" ${sortBy === 'priority' ? 'selected' : ''}>⚡ AI Priority Score (High → Low)</option>
                      <option value="upvotes" ${sortBy === 'upvotes' ? 'selected' : ''}>▲ Student Upvotes</option>
                      <option value="date" ${sortBy === 'date' ? 'selected' : ''}>🕒 Submission Time</option>
                    </select>
                  </div>
                </div>

                <div style="min-width: 240px;">
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); display: block; margin-bottom: 2px;">SEARCH QUEUE</label>
                  <input type="text" id="admin-search-input" class="form-control" placeholder="Search ticket #, title..." value="${searchQuery}" style="padding: 6px 12px; font-size: 0.85rem;">
                </div>

              </div>
            </div>

            <!-- Queue Table with AI Prioritization Score Badges -->
            <div class="table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>AI Priority Score</th>
                    <th>Issue Summary & Location</th>
                    <th>Status</th>
                    <th>Upvotes</th>
                    <th>Assign Technician</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${complaints.length === 0 ? `
                    <tr>
                      <td colspan="7" style="text-align: center; padding: 32px; color: var(--color-text-muted);">
                        No complaints match your active filter criteria.
                      </td>
                    </tr>
                  ` : complaints.map(c => {
                    const p = c.priorityMetrics || { tier: 'Medium', score: 50, badgeClass: 'badge-medium', factors: { keywordScore: 0, waitScore: 0, upvoteScore: 0, categoryBase: 0 } };
                    const factors = p.factors || { keywordScore: 0, waitScore: 0, upvoteScore: 0, categoryBase: 0 };
                    const statusClass = (c.status || 'Submitted').toLowerCase().replace(/\s+/g, '-');

                    return `
                      <tr>
                        <!-- Ticket ID -->
                        <td>
                          <a href="#/admin/complaints/${c.id}" style="font-weight: 800; color: var(--color-secondary);">
                            #${c.id}
                          </a>
                          <div style="font-size: 0.7rem; color: var(--color-text-light);">${new Date(c.createdAt || Date.now()).toLocaleDateString()}</div>
                        </td>

                        <!-- AI Priority Badge with score breakdown -->
                        <td>
                          <span class="badge ${p.badgeClass || 'badge-medium'}" title="Score factors: Keywords (${factors.keywordScore || 0}) + Wait (${factors.waitScore || 0}) + Upvotes (${factors.upvoteScore || 0}) + Hazard (${factors.categoryBase || 0})">
                            ${p.tier || 'Medium'} • ${p.score || 50} pts
                          </span>
                        </td>

                        <!-- Issue Details -->
                        <td>
                          <div style="font-weight: 700; color: var(--color-secondary); margin-bottom: 2px;">
                            <a href="#/admin/complaints/${c.id}" style="color: inherit;">${c.title}</a>
                          </div>
                          <div style="font-size: 0.785rem; color: var(--color-text-muted);">
                            📍 <strong>${c.location}</strong> • <span class="badge badge-category" style="padding: 2px 6px; font-size: 0.7rem;">${c.category}</span>
                            ${c.visibility === 'private' ? '<span class="badge" style="background:#F3E8FF;color:#6B21A8;border:1px solid #D8B4FE;padding:2px 6px;font-size:0.7rem;">🔒 Private</span>' : ''}
                          </div>
                        </td>

                        <!-- Status Badge -->
                        <td>
                          <span class="badge badge-${statusClass}">
                            ● ${c.status}
                          </span>
                        </td>

                        <!-- Upvotes -->
                        <td>
                          <span style="font-weight: 800; font-size: 0.9rem; color: var(--color-secondary);">
                            ▲ ${c.upvotes || 0}
                          </span>
                        </td>

                        <!-- Quick Assign Technician Dropdown -->
                        <td>
                          <select class="form-control quick-assign-dropdown" data-complaint-id="${c.id}" style="padding: 4px 8px; font-size: 0.8rem; width: auto;">
                            <option value="">${c.assignedTo ? `👨‍🔧 ${c.assignedTo.name}` : '⚡ Quick Assign...'}</option>
                            ${staffList.map(s => `
                              <option value="${s.id}" ${c.assignedTo?.id === s.id ? 'selected' : ''}>
                                ${s.name} (${s.department.split('&')[0]})
                              </option>
                            `).join('')}
                          </select>
                        </td>

                        <!-- Actions -->
                        <td>
                          <a href="#/admin/complaints/${c.id}" class="btn btn-outline btn-sm" style="padding: 4px 10px; font-size: 0.785rem;">
                            Triage →
                          </a>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

          </main>
        </div>
      `;
    },

    onMount() {
      // PDF Export Handlers
      const triggerPdf = async () => {
        const btn = document.getElementById('admin-export-report-btn');
        if (btn) btn.innerHTML = '⏳ Generating PDF...';
        await api.exportReport();
        if (btn) btn.innerHTML = '📄 Export PDF Report';
      };

      document.getElementById('admin-export-report-btn')?.addEventListener('click', triggerPdf);
      document.getElementById('admin-export-pdf-sidebar-btn')?.addEventListener('click', triggerPdf);

      // Filters
      document.getElementById('admin-status-filter')?.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        router.handleRoute();
      });

      document.getElementById('admin-category-filter')?.addEventListener('change', (e) => {
        categoryFilter = e.target.value;
        router.handleRoute();
      });

      document.getElementById('admin-sort-select')?.addEventListener('change', (e) => {
        sortBy = e.target.value;
        router.handleRoute();
      });

      document.getElementById('admin-search-input')?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        router.handleRoute();
      });

      // Quick Assign Dropdown Handlers
      document.querySelectorAll('.quick-assign-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', async (e) => {
          const complaintId = e.currentTarget.getAttribute('data-complaint-id');
          const staffId = e.target.value;
          const dropdownElement = e.currentTarget;
          if (!staffId) return;

          const staff = stateManager.getState().users.find(u => u.id === staffId);
          if (staff) {
            try {
              const result = await api.assignTechnician(complaintId, staff);
              window.dispatchEvent(new CustomEvent('campuscare-toast', {
                detail: {
                  type: result.timelineWarning ? 'warning' : 'success',
                  title: result.timelineWarning ? 'Assigned; Timeline Failed' : 'Technician Assigned',
                  message: result.timelineWarning
                    ? `Assigned #${complaintId}, but its activity log failed: ${result.timelineWarning}`
                    : `Assigned #${complaintId} to ${staff.name}.`
                }
              }));
              router.handleRoute();
            } catch (err) {
              console.error('Quick technician assignment failed:', err);
              window.dispatchEvent(new CustomEvent('campuscare-toast', {
                detail: {
                  type: 'error',
                  title: 'Assignment Failed',
                  message: err.message || 'Could not assign this ticket. Check your admin access and try again.'
                }
              }));
              dropdownElement.value = '';
            }
          }
        });
      });
    }
  };
}
