/**
 * CampusCare API Service Layer with Real Supabase Backend Queries
 * Supports plain fetch-style Supabase calls (.from().select(), .insert(), .update())
 * with graceful fallback to local state for offline demo mode.
 */
import { stateManager } from './state.js';
import { supabase } from './supabaseClient.js';

// Simulated network delay helper
const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * AI Smart Prioritization Scoring Algorithm
 */
export function calculatePriorityScore(complaint) {
  const URGENCY_KEYWORDS = [
    { word: 'hazard', weight: 40 },
    { word: 'fire', weight: 50 },
    { word: 'shock', weight: 45 },
    { word: 'danger', weight: 40 },
    { word: 'leakage', weight: 30 },
    { word: 'flooding', weight: 35 },
    { word: 'failure', weight: 25 },
    { word: 'broken', weight: 20 },
    { word: 'overheating', weight: 25 },
    { word: 'exam', weight: 30 },
    { word: 'slippery', weight: 25 },
    { word: 'outage', weight: 25 },
    { word: 'emergency', weight: 45 },
    { word: 'urgent', weight: 30 }
  ];

  let keywordScore = 0;
  const content = `${complaint.title || ''} ${complaint.description || ''}`.toLowerCase();
  
  URGENCY_KEYWORDS.forEach(kw => {
    if (content.includes(kw.word)) {
      keywordScore += kw.weight;
    }
  });

  const createdTime = new Date(complaint.createdAt || complaint.created_at || Date.now()).getTime();
  const now = Date.now();
  const waitHours = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
  const isResolved = complaint.status === 'Resolved';
  const waitScore = isResolved ? 0 : Math.min(40, waitHours * 1.5);

  const upvoteScore = Math.min(30, (complaint.upvotes || 0) * 4);

  let categoryBase = 10;
  const catId = complaint.categoryId || complaint.category_id;
  if (catId === 'security' || catId === 'plumbing') categoryBase = 25;
  if (catId === 'hvac' || catId === 'electrical') categoryBase = 20;

  const totalScore = Math.round(keywordScore + waitScore + upvoteScore + categoryBase);

  let tier = 'Low';
  let badgeClass = 'badge-low';
  if (totalScore >= 80) {
    tier = 'Critical';
    badgeClass = 'badge-critical';
  } else if (totalScore >= 50) {
    tier = 'High';
    badgeClass = 'badge-high';
  } else if (totalScore >= 30) {
    tier = 'Medium';
    badgeClass = 'badge-medium';
  }

  return {
    score: totalScore,
    tier,
    badgeClass,
    factors: {
      keywordScore,
      waitScore: Math.round(waitScore),
      upvoteScore,
      categoryBase
    }
  };
}

// Normalize Supabase DB Row to App Entity Format
function normalizeComplaintRow(row) {
  if (!row) return null;
  return {
    id: row.ticket_number || row.id,
    dbId: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    categoryId: row.category_id,
    location: row.location,
    specificSpot: row.specific_spot,
    visibility: row.visibility || 'public',
    status: row.status,
    priority: row.priority,
    upvotes: row.upvotes || 1,
    upvotedBy: row.upvoted_by || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedBy: row.profiles ? {
      id: row.profiles.id,
      name: row.profiles.name,
      email: row.profiles.email,
      rollNo: row.profiles.roll_no
    } : { name: 'Student', email: 'student@campus.edu' },
    assignedTo: row.assigned_profile ? {
      id: row.assigned_profile.id,
      name: row.assigned_profile.name,
      department: row.assigned_profile.department
    } : null,
    estimatedResolutionTime: row.estimated_resolution_time,
    photoUrl: row.photo_url,
    audioUrl: row.audio_url || null,
    resolutionProof: row.resolution_proof,
    timeline: (row.complaint_timeline || []).map(t => ({
      step: t.step,
      title: t.title,
      description: t.description,
      timestamp: t.timestamp,
      actor: t.actor
    })),
    comments: (row.complaint_comments || []).map(c => ({
      id: c.id,
      author: c.author_name,
      role: c.role,
      text: c.text,
      timestamp: c.created_at
    }))
  };
}

function findComplaintRow(id, columns) {
  const query = supabase.from('complaints').select(columns);
  return /^\d{4,}$/.test(id) || /^CMP-\d+$/i.test(id)
    ? query.eq('ticket_number', id).single()
    : query.eq('id', id).single();
}

export const api = {
  /**
   * Fetch all complaints with computed priority metadata from Supabase
   */
  async getComplaints(filter = {}) {
    const currentUser = stateManager.getState().currentUser;
    const currentRole = (stateManager.getState().currentRole || currentUser?.role || 'guest').toLowerCase();
    const canViewComplaint = complaint =>
      complaint.visibility !== 'private' ||
      currentRole === 'admin' ||
      (currentUser && (
        complaint.submittedBy?.id === currentUser.id ||
        (complaint.submittedBy?.email && complaint.submittedBy.email === currentUser.email)
      ));

    if (supabase) {
      try {
        let query = supabase
          .from('complaints')
          .select(`
            *,
            profiles:submitted_by(id, name, email, roll_no),
            assigned_profile:assigned_to(id, name, department),
            complaint_comments(*),
            complaint_timeline(*)
          `);

        if (filter.status && filter.status !== 'All') {
          query = query.eq('status', filter.status);
        }
        if (filter.category && filter.category !== 'All') {
          query = query.or(`category.eq.${filter.category},category_id.eq.${filter.category}`);
        }
        if (filter.location && filter.location !== 'All') {
          query = query.eq('location', filter.location);
        }
        if (filter.assignedTo) {
          query = query.eq('assigned_to', filter.assignedTo);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let complaints = data.map(row => normalizeComplaintRow(row));

          // Merge local state complaints and upvotes so local toggles/tickets are never wiped out
          const localComplaints = stateManager.getComplaints();
          const remoteIds = new Set(complaints.map(c => c.id).concat(complaints.map(c => c.dbId)));
          const localOnly = localComplaints.filter(l =>
            !remoteIds.has(l.id) && !remoteIds.has(l.dbId) && canViewComplaint(l)
          );

          complaints = complaints.map(c => {
            const local = localComplaints.find(l => l.id === c.id || l.dbId === c.id || l.id === c.dbId);
            if (local && Array.isArray(local.upvotedBy)) {
              return {
                ...c,
                upvotes: local.upvotes !== undefined ? local.upvotes : c.upvotes,
                upvotedBy: local.upvotedBy,
                audioUrl: local.audioUrl || c.audioUrl
              };
            }
            return c;
          });

          complaints = [...localOnly, ...complaints].filter(canViewComplaint);

          complaints = complaints.map(c => ({
            ...c,
            priorityMetrics: calculatePriorityScore(c)
          }));

          if (filter.sortByPriority) {
            complaints.sort((a, b) => b.priorityMetrics.score - a.priorityMetrics.score);
          } else {
            complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          }

          stateManager.setComplaints(complaints);
          return { success: true, data: complaints, count: complaints.length };
        }
      } catch (err) {
        console.warn('Supabase fetch error, using local state fallback:', err);
      }
    }

    // Local state fallback
    await delay();
    let complaints = [...stateManager.getComplaints()].filter(canViewComplaint);

    complaints = complaints.map(c => ({
      ...c,
      priorityMetrics: calculatePriorityScore(c)
    }));

    if (filter.status && filter.status !== 'All') {
      complaints = complaints.filter(c => c.status === filter.status);
    }
    if (filter.category && filter.category !== 'All') {
      complaints = complaints.filter(c => c.category === filter.category || c.categoryId === filter.category);
    }
    if (filter.location && filter.location !== 'All') {
      complaints = complaints.filter(c => c.location === filter.location);
    }
    if (filter.assignedTo) {
      complaints = complaints.filter(c => c.assignedTo && c.assignedTo.id === filter.assignedTo);
    }

    if (filter.sortByPriority) {
      complaints.sort((a, b) => b.priorityMetrics.score - a.priorityMetrics.score);
    } else {
      complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return { success: true, data: complaints, count: complaints.length };
  },

  /**
   * Get single complaint by ID
   */
  async getComplaintById(id) {
    const currentUser = stateManager.getState().currentUser;
    const currentRole = (stateManager.getState().currentRole || currentUser?.role || 'guest').toLowerCase();
    const canViewComplaint = complaint =>
      complaint.visibility !== 'private' ||
      currentRole === 'admin' ||
      (currentUser && (
        complaint.submittedBy?.id === currentUser.id ||
        (complaint.submittedBy?.email && complaint.submittedBy.email === currentUser.email)
      ));

    if (supabase) {
      try {
        const { data, error } = await findComplaintRow(id, `
            *,
            profiles:submitted_by(id, name, email, roll_no),
            assigned_profile:assigned_to(id, name, department),
            complaint_comments(*),
            complaint_timeline(*)
          `);

        if (error) throw error;
        if (!error && data) {
          const complaint = normalizeComplaintRow(data);
          return {
            success: true,
            data: {
              ...complaint,
              priorityMetrics: calculatePriorityScore(complaint)
            }
          };
        }
      } catch (err) {
        console.warn('Supabase fetch by ID error, falling back:', err);
      }
    }

    await delay();
    const complaint = stateManager.getComplaintById(id);
    if (!complaint || !canViewComplaint(complaint)) {
      throw new Error(`Complaint with ID ${id} not found.`);
    }
    return {
      success: true,
      data: {
        ...complaint,
        priorityMetrics: calculatePriorityScore(complaint)
      }
    };
  },

  /**
   * Create a new complaint in Supabase
   */
  async createComplaint(payload) {
    const currentUser = stateManager.getState().currentUser;
    const ticketNumber = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    let authUser = null;

    if (supabase) {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        authUser = data.user;

        if (!authUser) {
          throw new Error('Please sign in to your account before submitting a report.');
        }

        const { data: created, error } = await supabase
          .from('complaints')
          .insert([{
            ticket_number: ticketNumber,
            title: payload.title,
            description: payload.description,
            category: payload.categoryName || payload.category,
            category_id: payload.categoryId || 'electrical',
            location: payload.location,
            specific_spot: payload.specificSpot || 'Not specified',
            visibility: payload.visibility === 'private' ? 'private' : 'public',
            status: 'Submitted',
            priority: payload.priority || 'Medium',
            submitted_by: authUser.id,
            photo_url: payload.photoUrl || null,
            audio_url: payload.audioUrl || null,
            upvotes: 1,
            upvoted_by: [authUser.id]
          }])
          .select()
          .single();

        if (error) throw error;
        if (created) {
          // Add initial timeline entry
          await supabase.from('complaint_timeline').insert([{
            complaint_id: created.id,
            step: 'Submitted',
            title: 'Complaint Registered',
            description: 'Ticket initiated via student portal.',
            actor: currentUser?.name || authUser.user_metadata?.name || 'Student'
          }]);

          api.sendEmailNotification({
            to: currentUser?.email || authUser.email || 'student@campus.edu',
            subject: `UniVerse: Ticket #${ticketNumber} Logged Successfully`,
            message: `Your issue "${payload.title}" has been registered.`
          });

          return { success: true, data: { ...payload, id: ticketNumber } };
        }
        throw new Error('Supabase did not return the created complaint.');
      } catch (err) {
        console.error('Supabase complaint insert failed:', err);
        throw new Error(`Report could not be saved to Supabase: ${err.message || 'Unknown database error'}`);
      }
    }

    // Local state fallback
    await delay(250);
    const newComplaint = {
      id: ticketNumber,
      title: payload.title,
      category: payload.categoryName || payload.category,
      categoryId: payload.categoryId || 'electrical',
      location: payload.location,
      specificSpot: payload.specificSpot || 'Not specified',
      description: payload.description,
      visibility: payload.visibility === 'private' ? 'private' : 'public',
      submittedBy: {
        id: currentUser ? currentUser.id : 'anonymous',
        name: currentUser ? currentUser.name : 'Student',
        email: currentUser ? currentUser.email : 'student@campus.edu',
        rollNo: currentUser ? currentUser.rollNo : 'Student'
      },
      status: 'Submitted',
      priority: payload.priority || 'Medium',
      upvotes: 1,
      upvotedBy: [currentUser ? currentUser.id : 'anonymous'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null,
      photoUrl: payload.photoUrl || null,
      audioUrl: payload.audioUrl || null,
      timeline: [
        {
          step: 'Submitted',
          title: 'Complaint Registered',
          description: 'Ticket initiated via student portal.',
          timestamp: new Date().toISOString(),
          actor: currentUser ? currentUser.name : 'Student'
        }
      ],
      comments: []
    };

    stateManager.addComplaint(newComplaint);

    api.sendEmailNotification({
      to: newComplaint.submittedBy.email,
      subject: `UniVerse: Ticket #${newComplaint.id} Logged Successfully`,
      message: `Your issue "${newComplaint.title}" has been registered.`
    });

    return { success: true, data: newComplaint };
  },

  /**
   * Update complaint status in Supabase
   */
  async updateStatus(id, newStatus, note = '', actorName = 'Admin') {
    if (supabase) {
      const { data: ticket, error: ticketError } = await findComplaintRow(id, 'id, ticket_number, submitted_by');

      if (ticketError) throw new Error(`Could not load ticket ${id}: ${ticketError.message}`);

      const { data: updatedTicket, error: updateError } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(note ? { resolution_proof: note } : {}),
          ...(newStatus === 'Resolved' ? { resolved_at: new Date().toISOString() } : {})
        })
        .eq('id', ticket.id)
        .select('id')
        .single();

      if (updateError) {
        throw new Error(`Could not update ticket ${id}: ${updateError.message}`);
      }
      if (!updatedTicket) {
        throw new Error(`Ticket ${id} was not updated. Check the admin role and Supabase update policy.`);
      }

      const { error: timelineError } = await supabase.from('complaint_timeline').insert([{
        complaint_id: ticket.id,
        step: newStatus,
        title: `Status updated to ${newStatus}`,
        description: note || `Ticket marked as ${newStatus} by ${actorName}.`,
        actor: actorName
      }]);
      if (timelineError) {
        console.error('Ticket status saved but timeline update failed:', timelineError);
      }

      api.sendEmailNotification({
        to: 'student@campus.edu',
        subject: `[Update] Ticket #${id} is now ${newStatus}`,
        message: `Your complaint status has moved to: ${newStatus}. Note: ${note || 'Technician update.'}`
      });

      return { success: true, data: updatedTicket, timelineWarning: timelineError?.message };
    }

    // Local fallback
    await delay(200);
    const complaint = stateManager.getComplaintById(id);
    if (!complaint) throw new Error('Ticket not found');

    const timelineEntry = {
      step: newStatus,
      title: `Status updated to ${newStatus}`,
      description: note || `Ticket marked as ${newStatus} by ${actorName}.`,
      timestamp: new Date().toISOString(),
      actor: actorName
    };

    const updated = stateManager.updateComplaint(id, {
      status: newStatus,
      timeline: [...(complaint.timeline || []), timelineEntry],
      ...(note ? { resolutionProof: note } : {})
    });

    api.sendEmailNotification({
      to: complaint.submittedBy.email,
      subject: `[Update] Ticket #${complaint.id} is now ${newStatus}`,
      message: `Your campus complaint has moved to: ${newStatus}. Note: ${note || 'Technician update.'}`
    });

    return { success: true, data: updated };
  },

  /**
   * Assign ticket to technician in Supabase
   */
  async assignTechnician(id, staffUser, estimatedTime = 'Within 24 Hours') {
    if (supabase) {
      const { data: ticket, error: ticketError } = await findComplaintRow(id, 'id, status');

      if (ticketError) throw new Error(`Could not load ticket ${id}: ${ticketError.message}`);

      const nextStatus = ticket.status === 'Submitted' ? 'Assigned' : ticket.status;
      const { data: updatedTicket, error: updateError } = await supabase
        .from('complaints')
        .update({
          assigned_to: staffUser.id,
          status: nextStatus,
          estimated_resolution_time: estimatedTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)
        .select('id')
        .single();

      if (updateError) {
        throw new Error(`Could not assign ticket ${id}: ${updateError.message}`);
      }
      if (!updatedTicket) {
        throw new Error(`Ticket ${id} was not assigned. Check the admin role and Supabase update policy.`);
      }

      const { error: timelineError } = await supabase.from('complaint_timeline').insert([{
        complaint_id: ticket.id,
        step: 'Assigned',
        title: 'Technician Assigned',
        description: `Assigned to ${staffUser.name} (${staffUser.department}). ETA: ${estimatedTime}`,
        actor: 'Admin'
      }]);
      if (timelineError) {
        console.error('Technician assignment saved but timeline update failed:', timelineError);
      }

      return { success: true, data: updatedTicket, timelineWarning: timelineError?.message };
    }

    // Local fallback
    await delay(180);
    const complaint = stateManager.getComplaintById(id);
    if (!complaint) throw new Error('Ticket not found');

    const timelineEntry = {
      step: 'Assigned',
      title: 'Technician Assigned',
      description: `Assigned to ${staffUser.name} (${staffUser.department}). ETA: ${estimatedTime}`,
      timestamp: new Date().toISOString(),
      actor: 'Admin'
    };

    const updated = stateManager.updateComplaint(id, {
      assignedTo: { id: staffUser.id, name: staffUser.name, department: staffUser.department },
      status: complaint.status === 'Submitted' ? 'Assigned' : complaint.status,
      estimatedResolutionTime: estimatedTime,
      timeline: [...(complaint.timeline || []), timelineEntry]
    });

    return { success: true, data: updated };
  },

  /**
   * Toggle Upvote in StateManager and sync with Supabase
   */
  async upvoteComplaint(complaintId) {
    const currentUser = stateManager.getState().currentUser;
    const userId = (currentUser && currentUser.id) ? currentUser.id : 'usr_student_1';

    // 1. Immediately toggle in local state manager so UI is instantly responsive and persistent
    const updated = stateManager.toggleUpvote(complaintId, userId);

    // 2. Best-effort Supabase sync
    if (supabase && updated) {
      try {
        const { data: ticket } = await findComplaintRow(complaintId, 'id, upvotes, upvoted_by');

        if (ticket) {
          await supabase
            .from('complaints')
            .update({ upvotes: updated.upvotes, upvoted_by: updated.upvotedBy })
            .eq('id', ticket.id);
        }
      } catch (err) {
        console.warn('Supabase upvote sync error:', err);
      }
    }

    return { success: true, data: updated };
  },

  /**
   * AI Duplicate Detection Engine
   */
  async findDuplicates(categoryId, location, titleQuery = '') {
    const res = await api.getComplaints();
    const complaints = (res.data || []).filter(c =>
      c.visibility !== 'private' && c.status !== 'Resolved' && c.status !== 'Rejected'
    );

    const duplicates = complaints.filter(c => {
      const sameLocation = c.location && location && c.location.toLowerCase().includes(location.toLowerCase());
      const sameCategory = c.categoryId === categoryId || (c.category && categoryId && c.category.toLowerCase().includes(categoryId.toLowerCase()));

      if (sameLocation && sameCategory) return true;

      if (titleQuery && titleQuery.length > 5) {
        const words = titleQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchCount = words.filter(w => c.title.toLowerCase().includes(w)).length;
        if (matchCount >= 2 && sameLocation) return true;
      }
      return false;
    });

    return {
      success: true,
      duplicates: duplicates.slice(0, 3)
    };
  },

  /**
   * Simulated Email Notification Service
   */
  sendEmailNotification({ to, subject, message }) {
    console.log(`%c[SIMULATED EMAIL DISPATCH] To: ${to} | Subject: ${subject}`, 'color: #D4FF00; background: #1E1B4B; padding: 4px 8px; font-weight: bold;');

    const event = new CustomEvent('campuscare-email-sent', {
      detail: { to, subject, message, timestamp: new Date().toLocaleTimeString() }
    });
    window.dispatchEvent(event);
  },

  /**
   * Analytics & Recurring Issues Scanner
   */
  async getAnalyticsData() {
    const res = await api.getComplaints();
    const complaints = res.data || [];

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Acknowledged').length;

    const clusterMap = {};
    complaints.forEach(c => {
      const key = `${c.location}__${c.category}`;
      if (!clusterMap[key]) {
        clusterMap[key] = { location: c.location, category: c.category, count: 0, complaints: [] };
      }
      clusterMap[key].count += 1;
      clusterMap[key].complaints.push(c);
    });

    const recurringIssues = Object.values(clusterMap)
      .filter(item => item.count >= 3)
      .map(item => ({
        ...item,
        riskScore: item.count >= 4 ? 'Critical' : 'High',
        recommendation: `Preventive overhaul recommended: Replace primary distribution hardware at ${item.location}.`
      }));

    const categoryCounts = {};
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    return {
      summary: {
        total,
        resolved,
        inProgress,
        pending,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgResolutionHours: 18.5
      },
      recurringIssues,
      categoryCounts
    };
  },

  /**
   * Generate Real PDF Report via jsPDF
   */
  async exportReport() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert('jsPDF library loading... please try in a moment.');
      return false;
    }

    const doc = new jsPDF();
    const res = await api.getComplaints();
    const complaints = res.data || [];
    const analytics = await api.getAnalyticsData();

    doc.setFillColor(30, 27, 75);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(212, 255, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('UNIVERSE - AI SMART COMPLAINT AUDIT REPORT', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleString()} | Facility Operations & Estate Management`, 14, 26);

    doc.setFillColor(251, 249, 244);
    doc.roundedRect(14, 38, 182, 24, 3, 3, 'F');
    doc.setDrawColor(232, 226, 213);
    doc.roundedRect(14, 38, 182, 24, 3, 3, 'S');

    doc.setTextColor(30, 27, 75);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Tickets: ${analytics.summary.total}`, 22, 50);
    doc.text(`Resolved: ${analytics.summary.resolved} (${analytics.summary.resolutionRate}%)`, 68, 50);
    doc.text(`Active/In Progress: ${analytics.summary.inProgress}`, 120, 50);
    doc.text(`Pending: ${analytics.summary.pending}`, 165, 50);

    let startY = 70;
    if (analytics.recurringIssues.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('⚠️ AI PREDICTIVE ALERT: RECURRING ISSUE CLUSTERS (>= 3 Incidents)', 14, startY);

      analytics.recurringIssues.forEach((issue, idx) => {
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(`• [${issue.riskScore.toUpperCase()}] ${issue.location} - ${issue.category} (${issue.count} reported cases). Action: ${issue.recommendation}`, 14, startY + 8 + (idx * 6));
      });
      startY += 16 + (analytics.recurringIssues.length * 6);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 27, 75);
    doc.text('Active Campus Complaints Log', 14, startY);

    const tableRows = complaints.map(c => {
      const p = calculatePriorityScore(c);
      return [
        c.id,
        (c.title || '').substring(0, 36) + ((c.title || '').length > 36 ? '...' : ''),
        c.category,
        c.location,
        c.status,
        `${p.tier} (${p.score})`,
        `${c.upvotes || 0} ▲`
      ];
    });

    if (doc.autoTable) {
      doc.autoTable({
        startY: startY + 4,
        head: [['ID', 'Title', 'Category', 'Location', 'Status', 'AI Priority', 'Votes']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 246, 240] }
      });
    }

    doc.save(`UniVerse-Complaint-Report-${Date.now()}.pdf`);
    return true;
  }
};
