// Manually add admin credentials
const admin = { username: 'admin', password: 'pass' };
localStorage.setItem('admin', JSON.stringify(admin));

// Function to show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    // Hide after 3 seconds
    setTimeout(function () {
        notification.classList.remove('show');
    }, 3000);
}

// Function to hide an element by ID
function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'none';
    } else {
        console.error(`Element with ID ${id} not found.`);
    }
}

// Function to show an element by ID
function showElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = 'block';
    } else {
        console.error(`Element with ID ${id} not found.`);
    }
}

// Show login form when login button is clicked
document.getElementById('login-btn').addEventListener('click', function () {
    hideElement('homepage');
    showElement('login-form');
});

// Show signup form when signup button is clicked
document.getElementById('signup-btn').addEventListener('click', function () {
    hideElement('homepage');
    showElement('signup-form');
});

// Go back to home page from signup form
document.getElementById('back-to-home').addEventListener('click', function () {
    hideElement('signup-form');
    showElement('homepage');
});

// Go back to home page from login form
document.getElementById('back-to-home-from-login').addEventListener('click', function () {
    hideElement('login-form');
    showElement('homepage');
});

// Handle sign-up
document.getElementById('signup').addEventListener('submit', function (event) {
    event.preventDefault();

    const newUsername = document.getElementById('signup-username').value;
    const newPassword = document.getElementById('signup-password').value;
    const newRole = document.getElementById('signup-role').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Prevent creation of admin accounts
    if (newRole === 'admin') {
        showNotification('You cannot create an admin account.');
        return;
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === newUsername);
    if (existingUser) {
        showNotification('Username already exists.');
        return;
    }

    // Add new user to the users array
    users.push({ username: newUsername, password: newPassword, role: newRole });
    localStorage.setItem('users', JSON.stringify(users));

    showNotification('Signup successful! You can now log in.');

    // Go back to homepage after signup
    hideElement('signup-form');
    showElement('homepage');
    if (newRole !== 'student' && newRole !== 'employer') {
        showNotification('Invalid role selected.');
        return;
    }
});

// Handle login
document.getElementById('login').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const storedAdmin = JSON.parse(localStorage.getItem('admin')) || { username: 'admin', password: 'adminpass' };
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    console.log('Entered username:', username);
    console.log('Entered password:', password);
    console.log('Found user:', user);

    // Admin login
    if (username === storedAdmin.username && password === storedAdmin.password) {
        const adminUser = { username: 'admin', role: 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        console.log('Admin logged in:', adminUser);
        showNotification('Welcome, Admin!');
        hideElement('login-form');
        showElement('admin-dashboard');
        loadPendingJobs(); // Load pending jobs for admin approval
        return;
    }

    // Regular user login
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('User logged in:', user);
        showNotification(`Welcome back, ${user.username}!`);
        hideElement('login-form');

        if (user.role === 'student') {
            initializeStudentDashboard();
        } else if (user.role === 'employer') {
            initializeEmployerDashboard();
        }
    } else {
        console.error('Login failed: Invalid username or password.');
        showNotification('Invalid username or password.');
    }
});

// Dashboard Functions
function initializeStudentDashboard() {
    showElement('student-dashboard');
    displayApprovedJobs(); // Display jobs
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', displayApprovedJobs); // Add category filter
    }
}

function initializeEmployerDashboard() {
    showElement('employer-dashboard');
    displayEmployerJobs(); // Display employer's job postings
    displayApplications(); // Display applications
    initializeApplicationSorting(); // Initialize sorting for applications
}

function initializeApplicationSorting() {
    const sortButton = document.getElementById('sort-applications-btn'); // Add a "Sort Applications" button in the dashboard
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const applications = JSON.parse(localStorage.getItem('applications')) || [];
            const employerApplications = applications.filter(app => app.employer === currentUser.username);

            // Sort by interested/not interested
            employerApplications.sort((a, b) => {
                if (a.status === 'interested' && b.status !== 'interested') return -1;
                if (a.status !== 'interested' && b.status === 'interested') return 1;
                return 0;
            });

            localStorage.setItem('applications', JSON.stringify(applications));
            displayApplications(); // Refresh the view
        });
    }
}

// Show the job posting modal
document.getElementById('open-post-job-modal').addEventListener('click', function () {
    const modal = document.getElementById('post-job-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Post job modal not found.');
    }
});

// Close the modal when clicking the close button
document.getElementById('close-post-job-modal').addEventListener('click', function () {
    document.getElementById('post-job-modal').style.display = 'none';
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', function (event) {
    const modal = document.getElementById('post-job-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle job posting submission
document.getElementById('post-job').addEventListener('submit', function (event) {
    event.preventDefault();

    const jobTitle = document.getElementById('job-title').value;
    const jobDescription = document.getElementById('job-description').value;
    const jobCategory = document.getElementById('job-category').value;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const employerUsername = currentUser.username;

    let pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];
    pendingJobs.push({
        id: Date.now(),
        title: jobTitle,
        description: jobDescription,
        category: jobCategory,
        employer: employerUsername,
        approved: false,
    });

    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    alert('Job submitted for admin approval.');
    document.getElementById('post-job').reset();
    document.getElementById('post-job-modal').style.display = 'none';
});

// Function to load pending jobs for admin approval
function loadPendingJobs() {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];
    const pendingJobsContainer = document.getElementById('pending-postings');
    pendingJobsContainer.innerHTML = ''; // Clear existing content

    if (pendingJobs.length === 0) {
        pendingJobsContainer.innerHTML = '<p>No pending jobs for review.</p>';
        return;
    }

    pendingJobs.forEach((job, index) => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job-posting');
        jobDiv.innerHTML = `
            <h4>${job.title}</h4>
            <p>${job.description}</p>
            <button onclick="approveJob(${index})">Approve</button>
            <button onclick="rejectJob(${index})">Reject</button>
        `;
        pendingJobsContainer.appendChild(jobDiv);
    });
}

// Function to approve a job
function approveJob(index) {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];
    const job = pendingJobs[index];

    let approvedJobs = JSON.parse(localStorage.getItem('approvedJobs')) || [];
    approvedJobs.push(job);
    localStorage.setItem('approvedJobs', JSON.stringify(approvedJobs));

    pendingJobs.splice(index, 1);
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));

    alert('Job approved!');
    loadPendingJobs(); // Refresh the admin dashboard
}

// Function to reject a job
function rejectJob(index) {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];

    pendingJobs.splice(index, 1);
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));

    alert('Job rejected!');
    loadPendingJobs(); // Refresh the admin dashboard
}

// Modal Logic: Show and Hide Apply Modal
function openApplyModal(jobIndex) {
    const modal = document.getElementById('apply-modal');
    modal.style.display = 'block'; // Show the modal
    modal.dataset.jobIndex = jobIndex; // Store the job index for submission
}

document.getElementById('close-apply-modal').addEventListener('click', function () {
    document.getElementById('apply-modal').style.display = 'none';
});

window.addEventListener('click', function (event) {
    const modal = document.getElementById('apply-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle Application Form Submission
document.getElementById('apply-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        showNotification('You must be logged in as a student to apply.');
        return;
    }

    const name = document.getElementById('applicant-name').value;
    const contact = document.getElementById('applicant-contact').value;
    const resumeFile = document.getElementById('resume-upload').files[0];
    const jobIndex = document.getElementById('apply-modal').dataset.jobIndex;

    if (!resumeFile || resumeFile.type !== 'application/pdf') {
        showNotification('Please upload a valid PDF file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const applications = JSON.parse(localStorage.getItem('applications')) || [];
        applications.push({
            jobId: jobIndex,
            jobTitle: JSON.parse(localStorage.getItem('approvedJobs'))[jobIndex].title,
            applicantName: name,
            contact: contact,
            resume: reader.result, // Save PDF as Base64
            employer: JSON.parse(localStorage.getItem('approvedJobs'))[jobIndex].employer
        });

        localStorage.setItem('applications', JSON.stringify(applications));
        showNotification('Application submitted successfully!');
        document.getElementById('apply-modal').style.display = 'none';
        document.getElementById('apply-form').reset();
    };
    reader.readAsDataURL(resumeFile);
});


// Function to handle job application
function applyForJob(jobIndex) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        showNotification('You must be logged in as a student to apply.');
        return;
    }

    const approvedJobs = JSON.parse(localStorage.getItem('approvedJobs'));
    const job = approvedJobs[jobIndex];

    let applications = JSON.parse(localStorage.getItem('applications')) || [];
    applications.push({
        jobId: jobIndex,
        jobTitle: job.title,
        applicantName: currentUser.username,
        employer: job.employer
    });

    localStorage.setItem('applications', JSON.stringify(applications));
    showNotification('Application submitted successfully!');
}

function displayApprovedJobs() {
    const jobListings = document.getElementById('job-listings');
    const selectedCategory = document.getElementById('category-filter')?.value || 'all';
    jobListings.innerHTML = ''; // Clear any previous content

    const approvedJobs = JSON.parse(localStorage.getItem('approvedJobs')) || [];
    const filteredJobs = selectedCategory === 'all'
        ? approvedJobs
        : approvedJobs.filter(job => job.category === selectedCategory);

    if (filteredJobs.length === 0) {
        jobListings.innerHTML = '<p>No jobs available in this category.</p>';
        return;
    }

    filteredJobs.forEach((job, index) => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job-posting');
        jobDiv.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <p><strong>Category:</strong> ${job.category}</p>
            <button onclick="openApplyModal(${index})">Apply</button>
        `;
        jobListings.appendChild(jobDiv);
    });
}

displayApprovedJobs();



function displayEmployerJobs() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'employer') return;

    const employerUsername = currentUser.username;
    const approvedJobs = JSON.parse(localStorage.getItem('approvedJobs')) || [];
    const employerJobs = approvedJobs.filter(job => job.employer === employerUsername);

    const employerJobsContainer = document.getElementById('employer-jobs-container');
    employerJobsContainer.innerHTML = ''; // Clear existing content

    if (employerJobs.length === 0) {
        employerJobsContainer.innerHTML = '<p>You have not posted any jobs yet.</p>';
        return;
    }

    // Loop through each job and display it in the container
    employerJobs.forEach((job, index) => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job-posting'); // Add CSS class for styling
        jobDiv.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.description}</p>
            <p><strong>Category:</strong> ${job.category}</p>
            <button onclick="viewApplications(${index})">View Applications</button>
        `;
        employerJobsContainer.appendChild(jobDiv);
    });
}


// Function to display applications for a job

function viewApplications(jobIndex) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const jobApplications = applications.filter(
        app => app.employer === currentUser.username && app.jobId == jobIndex
    );

    const applicationsContainer = document.getElementById('employer-applications-container');
    const jobsContainer = document.getElementById('employer-jobs-container');
    applicationsContainer.innerHTML = ''; // Clear existing content
    applicationsContainer.style.display = 'block';
    jobsContainer.style.display = 'none'; // Hide job postings

    if (jobApplications.length === 0) {
        applicationsContainer.innerHTML = '<p>No applications for this job.</p>';
        applicationsContainer.innerHTML += `<button onclick="hideApplications()">Back to Jobs</button>`;
        return;
    }

    jobApplications.forEach((app, index) => {
        const appDiv = document.createElement('div');
        appDiv.classList.add('application');
        appDiv.innerHTML = `
            <p><strong>Name:</strong> ${app.applicantName}</p>
            <p><strong>Contact:</strong> ${app.contact}</p>
            <a href="${app.resume}" download="${app.applicantName}-Resume.pdf">Download Resume</a>
            <p><strong>Status:</strong> ${app.status || 'Pending'}</p>
            <button onclick="markApplication(${index}, 'interested')">Mark as Interested</button>
            <button onclick="markApplication(${index}, 'not interested')">Mark as Not Interested</button>
            <button onclick="deleteApplication(${index})">Delete Application</button>
        `;
        applicationsContainer.appendChild(appDiv);
    });

    // Add a "Back to Jobs" button
    applicationsContainer.innerHTML += `<button onclick="hideApplications()">Back to Jobs</button>`;
}

function hideApplications() {
    const applicationsContainer = document.getElementById('employer-applications-container');
    const jobsContainer = document.getElementById('employer-jobs-container');

    // Ensure the containers exist
    if (!applicationsContainer || !jobsContainer) {
        console.error('Applications or jobs container not found.');
        return;
    }

    applicationsContainer.style.display = 'none'; // Hide applications
    jobsContainer.style.display = 'block'; // Show job postings
}

// Ensure the button to view applications calls the viewApplications function
document.querySelectorAll('.view-applications-btn').forEach((button, index) => {
    button.addEventListener('click', function () {
        viewApplications(index);
    });
});

function deleteApplication(applicationIndex) {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];

    // Ensure the application exists
    if (applicationIndex < 0 || applicationIndex >= applications.length) {
        console.error('Invalid application index.');
        return;
    }

    const jobId = applications[applicationIndex].jobId; // Store jobId for refreshing the view
    applications.splice(applicationIndex, 1); // Remove the application

    localStorage.setItem('applications', JSON.stringify(applications)); // Save updated data

    showNotification('Application deleted successfully.');

    // Refresh the applications view for the associated job
    viewApplications(jobId);
}

function markApplication(applicationIndex, status) {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];

    // Ensure the application exists
    if (applicationIndex < 0 || applicationIndex >= applications.length) {
        console.error('Invalid application index.');
        return;
    }

    applications[applicationIndex].status = status; // Update status
    localStorage.setItem('applications', JSON.stringify(applications)); // Save updated data

    showNotification(`Application marked as ${status}.`);

    // Refresh the view for the job associated with this application
    viewApplications(applications[applicationIndex].jobId);
}

document.querySelectorAll('.logout-btn').forEach(button => {
    button.addEventListener('click', function () {
        localStorage.removeItem('currentUser');
        hideElement('student-dashboard');
        hideElement('employer-dashboard');
        hideElement('admin-dashboard');
        showElement('homepage');
        showNotification('You have been logged out.');
    });
});

// Function to handle "Refresh All" button click
document.getElementById('refresh-all-btn').addEventListener('click', function () {
    if (confirm('Are you sure you want to refresh the entire website?')) {
        // Clear all job postings and user data except for admin
        localStorage.removeItem('approvedJobs');
        localStorage.removeItem('pendingJobs');
        localStorage.removeItem('applications');
        localStorage.removeItem('users');

        // Preserve admin credentials
        const admin = { username: 'admin', password: 'pass' };
        localStorage.setItem('admin', JSON.stringify(admin));

        showNotification('Website refreshed successfully!');
        location.reload(); // Reload the page to reflect changes
    }
});

// Ensure admin credentials are set if not already present
if (!localStorage.getItem('admin')) {
    const admin = { username: 'admin', password: 'pass' };
    localStorage.setItem('admin', JSON.stringify(admin));
}