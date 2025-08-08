// Main JavaScript for Antoniv University

// DOM Elements
const navbar = document.querySelector('.navbar');
const mobileMenu = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('.nav-menu');

// Navbar scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  }
});

// Mobile menu toggle
if (mobileMenu && navMenu) {
  mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Active navigation link highlighting
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

// Call on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// Animation on scroll (for future use)
function animateOnScroll() {
  const elements = document.querySelectorAll('.card, .feature');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < window.innerHeight - elementVisible) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

// Initialize animations
window.addEventListener('scroll', animateOnScroll);

// Utility functions for forms
function showAlert(message, type = 'info') {
  // Remove existing alerts
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  // Create new alert
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Insert at the top of the form container or body
  const formContainer = document.querySelector('.form-container');
  const container = formContainer || document.body;
  
  if (formContainer) {
    formContainer.insertBefore(alert, formContainer.firstChild);
  } else {
    container.appendChild(alert);
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Form validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Loading state helper
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<div class="loading"></div> Processing...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

// Local storage helpers
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Check if user is logged in
function isLoggedIn() {
  return getFromStorage('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
  return getFromStorage('currentUser');
}

// Logout function
function logout() {
  removeFromStorage('currentUser');
  window.location.href = 'index.html';
}

// Redirect based on user role
function redirectToDashboard(user) {
  if (user.role === 'admin') {
    window.location.href = 'admin/dashboard.html';
  } else {
    window.location.href = 'student/dashboard.html';
  }
}

// Format date helper
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format percentage helper
function formatPercentage(percentage) {
  return Math.round(percentage * 100) / 100;
}

// API base URL
const API_BASE = 'https://student-crud-backend-u0nb.onrender.com/api';
// API request helper
// API request helper with authentication
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    
    // Get auth token if available
    const token = getFromStorage('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers,
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Set initial animations
  const cards = document.querySelectorAll('.card, .feature');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
  });
  
  // Trigger initial animation check
  setTimeout(animateOnScroll, 100);
  
  // Add hover effects to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Check for login redirect parameters
  const urlParams = new URLSearchParams(window.location.search);
  const loginType = urlParams.get('type');
  
  if (loginType && window.location.pathname.includes('login.html')) {
    // This will be handled in auth.js
    console.log(`Login type: ${loginType}`);
  }
});

// Console welcome message
console.log(`
🎓 Welcome to Antoniv University Management System
📚 Developed with ❤️ for educational excellence
🚀 Ready to serve students and administrators!
`);

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});