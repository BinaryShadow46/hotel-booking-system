// Hotel Booking System - Main JavaScript

class HotelBookingSystem {
    constructor() {
        this.init();
    }
    
    async init() {
        // Initialize all components
        this.setupEventListeners();
        this.loadFeaturedRooms();
        this.setupPWA();
        this.checkAuthStatus();
        this.setupMockData();
        
        // Set min date for check-in to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('checkin').min = today;
        document.getElementById('checkout').min = today;
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('navMenu').classList.toggle('active');
        });
        
        // Search rooms
        document.getElementById('searchRooms').addEventListener('click', () => {
            this.searchAvailableRooms();
        });
        
        // Login/Register modals
        document.getElementById('loginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('loginModal');
        });
        
        document.getElementById('registerBtn').addEventListener('click', (e) => {
            e.preventDefault();
            // In a real app, this would show registration modal
            alert('Registration functionality would be implemented here');
        });
        
        // Close modal when clicking X
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });
        
        // Install PWA
        document.getElementById('installBtn')?.addEventListener('click', () => {
            this.installPWA();
        });
        
        // Dismiss install prompt
        document.getElementById('dismissBtn')?.addEventListener('click', () => {
            document.getElementById('installPrompt').style.display = 'none';
            localStorage.setItem('pwaPromptDismissed', 'true');
        });
    }
    
    async loadFeaturedRooms() {
        try {
            // Try to load from API first
            const response = await fetch('api/rooms.json');
            if (response.ok) {
                const rooms = await response.json();
                this.displayRooms(rooms.slice(0, 3)); // Show only 3 featured
            } else {
                // Fallback to mock data
                this.displayRooms(this.getMockRooms().slice(0, 3));
            }
        } catch (error) {
            console.log('Using mock rooms data');
            this.displayRooms(this.getMockRooms().slice(0, 3));
        }
    }
    
    displayRooms(rooms) {
        const container = document.getElementById('featuredRooms');
        if (!container) return;
        
        container.innerHTML = rooms.map(room => `
            <div class="room-card">
                <div class="room-image">
                    <i class="fas fa-bed fa-3x"></i>
                </div>
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p>${room.description}</p>
                    <div class="room-features">
                        <span><i class="fas fa-user"></i> ${room.capacity} Guests</span>
                        <span><i class="fas fa-expand-arrows-alt"></i> ${room.size} sq ft</span>
                    </div>
                    <div class="room-price">$${room.price}/night</div>
                    <button class="btn-book" onclick="hotelSystem.bookRoom(${room.id})">
                        <i class="fas fa-calendar-check"></i> Book Now
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    searchAvailableRooms() {
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const guests = document.getElementById('guests').value;
        
        if (!checkin || !checkout) {
            alert('Please select check-in and check-out dates');
            return;
        }
        
        // Store search criteria
        localStorage.setItem('searchCriteria', JSON.stringify({
            checkin, checkout, guests
        }));
        
        // Redirect to rooms page
        window.location.href = 'pages/rooms.html';
    }
    
    bookRoom(roomId) {
        // Store selected room in localStorage
        localStorage.setItem('selectedRoom', roomId);
        
        // Redirect to booking page
        window.location.href = 'pages/booking.html';
    }
    
    setupPWA() {
        // Check if PWA is installable
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install prompt if not dismissed before
            if (!localStorage.getItem('pwaPromptDismissed')) {
                const prompt = document.getElementById('installPrompt');
                if (prompt) {
                    prompt.style.display = 'block';
                }
            }
            
            // Update PWA status
            document.getElementById('pwaStatus').textContent = 'PWA: Installable';
        });
        
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.getElementById('pwaStatus').textContent = 'PWA: Installed';
        }
    }
    
    installPWA() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    document.getElementById('pwaStatus').textContent = 'PWA: Installing...';
                }
                deferredPrompt = null;
            });
        }
    }
    
    checkAuthStatus() {
        // Check if user is logged in (from localStorage)
        const user = localStorage.getItem('hotelUser');
        if (user) {
            const userData = JSON.parse(user);
            document.getElementById('loginBtn').innerHTML = 
                `<i class="fas fa-user"></i> ${userData.name}`;
            document.getElementById('registerBtn').innerHTML = 
                `<i class="fas fa-sign-out-alt"></i> Logout`;
            
            // Change logout functionality
            document.getElementById('registerBtn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('hotelUser');
                window.location.reload();
            });
        }
    }
    
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    setupMockData() {
        // Create initial mock data if not exists
        if (!localStorage.getItem('hotelRooms')) {
            localStorage.setItem('hotelRooms', JSON.stringify(this.getMockRooms()));
        }
        
        if (!localStorage.getItem('hotelBookings')) {
            localStorage.setItem('hotelBookings', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('hotelUsers')) {
            localStorage.setItem('hotelUsers', JSON.stringify([
                {
                    id: 1,
                    email: 'demo@hotel.com',
                    password: 'demo123',
                    name: 'Demo User',
                    role: 'user'
                }
            ]));
        }
    }
    
    getMockRooms() {
        return [
            {
                id: 1,
                name: "Deluxe Suite",
                description: "Spacious suite with king bed and city view",
                price: 299,
                capacity: 2,
                size: 450,
                amenities: ["WiFi", "TV", "Minibar", "AC"],
                image: "room1.jpg"
            },
            {
                id: 2,
                name: "Executive Room",
                description: "Modern room with workspace and premium amenities",
                price: 199,
                capacity: 2,
                size: 350,
                amenities: ["WiFi", "TV", "Work Desk", "Coffee Maker"],
                image: "room2.jpg"
            },
            {
                id: 3,
                name: "Family Suite",
                description: "Perfect for families with separate bedrooms",
                price: 399,
                capacity: 4,
                size: 600,
                amenities: ["WiFi", "2 TVs", "Kitchenette", "Sofa Bed"],
                image: "room3.jpg"
            }
        ];
    }
}

// Initialize the system
const hotelSystem = new HotelBookingSystem();

// Expose to global scope for HTML onclick handlers
window.hotelSystem = hotelSystem;

// Handle form submissions
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            // Simple authentication (in real app, this would be server-side)
            const users = JSON.parse(localStorage.getItem('hotelUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('hotelUser', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }));
                alert('Login successful!');
                hotelSystem.hideAllModals();
                window.location.reload();
            } else {
                alert('Invalid credentials');
            }
        });
    }
});
