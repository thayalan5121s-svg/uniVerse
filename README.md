# ⚡ UniVerse — AI-Powered Smart Campus Complaint Management System

**UniVerse** is a production-quality, responsive single-page web application built with plain HTML, CSS, and modern JavaScript (no frameworks required). It streamlines campus infrastructure reporting, AI-driven prioritization, automated duplicate mitigation, conversational chatbot filing, and cross-department technician dispatch.

---

## 🎨 Design System & Palette

- **Primary (`--color-primary`)**: `#FF5733` (Electric Coral)
- **Secondary (`--color-secondary`)**: `#1E1B4B` (Deep Indigo)
- **Accent (`--color-accent`)**: `#D4FF00` (Electric Lime / Neon Yellow)
- **Background (`--color-bg`)**: `#FBF9F4` (Warm Cream)
- **Typography**: `Plus Jakarta Sans` (Headers & Display) + `Inter` (Body) via Google Fonts.
- **Micro-interactions**: Chunky tactile buttons with active press offsets, glowing status badges, toast notification queues, and confetti celebration effects.

---

## 🚀 Key Features Implemented

1. **AI Smart Prioritization Queue (`#/admin`)**:
   - Calculates a live priority score combining keyword urgency ($UrgencyKeywords$), wait time ($WaitHours$), upvote popularity ($Upvotes$), and subsystem hazard factor ($CategoryHazard$).
   - Dynamic sorting from highest urgency down with interactive factors breakdown tooltip and tier badges (`Critical`, `High`, `Medium`, `Low`).

2. **AI Duplicate Detection (`#/complaints/new`)**:
   - Compares selected category, location, and title against existing open campus complaints in real time.
   - Displays a glowing **"Similar complaints found nearby"** banner with an **"Upvote Instead (+1)"** action that boosts the existing ticket and avoids creating duplicates.

3. **CareBot Conversational AI Assistant (`#/chatbot`)**:
   - Step-by-step multi-turn wizard that prompts for Category $\rightarrow$ Campus Location $\rightarrow$ Description $\rightarrow$ Auto-generates the complaint and redirects to live tracking.
   - Instant keyword FAQ replies for Wi-Fi support, ticket status checks, and campus emergency hotlines.
   - Accessible via floating mascot button from every student page.

4. **Live Cross-Role Synchronized Status Tracking (`#/complaints/:id`)**:
   - Vertical timeline (`Submitted` $\rightarrow$ `Acknowledged` $\rightarrow$ `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`) with timestamps and actors.
   - Updates made in Admin or Staff views are immediately synchronized in shared `localStorage` state across all devices and views.

5. **Predictive Recurring Issue Detection (`#/admin/analytics`)**:
   - Automated scanner identifies any campus location + category cluster with $\ge 3$ complaints.
   - Displays high-contrast **"Flagged for Preventive Maintenance"** alert cards with root-cause diagnostics and recommendations.

6. **Hardcopy PDF Audit Report Export**:
   - Real downloadable PDF generated using `jsPDF` and `jspdf-autotable`, summarizing complaint KPIs, recurring failure clusters, and active ticket logs.

7. **Simulated Email Notifications**:
   - `sendEmailNotification()` dispatches toast/snackbar notifications whenever ticket statuses change or technicians are assigned.

8. **Role-Based Client Route Guarding**:
   - Prevents unauthorized access between Student, Admin, and Staff routes.
   - Includes a persistent **Demo Persona Switcher** for instant 1-click testing.

9. **Public & Private Reports**:
   - Students can choose public visibility for campus-wide viewing or private visibility for the submitter and admins only.
   - Supabase row-level security restricts private complaints and their activity timeline/comments; staff and other students cannot read them.
   - New self-registered accounts are students; staff/admin roles must be assigned by a trusted administrator.

---

## 📁 Project Structure

```
├── index.html                  # Main application entry point & CDN loaders
├── css/
│   ├── variables.css           # Theme colors, CSS custom properties, tokens
│   ├── components.css          # Tactile buttons, cards, badges, modal, timeline
│   ├── layout.css              # Navbars, sidebar, mobile bottom tab bar, grids
│   └── style.css               # Global stylesheet & table styling
├── js/
│   ├── mockData.js             # Realistic campus complaints, locations, users
│   ├── state.js                # Reactive shared state manager with localStorage
│   ├── api.js                  # Async Promise API layer (getComplaints, createComplaint, exportReport...)
│   ├── router.js               # Hash SPA router with route guards & lifecycle hooks
│   ├── app.js                  # App bootstrap, toast queue, floating mascot
│   └── views/
│       ├── landing.js          # Role selector & sign-in screen
│       ├── signup.js           # Student account registration
│       ├── dashboard.js        # Student home with filters, search, upvotes
│       ├── newComplaint.js     # Form with AI duplicate checker & voice/photo tabs
│       ├── complaintDetail.js  # Live tracking timeline & comments thread
│       ├── chatbot.js          # CareBot multi-turn submission assistant
│       ├── adminDashboard.js   # AI-prioritized queue & quick dispatch
│       ├── adminAnalytics.js   # Charts & recurring issues panel
│       ├── adminComplaintDetail.js # Admin triage & technician assignment
│       ├── staffDashboard.js   # Technician work order queue
│       └── staffComplaintDetail.js # Staff resolution workbench & proof notes
```

---

## 🏃 How to Run the App

For Supabase-backed authentication and privacy enforcement, run `schema.sql` in the Supabase SQL Editor when setting up or updating the database.

1. **Option A (Vite Dev Server)**:
   ```bash
   npm run dev
   ```
2. **Option B (Static Server / VS Code Live Server)**:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
3. **Option C (Direct File Open)**:
   Open `index.html` in any modern web browser.
