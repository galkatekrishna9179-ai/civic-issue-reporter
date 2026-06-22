// ---- Auth check ----
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'auth.html';
}

document.getElementById('user-greeting').textContent = `Hi, ${user.name} (${user.role})`;

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'auth.html';
});

// ---- Fetch and display issues ----
const issuesContainer = document.getElementById('issues-container');

async function loadIssues() {
  const response = await fetch('/issues');
  const issues = await response.json();

  issuesContainer.innerHTML = ''; // clear previous content

issues.forEach((issue, index) => {
    const card = document.createElement('div');
    card.className = 'issue-card';
    card.setAttribute('data-status', issue.status);

    const ticketNumber = String(index + 1).padStart(4, '0');

    card.innerHTML = `
      <div class="status-badge ${issue.status}">${issue.status}</div>
      <div class="ticket-id">#${ticketNumber}</div>
      <h3>${issue.title}</h3>
      <p>${issue.description}</p>
      <p><strong>Category:</strong> ${issue.category} &nbsp;·&nbsp; <strong>Location:</strong> ${issue.location}</p>
      ${user.role === 'admin' ? `
        <div class="card-actions">
          <button class="resolve-btn" data-id="${issue._id}">Mark Resolved</button>
          <button class="delete-btn" data-id="${issue._id}">Delete</button>
        </div>
      ` : ''}
    `;

    issuesContainer.appendChild(card);
  });

  // Attach event listeners for admin buttons (only exist if admin)
  document.querySelectorAll('.resolve-btn').forEach((btn) => {
    btn.addEventListener('click', () => updateStatus(btn.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteIssue(btn.dataset.id));
  });
}

// ---- Submit a new issue ----
const issueForm = document.getElementById('issue-form');

issueForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const location = document.getElementById('location').value;

  const response = await fetch('/issues', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, category, location })
  });

  if (response.ok) {
    issueForm.reset();
    loadIssues();
  } else {
    const data = await response.json();
    alert(data.error);
  }
});

// ---- Admin: mark resolved ----
async function updateStatus(id) {
  const response = await fetch(`/issues/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'Resolved' })
  });

  if (response.ok) {
    loadIssues();
  } else {
    const data = await response.json();
    alert(data.error);
  }
}

// ---- Admin: delete issue ----
async function deleteIssue(id) {
  const response = await fetch(`/issues/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    loadIssues();
  } else {
    const data = await response.json();
    alert(data.error);
  }
}

// ---- Initial load ----
loadIssues();

// ---- Category chip selection ----
const categoryChips = document.querySelectorAll('.category-chip');
const categoryInput = document.getElementById('category');

categoryChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    categoryChips.forEach((c) => c.classList.remove('selected'));
    chip.classList.add('selected');
    categoryInput.value = chip.dataset.category;
  });
});