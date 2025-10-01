const SUPABASE_URL = 'https://zseqmxgvusdlsllbanzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZXFteGd2dXNkbHNsbGJhbnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzMzNzcsImV4cCI6MjA3NDkwOTM3N30.xqnuGg59uno4XYjQO3k6nwrF24ozuK1p-krJVVE_0Qc';

const API_BASE = `${SUPABASE_URL}/functions/v1`;

document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initCategoryFilter();

  if (window.currentPostSlug) {
    initPostPage();
  }

  loadPostViews();
  calculateReadingTimes();
});

function initSearch() {
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  if (!searchToggle || !searchOverlay || !searchClose || !searchInput) return;

  searchToggle.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus();
  });

  searchClose.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    document.getElementById('searchResults').innerHTML = '';
  });

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      document.getElementById('searchResults').innerHTML = '';
    }
  });

  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
      document.getElementById('searchResults').innerHTML = '';
      return;
    }

    searchTimeout = setTimeout(() => performSearch(query), 300);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchOverlay.classList.add('active');
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      searchOverlay.classList.remove('active');
    }
  });
}

async function performSearch(query) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '<div class="loading-spinner">Searching...</div>';

  try {
    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      resultsContainer.innerHTML = data.results.map(result => {
        const url = `/${result.slug}/`;
        return `
          <a href="${url}" class="search-result-item">
            <div class="search-result-title">${escapeHtml(result.title)}</div>
            <div class="search-result-excerpt">${escapeHtml(result.excerpt)}</div>
          </a>
        `;
      }).join('');
    } else {
      resultsContainer.innerHTML = '<div class="loading-spinner">No results found</div>';
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = '<div class="loading-spinner">Search failed. Please try again.</div>';
  }
}

function initCategoryFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const postItems = document.querySelectorAll('.post-item');

  if (filterButtons.length === 0 || postItems.length === 0) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      postItems.forEach(item => {
        const itemCategories = item.getAttribute('data-categories') || '';

        if (category === 'all' || itemCategories.includes(category)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

async function initPostPage() {
  await incrementPostView(window.currentPostSlug);
  await loadComments(window.currentPostSlug);
  await loadRelatedPosts(window.currentPostSlug);
  initCommentForm();
}

async function incrementPostView(slug) {
  try {
    const response = await fetch(
      `${API_BASE}/post-views?slug=${encodeURIComponent(slug)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    updateViewCount(slug, data.view_count);
  } catch (error) {
    console.error('Error incrementing view:', error);
  }
}

async function loadPostViews() {
  const viewElements = document.querySelectorAll('.post-views[data-slug]');

  for (const element of viewElements) {
    const slug = element.getAttribute('data-slug');
    try {
      const response = await fetch(
        `${API_BASE}/post-views?slug=${encodeURIComponent(slug)}`,
        {
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      updateViewCount(slug, data.view_count);
    } catch (error) {
      console.error(`Error loading views for ${slug}:`, error);
      element.innerHTML = '';
    }
  }
}

function updateViewCount(slug, count) {
  const viewElements = document.querySelectorAll(`.post-views[data-slug="${slug}"]`);
  viewElements.forEach(element => {
    element.innerHTML = `${count} view${count !== 1 ? 's' : ''}`;
  });
}

function calculateReadingTimes() {
  const readingTimeElements = document.querySelectorAll('.post-reading-time');

  readingTimeElements.forEach(element => {
    const postContent = document.querySelector('.post-content');

    if (postContent) {
      const text = postContent.textContent || postContent.innerText;
      const wordCount = text.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      element.innerHTML = `${readingTime} min read`;
    } else {
      element.innerHTML = '5 min read';
    }
  });
}

async function loadComments(slug) {
  const commentsList = document.getElementById('commentsList');
  if (!commentsList) return;

  try {
    const response = await fetch(
      `${API_BASE}/comments?slug=${encodeURIComponent(slug)}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.comments && data.comments.length > 0) {
      commentsList.innerHTML = data.comments.map(comment => `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(comment.author_name)}</span>
            <span class="comment-date">${formatDate(comment.created_at)}</span>
          </div>
          <div class="comment-content">${escapeHtml(comment.content)}</div>
        </div>
      `).join('');
    } else {
      commentsList.innerHTML = '<div class="loading-spinner">No comments yet. Be the first to comment!</div>';
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsList.innerHTML = '<div class="loading-spinner">Failed to load comments</div>';
  }
}

function initCommentForm() {
  const commentForm = document.getElementById('commentForm');
  if (!commentForm) return;

  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = commentForm.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('commentMessage');

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    messageDiv.className = 'comment-message';
    messageDiv.style.display = 'none';

    const formData = {
      postSlug: window.currentPostSlug,
      authorName: document.getElementById('commentName').value,
      authorEmail: document.getElementById('commentEmail').value,
      content: document.getElementById('commentContent').value,
    };

    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.className = 'comment-message success';
        messageDiv.textContent = data.message;
        messageDiv.style.display = 'block';
        commentForm.reset();
      } else {
        messageDiv.className = 'comment-message error';
        messageDiv.textContent = data.error || 'Failed to submit comment';
        messageDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      messageDiv.className = 'comment-message error';
      messageDiv.textContent = 'Failed to submit comment. Please try again.';
      messageDiv.style.display = 'block';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Comment';
    }
  });
}

async function loadRelatedPosts(currentSlug) {
  const relatedPostsGrid = document.getElementById('relatedPostsGrid');
  if (!relatedPostsGrid) return;

  try {
    const categories = window.currentPostCategories || '';

    const response = await fetch(
      `${API_BASE}/search?q=${encodeURIComponent(categories.split(',')[0] || 'java')}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const related = data.results
        .filter(post => post.slug !== currentSlug)
        .slice(0, 3);

      if (related.length > 0) {
        relatedPostsGrid.innerHTML = related.map(post => `
          <a href="/${post.slug}/" class="related-post-card">
            <div class="related-post-title">${escapeHtml(post.title)}</div>
            <div class="related-post-date">${formatDate(post.created_at)}</div>
          </a>
        `).join('');
      } else {
        relatedPostsGrid.innerHTML = '<div class="loading-spinner">No related posts found</div>';
      }
    } else {
      relatedPostsGrid.innerHTML = '<div class="loading-spinner">No related posts found</div>';
    }
  } catch (error) {
    console.error('Error loading related posts:', error);
    relatedPostsGrid.innerHTML = '<div class="loading-spinner">Failed to load related posts</div>';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
