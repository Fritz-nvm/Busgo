import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import time, timedelta
from myapp.models import BusOperator, Bus, Route, Schedule, Seat

class Command(BaseCommand):
    help = 'Populate database with sample data for BusGo Cameroon'

    def handle(self, *args, **options):
        self.stdout.write('Populating database with sample data...')
        
        # Create bus operators
        operators_data = [
            {
                'name': 'VATICAN EXPRESS',
                'contact_phone': '+237 6XX XXX XXX',
                'contact_email': 'info@vaticanexpress.cm',
                'license_number': 'VE2024001'
            },
            {
                'name': 'MOGHAMO EXPRESS',
                'contact_phone': '+237 6XX XXX XXX',
                'contact_email': 'info@moghamoexpress.cm',
                'license_number': 'ME2024002'
            },
            {
                'name': 'NSO BOYS',
                'contact_phone': '+237 6XX XXX XXX',
                'contact_email': 'info@nsoboys.cm',
                'license_number': 'NB2024003'
            },
            {
                'name': 'AMO MEZAM',
                'contact_phone': '+237 6XX XXX XXX',
                'contact_email': 'info@amomezam.cm',
                'license_number': 'AM2024004'
            },
            {
                'name': 'GRAND EXPRESS',
                'contact_phone': '+237 6XX XXX XXX',
                'contact_email': 'info@grandexpress.cm',
                'license_number': 'GE2024005'
            }
        ]
        
        operators = []
        for op_data in operators_data:
            operator, created = BusOperator.objects.get_or_create(
                name=op_data['name'],
                defaults=op_data
            )
            operators.append(operator)
            if created:
                self.stdout.write(f'Created operator: {operator.name}')
        
        # Create buses
        buses_data = [
            {'operator': operators[0], 'bus_number': 'VE-2024', 'bus_type': 'AC', 'has_wifi': True, 'has_ac': True, 'has_charging': True},
            {'operator': operators[1], 'bus_number': 'ME-1856', 'bus_type': 'Standard', 'has_charging': True},
            {'operator': operators[2], 'bus_number': 'NB-9876', 'bus_type': 'VIP', 'has_wifi': True, 'has_ac': True, 'has_charging': True, 'has_entertainment': True},
            {'operator': operators[3], 'bus_number': 'AM-7890', 'bus_type': 'Economy', 'has_charging': True},
            {'operator': operators[4], 'bus_number': 'GE-5432', 'bus_type': 'Premium', 'has_wifi': True, 'has_ac': True, 'has_charging': True},
        ]
        
        buses = []
        for bus_data in buses_data:
            bus, created = Bus.objects.get_or_create(
                bus_number=bus_data['bus_number'],
                defaults=bus_data
            )
            buses.append(bus)
            if created:
                self.stdout.write(f'Created bus: {bus.bus_number}')
                
                # Create seats for this bus
                self.create_seats_for_bus(bus)
        
        # Create routes
        routes_data = [
            {'from_city': 'Douala', 'to_city': 'Bamenda', 'distance_km': 300, 'estimated_duration': '4h 30m'},
            {'from_city': 'Bamenda', 'to_city': 'Douala', 'distance_km': 300, 'estimated_duration': '4h 30m'},
            {'from_city': 'Douala', 'to_city': 'Buea', 'distance_km': 80, 'estimated_duration': '1h 30m'},
            {'from_city': 'Buea', 'to_city': 'Douala', 'distance_km': 80, 'estimated_duration': '1h 30m'},
            {'from_city': 'Bamenda', 'to_city': 'Maroua', 'distance_km': 450, 'estimated_duration': '6h 00m'},
            {'from_city': 'Limbe', 'to_city': 'Garoua', 'distance_km': 600, 'estimated_duration': '8h 00m'},
        ]
        
        routes = []
        for route_data in routes_data:
            route, created = Route.objects.get_or_create(
                from_city=route_data['from_city'],
                to_city=route_data['to_city'],
                defaults=route_data
            )
            routes.append(route)
            if created:
                self.stdout.write(f'Created route: {route.from_city} → {route.to_city}')
        
        # Create schedules
        schedules_data = [
            {'bus': buses[0], 'route': routes[0], 'departure_time': time(8, 30), 'arrival_time': time(13, 0), 'price': 7500},
            {'bus': buses[1], 'route': routes[0], 'departure_time': time(10, 15), 'arrival_time': time(15, 0), 'price': 6000},
            {'bus': buses[2], 'route': routes[0], 'departure_time': time(22, 30), 'arrival_time': time(3, 45), 'price': 9500},
            {'bus': buses[3], 'route': routes[0], 'departure_time': time(20, 0), 'arrival_time': time(1, 30), 'price': 5000},
            {'bus': buses[4], 'route': routes[0], 'departure_time': time(9, 0), 'arrival_time': time(13, 30), 'price': 8000},
            
            # Return routes
            {'bus': buses[0], 'route': routes[1], 'departure_time': time(14, 0), 'arrival_time': time(18, 30), 'price': 7500},
            {'bus': buses[1], 'route': routes[1], 'departure_time': time(16, 15), 'arrival_time': time(21, 0), 'price': 6000},
            
            # Other routes
            {'bus': buses[0], 'route': routes[2], 'departure_time': time(7, 0), 'arrival_time': time(8, 30), 'price': 5000},
            {'bus': buses[1], 'route': routes[3], 'departure_time': time(17, 0), 'arrival_time': time(18, 30), 'price': 5000},
        ]
        
        for schedule_data in schedules_data:
            schedule, created = Schedule.objects.get_or_create(
                bus=schedule_data['bus'],
                route=schedule_data['route'],
                departure_time=schedule_data['departure_time'],
                defaults=schedule_data
            )
            if created:
                self.stdout.write(f'Created schedule: {schedule.bus.bus_number} - {schedule.route}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))
    
    def create_seats_for_bus(self, bus):
        """Create seats for a bus (70 seats in typical Cameroon bus layout)"""
        seats_data = []
        
        # Create 70 seats in rows of 4 (2+2 layout)
        for row in range(1, 18):  # 17 rows
            # Left side seats
            seats_data.append({
                'bus': bus,
                'seat_number': f'{row}A',
                'row_number': row,
                'is_window': True,
                'is_aisle': False
            })
            seats_data.append({
                'bus': bus,
                'seat_number': f'{row}B',
                'row_number': row,
                'is_window': False,
                'is_aisle': True
            })
            
            # Right side seats
            seats_data.append({
                'bus': bus,
                'seat_number': f'{row}C',
                'row_number': row,
                'is_window': False,
                'is_aisle': True
            })
            seats_data.append({
                'bus': bus,
                'seat_number': f'{row}D',
                'row_number': row,
                'is_window': True,
                'is_aisle': False
            })
        
        # Add 2 more seats in the last row to make 70
        seats_data.append({
            'bus': bus,
            'seat_number': '18A',
            'row_number': 18,
            'is_window': True,
            'is_aisle': False
        })
        seats_data.append({
            'bus': bus,
            'seat_number': '18B',
            'row_number': 18,
            'is_window': False,
            'is_aisle': True
        })
        
        for seat_data in seats_data:
            Seat.objects.get_or_create(
                bus=seat_data['bus'],
                seat_number=seat_data['seat_number'],
                defaults=seat_data
            )
        
        self.stdout.write(f'Created {len(seats_data)} seats for bus {bus.bus_number}')