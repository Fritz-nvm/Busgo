// Payment JavaScript for BusGo Cameroon

document.addEventListener('DOMContentLoaded', function() {
    initializePayment();
    loadBookingData();
    initializePaymentForm();
});

let bookingData = null;

// Initialize payment
function initializePayment() {
    // Load booking data from localStorage
    const storedBookingData = localStorage.getItem('currentBooking');
    if (storedBookingData) {
        bookingData = JSON.parse(storedBookingData);
        updatePaymentAmounts();
    }
}

// Load booking data
function loadBookingData() {
    if (!bookingData) {
        // Fallback data for demo
        bookingData = {
            totalAmount: 7500,
            taxesFees: 750,
            finalTotal: 8350
        };
        updatePaymentAmounts();
    }
}

// Update payment amounts
function updatePaymentAmounts() {
    const processingFee = 100;
    const total = bookingData.totalAmount + bookingData.taxesFees + processingFee;
    
    document.getElementById('baseFareAmount').textContent = `${bookingData.totalAmount.toLocaleString()} FCFA`;
    document.getElementById('taxesAmount').textContent = `${bookingData.taxesFees.toLocaleString()} FCFA`;
    document.getElementById('processingFee').textContent = `${processingFee.toLocaleString()} FCFA`;
    document.getElementById('totalAmount').textContent = `${total.toLocaleString()} FCFA`;
}

// Initialize payment form
function initializePaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePayment);
    }
    
    // Update payment method display
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', updatePaymentMethod);
    });
}

// Handle payment submission
async function handlePayment(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const phoneNumber = formData.get('phone') || e.target.querySelector('input[type="tel"]').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 9) {
        showAlert('Please enter a valid phone number', 'warning');
        return;
    }
    
    // Show processing modal
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
    
    try {
        // Simulate payment processing
        await simulatePayment(paymentMethod, phoneNumber);
        
        // Hide modal
        modal.hide();
        
        // Show success and redirect
        showAlert('Payment successful! Redirecting to confirmation...', 'success');
        
        setTimeout(() => {
            window.location.href = 'booking-confirmation.html';
        }, 2000);
        
    } catch (error) {
        // Hide modal
        modal.hide();
        
        // Show error
        showAlert('Payment failed. Please try again.', 'danger');
    }
}

// Update payment method display
function updatePaymentMethod() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    console.log('Selected payment method:', selectedMethod);
}

// Simulate payment processing
function simulatePayment(method, phoneNumber) {
    return new Promise((resolve, reject) => {
        // Simulate API call delay
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    transactionId: 'TXN' + Date.now(),
                    method: method,
                    phone: phoneNumber
                });
            } else {
                reject(new Error('Payment failed'));
            }
        }, 3000); // 3 second delay to simulate processing
    });
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