/**
 * View: Admin Analytics & Predictive Recurring Issue Detection
 */
import { stateManager } from '../state.js';
import { api } from '../api.js';

export function createAdminAnalyticsView() {
  return {
    async render() {
      const state = stateManager.getState();
      const adminUser = state.currentUser || { name: 'Admin' };
      const analytics = await api.getAnalyticsData();

      const { summary, recurringIssues, categoryCounts } = analytics;

      return `
        <div class="admin-layout-container">
          <!-- Sidebar -->
          <aside class="sidebar">
            <div>
              <div class="sidebar-header">
                <div class="brand-logo" style="margin-bottom: 8px;">
                  <div class="brand-icon" style="width: 32px; height: 32px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                  </div>
                  <span class="brand-title" style="font-size: 1.15rem;">Uni<span>Verse</span></span>
                </div>
                <div class="sidebar-role-tag">Analytics Engine</div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 6px;">
                  ${adminUser.name}
                </div>
              </div>

              <ul class="sidebar-menu">
                <li>
                  <a href="#/admin" class="sidebar-link" data-route="/admin">
                    <span class="icon">📊</span> AI Queue Triage
                  </a>
                </li>
                <li>
                  <a href="#/admin/analytics" class="sidebar-link active" data-route="/admin/analytics">
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
              <button class="btn btn-outline btn-sm w-full" id="analytics-export-pdf-sidebar-btn">
                Export Audit PDF
              </button>
              <button class="btn btn-outline btn-sm w-full btn-signout" data-action="signout" id="analytics-sidebar-signout-btn" style="box-shadow: none; color: #DC2626; border-color: #FECACA; background: #FEF2F2; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </aside>

          <!-- Main Analytics Area -->
          <main class="admin-main-content">
            <div class="page-header">
              <div>
                <h1 class="page-title">Campus Infrastructure Analytics</h1>
                <p class="page-subtitle">Predictive maintenance alerts, failure recurrence clustering, and resolution performance</p>
              </div>

              <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn btn-primary btn-sm" id="analytics-export-pdf-btn">
                  Export Full PDF Report
                </button>
                <button class="btn btn-outline btn-sm btn-signout" data-action="signout" id="analytics-top-signout-btn" style="box-shadow: none; color: #DC2626; border-color: #FECACA; background: #FEF2F2; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            </div>

            <!-- KPI Metric Cards -->
            <div class="stats-grid">
              <div class="stat-card">
                <div>
                  <div class="stat-val">${summary.total}</div>
                  <div class="stat-label">Total Logged Cases</div>
                </div>
                <div class="stat-icon-wrap" style="background: var(--color-primary-light); color: var(--color-primary);">📋</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: #059669;">${summary.resolutionRate}%</div>
                  <div class="stat-label">Resolution SLA Rate</div>
                </div>
                <div class="stat-icon-wrap" style="background: #D1FAE5; color: #059669;">⚡</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: #D97706;">${summary.avgResolutionHours}h</div>
                  <div class="stat-label">Average Turnaround Time</div>
                </div>
                <div class="stat-icon-wrap" style="background: #FEF3C7; color: #D97706;">⏱️</div>
              </div>

              <div class="stat-card">
                <div>
                  <div class="stat-val" style="color: #DC2626;">${recurringIssues.length}</div>
                  <div class="stat-label">High-Risk Clusters Flagged</div>
                </div>
                <div class="stat-icon-wrap" style="background: #FEE2E2; color: #DC2626;">⚠️</div>
              </div>
            </div>

            <!-- PREDICTIVE RECURRING ISSUE DETECTION PANEL (Flagged for Preventive Maintenance) -->
            <div style="margin-bottom: 28px;">
              <h2 style="font-size: 1.3rem; color: var(--color-secondary); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                <span>🛡️</span> AI Recurring Issue Detector (Threshold ≥ 3 Incidents)
              </h2>

              ${recurringIssues.length === 0 ? `
                <div class="card" style="padding: 24px; text-align: center; color: var(--color-text-muted);">
                  ✅ No recurring failure clusters detected. Campus infrastructure is operating within standard tolerances.
                </div>
              ` : recurringIssues.map(cluster => `
                <div class="alert-recurring">
                  <div class="alert-recurring-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 1.5rem;">⚠️</span>
                      <div>
                        <h3 style="color: #991B1B; font-size: 1.15rem; margin: 0;">
                          ${cluster.location} — ${cluster.category}
                        </h3>
                        <div style="font-size: 0.8rem; color: #7F1D1D; font-weight: 600; margin-top: 2px;">
                          Pattern Detected: ${cluster.count} separate student complaints logged for this subsystem
                        </div>
                      </div>
                    </div>
                    <span class="alert-recurring-badge">Flagged for Preventive Maintenance</span>
                  </div>

                  <div style="background: rgba(255,255,255,0.85); border: 1.5px solid #FCA5A5; border-radius: var(--radius-md); padding: 14px; margin-top: 12px;">
                    <div style="font-weight: 800; font-size: 0.85rem; color: #991B1B; margin-bottom: 4px;">
                      🤖 AI Root-Cause Diagnostic & Recommendation:
                    </div>
                    <p style="font-size: 0.88rem; color: #7F1D1D; line-height: 1.4; margin-bottom: 10px;">
                      ${cluster.recommendation} Frequency indicates recurring component exhaustion rather than isolated wear.
                    </p>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      ${cluster.complaints.map(c => `
                        <a href="#/admin/complaints/${c.id}" class="badge" style="background: #FFFFFF; color: #991B1B; border-color: #F87171; text-transform: none;">
                          #${c.id}: ${c.title.substring(0, 24)}...
                        </a>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Visual Charts & Distribution Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
              
              <!-- Category Breakdown Bar Chart -->
              <div class="card">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 16px;">
                  📊 Complaints by Facility Category
                </h3>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                  ${Object.entries(categoryCounts).map(([cat, count]) => {
                    const pct = Math.round((count / summary.total) * 100);
                    return `
                      <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                          <span style="color: var(--color-secondary);">${cat}</span>
                          <span style="color: var(--color-primary);">${count} tickets (${pct}%)</span>
                        </div>
                        <div style="height: 10px; background: var(--color-bg-alt); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--color-border);">
                          <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-hover) 100%); border-radius: var(--radius-full);"></div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Status Pipeline Visual Distribution -->
              <div class="card">
                <h3 class="card-title" style="font-size: 1.1rem; margin-bottom: 16px;">
                  ⚙️ Resolution Pipeline Status
                </h3>

                <div style="display: flex; flex-direction: column; gap: 16px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                      <span style="color: #047857;">Resolved</span>
                      <span>${summary.resolved}</span>
                    </div>
                    <div style="height: 12px; background: var(--color-bg-alt); border-radius: var(--radius-full); overflow: hidden;">
                      <div style="height: 100%; width: ${Math.round((summary.resolved / summary.total) * 100)}%; background: #10B981;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                      <span style="color: #6D28D9;">Assigned / In Progress</span>
                      <span>${summary.inProgress}</span>
                    </div>
                    <div style="height: 12px; background: var(--color-bg-alt); border-radius: var(--radius-full); overflow: hidden;">
                      <div style="height: 100%; width: ${Math.round((summary.inProgress / summary.total) * 100)}%; background: #8B5CF6;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
                      <span style="color: #B45309;">Submitted / Acknowledging</span>
                      <span>${summary.pending}</span>
                    </div>
                    <div style="height: 12px; background: var(--color-bg-alt); border-radius: var(--radius-full); overflow: hidden;">
                      <div style="height: 100%; width: ${Math.round((summary.pending / summary.total) * 100)}%; background: #F59E0B;"></div>
                    </div>
                  </div>
                </div>

                <div style="margin-top: 24px; padding: 14px; background: var(--color-bg-alt); border-radius: var(--radius-md); border: 1.5px solid var(--color-border); font-size: 0.825rem; color: var(--color-text-muted);">
                  💡 <strong>Recommendation:</strong> Allocate 2 additional electrical engineers to Hostel Block B to eliminate the recurring AC compressor bottleneck.
                </div>
              </div>

            </div>
          </main>
        </div>
      `;
    },

    onMount() {
      const triggerPdf = async () => {
        const btn = document.getElementById('analytics-export-pdf-btn');
        if (btn) btn.innerHTML = '⏳ Generating PDF...';
        await api.exportReport();
        if (btn) btn.innerHTML = '📄 Export Full PDF Report';
      };

      document.getElementById('analytics-export-pdf-btn')?.addEventListener('click', triggerPdf);
      document.getElementById('analytics-export-pdf-sidebar-btn')?.addEventListener('click', triggerPdf);
    }
  };
}
