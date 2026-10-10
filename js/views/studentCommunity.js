/**
 * Student-only campus community for questions, help, and event posts.
 */
import { api } from '../api.js';
import { stateManager } from '../state.js';

const COMMUNITY_TAGS = ['Help', 'Doubt', 'Events/Hackathon', 'Something else'];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

export function createStudentCommunityView() {
  let posts = [];
  let loading = false;

  const renderPosts = () => {
    const userId = stateManager.getState().currentUser?.id;
    if (!posts.length) {
      return '<div class="card" style="text-align:center;padding:36px 20px;color:var(--color-text-muted);">No posts yet. Start the conversation!</div>';
    }

    return posts.map(post => {
      const upvoted = (post.upvoted_by || []).includes(userId);
      const author = post.author?.name || 'Student';
      const date = new Date(post.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      return `
        <article class="card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;">
            <div>
              <span class="badge badge-category">${escapeHtml(post.tag)}</span>
              <h2 style="font-size:1.1rem;margin:10px 0 6px;color:var(--color-secondary);">${escapeHtml(post.title)}</h2>
              <p style="white-space:pre-wrap;line-height:1.55;margin:0 0 14px;">${escapeHtml(post.body)}</p>
              <small style="color:var(--color-text-muted);">Posted by ${escapeHtml(author)} · ${escapeHtml(date)}</small>
            </div>
            <button type="button" class="upvote-btn ${upvoted ? 'upvoted' : ''}" data-community-upvote="${escapeHtml(post.id)}" aria-pressed="${upvoted}">
              <span>▲</span><span>${Number(post.upvotes) || 0}</span><span>${upvoted ? 'Upvoted' : 'Upvote'}</span>
            </button>
          </div>
        </article>
      `;
    }).join('');
  };

  const showMessage = (type, title, message) => {
    window.dispatchEvent(new CustomEvent('campuscare-toast', { detail: { type, title, message } }));
  };

  return {
    async render() {
      loading = true;
      try {
        posts = await api.getStudentCommunityPosts();
      } finally {
        loading = false;
      }
      const user = stateManager.getState().currentUser;
      return `
        <div class="page-container" style="max-width:900px;">
          <div class="page-header">
            <div>
              <h1 class="page-title">Student Community</h1>
              <p class="page-subtitle">Ask for help, share a doubt, or post campus events with fellow students.</p>
            </div>
          </div>
          <div class="card" style="padding:22px;margin-bottom:20px;">
            <form id="community-post-form">
              <div class="form-group">
                <label class="form-label" for="community-post-title">Post title</label>
                <input id="community-post-title" name="title" class="form-control" maxlength="120" required placeholder="What would you like to share?">
              </div>
              <div class="form-group">
                <label class="form-label" for="community-post-body">Details</label>
                <textarea id="community-post-body" name="body" class="form-control" maxlength="3000" required placeholder="Write your post..." style="min-height:120px;"></textarea>
              </div>
              <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
                <div class="form-group" style="flex:1;min-width:220px;margin-bottom:0;">
                  <label class="form-label" for="community-post-tag">Tag</label>
                  <select id="community-post-tag" name="tag" class="form-control" required>
                    ${COMMUNITY_TAGS.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join('')}
                  </select>
                </div>
                <button id="community-submit-btn" type="submit" class="btn btn-primary">Publish post</button>
              </div>
              <p style="font-size:.8rem;color:var(--color-text-muted);margin:12px 0 0;">Only signed-in student accounts can read or publish community posts.</p>
            </form>
          </div>
          <div id="community-posts" style="display:flex;flex-direction:column;gap:14px;" aria-live="polite">
            ${loading ? '<div class="card" style="padding:24px;">Loading posts…</div>' : renderPosts()}
          </div>
        </div>
      `;
    },

    onMount() {
      document.getElementById('community-post-form')?.addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const button = document.getElementById('community-submit-btn');
        const formData = new FormData(form);
        button.disabled = true;
        try {
          await api.createStudentCommunityPost({
            title: formData.get('title'),
            body: formData.get('body'),
            tag: formData.get('tag')
          });
          form.reset();
          posts = await api.getStudentCommunityPosts();
          document.getElementById('community-posts').innerHTML = renderPosts();
          showMessage('success', 'Post published', 'Your post is now visible to students.');
        } catch (error) {
          showMessage('error', 'Could not publish post', error.message);
        } finally {
          button.disabled = false;
        }
      });

      document.getElementById('community-posts')?.addEventListener('click', async event => {
        const button = event.target.closest('[data-community-upvote]');
        if (!button) return;
        button.disabled = true;
        try {
          await api.toggleStudentCommunityUpvote(button.getAttribute('data-community-upvote'));
          posts = await api.getStudentCommunityPosts();
          document.getElementById('community-posts').innerHTML = renderPosts();
        } catch (error) {
          showMessage('error', 'Could not update upvote', error.message);
          button.disabled = false;
        }
      });
    }
  };
}
