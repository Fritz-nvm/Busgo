from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class BusOperator(models.Model):
    name = models.CharField(max_length=100)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    license_number = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Bus(models.Model):
    BUS_TYPES = [
        ('AC', 'AC'),
        ('VIP', 'VIP'),
        ('Premium', 'Premium'),
        ('Economy', 'Economy'),
        ('Standard', 'Standard'),
    ]
    
    operator = models.ForeignKey(BusOperator, on_delete=models.CASCADE)
    bus_number = models.CharField(max_length=20, unique=True)
    bus_type = models.CharField(max_length=20, choices=BUS_TYPES)
    total_seats = models.IntegerField(default=70)
    has_wifi = models.BooleanField(default=False)
    has_ac = models.BooleanField(default=False)
    has_charging = models.BooleanField(default=False)
    has_entertainment = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.operator.name} - {self.bus_number}"

class Route(models.Model):
    from_city = models.CharField(max_length=50)
    to_city = models.CharField(max_length=50)
    distance_km = models.IntegerField()
    estimated_duration = models.CharField(max_length=20)  # e.g., "4h 30m"
    
    class Meta:
        unique_together = ['from_city', 'to_city']
    
    def __str__(self):
        return f"{self.from_city} → {self.to_city}"

class Schedule(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    # Days of week the schedule runs
    monday = models.BooleanField(default=True)
    tuesday = models.BooleanField(default=True)
    wednesday = models.BooleanField(default=True)
    thursday = models.BooleanField(default=True)
    friday = models.BooleanField(default=True)
    saturday = models.BooleanField(default=True)
    sunday = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.bus} - {self.route} at {self.departure_time}"
    
    @property
    def duration(self):
        return self.route.estimated_duration
    
    @property
    def operator_name(self):
        return self.bus.operator.name

class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat_number = models.CharField(max_length=5)  # e.g., "1A", "2B"
    row_number = models.IntegerField()
    is_window = models.BooleanField(default=False)
    is_aisle = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['bus', 'seat_number']
    
    def __str__(self):
        return f"{self.bus.bus_number} - Seat {self.seat_number}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    booking_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    travel_date = models.DateField()
    
    # Contact information
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    
    # Pricing
    base_fare = models.DecimalField(max_digits=10, decimal_places=2)
    taxes_fees = models.DecimalField(max_digits=10, decimal_places=2)
    processing_fee = models.DecimalField(max_digits=10, decimal_places=2, default=150)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status and timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Payment information
    payment_method = models.CharField(max_length=50, blank=True)
    payment_phone = models.CharField(max_length=20, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Booking {self.booking_id} - {self.schedule.route}"
    
    @property
    def pnr(self):
        return f"BG{str(self.booking_id)[:8].upper()}"

class Passenger(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(120)])
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    
    def __str__(self):
        return f"{self.name} - Seat {self.seat.seat_number}"

class SeatBooking(models.Model):
    """Track which seats are booked for specific dates"""
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    travel_date = models.DateField()
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['seat', 'schedule', 'travel_date']
    
    def __str__(self):
        return f"Seat {self.seat.seat_number} - {self.travel_date}"

class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review for {self.booking.schedule.bus} - {self.rating} stars"