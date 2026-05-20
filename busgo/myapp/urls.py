from django.urls import path
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # Main pages
    path('', views.home, name='home'),
    path('buses/', views.bus_listing, name='bus_listing'),
    path('seats/<int:bus_id>/', views.seat_selection, name='seat_selection'),
    path('booking-details/', views.booking_details, name='booking_details'),
    path('payment/', views.payment, name='payment'),
    path('process-payment/', views.process_payment, name='process_payment'),
    path('confirmation/', views.confirmation, name='confirmation'),
    
    # Authentication
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    
    # API endpoints
    path('bus-listing/seat-selection/', views.select_seats_api, name='select_seats_api'),
]
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)