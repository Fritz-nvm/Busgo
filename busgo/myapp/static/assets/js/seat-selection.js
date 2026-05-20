// Seat Selection JavaScript for BusGo Cameroon

document.addEventListener('DOMContentLoaded', function() {
    initializeSeatSelection();
    loadBusData();
    initializeSeatInteraction();
    updateBookingSummary();
});

let selectedBus = null;
let selectedSeats = [];
let seatPrice = 7500;

// Initialize seat selection
function initializeSeatSelection() {
    // Load bus data from localStorage
    const busData = localStorage.getItem('selectedBus');
    if (busData) {
        selectedBus = JSON.parse(busData);
        seatPrice = selectedBus.price;
        updateBusInfo();
    } else {
        // Fallback data if no bus selected
        selectedBus = {
            operator: 'VATICAN EXPRESS',
            from: 'Douala',
            to: 'Bamenda',
            departureTime: '08:30',
            arrivalTime: '13:00',
            price: 7500
        };
    }
}

// Load bus data and update UI
function loadBusData() {
    if (!selectedBus) return;

    // Update bus info header
    const busInfoElements = {
        operator: document.querySelector('.bus-info h4'),
        route: document.querySelector('.journey-summary span:first-child'),
        date: document.querySelector('.journey-summary span:nth-child(2)'),
        time: document.querySelector('.journey-summary span:nth-child(3)'),
        price: document.querySelector('.journey-summary span:last-child')
    };

    if (busInfoElements.operator) {
        busInfoElements.operator.textContent = selectedBus.operator;
    }

    if (busInfoElements.route) {
        busInfoElements.route.innerHTML = `
            <i class="fas fa-map-marker-alt text-primary me-1"></i>
            ${selectedBus.from} → ${selectedBus.to}
        `;
    }

    if (busInfoElements.date) {
        const today = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        busInfoElements.date.innerHTML = `
            <i class="fas fa-calendar-alt text-primary me-1"></i>
            ${today}
        `;
    }

    if (busInfoElements.time) {
        busInfoElements.time.innerHTML = `
            <i class="fas fa-clock text-primary me-1"></i>
            ${selectedBus.departureTime} - ${selectedBus.arrivalTime}
        `;
    }

    if (busInfoElements.price) {
        busInfoElements.price.innerHTML = `
            <i class="fas fa-money-bill-wave text-primary me-1"></i>
            ${selectedBus.price.toLocaleString()} FCFA per seat
        `;
    }
}

// Update bus info in header
function updateBusInfo() {
    const busInfoSection = document.querySelector('.bus-info-header');
    if (busInfoSection && selectedBus) {
        // Update is handled in loadBusData()
        loadBusData();
    }
}

// Initialize seat interaction
function initializeSeatInteraction() {
    const seats = document.querySelectorAll('.seat-available');
    
    seats.forEach(seat => {
        seat.addEventListener('click', function() {
            const seatNumber = this.dataset.seat;
            const seatPrice = parseFloat(this.dataset.price);
            
            if (this.classList.contains('seat-selected')) {
                // Deselect seat
                this.classList.remove('seat-selected');
                this.classList.add('seat-available');
                selectedSeats = selectedSeats.filter(s => s.number !== seatNumber);
            } else {
                // Select seat (limit to 4 seats)
                if (selectedSeats.length >= 4) {
                    showAlert('You can select maximum 4 seats at a time', 'warning');
                    return;
                }
                
                this.classList.remove('seat-available');
                this.classList.add('seat-selected');
                selectedSeats.push({
                    number: seatNumber,
                    price: seatPrice
                });
            }
            
            updateSelectedSeatsDisplay();
            updateBookingSummary();
            updateProceedButton();
        });
    });
}

// Update selected seats display
function updateSelectedSeatsDisplay() {
    const selectedSeatsDisplay = document.getElementById('selectedSeatsDisplay');
    const selectedSeatsList = document.getElementById('selectedSeatsList');
    
    if (selectedSeats.length === 0) {
        if (selectedSeatsDisplay) {
            selectedSeatsDisplay.textContent = 'None';
        }
        if (selectedSeatsList) {
            selectedSeatsList.innerHTML = '<p class="text-muted text-center">No seats selected</p>';
        }
    } else {
        const seatNumbers = selectedSeats.map(seat => seat.number).join(', ');
        
        if (selectedSeatsDisplay) {
            selectedSeatsDisplay.textContent = seatNumbers;
        }
        
        if (selectedSeatsList) {
            selectedSeatsList.innerHTML = selectedSeats.map(seat => `
                <div class="selected-seat-item d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <span class="fw-semibold">Seat ${seat.number}</span>
                    <span class="text-primary">${seat.price.toLocaleString()} FCFA</span>
                </div>
            `).join('');
        }
    }
}

// Update booking summary
function updateBookingSummary() {
    const baseFare = selectedSeats.reduce((total, seat) => total + seat.price, 0);
    const taxesFees = Math.round(baseFare * 0.1); // 10% taxes
    const finalTotal = baseFare + taxesFees;
    
    // Update price elements
    const elements = {
        totalAmount: document.getElementById('totalAmount'),
        baseFare: document.getElementById('baseFare'),
        taxesFees: document.getElementById('taxesFees'),
        finalTotal: document.getElementById('finalTotal')
    };
    
    if (elements.totalAmount) {
        elements.totalAmount.textContent = finalTotal.toLocaleString();
    }
    
    if (elements.baseFare) {
        elements.baseFare.textContent = `${baseFare.toLocaleString()} FCFA`;
    }
    
    if (elements.taxesFees) {
        elements.taxesFees.textContent = `${taxesFees.toLocaleString()} FCFA`;
    }
    
    if (elements.finalTotal) {
        elements.finalTotal.textContent = `${finalTotal.toLocaleString()} FCFA`;
    }
    
    // Update journey details in booking summary
    updateJourneyDetails();
}

// Update journey details in booking summary
function updateJourneyDetails() {
    if (!selectedBus) return;
    
    const journeyDetails = document.querySelector('.journey-details');
    if (journeyDetails) {
        const today = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        journeyDetails.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Route:</span>
                <span class="fw-semibold">${selectedBus.from} → ${selectedBus.to}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Date:</span>
                <span class="fw-semibold">${today}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Time:</span>
                <span class="fw-semibold">${selectedBus.departureTime} - ${selectedBus.arrivalTime}</span>
            </div>
            <div class="d-flex justify-content-between">
                <span class="text-muted">Bus:</span>
                <span class="fw-semibold">${selectedBus.operator}</span>
            </div>
        `;
    }
}

// Update proceed button state
function updateProceedButton() {
    const proceedBtn = document.getElementById('proceedBtn');
    const bookingNote = document.querySelector('.booking-note');
    
    if (proceedBtn) {
        if (selectedSeats.length > 0) {
            proceedBtn.disabled = false;
            proceedBtn.classList.remove('btn-secondary');
            proceedBtn.classList.add('btn-primary');
            
            if (bookingNote) {
                bookingNote.innerHTML = `
                    <small class="text-success">
                        <i class="fas fa-check-circle me-1"></i>
                        ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected. Ready to proceed!
                    </small>
                `;
            }
        } else {
            proceedBtn.disabled = true;
            proceedBtn.classList.remove('btn-primary');
            proceedBtn.classList.add('btn-secondary');
            
            if (bookingNote) {
                bookingNote.innerHTML = `
                    <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        Please select at least one seat to proceed
                    </small>
                `;
            }
        }
    }
}

// Proceed to booking
function proceedToBooking() {
    if (selectedSeats.length === 0) {
        showAlert('Please select at least one seat', 'warning');
        return;
    }
    
    // Store booking data
    const bookingData = {
        bus: selectedBus,
        selectedSeats: selectedSeats,
        totalAmount: selectedSeats.reduce((total, seat) => total + seat.price, 0),
        taxesFees: Math.round(selectedSeats.reduce((total, seat) => total + seat.price, 0) * 0.1),
        bookingDate: new Date().toISOString(),
        journeyDate: new Date().toISOString().split('T')[0]
    };
    
    bookingData.finalTotal = bookingData.totalAmount + bookingData.taxesFees;
    
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // Show loading state
    const proceedBtn = document.getElementById('proceedBtn');
    const originalText = proceedBtn.innerHTML;
    proceedBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    proceedBtn.disabled = true;
    
    // Simulate processing delay
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 1500);
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

// Initialize seat map with random booked seats
function initializeSeatMap() {
    const seats = document.querySelectorAll('.seat');
    const bookedSeats = ['2B', '3C', '5A', '8B']; // Predefined booked seats
    
    seats.forEach(seat => {
        const seatNumber = seat.dataset.seat;
        
        if (bookedSeats.includes(seatNumber)) {
            seat.classList.remove('seat-available');
            seat.classList.add('seat-booked');
            seat.style.cursor = 'not-allowed';
        }
    });
}

// Call initialization
initializeSeatMap();