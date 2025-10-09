// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavbar();
    initScrollAnimations();
    initStatsCounter();
    initStudentManagement();
    initAnalytics();
    initModalHandling();
    
    // Set current date for enrollment date field
    const enrollmentDate = document.getElementById('enrollment_date');
    if (enrollmentDate) {
        enrollmentDate.value = new Date().toISOString().split('T')[0];
    }
});

// Student Management Functions
function initStudentManagement() {
    initSearchAndFilter();
    initAddStudentForm();
    initEditStudentForm();
}

function initSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const courseFilter = document.getElementById('courseFilter');
    const yearFilter = document.getElementById('yearFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }
    if (courseFilter) {
        courseFilter.addEventListener('change', filterStudents);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', filterStudents);
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const courseFilter = document.getElementById('courseFilter')?.value || '';
    const yearFilter = document.getElementById('yearFilter')?.value || '';
    
    const rows = document.querySelectorAll('.student-row');
    
    rows.forEach(row => {
        const name = row.querySelector('.student-name').textContent.toLowerCase();
        const email = row.querySelector('.student-email').textContent.toLowerCase();
        const course = row.getAttribute('data-course');
        const year = row.getAttribute('data-year');
        
        const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
        const matchesCourse = !courseFilter || course === courseFilter;
        const matchesYear = !yearFilter || year === yearFilter;
        
        row.style.display = matchesSearch && matchesCourse && matchesYear ? '' : 'none';
    });
}

function initAddStudentForm() {
    const form = document.getElementById('addStudentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitStudentForm(form, '/add-student', 'addStudentModal');
        });
    }
}

function initEditStudentForm() {
    const form = document.getElementById('editStudentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = form.getAttribute('data-student-id');
            await submitStudentForm(form, `/edit-student/${studentId}`, 'editStudentModal');
        });
    }
}

async function submitStudentForm(form, url, modalId) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<div class="loading"></div> Processing...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(data.message, 5000);
            closeModal(modalId);
            form.reset();
            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1000);
        } else {
            showNotification(data.message || 'Error processing request');
        }
    } catch (error) {
        showNotification('Network error. Please check your connection.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'block';
}

function editStudent(studentId) {
    // In a real app, you would fetch student data from the server
    const student = getStudentById(studentId);
    if (student) {
        const form = document.getElementById('editStudentForm');
        form.setAttribute('data-student-id', studentId);
        
        // Populate form with student data
        form.querySelector('[name="name"]').value = student.name;
        form.querySelector('[name="email"]').value = student.email;
        form.querySelector('[name="course"]').value = student.course;
        form.querySelector('[name="year"]').value = student.year;
        form.querySelector('[name="gpa"]').value = student.gpa;
        form.querySelector('[name="attendance"]').value = student.attendance;
        form.querySelector('[name="status"]').value = student.status;
        
        document.getElementById('editStudentModal').style.display = 'block';
    }
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        fetch(`/delete-student/${studentId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showNotification('Error deleting student');
            }
        })
        .catch(error => {
            showNotification('Network error. Please try again.');
        });
    }
}

function getStudentById(studentId) {
    // This would typically come from the server
    // For now, we'll return a mock object
    return {
        id: studentId,
        name: "Sample Student",
        email: "sample@university.edu",
        course: "Computer Science",
        year: 2,
        gpa: 3.5,
        attendance: 90,
        status: "Active"
    };
}

// Modal Handling
function initModalHandling() {
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Analytics Functions
function initAnalytics() {
    loadStudentStats();
}

function loadStudentStats() {
    fetch('/api/student-stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalStudents').textContent = data.total;
            document.getElementById('activeStudents').textContent = data.active;
            document.getElementById('probationStudents').textContent = data.probation;
        })
        .catch(error => {
            console.error('Error loading student stats:', error);
        });
}

function generateReport() {
    showNotification('Generating report... This feature is under development.');
    // In a real app, this would generate and download a PDF/Excel report
}

// Keep all the existing functions from previous version (navbar, animations, counters, etc.)
// ... (all the existing functions from the previous version remain the same)

// Notification system (keep the same)
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}