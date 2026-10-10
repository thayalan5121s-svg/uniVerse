/**
 * View: New Complaint Submission with AI Duplication Detection
 */
import { CATEGORIES, CAMPUS_LOCATIONS } from '../mockData.js';
import { api } from '../api.js';
import { router } from '../router.js';

export function createNewComplaintView() {
  let selectedCategory = CATEGORIES[0];
  let selectedLocation = CAMPUS_LOCATIONS[0];
  let inputMode = 'text'; // 'text' | 'photo' | 'voice'
  let isRecording = false;
  let voiceRecorded = false;
  let recordedAudioBlob = null;
  let recordedAudioDataUrl = null;
  let uploadedPhotoPreview = null;
  let duplicateMatches = [];

  return {
    render() {
      return `
        <div class="page-container" style="max-width: 820px;">
          <!-- Breadcrumbs -->
          <div class="breadcrumbs">
            <a href="#/dashboard">Dashboard</a>
            <span class="separator">/</span>
            <span class="current">New Complaint</span>
          </div>

          <div class="page-header" style="margin-bottom: 20px;">
            <div>
              <h1 class="page-title">Report a Campus Issue</h1>
              <p class="page-subtitle">AI-assisted categorization, triage, and duplicate prevention</p>
            </div>
            <a href="#/dashboard" class="btn btn-outline btn-sm">← Back to Dashboard</a>
          </div>

          <!-- Main Submission Form Card -->
          <div class="card" style="padding: 28px; border: 1px solid var(--color-border); box-shadow: var(--shadow-card);">
            <form id="new-complaint-form">
              
              <!-- 1. Category Selection Tiles -->
              <div class="form-group" style="margin-bottom: 24px;">
                <label class="form-label">
                  <span>1. Select Issue Category <span class="required">*</span></span>
                  <span style="font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500;">Dispatches to ${selectedCategory.department}</span>
                </label>
                <div class="category-grid" id="category-tiles-grid">
                  ${CATEGORIES.map(cat => `
                    <div class="category-tile ${selectedCategory.id === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
                      <div class="cat-icon">${cat.icon}</div>
                      <div class="cat-label">${cat.name}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- 2. Location & Zone Picker -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div class="form-group">
                  <label class="form-label">Campus Zone / Building <span class="required">*</span></label>
                  <select id="complaint-location-select" class="form-control" required>
                    ${CAMPUS_LOCATIONS.map(loc => `
                      <option value="${loc}" ${selectedLocation === loc ? 'selected' : ''}>${loc}</option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Specific Room / Landmark</label>
                  <input type="text" id="complaint-spot-input" class="form-control" placeholder="e.g. Room B-312, 2nd Floor Corridor, Washroom 4">
                </div>
              </div>

              <!-- LIVE AI DUPLICATE DETECTION BANNER -->
              <div id="duplicate-warning-container">
                <!-- Dynamically injected when duplicates detected -->
              </div>

              <!-- 3. Title -->
              <div class="form-group">
                <label class="form-label">Issue Summary / Title <span class="required">*</span></label>
                <input type="text" id="complaint-title-input" class="form-control" placeholder="e.g. Broken AC compressor unit blowing hot air" required>
              </div>

              <div class="form-group" style="margin: 18px 0;">
                <label class="form-label" for="complaint-visibility-select">Who can view this report?</label>
                <select id="complaint-visibility-select" class="form-control">
                  <option value="public" selected>Public — visible to campus users</option>
                  <option value="private">Private — visible only to you and admins</option>
                </select>
                <p id="complaint-visibility-help" style="font-size: 0.8rem; color: var(--color-text-muted); margin: 6px 0 0;">
                  Public reports can be seen and upvoted by other campus users.
                </p>
              </div>

              <!-- 4. Multi-Modal Input Tabs (Text / Photo / Voice) -->
              <div style="margin-bottom: 20px;">
                <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--color-border); padding-bottom: 8px; margin-bottom: 14px;">
                  <button type="button" class="role-pill-btn ${inputMode === 'text' ? 'active' : ''}" data-mode="text" style="background: ${inputMode === 'text' ? 'var(--color-primary)' : '#FFFFFF'}; color: ${inputMode === 'text' ? '#FFFFFF' : 'var(--color-text-muted)'}; border: 1px solid ${inputMode === 'text' ? 'var(--color-primary)' : 'var(--color-border)'};">
                    Detailed Text
                  </button>
                  <button type="button" class="role-pill-btn ${inputMode === 'photo' ? 'active' : ''}" data-mode="photo" style="background: ${inputMode === 'photo' ? 'var(--color-primary)' : '#FFFFFF'}; color: ${inputMode === 'photo' ? '#FFFFFF' : 'var(--color-text-muted)'}; border: 1px solid ${inputMode === 'photo' ? 'var(--color-primary)' : 'var(--color-border)'};">
                    Photo Attachment
                  </button>
                  <button type="button" class="role-pill-btn ${inputMode === 'voice' ? 'active' : ''}" data-mode="voice" style="background: ${inputMode === 'voice' ? 'var(--color-primary)' : '#FFFFFF'}; color: ${inputMode === 'voice' ? '#FFFFFF' : 'var(--color-text-muted)'}; border: 1px solid ${inputMode === 'voice' ? 'var(--color-primary)' : 'var(--color-border)'};">
                    Voice Note
                  </button>
                </div>

                <!-- Textarea Tab -->
                <div id="tab-text-content" style="display: ${inputMode === 'text' ? 'block' : 'none'};">
                  <div class="form-group">
                    <label class="form-label">Full Description <span class="required">*</span></label>
                    <textarea id="complaint-desc-input" class="form-control" placeholder="Describe the problem, duration, and operational impact..." required></textarea>
                  </div>
                </div>

                <!-- Photo Tab -->
                <div id="tab-photo-content" style="display: ${inputMode === 'photo' ? 'block' : 'none'};">
                  <div style="border: 1px dashed var(--color-border); border-radius: var(--radius-md); padding: 24px; text-align: center; background: var(--color-bg-alt);">
                    <div style="font-size: 1.8rem; margin-bottom: 8px;">📷</div>
                    <h4 style="color: var(--color-secondary); margin-bottom: 4px; font-weight: 600;">Upload Damage / Fault Photo</h4>
                    <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 12px;">Supports JPG, PNG (Max 10MB)</p>
                    <input type="file" id="photo-file-input" accept="image/*" style="display: none;">
                    <button type="button" class="btn btn-outline btn-sm" id="trigger-photo-upload-btn">Browse Photo</button>
                    
                    <div id="photo-preview-container" style="margin-top: 14px; display: none;">
                      <img id="photo-preview-img" src="" style="max-height: 160px; border-radius: var(--radius-md); border: 1px solid var(--color-border); box-shadow: var(--shadow-card);" alt="Attachment Preview">
                      <div style="margin-top: 6px;">
                        <button type="button" class="btn btn-danger btn-sm" id="remove-photo-btn" style="padding: 2px 8px; font-size: 0.75rem;">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voice Note Tab -->
                <div id="tab-voice-content" style="display: ${inputMode === 'voice' ? 'block' : 'none'};">
                  <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 24px; background: var(--color-bg-alt); text-align: center;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #EFF6FF; color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 10px;">
                      🎙️
                    </div>
                    <h4 style="color: var(--color-secondary); margin-bottom: 4px; font-weight: 600;">Record Voice Complaint</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 16px;">
                      Record a voice note describing the campus issue. Staff and technicians can listen to the audio playback.
                    </p>

                    <!-- Recording Indicator & Timer -->
                    <div id="recording-indicator-wrap" style="display: none; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px;">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #EF4444; animation: blink 1s infinite;"></span>
                      <span id="record-timer-display" style="font-weight: 700; color: #DC2626; font-size: 1rem; font-family: monospace;">00:00</span>
                      <span style="font-size: 0.825rem; color: #DC2626; font-weight: 500;">Recording audio...</span>
                    </div>

                    <!-- Record Controls -->
                    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                      <button type="button" class="btn btn-primary" id="toggle-record-btn">
                        🎙️ Start Voice Recording
                      </button>
                      <button type="button" class="btn btn-outline btn-sm" id="cancel-record-btn" style="display: none; color: #DC2626; border-color: #FECACA;">
                        Cancel
                      </button>
                    </div>

                    <!-- Audio Playback Preview Section -->
                    <div id="voice-playback-container" style="display: none; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--color-border);">
                      <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-secondary); margin-bottom: 8px;">
                        🎧 Audio Playback Preview
                      </div>
                      <audio id="voice-playback-audio" controls style="width: 100%; max-width: 460px; margin: 0 auto; display: block; border-radius: 8px;"></audio>
                      <div style="margin-top: 12px; display: flex; justify-content: center; gap: 10px;">
                        <button type="button" class="btn btn-outline btn-sm" id="rerecord-voice-btn">
                          🔄 Record Again
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" id="delete-voice-btn" style="color: #DC2626; border-color: #FECACA;">
                          🗑️ Remove Audio
                        </button>
                      </div>
                    </div>

                    <div id="voice-status-note" style="margin-top: 14px; font-size: 0.85rem; color: var(--color-text-muted);">
                      Click "Start Voice Recording" to capture audio from your microphone
                    </div>
                  </div>
                </div>
              </div>

              <!-- Emergency / Safety Hazard Checkbox -->
              <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
                <input type="checkbox" id="emergency-toggle" style="width: 18px; height: 18px; accent-color: #DC2626; cursor: pointer;">
                <div>
                  <label for="emergency-toggle" style="font-weight: 600; font-size: 0.9rem; color: #991B1B; cursor: pointer;">
                    Flag as Urgent Safety / Hazard Emergency
                  </label>
                  <p style="font-size: 0.775rem; color: #7F1D1D; margin: 0;">Applies critical priority weighting to notify facility duty officers immediately.</p>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
                <a href="#/dashboard" class="btn btn-outline">Cancel</a>
                <button type="submit" id="submit-complaint-btn" class="btn btn-primary btn-lg">
                  Submit & Queue for Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
    },

    onMount() {
      const checkDuplicates = async () => {
        const titleVal = document.getElementById('complaint-title-input')?.value || '';
        const res = await api.findDuplicates(selectedCategory.id, selectedLocation, titleVal);
        const container = document.getElementById('duplicate-warning-container');
        if (!container) return;

        if (res.duplicates && res.duplicates.length > 0) {
          duplicateMatches = res.duplicates;
          container.innerHTML = `
            <div class="duplicate-banner">
              <div class="duplicate-banner-header">
                <span>⚡ AI Duplicate Detection:</span>
                <span>${res.duplicates.length} Similar Open Issue(s) Found Nearby</span>
              </div>
              <p style="font-size: 0.85rem; color: #7C2D12; margin: 0;">
                Students have already logged a similar issue in this location. To speed up repair, you can upvote the existing ticket instead of creating a duplicate.
              </p>
              
              ${res.duplicates.map(d => `
                <div class="duplicate-item">
                  <div class="duplicate-item-info">
                    <div class="duplicate-item-title">#${d.id}: ${d.title}</div>
                    <div class="duplicate-item-meta">📍 ${d.location} • Status: <strong style="color: var(--color-primary);">${d.status}</strong> • Upvotes: ${d.upvotes || 0}</div>
                  </div>
                  <button type="button" class="btn btn-accent btn-sm" data-upvote-instead-id="${d.id}" style="box-shadow: 0 3px 0 #85A300;">
                    ▲ Upvote Instead (+1)
                  </button>
                </div>
              `).join('')}
            </div>
          `;

          // Attach click listeners for "Upvote Instead"
          container.querySelectorAll('[data-upvote-instead-id]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const targetId = e.currentTarget.getAttribute('data-upvote-instead-id');
              await api.upvoteComplaint(targetId);

              window.dispatchEvent(new CustomEvent('campuscare-toast', {
                detail: {
                  type: 'success',
                  title: 'Upvoted Existing Ticket!',
                  message: `Skipped duplicate ticket. Upvoted #${targetId} to increase priority.`
                }
              }));

              router.navigate(`/complaints/${targetId}`);
            });
          });

        } else {
          duplicateMatches = [];
          container.innerHTML = '';
        }
      };

      // Category Tile Click Handlers
      document.querySelectorAll('#category-tiles-grid .category-tile').forEach(tile => {
        tile.addEventListener('click', (e) => {
          const catId = e.currentTarget.getAttribute('data-cat-id');
          selectedCategory = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
          
          document.querySelectorAll('#category-tiles-grid .category-tile').forEach(t => t.classList.remove('active'));
          e.currentTarget.classList.add('active');
          checkDuplicates();
        });
      });

      // Location Select Handler
      const locSelect = document.getElementById('complaint-location-select');
      if (locSelect) {
        locSelect.addEventListener('change', (e) => {
          selectedLocation = e.target.value;
          checkDuplicates();
        });
      }

      // Title input duplicate checker
      const titleInput = document.getElementById('complaint-title-input');
      if (titleInput) {
        titleInput.addEventListener('input', () => {
          checkDuplicates();
        });
      }

      const visibilitySelect = document.getElementById('complaint-visibility-select');
      visibilitySelect?.addEventListener('change', () => {
        const help = document.getElementById('complaint-visibility-help');
        if (help) {
          help.textContent = visibilitySelect.value === 'private'
            ? 'Your private report is visible only to you and admins. Other students and staff cannot view it.'
            : 'Public reports can be seen and upvoted by other campus users.';
        }
      });

      // Input Mode Switchers (Text / Photo / Voice)
      document.querySelectorAll('[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          inputMode = e.currentTarget.getAttribute('data-mode');
          document.getElementById('tab-text-content').style.display = inputMode === 'text' ? 'block' : 'none';
          document.getElementById('tab-photo-content').style.display = inputMode === 'photo' ? 'block' : 'none';
          document.getElementById('tab-voice-content').style.display = inputMode === 'voice' ? 'block' : 'none';
          
          document.querySelectorAll('[data-mode]').forEach(b => {
            b.classList.remove('active');
            b.style.background = '#FFFFFF';
            b.style.color = 'var(--color-secondary)';
          });
          e.currentTarget.classList.add('active');
          e.currentTarget.style.background = 'var(--color-secondary)';
          e.currentTarget.style.color = '#FFFFFF';
        });
      });

      // Photo upload mock
      const photoFileInput = document.getElementById('photo-file-input');
      const triggerPhotoBtn = document.getElementById('trigger-photo-upload-btn');
      const previewContainer = document.getElementById('photo-preview-container');
      const previewImg = document.getElementById('photo-preview-img');
      const removePhotoBtn = document.getElementById('remove-photo-btn');

      triggerPhotoBtn?.addEventListener('click', () => photoFileInput?.click());
      
      photoFileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            uploadedPhotoPreview = evt.target.result;
            previewImg.src = uploadedPhotoPreview;
            previewContainer.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      });

      removePhotoBtn?.addEventListener('click', () => {
        uploadedPhotoPreview = null;
        if (photoFileInput) photoFileInput.value = '';
        previewContainer.style.display = 'none';
      });

      // Real Voice Recording & Playback
      let mediaRecorder = null;
      let audioChunks = [];
      let timerInterval = null;
      let secondsElapsed = 0;
      let speechRecognition = null;

      const recordBtn = document.getElementById('toggle-record-btn');
      const cancelRecordBtn = document.getElementById('cancel-record-btn');
      const voiceStatus = document.getElementById('voice-status-note');
      const recordingIndicator = document.getElementById('recording-indicator-wrap');
      const timerDisplay = document.getElementById('record-timer-display');
      const playbackContainer = document.getElementById('voice-playback-container');
      const playbackAudio = document.getElementById('voice-playback-audio');
      const rerecordBtn = document.getElementById('rerecord-voice-btn');
      const deleteVoiceBtn = document.getElementById('delete-voice-btn');

      // Initialize SpeechRecognition if available in browser
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          speechRecognition = new SpeechRecognition();
          speechRecognition.continuous = true;
          speechRecognition.interimResults = true;
          speechRecognition.onresult = (evt) => {
            let transcript = '';
            for (let i = evt.resultIndex; i < evt.results.length; ++i) {
              if (evt.results[i].isFinal) {
                transcript += evt.results[i][0].transcript;
              }
            }
            if (transcript.trim()) {
              const descInput = document.getElementById('complaint-desc-input');
              if (descInput) {
                if (!descInput.value.trim()) {
                  descInput.value = transcript.trim();
                } else if (!descInput.value.includes(transcript.trim())) {
                  descInput.value += `\n[Voice Note]: ${transcript.trim()}`;
                }
              }
            }
          };
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }

      const startVoiceRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (voiceStatus) {
            voiceStatus.innerText = 'Microphone access is not supported in this browser environment.';
            voiceStatus.style.color = '#DC2626';
          }
          return;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioChunks = [];

          let options = {};
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              options = { mimeType: 'audio/webm;codecs=opus' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
              options = { mimeType: 'audio/mp4' };
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
              options = { mimeType: 'audio/ogg' };
            }
          }

          mediaRecorder = new MediaRecorder(stream, options);

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());

            if (audioChunks.length > 0) {
              const mimeType = mediaRecorder.mimeType || 'audio/webm';
              recordedAudioBlob = new Blob(audioChunks, { type: mimeType });

              // Convert Blob to Base64 Data URL for persistent storage & playback
              const reader = new FileReader();
              reader.onloadend = () => {
                recordedAudioDataUrl = reader.result;
                if (playbackAudio) {
                  playbackAudio.src = recordedAudioDataUrl;
                }
              };
              reader.readAsDataURL(recordedAudioBlob);

              // Immediate preview using object URL
              const blobUrl = URL.createObjectURL(recordedAudioBlob);
              if (playbackAudio) {
                playbackAudio.src = blobUrl;
              }

              voiceRecorded = true;
              if (playbackContainer) playbackContainer.style.display = 'block';
              if (voiceStatus) {
                voiceStatus.innerText = 'Voice note recorded successfully! You can listen to the preview above.';
                voiceStatus.style.color = '#059669';
              }
              if (recordBtn) recordBtn.style.display = 'none';

              const descInput = document.getElementById('complaint-desc-input');
              if (descInput && !descInput.value.trim()) {
                descInput.value = 'Attached voice complaint note. Listen to audio recording for details.';
              }
            }
          };

          mediaRecorder.start(100);
          isRecording = true;
          secondsElapsed = 0;
          if (timerDisplay) timerDisplay.innerText = '00:00';
          if (recordingIndicator) recordingIndicator.style.display = 'flex';
          if (cancelRecordBtn) cancelRecordBtn.style.display = 'inline-block';
          if (playbackContainer) playbackContainer.style.display = 'none';
          if (recordBtn) {
            recordBtn.className = 'btn btn-danger';
            recordBtn.innerHTML = '⏹️ Stop Recording';
          }
          if (voiceStatus) {
            voiceStatus.innerText = 'Recording audio... Speak clearly into your microphone.';
            voiceStatus.style.color = '#DC2626';
          }

          if (speechRecognition) {
            try { speechRecognition.start(); } catch {}
          }

          clearInterval(timerInterval);
          timerInterval = setInterval(() => {
            secondsElapsed++;
            const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
            const secs = String(secondsElapsed % 60).padStart(2, '0');
            if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
          }, 1000);

        } catch (err) {
          console.error('Microphone error:', err);
          if (voiceStatus) {
            voiceStatus.innerText = `Microphone access denied: ${err.message || 'Permission denied'}. Please allow microphone permissions.`;
            voiceStatus.style.color = '#DC2626';
          }
        }
      };

      const stopVoiceRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        if (speechRecognition) {
          try { speechRecognition.stop(); } catch {}
        }
        clearInterval(timerInterval);
        isRecording = false;
        if (recordingIndicator) recordingIndicator.style.display = 'none';
        if (cancelRecordBtn) cancelRecordBtn.style.display = 'none';
        if (recordBtn) {
          recordBtn.className = 'btn btn-primary';
          recordBtn.innerHTML = '🎙️ Start Voice Recording';
        }
      };

      const resetVoiceRecording = () => {
        if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        if (speechRecognition) {
          try { speechRecognition.stop(); } catch {}
        }
        clearInterval(timerInterval);
        isRecording = false;
        voiceRecorded = false;
        audioChunks = [];
        recordedAudioBlob = null;
        recordedAudioDataUrl = null;

        if (playbackAudio) {
          playbackAudio.pause();
          playbackAudio.src = '';
        }
        if (recordingIndicator) recordingIndicator.style.display = 'none';
        if (cancelRecordBtn) cancelRecordBtn.style.display = 'none';
        if (playbackContainer) playbackContainer.style.display = 'none';
        if (recordBtn) {
          recordBtn.style.display = 'inline-block';
          recordBtn.className = 'btn btn-primary';
          recordBtn.innerHTML = '🎙️ Start Voice Recording';
        }
        if (voiceStatus) {
          voiceStatus.innerText = 'Click "Start Voice Recording" to capture audio from your microphone';
          voiceStatus.style.color = 'var(--color-text-muted)';
        }
      };

      recordBtn?.addEventListener('click', () => {
        if (!isRecording) {
          startVoiceRecording();
        } else {
          stopVoiceRecording();
        }
      });

      cancelRecordBtn?.addEventListener('click', resetVoiceRecording);
      deleteVoiceBtn?.addEventListener('click', resetVoiceRecording);
      rerecordBtn?.addEventListener('click', () => {
        resetVoiceRecording();
        startVoiceRecording();
      });

      // Form Submission
      document.getElementById('new-complaint-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-complaint-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Analyzing & Logging Ticket...';

        const title = document.getElementById('complaint-title-input').value.trim();
        const spot = document.getElementById('complaint-spot-input').value.trim();
        let description = document.getElementById('complaint-desc-input')?.value.trim() || '';
        if (voiceRecorded && !description) {
          description = 'Recorded audio complaint submitted via student voice note.';
        }
        const isEmergency = document.getElementById('emergency-toggle')?.checked;

        const payload = {
          title,
          categoryName: selectedCategory.name,
          categoryId: selectedCategory.id,
          location: selectedLocation,
          specificSpot: spot || selectedLocation,
          description: description || title,
          priority: isEmergency ? 'Critical' : 'Medium',
          visibility: document.getElementById('complaint-visibility-select')?.value === 'private' ? 'private' : 'public',
          photoUrl: uploadedPhotoPreview || (inputMode === 'photo' ? 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80' : null),
          audioUrl: recordedAudioDataUrl || null
        };

        let result;
        try {
          result = await api.createComplaint(payload);
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Submit & Queue for Triage';
          window.dispatchEvent(new CustomEvent('campuscare-toast', {
            detail: {
              type: 'error',
              title: 'Report Not Submitted',
              message: err.message || 'The report could not be saved. Please try again.'
            }
          }));
          return;
        }

        window.dispatchEvent(new CustomEvent('campuscare-toast', {
          detail: {
            type: 'success',
            title: 'Complaint Logged!',
            message: `Ticket #${result.data.id} has been created and queued for technician triage.`
          }
        }));

        // Redirect to detail page
        router.navigate(`/complaints/${result.data.id}`);
      });

      // Run initial duplicate check
      checkDuplicates();
    }
  };
}
