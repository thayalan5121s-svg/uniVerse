/**
 * View: CareBot Conversational AI Screen
 * Multi-turn complaint creation wizard + Instant FAQ resolver
 */
import { CATEGORIES, CAMPUS_LOCATIONS } from '../mockData.js';
import { api } from '../api.js';
import { stateManager } from '../state.js';
import { router } from '../router.js';

export function createChatbotView() {
  // Conversational state machine
  // step: 'greeting' | 'ask_category' | 'ask_location' | 'ask_description' | 'confirm_submission' | 'done'
  let conversationState = {
    step: 'greeting',
    draft: {
      category: '',
      categoryId: '',
      location: '',
      description: '',
      title: ''
    }
  };

  const messages = [
    {
      sender: 'bot',
      text: "👋 Hi there! I'm **UniVerse AI**, your 24/7 Campus Assistant. I can help you report an issue step-by-step or check the status of your existing complaints.",
      options: ['➕ Report an Issue', '📊 Check My Ticket Status', '📶 Wi-Fi Support Info', '🚨 Campus Emergency Contacts']
    }
  ];

  return {
    render() {
      return `
        <div class="page-container" style="max-width: 760px;">
          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <a href="#/dashboard">Dashboard</a>
            <span class="separator">/</span>
            <span class="current">UniVerse AI Assistant</span>
          </div>

          <div class="card" style="padding: 0; overflow: hidden; height: calc(100vh - 200px); min-height: 540px; display: flex; flex-direction: column; border: 1px solid var(--color-border); box-shadow: var(--shadow-card);">
            
            <!-- Chat Header -->
            <div style="background: #0F172A; color: #FFFFFF; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1E293B;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                  💬
                </div>
                <div>
                  <h3 style="color: #FFFFFF; font-size: 1.05rem; font-weight: 600; margin: 0;">UniVerse Support Assistant</h3>
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #94A3B8;">
                    <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10B981;"></span>
                    Automated Facility Support
                  </div>
                </div>
              </div>

              <button class="btn btn-outline btn-sm" id="reset-chat-btn" style="background: rgba(255,255,255,0.08); color: #FFFFFF; border-color: rgba(255,255,255,0.2); font-size: 0.75rem;">
                Restart Chat
              </button>
            </div>

            <!-- Messages Log Area -->
            <div id="chat-messages-container" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; background: var(--color-bg);">
              ${messages.map(msg => renderMessage(msg)).join('')}
            </div>

            <!-- Chat Input Area -->
            <div style="padding: 14px 20px; background: #FFFFFF; border-top: 1px solid var(--color-border);">
              <form id="chat-input-form" style="display: flex; gap: 10px;">
                <input type="text" id="chat-user-input" class="form-control" placeholder="Type your inquiry or select an option above..." autocomplete="off" required>
                <button type="submit" class="btn btn-primary" id="chat-send-btn" style="flex-shrink: 0; padding: 9px 18px;">
                  Send
                </button>
              </form>
            </div>

          </div>
        </div>
      `;
    },

    onMount() {
      const container = document.getElementById('chat-messages-container');
      const inputForm = document.getElementById('chat-input-form');
      const inputField = document.getElementById('chat-user-input');
      const resetBtn = document.getElementById('reset-chat-btn');

      const scrollToBottom = () => {
        if (container) container.scrollTop = container.scrollHeight;
      };

      const appendMessage = (msg) => {
        messages.push(msg);
        if (container) {
          container.insertAdjacentHTML('beforeend', renderMessage(msg));
          scrollToBottom();
          attachOptionListeners();
        }
      };

      const handleUserResponse = async (userText) => {
        appendMessage({ sender: 'user', text: userText });
        if (inputField) inputField.value = '';

        const lower = userText.toLowerCase().trim();

        // 1. FAQ keywords
        if (lower.includes('status') || lower.includes('check ticket') || lower.includes('my ticket')) {
          const user = stateManager.getState().currentUser;
          const userComplaints = stateManager.getComplaints().filter(c => c.submittedBy?.email === user.email);
          
          if (userComplaints.length === 0) {
            appendMessage({
              sender: 'bot',
              text: `You currently have no active tickets logged under ${user.email}. Would you like to submit one?`,
              options: ['➕ Report an Issue', '🏠 Back to Dashboard']
            });
          } else {
            const latest = userComplaints[0];
            appendMessage({
              sender: 'bot',
              text: `Here is your latest ticket status:\n\n📌 **Ticket #${latest.id}**: *"${latest.title}"*\n📍 Location: ${latest.location}\n📊 Status: **${latest.status}**\n👨‍🔧 Assigned: ${latest.assignedTo ? latest.assignedTo.name : 'Pending Assignment'}`,
              options: [`🔗 View #${latest.id} Details`, '➕ Report Another Issue']
            });
          }
          return;
        }

        if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('internet')) {
          appendMessage({
            sender: 'bot',
            text: "📶 **Campus Wi-Fi Helpdesk:**\n• SSID: `Campus_Student_5G`\n• Support Ext: 2404 / it.support@campus.edu\n• If you are experiencing dead zones or router drops, I can log a ticket for the network team.",
            options: ['➕ Report Wi-Fi Issue', '📊 Check My Ticket Status']
          });
          return;
        }

        if (lower.includes('emergency') || lower.includes('contact') || lower.includes('ambulance') || lower.includes('security')) {
          appendMessage({
            sender: 'bot',
            text: "🚨 **24/7 Campus Emergency Hotlines:**\n• Chief Security Officer: `+91 98765 00100`\n• Campus Health Centre / Ambulance: `+91 98765 00108`\n• Women's Safety Cell: `+91 98765 00109`\n• Hostel Chief Warden: `+91 98765 00102`",
            options: ['➕ Report Urgent Hazard', '🏠 Dashboard']
          });
          return;
        }

        // 2. Multi-turn step-by-step complaint creation wizard
        if (conversationState.step === 'greeting' || lower.includes('report') || lower.includes('issue')) {
          conversationState.step = 'ask_category';
          appendMessage({
            sender: 'bot',
            text: "Great! Let's get this fixed quickly. **Step 1/3:** What type of issue are you facing?",
            options: CATEGORIES.map(c => `${c.icon} ${c.name}`)
          });
          return;
        }

        if (conversationState.step === 'ask_category') {
          const matchedCat = CATEGORIES.find(c => lower.includes(c.id) || lower.includes(c.name.toLowerCase()) || userText.includes(c.icon)) || CATEGORIES[0];
          conversationState.draft.category = matchedCat.name;
          conversationState.draft.categoryId = matchedCat.id;
          conversationState.step = 'ask_location';

          appendMessage({
            sender: 'bot',
            text: `Got it: **${matchedCat.name}**. Now **Step 2/3:** Where is this located on campus?`,
            options: CAMPUS_LOCATIONS.slice(0, 6)
          });
          return;
        }

        if (conversationState.step === 'ask_location') {
          conversationState.draft.location = userText.replace(/^[📍\s]+/u, '');
          conversationState.step = 'ask_description';

          appendMessage({
            sender: 'bot',
            text: `Location noted: **${conversationState.draft.location}**.\n\nFinally **Step 3/3:** Please briefly describe the issue (e.g. *Broken AC unit making noise in Room 204*, *Water leaking in corridor*, etc.)`
          });
          return;
        }

        if (conversationState.step === 'ask_description') {
          conversationState.draft.description = userText;
          conversationState.draft.title = userText.length > 55 ? userText.substring(0, 52) + '...' : userText;
          conversationState.step = 'confirm_submission';

          appendMessage({
            sender: 'bot',
            text: `📋 **Ready to submit this ticket!**\n\n• **Category:** ${conversationState.draft.category}\n• **Location:** ${conversationState.draft.location}\n• **Summary:** ${conversationState.draft.title}\n\nShall I create this ticket now?`,
            options: ['✅ Yes, Submit Ticket', '❌ Cancel']
          });
          return;
        }

        if (conversationState.step === 'confirm_submission') {
          if (lower.includes('yes') || lower.includes('submit') || lower.includes('✅')) {
            // Call API to create complaint
            const res = await api.createComplaint({
              title: conversationState.draft.title,
              categoryName: conversationState.draft.category,
              categoryId: conversationState.draft.categoryId,
              location: conversationState.draft.location,
              description: conversationState.draft.description
            });

            conversationState.step = 'done';

            appendMessage({
              sender: 'bot',
              text: `🎉 **Ticket #${res.data.id} Created Successfully!**\n\nOur AI triage has categorized this and notified the ${conversationState.draft.category} department. You can track live updates anytime.`,
              options: [`🔗 Open Ticket #${res.data.id}`, '➕ Report Another Issue', '🏠 Dashboard']
            });
            return;
          } else {
            conversationState.step = 'greeting';
            appendMessage({
              sender: 'bot',
              text: 'Submission cancelled. How else can I assist you?',
              options: ['➕ Report an Issue', '📊 Check My Ticket Status']
            });
            return;
          }
        }

        // Generic fallback response
        appendMessage({
          sender: 'bot',
          text: `I understood: "${userText}". Would you like to file this as a formal complaint or check status?`,
          options: ['➕ File Complaint', '📊 Check Status', '🚨 Emergency Contacts']
        });
      };

      const attachOptionListeners = () => {
        document.querySelectorAll('.chat-option-pill').forEach(pill => {
          pill.onclick = (e) => {
            const optText = e.currentTarget.innerText.trim();
            if (optText.startsWith('🔗 Open Ticket #') || optText.startsWith('🔗 View #')) {
              const ticketId = optText.match(/CMP-\d+/)?.[0];
              if (ticketId) router.navigate(`/complaints/${ticketId}`);
            } else if (optText === '🏠 Dashboard' || optText === '🏠 Back to Dashboard') {
              router.navigate('/dashboard');
            } else {
              handleUserResponse(optText);
            }
          };
        });
      };

      inputForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = inputField?.value.trim();
        if (val) {
          handleUserResponse(val);
        }
      });

      resetBtn?.addEventListener('click', () => {
        conversationState = {
          step: 'greeting',
          draft: { category: '', categoryId: '', location: '', description: '', title: '' }
        };
        messages.length = 0;
        messages.push({
          sender: 'bot',
          text: "👋 Hi there! I'm **CareBot**, your 24/7 AI Campus Assistant. How can I help you today?",
          options: ['➕ Report an Issue', '📊 Check My Ticket Status', '📶 Wi-Fi Support Info']
        });
        if (container) {
          container.innerHTML = messages.map(msg => renderMessage(msg)).join('');
          attachOptionListeners();
        }
      });

      attachOptionListeners();
      scrollToBottom();
    }
  };
}

function renderMessage(msg) {
  const isBot = msg.sender === 'bot';
  // Formats simple bold markdown (**text** or \n)
  let formatted = msg.text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.06); padding: 2px 5px; border-radius: 4px;">$1</code>')
    .replace(/\n/g, '<br>');

  return `
    <div style="display: flex; gap: 10px; align-self: ${isBot ? 'flex-start' : 'flex-end'}; max-width: 82%;">
      ${isBot ? `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); border: 1px solid rgba(37, 99, 235, 0.2); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0;">
          💬
        </div>
      ` : ''}

      <div>
        <div style="background: ${isBot ? '#FFFFFF' : 'var(--color-primary)'}; color: ${isBot ? 'var(--color-text-main)' : '#FFFFFF'}; border: 1px solid ${isBot ? 'var(--color-border)' : 'transparent'}; border-radius: var(--radius-lg); padding: 12px 16px; box-shadow: var(--shadow-subtle); font-size: 0.9rem; line-height: 1.5;">
          ${formatted}
        </div>

        ${isBot && msg.options && msg.options.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
            ${msg.options.map(opt => `
              <button type="button" class="chat-option-pill" style="background: #FFFFFF; border: 1px solid var(--color-border); color: var(--color-primary); padding: 5px 12px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 500; cursor: pointer; box-shadow: var(--shadow-subtle); transition: all 0.15s ease;">
                ${opt}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
