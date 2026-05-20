// Booking Confirmation JavaScript for BusGo Cameroon

document.addEventListener('DOMContentLoaded', function() {
    initializeBookingConfirmation();
    generateBookingReference();
    loadBookingData();
    initializeActionButtons();
});

let bookingData = null;
let bookingReference = '';

// Initialize booking confirmation
function initializeBookingConfirmation() {
    // Load booking data from localStorage
    const storedBookingData = localStorage.getItem('currentBooking');
    if (storedBookingData) {
        bookingData = JSON.parse(storedBookingData);
        updateBookingDetails();
    } else {
        // Fallback data for demo
        bookingData = {
            bus: {
                operator: 'VATICAN EXPRESS',
                from: 'Douala',
                to: 'Bamenda',
                departureTime: '08:30',
                arrivalTime: '13:00'
            },
            selectedSeats: [{ number: '3A', price: 7500 }],
            totalAmount: 7500,
            taxesFees: 750,
            finalTotal: 8400,
            journeyDate: new Date().toISOString().split('T')[0]
        };
        updateBookingDetails();
    }
}

// Generate booking reference
function generateBookingReference() {
    bookingReference = 'BG' + new Date().getFullYear() + 
                      String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    
    // Update booking reference in UI
    const refElement = document.querySelector('.card-header h3');
    if (refElement) {
        refElement.textContent = `#${bookingReference}`;
    }
}

// Load and display booking data
function loadBookingData() {
    if (!bookingData) return;
    
    // Store confirmed booking
    const confirmedBooking = {
        ...bookingData,
        id: bookingReference,
        pnr: bookingReference,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
    };
    
    // Add to bookings history
    const existingBookings = JSON.parse(localStorage.getItem('busgo_bookings') || '[]');
    existingBookings.push(confirmedBooking);
    localStorage.setItem('busgo_bookings', JSON.stringify(existingBookings));
    
    // Clear current booking data
    localStorage.removeItem('currentBooking');
}

// Update booking details in UI
function updateBookingDetails() {
    if (!bookingData) return;
    
    updateJourneyInformation();
    updatePassengerInformation();
    updatePaymentSummary();
}

// Update journey information
function updateJourneyInformation() {
    const journeyInfo = document.querySelector('.journey-info');
    if (!journeyInfo || !bookingData.bus) return;
    
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    journeyInfo.innerHTML = `
        <h6 class="fw-bold mb-3">Journey Details</h6>
        <div class="row">
            <div class="col-md-6">
                <div class="info-item mb-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-bus text-primary me-3"></i>
                        <div>
                            <small class="text-muted">Bus Operator</small>
                            <div class="fw-semibold">${bookingData.bus.operator}</div>
                        </div>
                    </div>
                </div>
                
                <div class="info-item mb-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-route text-primary me-3"></i>
                        <div>
                            <small class="text-muted">Route</small>
                            <div class="fw-semibold">${bookingData.bus.from} → ${bookingData.bus.to}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="info-item mb-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-calendar-alt text-primary me-3"></i>
                        <div>
                            <small class="text-muted">Travel Date</small>
                            <div class="fw-semibold">${today}</div>
                        </div>
                    </div>
                </div>
                
                <div class="info-item mb-3">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-clock text-primary me-3"></i>
                        <div>
                            <small class="text-muted">Departure Time</small>
                            <div class="fw-semibold">${bookingData.bus.departureTime}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Update passenger information
function updatePassengerInformation() {
    const passengerInfo = document.querySelector('.passenger-info');
    if (!passengerInfo || !bookingData.selectedSeats) return;
    
    const passengerCards = bookingData.selectedSeats.map((seat, index) => `
        <div class="passenger-card bg-light rounded p-3 mb-3">
            <div class="row align-items-center">
                <div class="col-md-4">
                    <div class="passenger-avatar">
                        <i class="fas fa-user-circle text-primary me-2"></i>
                        <span class="fw-semibold">Passenger ${index + 1}</span>
                    </div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Age</small>
                    <div class="fw-semibold">28</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Gender</small>
                    <div class="fw-semibold">Adult</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Seat</small>
                    <div class="fw-semibold text-primary">${seat.number}</div>
                </div>
                <div class="col-md-2">
                    <small class="text-muted">Fare</small>
                    <div class="fw-semibold">${seat.price.toLocaleString()} FCFA</div>
                </div>
            </div>
        </div>
    `).join('');
    
    passengerInfo.innerHTML = `
        <h6 class="fw-bold mb-3">Passenger Details</h6>
        ${passengerCards}
    `;
}

// Update payment summary
function updatePaymentSummary() {
    const paymentSummary = document.querySelector('.payment-summary');
    if (!paymentSummary || !bookingData) return;
    
    const convenienceFee = 150;
    const totalPaid = bookingData.totalAmount + bookingData.taxesFees + convenienceFee;
    
    paymentSummary.innerHTML = `
        <h6 class="fw-bold mb-3">Payment Summary</h6>
        <div class="row">
            <div class="col-md-6">
                <div class="d-flex justify-content-between mb-2">
                    <span>Base Fare:</span>
                    <span>${bookingData.totalAmount.toLocaleString()} FCFA</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Taxes & Fees:</span>
                    <span>${bookingData.taxesFees.toLocaleString()} FCFA</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Convenience Fee:</span>
                    <span>${convenienceFee.toLocaleString()} FCFA</span>
                </div>
            </div>
            <div class="col-md-6">
                <div class="total-amount bg-primary text-white rounded p-3 text-center">
                    <small>Total Paid</small>
                    <h4 class="fw-bold mb-0">${totalPaid.toLocaleString()} FCFA</h4>
                </div>
            </div>
        </div>
    `;
}

// Initialize action buttons
function initializeActionButtons() {
    // Download ticket button
    const downloadBtn = document.querySelector('button[onclick="downloadTicket()"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTicket);
    }
    
    // Print ticket button
    const printBtn = document.querySelector('button[onclick="printTicket()"]');
    if (printBtn) {
        printBtn.addEventListener('click', printTicket);
    }
    
    // Share ticket button
    const shareBtn = document.querySelector('button[onclick="shareTicket()"]');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareTicket);
    }
    
    // Support buttons
    const chatBtn = document.querySelector('button[onclick="openChat()"]');
    if (chatBtn) {
        chatBtn.addEventListener('click', openChat);
    }
}

// Download ticket function
function downloadTicket() {
    // Create a simple text version of the ticket
    const ticketContent = generateTicketContent();
    
    // Create blob and download
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BusGo_Ticket_${bookingReference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Ticket downloaded successfully!', 'success');
}

// Print ticket function
function printTicket() {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    const ticketHTML = generatePrintableTicket();
    
    printWindow.document.write(ticketHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    
    showAlert('Print dialog opened', 'info');
}

// Share ticket function
function shareTicket() {
    const shareData = {
        title: 'BusGo Ticket',
        text: `My bus ticket for ${bookingData.bus.from} to ${bookingData.bus.to}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showAlert('Ticket shared successfully!', 'success'))
            .catch(() => showAlert('Sharing failed', 'error'));
    } else {
        // Fallback: copy to clipboard
        const ticketInfo = `BusGo Ticket #${bookingReference}\n${bookingData.bus.from} → ${bookingData.bus.to}\nDeparture: ${bookingData.bus.departureTime}`;
        
        navigator.clipboard.writeText(ticketInfo)
            .then(() => showAlert('Ticket details copied to clipboard!', 'success'))
            .catch(() => showAlert('Failed to copy ticket details', 'error'));
    }
}

// Open chat function
function openChat() {
    // Simulate opening chat
    showAlert('Chat support will be available soon!', 'info');
    
    // In a real application, this would open a chat widget
    console.log('Opening chat support...');
}

// Generate ticket content for download
function generateTicketContent() {
    const today = new Date().toLocaleDateString('en-US');
    
    return `
BusGo Cameroon - Bus Ticket
============================

Booking Reference: ${bookingReference}
Booking Date: ${today}

Journey Details:
- Route: ${bookingData.bus.from} → ${bookingData.bus.to}
- Date: ${today}
- Departure: ${bookingData.bus.departureTime}
- Arrival: ${bookingData.bus.arrivalTime}
- Bus Operator: ${bookingData.bus.operator}

Passenger Details:
${bookingData.selectedSeats.map((seat, index) => 
    `- Passenger ${index + 1}: Seat ${seat.number} - ${seat.price.toLocaleString()} FCFA`
).join('\n')}

Payment Summary:
- Base Fare: ${bookingData.totalAmount.toLocaleString()} FCFA
- Taxes & Fees: ${bookingData.taxesFees.toLocaleString()} FCFA
- Convenience Fee: 150 FCFA
- Total Paid: ${(bookingData.totalAmount + bookingData.taxesFees + 150).toLocaleString()} FCFA

Important Information:
- Please arrive 15 minutes before departure
- Carry a valid ID proof during travel
- Show this ticket to the conductor
- Cancellation allowed up to 2 hours before departure

Thank you for choosing BusGo Cameroon!
Support: support@busgo.cm | +237 6XX XXX XXX
    `.trim();
}

// Generate printable ticket HTML
function generatePrintableTicket() {
    const today = new Date().toLocaleDateString('en-US');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>BusGo Ticket - ${bookingReference}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 15px; }
            .section h3 { color: #2563eb; margin-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 1.2em; color: #2563eb; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚌 BusGo Cameroon</h1>
            <h2>Bus Ticket</h2>
            <p>Booking Reference: <strong>${bookingReference}</strong></p>
        </div>
        
        <div class="section">
            <h3>Journey Details</h3>
            <div class="info-row"><span>Route:</span><span>${bookingData.bus.from} → ${bookingData.bus.to}</span></div>
            <div class="info-row"><span>Date:</span><span>${today}</span></div>
            <div class="info-row"><span>Departure:</span><span>${bookingData.bus.departureTime}</span></div>
            <div class="info-row"><span>Bus Operator:</span><span>${bookingData.bus.operator}</span></div>
        </div>
        
        <div class="section">
            <h3>Passenger Details</h3>
            ${bookingData.selectedSeats.map((seat, index) => 
                `<div class="info-row"><span>Passenger ${index + 1}:</span><span>Seat ${seat.number} - ${seat.price.toLocaleString()} FCFA</span></div>`
            ).join('')}
        </div>
        
        <div class="section">
            <h3>Payment Summary</h3>
            <div class="info-row"><span>Base Fare:</span><span>${bookingData.totalAmount.toLocaleString()} FCFA</span></div>
            <div class="info-row"><span>Taxes & Fees:</span><span>${bookingData.taxesFees.toLocaleString()} FCFA</span></div>
            <div class="info-row"><span>Convenience Fee:</span><span>150 FCFA</span></div>
            <div class="info-row total"><span>Total Paid:</span><span>${(bookingData.totalAmount + bookingData.taxesFees + 150).toLocaleString()} FCFA</span></div>
        </div>
        
        <div class="footer">
            <p><strong>Important:</strong> Please arrive 15 minutes before departure | Carry valid ID | Show this ticket to conductor</p>
            <p>Thank you for choosing BusGo Cameroon! | support@busgo.cm | +237 6XX XXX XXX</p>
        </div>
    </body>
    </html>
    `;
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