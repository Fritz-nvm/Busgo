// Minimal JavaScript for BusGo Cameroon - Django Version

document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today for date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
        input.min = today;
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Basic validation for select elements
            const fromSelect = form.querySelector('select[name="from_city"]');
            const toSelect = form.querySelector('select[name="to_city"]');
            
            if (fromSelect && toSelect && fromSelect.value === toSelect.value && fromSelect.value !== '') {
                e.preventDefault();
                alert('Departure and destination cities must be different');
                return false;
            }
        });
    });

    // Auto-submit for sort dropdown
    const sortSelects = document.querySelectorAll('select[name="sort_by"]');
    sortSelects.forEach(select => {
        select.addEventListener('change', function() {
            this.form.submit();
        });
    });
});

// Utility function for alerts (if needed)
function showAlert(message, type = 'info') {
    alert(message); // Simple fallback, can be enhanced with Bootstrap alerts
}