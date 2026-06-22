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

// ---- Detect live location ----
const detectLocationBtn = document.getElementById('detect-location-btn');
const locationInput = document.getElementById('location');

detectLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  detectLocationBtn.textContent = 'Detecting...';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        locationInput.value = data.display_name || `${latitude}, ${longitude}`;
      } catch (err) {
        locationInput.value = `${latitude}, ${longitude}`;
      }

      detectLocationBtn.textContent = '📍 Use my location';
    },
    (error) => {
      alert('Could not detect location: ' + error.message);
      detectLocationBtn.textContent = '📍 Use my location';
    }
  );
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
      ${issue.imageUrl ? `<img src="${issue.imageUrl}" class="issue-photo" alt="${issue.title}">` : ''}
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
  const imageFile = document.getElementById('image').files[0];
  console.log('DEBUG:', { title, description, category, location, imageFile });

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  formData.append('location', location);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch('/issues', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
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

// ---- Custom file upload UI ----
const uploadArea = document.getElementById('upload-area');
const imageInput = document.getElementById('image');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

uploadPlaceholder.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
      uploadPlaceholder.classList.add('hidden');
      removeImageBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
});

removeImageBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  imageInput.value = '';
  imagePreview.classList.add('hidden');
  uploadPlaceholder.classList.remove('hidden');
  removeImageBtn.classList.add('hidden');
});