from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q, Avg, Count
from datetime import datetime, timedelta
import json
from decimal import Decimal

from .models import (
    Bus, Schedule, Route, Seat, Booking, Passenger, 
    SeatBooking, BusOperator, Review
)
from .forms import BookingForm, PassengerFormSet

def home(request):
    """Home page view"""
    context = {
        'today': timezone.now().date(),
    }
    return render(request, 'homepage.html', context)

def bus_listing(request):
    """Bus listing page with search and filters"""
    # Get search parameters
    from_city = request.GET.get('from_city', 'Douala')
    to_city = request.GET.get('to_city', 'Bamenda')
    travel_date = request.GET.get('travel_date', timezone.now().date())
    
    # Parse travel date
    if isinstance(travel_date, str):
        try:
            travel_date = datetime.strptime(travel_date, '%Y-%m-%d').date()
        except ValueError:
            travel_date = timezone.now().date()
    
    # Get route
    try:
        route = Route.objects.get(from_city=from_city, to_city=to_city)
    except Route.DoesNotExist:
        # Create route if it doesn't exist (for demo purposes)
        route = Route.objects.create(
            from_city=from_city,
            to_city=to_city,
            distance_km=300,
            estimated_duration="4h 30m"
        )
    
    # Get schedules for this route
    schedules = Schedule.objects.filter(
        route=route,
        is_active=True,
        bus__is_active=True
    ).select_related('bus', 'bus__operator', 'route')
    
    # Apply filters
    time_filter = request.GET.getlist('time_filter')
    if time_filter:
        time_q = Q()
        if 'morning' in time_filter:
            time_q |= Q(departure_time__hour__gte=6, departure_time__hour__lt=18)
        if 'night' in time_filter:
            time_q |= Q(departure_time__hour__gte=18) | Q(departure_time__hour__lt=6)
        schedules = schedules.filter(time_q)
    
    max_price = request.GET.get('max_price')
    if max_price:
        schedules = schedules.filter(price__lte=max_price)
    
    bus_types = request.GET.getlist('bus_type')
    if bus_types:
        schedules = schedules.filter(bus__bus_type__in=bus_types)
    
    # Apply sorting
    sort_by = request.GET.get('sort_by', 'departure_time')
    if sort_by == 'price_low':
        schedules = schedules.order_by('price')
    elif sort_by == 'price_high':
        schedules = schedules.order_by('-price')
    elif sort_by == 'rating':
        schedules = schedules.annotate(
            avg_rating=Avg('bus__booking__review__rating')
        ).order_by('-avg_rating')
    else:
        schedules = schedules.order_by('departure_time')
    
    # Calculate available seats for each schedule
    buses_data = []
    for schedule in schedules:
        # Get booked seats for this date
        booked_seats = SeatBooking.objects.filter(
            schedule=schedule,
            travel_date=travel_date,
            is_active=True
        ).count()
        
        available_seats = schedule.bus.total_seats - booked_seats
        
        # Get reviews
        reviews = Review.objects.filter(booking__schedule__bus=schedule.bus)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 4.0
        reviews_count = reviews.count()
        
        bus_data = {
            'id': schedule.id,
            'operator_name': schedule.bus.operator.name,
            'bus_number': schedule.bus.bus_number,
            'bus_type': schedule.bus.bus_type,
            'departure_time': schedule.departure_time,
            'arrival_time': schedule.arrival_time,
            'duration': schedule.duration,
            'price': schedule.price,
            'total_seats': schedule.bus.total_seats,
            'available_seats': available_seats,
            'rating': round(avg_rating, 1),
            'reviews_count': reviews_count,
            'has_wifi': schedule.bus.has_wifi,
            'has_ac': schedule.bus.has_ac,
            'has_charging': schedule.bus.has_charging,
            'has_entertainment': schedule.bus.has_entertainment,
        }
        buses_data.append(bus_data)
    
    context = {
        'buses': buses_data,
        'search_params': {
            'from_city': from_city,
            'to_city': to_city,
            'travel_date': travel_date,
            'passengers': request.GET.get('passengers', '1'),
        },
        'today': timezone.now().date(),
    }
    
    return render(request, 'bus-listing.html', context)

def seat_selection(request, bus_id):
    """Seat selection page"""
    schedule = get_object_or_404(Schedule, id=bus_id)
    
    # Get search parameters
    from_city = request.GET.get('from_city', schedule.route.from_city)
    to_city = request.GET.get('to_city', schedule.route.to_city)
    travel_date = request.GET.get('travel_date', timezone.now().date())
    
    if isinstance(travel_date, str):
        try:
            travel_date = datetime.strptime(travel_date, '%Y-%m-%d').date()
        except ValueError:
            travel_date = timezone.now().date()
    
    # Get seats for this bus
    seats = Seat.objects.filter(bus=schedule.bus).order_by('row_number', 'seat_number')
    
    # Get booked seats for this date
    booked_seats = SeatBooking.objects.filter(
        schedule=schedule,
        travel_date=travel_date,
        is_active=True
    ).values_list('seat__seat_number', flat=True)
    
    # Create seat layout
    seat_layout = []
    current_row = None
    row_seats = []
    
    for seat in seats:
        if current_row != seat.row_number:
            if row_seats:
                seat_layout.append({
                    'row_number': current_row,
                    'seats': row_seats
                })
            current_row = seat.row_number
            row_seats = []
        
        seat_data = {
            'seat_number': seat.seat_number,
            'is_booked': seat.seat_number in booked_seats,
            'is_aisle': seat.is_aisle,
        }
        row_seats.append(seat_data)
    
    # Add the last row
    if row_seats:
        seat_layout.append({
            'row_number': current_row,
            'seats': row_seats
        })
    
    context = {
        'bus': {
            'id': schedule.id,
            'operator_name': schedule.bus.operator.name,
            'bus_number': schedule.bus.bus_number,
            'departure_time': schedule.departure_time,
            'arrival_time': schedule.arrival_time,
            'price': schedule.price,
        },
        'seat_layout': seat_layout,
        'search_params': {
            'from_city': from_city,
            'to_city': to_city,
            'travel_date': travel_date,
        },
    }
    
    return render(request, 'seat-selection.html', context)

def booking_details(request):
    """Booking details page"""
    if request.method == 'POST':
        # Get form data
        bus_id = request.POST.get('bus_id')
        from_city = request.POST.get('from_city')
        to_city = request.POST.get('to_city')
        travel_date = request.POST.get('travel_date')
        selected_seats_json = request.POST.get('selected_seats')
        
        try:
            selected_seats = json.loads(selected_seats_json)
        except (json.JSONDecodeError, TypeError):
            messages.error(request, 'Invalid seat selection data')
            return redirect('bus_listing')
        
        schedule = get_object_or_404(Schedule, id=bus_id)
        
        # Parse travel date
        if isinstance(travel_date, str):
            try:
                travel_date = datetime.strptime(travel_date, '%Y-%m-%d').date()
            except ValueError:
                travel_date = timezone.now().date()
        
        # Calculate totals
        base_fare = sum(Decimal(str(seat['price'])) for seat in selected_seats)
        taxes_fees = base_fare * Decimal('0.1')  # 10% taxes
        processing_fee = Decimal('150')
        total_amount = base_fare + taxes_fees + processing_fee
        
        # Get seat display
        selected_seats_display = ', '.join(seat['number'] for seat in selected_seats)
        
        context = {
            'bus': {
                'id': schedule.id,
                'operator_name': schedule.bus.operator.name,
                'departure_time': schedule.departure_time,
                'arrival_time': schedule.arrival_time,
            },
            'booking_data': {
                'from_city': from_city,
                'to_city': to_city,
                'travel_date': travel_date,
                'bus_id': bus_id,
            },
            'selected_seats': selected_seats,
            'selected_seats_display': selected_seats_display,
            'selected_seats_json': selected_seats_json,
            'base_fare': base_fare,
            'taxes_fees': taxes_fees,
            'processing_fee': processing_fee,
            'total_amount': total_amount,
        }
        
        return render(request, 'booking-details.html', context)
    
    return redirect('bus_listing')

def payment(request):
    """Payment page"""
    if request.method == 'POST':
        # Get all form data
        bus_id = request.POST.get('bus_id')
        from_city = request.POST.get('from_city')
        to_city = request.POST.get('to_city')
        travel_date = request.POST.get('travel_date')
        selected_seats_json = request.POST.get('selected_seats')
        total_amount = request.POST.get('total_amount')
        contact_email = request.POST.get('contact_email')
        contact_phone = request.POST.get('contact_phone')
        
        # Get passenger data
        passengers_data = []
        seat_index = 0
        while True:
            name = request.POST.get(f'passenger_{seat_index}_name')
            if not name:
                break
            
            passenger = {
                'name': name,
                'age': request.POST.get(f'passenger_{seat_index}_age'),
                'gender': request.POST.get(f'passenger_{seat_index}_gender'),
                'seat': request.POST.get(f'passenger_{seat_index}_seat'),
            }
            passengers_data.append(passenger)
            seat_index += 1
        
        try:
            selected_seats = json.loads(selected_seats_json)
        except (json.JSONDecodeError, TypeError):
            messages.error(request, 'Invalid booking data')
            return redirect('bus_listing')
        
        schedule = get_object_or_404(Schedule, id=bus_id)
        
        # Parse travel date
        if isinstance(travel_date, str):
            try:
                travel_date = datetime.strptime(travel_date, '%Y-%m-%d').date()
            except ValueError:
                travel_date = timezone.now().date()
        
        # Calculate totals
        base_fare = sum(Decimal(str(seat['price'])) for seat in selected_seats)
        taxes_fees = base_fare * Decimal('0.1')
        processing_fee = Decimal('150')
        final_total = base_fare + taxes_fees + processing_fee
        
        # Get seat display
        selected_seats_display = ', '.join(seat['number'] for seat in selected_seats)
        
        context = {
            'booking_data': {
                'from_city': from_city,
                'to_city': to_city,
                'travel_date': travel_date,
                'bus_id': bus_id,
                'contact_email': contact_email,
                'contact_phone': contact_phone,
            },
            'passengers_json': json.dumps(passengers_data),
            'selected_seats': selected_seats,
            'selected_seats_display': selected_seats_display,
            'base_fare': base_fare,
            'taxes_fees': taxes_fees,
            'processing_fee': processing_fee,
            'final_total': final_total,
        }
        
        return render(request, 'payment.html', context)
    
    return redirect('bus_listing')

def process_payment(request):
    """Process payment and create booking"""
    if request.method == 'POST':
        # Get form data
        bus_id = request.POST.get('bus_id')
        from_city = request.POST.get('from_city')
        to_city = request.POST.get('to_city')
        travel_date = request.POST.get('travel_date')
        contact_email = request.POST.get('contact_email')
        contact_phone = request.POST.get('contact_phone')
        passengers_json = request.POST.get('passengers_data')
        final_total = request.POST.get('final_total')
        payment_method = request.POST.get('payment_method')
        payment_phone = request.POST.get('payment_phone')
        
        try:
            passengers_data = json.loads(passengers_json)
        except (json.JSONDecodeError, TypeError):
            messages.error(request, 'Invalid passenger data')
            return redirect('bus_listing')
        
        schedule = get_object_or_404(Schedule, id=bus_id)
        
        # Parse travel date
        if isinstance(travel_date, str):
            try:
                travel_date = datetime.strptime(travel_date, '%Y-%m-%d').date()
            except ValueError:
                travel_date = timezone.now().date()
        
        # Calculate amounts
        base_fare = Decimal(final_total) / Decimal('1.11')  # Reverse calculate
        taxes_fees = base_fare * Decimal('0.1')
        processing_fee = Decimal('150')
        
        # Create booking
        booking = Booking.objects.create(
            user=request.user if request.user.is_authenticated else None,
            schedule=schedule,
            travel_date=travel_date,
            contact_email=contact_email,
            contact_phone=contact_phone,
            base_fare=base_fare,
            taxes_fees=taxes_fees,
            processing_fee=processing_fee,
            total_amount=final_total,
            status='confirmed',
            payment_method=payment_method,
            payment_phone=payment_phone,
            transaction_id=f'TXN{timezone.now().timestamp():.0f}',
        )
        
        # Create passengers and seat bookings
        for passenger_data in passengers_data:
            # Get seat
            seat = get_object_or_404(
                Seat, 
                bus=schedule.bus, 
                seat_number=passenger_data['seat']
            )
            
            # Create passenger
            Passenger.objects.create(
                booking=booking,
                seat=seat,
                name=passenger_data['name'],
                age=int(passenger_data['age']),
                gender=passenger_data['gender'],
            )
            
            # Create seat booking
            SeatBooking.objects.create(
                seat=seat,
                schedule=schedule,
                travel_date=travel_date,
                booking=booking,
            )
        
        # Store booking ID in session for confirmation page
        request.session['booking_id'] = str(booking.booking_id)
        
        return redirect('confirmation')
    
    return redirect('bus_listing')

def confirmation(request):
    """Booking confirmation page"""
    booking_id = request.session.get('booking_id')
    if not booking_id:
        messages.error(request, 'No booking found')
        return redirect('home')
    
    booking = get_object_or_404(Booking, booking_id=booking_id)
    
    context = {
        'booking': booking,
        'passengers': booking.passengers.all(),
    }
    
    return render(request, 'booking-confirmation.html', context)

def login_view(request):
    """Login page"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid username or password')
    
    return render(request, 'login.html')

def register_view(request):
    """Register page"""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    
    return render(request, 'register.html', {'form': form})

@csrf_exempt
def select_seats_api(request):
    """API endpoint for seat selection (for JavaScript integration)"""
    if request.method == 'POST':
        bus_id = request.POST.get('bus_id')
        from_city = request.POST.get('from_city')
        to_city = request.POST.get('to_city')
        travel_date = request.POST.get('travel_date')
        
        # Store in session or return success
        request.session['seat_selection_data'] = {
            'bus_id': bus_id,
            'from_city': from_city,
            'to_city': to_city,
            'travel_date': travel_date,
        }
        
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False})