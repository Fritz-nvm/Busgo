// Bus Listing JavaScript for BusGo Cameroon

document.addEventListener('DOMContentLoaded', function() {
    initializeBusListing();
    initializeFilters();
    initializeSorting();
    loadSearchData();
    initializeModifySearch();
});

// Sample bus data for Cameroon with real travel agencies
const busData = [
    {
        id: 1,
        operator: 'VATICAN EXPRESS',
        busNumber: 'VE-2024',
        type: 'AC',
        seating: '70 Seats',
        from: 'Douala',
        to: 'Bamenda',
        departureTime: '08:30',
        arrivalTime: '13:00',
        duration: '4h 30m',
        price: 7500,
        originalPrice: 7500,
        availableSeats: 18,
        totalSeats: 70,
        rating: 4.5,
        reviews: 245,
        amenities: ['WiFi', 'Charging', 'AC'],
        features: ['AC', 'WiFi', 'Premium']
    },
    {
        id: 2,
        operator: 'MOGHAMO EXPRESS',
        busNumber: 'ME-1856',
        type: 'Standard',
        seating: '70 Seats',
        from: 'Douala',
        to: 'Bamenda',
        departureTime: '10:15',
        arrivalTime: '15:00',
        duration: '4h 45m',
        price: 6000,
        originalPrice: 6000,
        availableSeats: 5,
        totalSeats: 70,
        rating: 4.2,
        reviews: 189,
        amenities: ['Charging', 'Refreshments'],
        features: ['Standard']
    },
    {
        id: 3,
        operator: 'NSO BOYS',
        busNumber: 'NB-9876',
        type: 'VIP',
        seating: '70 Seats',
        from: 'Douala',
        to: 'Bamenda',
        departureTime: '22:30',
        arrivalTime: '03:45',
        duration: '5h 15m',
        price: 9500,
        originalPrice: 9500,
        availableSeats: 12,
        totalSeats: 70,
        rating: 4.8,
        reviews: 312,
        amenities: ['WiFi', 'Charging', 'Blankets', 'AC'],
        features: ['VIP', 'Night Service', 'AC']
    },
    {
        id: 4,
        operator: 'AMO MEZAM',
        busNumber: 'AM-7890',
        type: 'Economy',
        seating: '70 Seats',
        from: 'Douala',
        to: 'Bamenda',
        departureTime: '20:00',
        arrivalTime: '01:30',
        duration: '5h 30m',
        price: 5000,
        originalPrice: 5000,
        availableSeats: 30,
        totalSeats: 70,
        rating: 3.5,
        reviews: 98,
        amenities: ['Charging'],
        features: ['Economy']
    },
    {
        id: 5,
        operator: 'GRAND EXPRESS',
        busNumber: 'GE-5432',
        type: 'Premium',
        seating: '70 Seats',
        from: 'Douala',
        to: 'Bamenda',
        departureTime: '09:00',
        arrivalTime: '13:30',
        duration: '4h 30m',
        price: 8000,
        originalPrice: 8000,
        availableSeats: 25,
        totalSeats: 70,
        rating: 4.6,
        reviews: 156,
        amenities: ['WiFi', 'Charging', 'AC', 'Refreshments'],
        features: ['Premium', 'AC', 'WiFi']
    }
];

let filteredBuses = [...busData];
let currentFilters = {
    timeSlots: [],
    priceRange: [5000, 10000]
};

let currentSearchParams = {
    from: 'Douala',
    to: 'Bamenda',
    date: new Date().toISOString().split('T')[0]
};

// Initialize bus listing
function initializeBusListing() {
    renderBuses(filteredBuses);
    updateResultsCount();
}

// Load search data from localStorage
function loadSearchData() {
    const searchData = localStorage.getItem('busSearchData');
    if (searchData) {
        const data = JSON.parse(searchData);
        currentSearchParams = data;
        updateSearchHeader(data);
        // Filter buses based on search data
        filterBusesByRoute(data.from, data.to);
    }
}

// Initialize modify search modal
function initializeModifySearch() {
    const modal = document.getElementById('modifySearchModal');
    if (modal) {
        modal.addEventListener('show.bs.modal', function() {
            // Pre-populate modal with current search data
            document.getElementById('modalFrom').value = currentSearchParams.from;
            document.getElementById('modalTo').value = currentSearchParams.to;
            document.getElementById('modalDate').value = currentSearchParams.date;
        });
    }
}

// Update search function
function updateSearch() {
    const from = document.getElementById('modalFrom').value;
    const to = document.getElementById('modalTo').value;
    const date = document.getElementById('modalDate').value;
    const passengers = document.getElementById('modalPassengers').value;

    // Validate form
    if (!from || !to || !date) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    if (from === to) {
        showAlert('Departure and destination cities must be different', 'warning');
        return;
    }

    // Update current search params
    currentSearchParams = { from, to, date, passengers };

    // Update localStorage
    localStorage.setItem('busSearchData', JSON.stringify(currentSearchParams));

    // Update UI
    updateSearchHeader(currentSearchParams);
    filterBusesByRoute(from, to);

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modifySearchModal'));
    modal.hide();

    // Show success message
    showAlert('Search updated successfully!', 'success');
}

// Filter buses by route
function filterBusesByRoute(from, to) {
    // For demo purposes, we'll show all buses but update their route info
    filteredBuses = busData.map(bus => ({
        ...bus,
        from: from,
        to: to
    }));
    
    renderBuses(filteredBuses);
    updateResultsCount();
}

// Update search header with current search data
function updateSearchHeader(data) {
    const routeElement = document.getElementById('currentRoute');
    const dateElement = document.getElementById('currentDate');
    
    if (routeElement && data) {
        routeElement.textContent = `${data.from} → ${data.to}`;
    }
    
    if (dateElement && data.date) {
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateElement.textContent = formattedDate;
    }
}

// Render buses
function renderBuses(buses) {
    const container = document.querySelector('.bus-listings');
    if (!container) return;

    if (buses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-bus text-muted mb-3" style="font-size: 3rem;"></i>
                <h5 class="text-muted">No buses found</h5>
                <p class="text-muted">Try adjusting your filters or search criteria</p>
            </div>
        `;
        return;
    }

    container.innerHTML = buses.map(bus => createBusCard(bus)).join('');
}

// Create bus card HTML
function createBusCard(bus) {
    const availabilityClass = bus.availableSeats <= 5 ? 'text-warning' : 'text-success';
    const availabilityIcon = bus.availableSeats <= 5 ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    const availabilityText = bus.availableSeats <= 5 ? 
        `Only ${bus.availableSeats} seats left` : 
        `${bus.availableSeats} seats available`;

    return `
        <div class="bus-card bg-white rounded-4 shadow-sm mb-4" data-bus-id="${bus.id}">
            <div class="bus-card-header p-4 border-bottom">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="d-flex align-items-center mb-2">
                            <h5 class="fw-bold mb-0 me-3">${bus.operator}</h5>
                            ${bus.features.map(feature => `<span class="badge bg-${getBadgeColor(feature)} me-1">${feature}</span>`).join('')}
                        </div>
                        <p class="text-muted mb-0">${bus.type} Coach • ${bus.seating}</p>
                    </div>
                    <div class="col-lg-4 text-lg-end">
                        <div class="rating mb-2">
                            <span class="text-warning">
                                ${generateStarRating(bus.rating)}
                            </span>
                            <span class="text-muted ms-1">(${bus.rating})</span>
                        </div>
                        <p class="text-muted mb-0">${bus.reviews} reviews</p>
                    </div>
                </div>
            </div>
            
            <div class="bus-card-body p-4">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <div class="journey-info">
                            <div class="d-flex align-items-center mb-3">
                                <div class="time-info text-center me-4">
                                    <h4 class="fw-bold mb-0">${bus.departureTime}</h4>
                                    <p class="text-muted mb-0">${bus.from}</p>
                                </div>
                                <div class="journey-line flex-grow-1 text-center">
                                    <div class="journey-duration">
                                        <span class="badge bg-light text-dark">${bus.duration}</span>
                                    </div>
                                    <div class="journey-path">
                                        <div class="path-line"></div>
                                    </div>
                                </div>
                                <div class="time-info text-center ms-4">
                                    <h4 class="fw-bold mb-0">${bus.arrivalTime}</h4>
                                    <p class="text-muted mb-0">${bus.to}</p>
                                </div>
                            </div>
                            
                            <div class="amenities">
                                ${bus.amenities.map(amenity => `
                                    <span class="amenity-tag">
                                        <i class="fas fa-${getAmenityIcon(amenity)}"></i> ${amenity}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-6">
                        <div class="booking-info text-lg-end">
                            <div class="price-info mb-3">
                                <h3 class="text-primary fw-bold mb-0">${bus.price.toLocaleString()} FCFA</h3>
                                <p class="text-muted mb-0">per person</p>
                            </div>
                            
                            <div class="availability mb-3">
                                <span class="${availabilityClass} fw-semibold">
                                    <i class="${availabilityIcon} me-1"></i>
                                    ${availabilityText}
                                </span>
                            </div>
                            
                            <div class="booking-actions">
                                <button class="btn btn-outline-primary me-2" onclick="showBusDetails(${bus.id})">
                                    View Details
                                </button>
                                <button class="btn btn-primary" onclick="selectSeats(${bus.id})">
                                    Select Seats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize filters
function initializeFilters() {
    // Time slot filters
    document.querySelectorAll('input[type="checkbox"][id^="morning"], input[type="checkbox"][id^="night"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleTimeSlotFilter);
    });

    // Price range filter
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = parseInt(this.value).toLocaleString();
            currentFilters.priceRange[1] = parseInt(this.value);
            applyFilters();
        });
    }
}

// Handle time slot filter
function handleTimeSlotFilter(e) {
    const timeSlot = e.target.id;
    if (e.target.checked) {
        currentFilters.timeSlots.push(timeSlot);
    } else {
        currentFilters.timeSlots = currentFilters.timeSlots.filter(slot => slot !== timeSlot);
    }
    applyFilters();
}

// Apply all filters
function applyFilters() {
    filteredBuses = busData.filter(bus => {
        // Time slot filter
        if (currentFilters.timeSlots.length > 0) {
            const hour = parseInt(bus.departureTime.split(':')[0]);
            const timeSlotMatch = currentFilters.timeSlots.some(slot => {
                switch(slot) {
                    case 'morning': return hour >= 6 && hour < 18;
                    case 'night': return hour >= 18 || hour < 6;
                    default: return false;
                }
            });
            if (!timeSlotMatch) return false;
        }

        // Price range filter
        if (bus.price > currentFilters.priceRange[1]) return false;

        return true;
    });

    // Update route info for filtered buses
    filteredBuses = filteredBuses.map(bus => ({
        ...bus,
        from: currentSearchParams.from,
        to: currentSearchParams.to
    }));

    renderBuses(filteredBuses);
    updateResultsCount();
}

// Initialize sorting
function initializeSorting() {
    const sortSelect = document.querySelector('.sort-dropdown select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSorting);
    }
}

// Handle sorting
function handleSorting(e) {
    const sortBy = e.target.value;
    
    switch(sortBy) {
        case 'Sort by: Price (Low to High)':
            filteredBuses.sort((a, b) => a.price - b.price);
            break;
        case 'Sort by: Price (High to Low)':
            filteredBuses.sort((a, b) => b.price - a.price);
            break;
        case 'Sort by: Rating':
            filteredBuses.sort((a, b) => b.rating - a.rating);
            break;
        default:
            filteredBuses.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
    
    renderBuses(filteredBuses);
}

// Update results count
function updateResultsCount() {
    const countElement = document.getElementById('busCount');
    if (countElement) {
        const count = filteredBuses.length;
        countElement.textContent = `${count} bus${count !== 1 ? 'es' : ''} found for your route`;
    }
}

// Utility functions
function getBadgeColor(feature) {
    const colors = {
        'AC': 'success',
        'Standard': 'warning',
        'VIP': 'primary',
        'Premium': 'info',
        'WiFi': 'info',
        'Night Service': 'dark',
        'Economy': 'secondary'
    };
    return colors[feature] || 'secondary';
}

function getAmenityIcon(amenity) {
    const icons = {
        'WiFi': 'wifi',
        'Charging': 'charging-station',
        'AC': 'snowflake',
        'Blankets': 'bed',
        'Refreshments': 'coffee'
    };
    return icons[amenity] || 'check';
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Bus action functions
function showBusDetails(busId) {
    const bus = filteredBuses.find(b => b.id === busId);
    if (!bus) return;

    // Create modal or show details
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${bus.operator} - Bus Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="fw-bold">Bus Information</h6>
                            <p><strong>Bus Number:</strong> ${bus.busNumber}</p>
                            <p><strong>Type:</strong> ${bus.type}</p>
                            <p><strong>Seating:</strong> ${bus.seating}</p>
                            <p><strong>Total Seats:</strong> ${bus.totalSeats}</p>
                        </div>
                        <div class="col-md-6">
                            <h6 class="fw-bold">Journey Details</h6>
                            <p><strong>Route:</strong> ${bus.from} → ${bus.to}</p>
                            <p><strong>Departure:</strong> ${bus.departureTime}</p>
                            <p><strong>Arrival:</strong> ${bus.arrivalTime}</p>
                            <p><strong>Duration:</strong> ${bus.duration}</p>
                        </div>
                    </div>
                    <hr>
                    <h6 class="fw-bold">Amenities</h6>
                    <div class="amenities">
                        ${bus.amenities.map(amenity => `
                            <span class="amenity-tag me-2 mb-2">
                                <i class="fas fa-${getAmenityIcon(amenity)}"></i> ${amenity}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="selectSeats(${busId})" data-bs-dismiss="modal">Select Seats</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Modified selectSeats function to use Django endpoint
function selectSeats(busId) {
    // Store selected bus data
    const bus = filteredBuses.find(b => b.id === busId);
    if (bus) {
        localStorage.setItem('selectedBus', JSON.stringify(bus));
        
        // Show loading state
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        button.disabled = true;
        
        // Create form data to send to Django
        const formData = new FormData();
        formData.append('bus_id', busId);
        formData.append('from_city', currentSearchParams.from);
        formData.append('to_city', currentSearchParams.to);
        formData.append('travel_date', currentSearchParams.date);
        
        // Send request to Django endpoint
        fetch('/bus-listing/seat-selection/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCsrfToken(), // Get CSRF token
            }
        })
        .then(response => {
            if (response.ok) {
                // If Django returns success, redirect to seat selection page
                window.location.href = 'seat-selection.html';
            } else {
                throw new Error('Server error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback: redirect to seat selection page anyway
            window.location.href = 'seat-selection.html';
        })
        .finally(() => {
            // Reset button state
            button.innerHTML = originalText;
            button.disabled = false;
        });
    }
}

// Helper function to get CSRF token
function getCsrfToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken) {
        return csrfToken.value;
    }
    
    // Alternative: get from cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    
    return '';
}

// Utility function to show alerts
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}