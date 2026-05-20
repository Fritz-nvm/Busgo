from django import forms
from django.forms import formset_factory
from .models import Booking, Passenger

class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = ['contact_email', 'contact_phone']
        widgets = {
            'contact_email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter email address'
            }),
            'contact_phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '6XX XXX XXX'
            }),
        }

class PassengerForm(forms.ModelForm):
    class Meta:
        model = Passenger
        fields = ['name', 'age', 'gender']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter full name'
            }),
            'age': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Age',
                'min': 1,
                'max': 120
            }),
            'gender': forms.Select(attrs={
                'class': 'form-select'
            }),
        }

PassengerFormSet = formset_factory(PassengerForm, extra=1)

class SearchForm(forms.Form):
    CITY_CHOICES = [
        ('', 'Select city'),
        ('Douala', 'Douala'),
        ('Bamenda', 'Bamenda'),
        ('Buea', 'Buea'),
        ('Limbe', 'Limbe'),
        ('Maroua', 'Maroua'),
        ('Far North', 'Far North'),
        ('Littoral', 'Littoral'),
        ('Garoua', 'Garoua'),
    ]
    
    from_city = forms.ChoiceField(
        choices=CITY_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    to_city = forms.ChoiceField(
        choices=CITY_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    travel_date = forms.DateField(
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )
    passengers = forms.ChoiceField(
        choices=[(i, f'{i} Passenger{"s" if i > 1 else ""}') for i in range(1, 5)],
        initial=1,
        widget=forms.Select(attrs={'class': 'form-select'})
    )