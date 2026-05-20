from django.contrib import admin
from .models import (
    BusOperator, Bus, Route, Schedule, Seat, 
    Booking, Passenger, SeatBooking, Review
)

@admin.register(BusOperator)
class BusOperatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_phone', 'license_number', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'license_number']

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_number', 'operator', 'bus_type', 'total_seats', 'is_active']
    list_filter = ['bus_type', 'is_active', 'has_wifi', 'has_ac']
    search_fields = ['bus_number', 'operator__name']

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['from_city', 'to_city', 'distance_km', 'estimated_duration']
    search_fields = ['from_city', 'to_city']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['bus', 'route', 'departure_time', 'arrival_time', 'price', 'is_active']
    list_filter = ['is_active', 'bus__bus_type']
    search_fields = ['bus__bus_number', 'route__from_city', 'route__to_city']

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['bus', 'seat_number', 'row_number', 'is_window', 'is_aisle']
    list_filter = ['is_window', 'is_aisle']
    search_fields = ['bus__bus_number', 'seat_number']

class PassengerInline(admin.TabularInline):
    model = Passenger
    extra = 0

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'schedule', 'travel_date', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at', 'travel_date']
    search_fields = ['booking_id', 'contact_email', 'contact_phone']
    inlines = [PassengerInline]
    readonly_fields = ['booking_id', 'created_at', 'updated_at']

@admin.register(SeatBooking)
class SeatBookingAdmin(admin.ModelAdmin):
    list_display = ['seat', 'schedule', 'travel_date', 'booking', 'is_active']
    list_filter = ['travel_date', 'is_active']
    search_fields = ['seat__seat_number', 'booking__booking_id']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['booking', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['booking__booking_id', 'comment']