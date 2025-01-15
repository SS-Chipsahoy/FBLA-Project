

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



function hideElement(id) {

    document.getElementById(id).style.display = 'none';

}



function showElement(id) {

    document.getElementById(id).style.display = 'block';

}



// Initialize localStorage with some dummy job postings

let jobPostings = [

    { title: "Software Developer Intern", description: "A great opportunity for students." },

    { title: "Marketing Intern", description: "A hands-on marketing experience." }

];



// If job postings are not already in localStorage, add them

if (!localStorage.getItem('jobPostings')) {

    localStorage.setItem('jobPostings', JSON.stringify(jobPostings));

}



// Display current job postings on homepage

function displayJobPostings() {

    const jobListings = document.getElementById('all-job-listings');

    jobListings.innerHTML = '';

    jobPostings = JSON.parse(localStorage.getItem('jobPostings'));

    jobPostings.forEach(job => {

        const jobDiv = document.createElement('div');

        jobDiv.innerHTML = `<h3>${job.title}</h3><p>${job.description}</p>`;

        jobListings.appendChild(jobDiv);

    });

}



displayJobPostings();



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

document.getElementById('login').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password); // Define user

    if (user) {
        localStorage.setItem('currentAccountType', user.role);
        showNotification(`Welcome back, ${user.username}!`);

        if (user.role === 'student') {
            document.getElementById('student-dashboard').style.display = 'block';
            displayApprovedJobs(); // Call the function for approved jobs
        } else if (user.role === 'employer') {
            document.getElementById('employer-dashboard').style.display = 'block';
        } else if (user.role === 'admin') {
            document.getElementById('admin-dashboard').style.display = 'block';
            loadPendingJobs(); // Load pending jobs for admin
        }
    } else {
        showNotification('Invalid username or password.');
    }
});


// Handle login



function initializeAdmin() {

    // Add predetermined admin user and pass, check to make sure it isn't duplicate

    if (!localStorage.getItem('admin')) {

        const adminCredentials = {

            username: "admin", // Predetermined admin Username

            password: "pass" // Predetermine admin Password

        };

        // Save the admin credentials to localStorage

        localStorage.setItem('admin', JSON.stringify(adminCredentials));

    }

}



// Call the function

initializeAdmin();



document.getElementById('login').addEventListener('submit', function(event) {

    event.preventDefault();



    const username = document.getElementById('username').value;

    const password = document.getElementById('password').value;

    const storedAdmin = JSON.parse(localStorage.getItem('admin'));

    


    // Check if admin credentials are entered

    if (storedAdmin && username === storedAdmin.username && password === storedAdmin.password) {

        // Show admin Dash

        document.getElementById('login-form').style.display = 'none';

        document.getElementById('admin-dashboard').style.display = 'block';

        return;

    }



    let users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.username === username && user.password === password);



    if (user) {

        // Store the account type in localStorage

        localStorage.setItem('currentAccountType', user.role);



        // Successfully logged in

        showNotification(`Welcome back, ${user.username}!`);

        

        // Show the appropriate dashboard based on the user's role

        hideElement('login-form');

        hideElement('signup-form');

        if (user.role === 'student') {

            document.getElementById('student-dashboard').style.display = 'block';

            displayJobPostings(); // Display job postings for students

        } else if (user.role === 'employer') {

            document.getElementById('employer-dashboard').style.display = 'block';

        } else if (user.role === 'admin') {

            document.getElementById('admin-dashboard').style.display = 'block';

        }

    } else {

        // Login failed

        showNotification('Invalid username or password.');

    }

});



// Go back to home page from dashboard

document.querySelectorAll('.dashboard button[id^="back-to-home"]').forEach(button => {

    button.addEventListener('click', function () {

        hideElement('student-dashboard');

        hideElement('employer-dashboard');

        hideElement('admin-dashboard');

        showElement('homepage');

    });

});



// Show the job posting modal

document.getElementById('open-post-job-modal').addEventListener('click', function () {

    document.getElementById('post-job-modal').style.display = 'block';

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

    event.preventDefault(); // Prevent the page from reloading



    // Get job details from the form

    const jobTitle = document.getElementById('job-title').value;

    const jobDescription = document.getElementById('job-description').value;



    // Save the job as pending in localStorage

    let pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];

    pendingJobs.push({

        id: Date.now(), // Use a unique timestamp as the job ID

        title: jobTitle,

        description: jobDescription,

        approved: false // Mark as pending approval

    });



    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));



    // Show a success message

    alert('Job submitted for admin approval.');



    // Clear the form fields and close the modal

    document.getElementById('post-job').reset(); // Clear the form

    document.getElementById('post-job-modal').style.display = 'none'; // Close the modal

});



function loadPendingJobs() {

    // Retrieve pending jobs from localStorage

    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];

    const pendingJobsContainer = document.getElementById('pending-jobs');

    pendingJobsContainer.innerHTML = ''; // Clear existing content



    if (pendingJobs.length === 0) {

        // No jobs to show

        pendingJobsContainer.innerHTML = '<p>No pending jobs for review.</p>';

        return;

    }



    // Render each pending job

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



function approveJob(index) {

    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];

    const job = pendingJobs[index];



    // Add job to the approved jobs list

    let approvedJobs = JSON.parse(localStorage.getItem('approvedJobs')) || [];

    approvedJobs.push(job);

    localStorage.setItem('approvedJobs', JSON.stringify(approvedJobs));



    // Remove the job from pending jobs

    pendingJobs.splice(index, 1);

    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));



    alert('Job approved!');

    loadPendingJobs(); // Refresh the admin dashboard

}



function rejectJob(index) {

    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];



    // Remove the job from the pending jobs list

    pendingJobs.splice(index, 1);

    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));



    alert('Job rejected!');

    loadPendingJobs(); // Refresh the admin dashboard

}



document.getElementById('login').addEventListener('submit', function (event) {

    event.preventDefault();



    const username = document.getElementById('username').value;

    const password = document.getElementById('password').value;



    const storedAdmin = JSON.parse(localStorage.getItem('admin')) || { username: 'admin', password: 'pass' };



    // Check if admin credentials match

    if (username === storedAdmin.username && password === storedAdmin.password) {

        localStorage.setItem('currentAccountType', 'admin'); // Store the role

        hideElement('login-form');

        showElement('admin-dashboard');

        loadPendingJobs(); // Load pending jobs on the admin dashboard

    } else {

        alert('Invalid credentials!');

    }

});



function showElement(id) {

    document.getElementById(id).style.display = 'block';

}



function hideElement(id) {

    document.getElementById(id).style.display = 'none';

}



localStorage.setItem('pendingJobs', JSON.stringify([

    { title: 'Software Developer Intern', description: 'Build great software.', approved: false },

    { title: 'Marketing Manager', description: 'Lead marketing campaigns.', approved: false }

]));

// Load pending jobs for admin approval
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

// Approve a job
function approveJob(index) {
    let pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];
    let approvedJobs = JSON.parse(localStorage.getItem('approvedJobs')) || [];

    approvedJobs.push(pendingJobs[index]);
    localStorage.setItem('approvedJobs', JSON.stringify(approvedJobs));

    pendingJobs.splice(index, 1); // Remove the approved job
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));

    alert('Job approved!');
    loadPendingJobs(); // Refresh pending jobs
}

// Reject a job
function rejectJob(index) {
    let pendingJobs = JSON.parse(localStorage.getItem('pendingJobs')) || [];
    pendingJobs.splice(index, 1); // Remove the rejected job
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));

    alert('Job rejected!');
    loadPendingJobs(); // Refresh pending jobs
}

// Call this when the admin logs in
loadPendingJobs();

function displayApprovedJobs() {
    const jobListings = document.getElementById('job-listings');
    jobListings.innerHTML = ''; // Clear existing content

    const approvedJobs = JSON.parse(localStorage.getItem('approvedJobs')) || [];

    if (approvedJobs.length === 0) {
        jobListings.innerHTML = '<p>No approved jobs available at the moment.</p>';
        return;
    }

    approvedJobs.forEach(job => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job-posting');
        jobDiv.innerHTML = `
            <h3>${job.title}</h3>
            <p>${job.description}</p>
        `;
        jobListings.appendChild(jobDiv);
    });
}

if (user.role === 'student') {
    document.getElementById('student-dashboard').style.display = 'block';
    displayApprovedJobs(); // Load and display approved jobs for students
}

console.log('Approved jobs:', JSON.parse(localStorage.getItem('approvedJobs')));

function displayApprovedJobs() {
    console.log('Displaying approved jobs...');
    // The rest of the function...
}

// Debugging user roles

console.log('User:', user);
console.log('User role:', user?.role);

// More Debugging 


if (user.role === 'student') {
    document.getElementById('student-dashboard').style.display = 'block';
    displayApprovedJobs();
} else {
    console.error('User not found or role is undefined.');
}
