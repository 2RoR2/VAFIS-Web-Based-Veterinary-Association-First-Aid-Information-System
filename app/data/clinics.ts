export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  hours: string;
  hoursDetail: { [key: string]: string };
  distance: string;
  isOpen: boolean;
  isEmergency: boolean;
  services: string[];
  species: string[];
  rating: number;
  reviews: number;
  lat?: number;
  lng?: number;
}

export const clinics: Clinic[] = [
  {
    id: 'kuching-emergency-vet',
    name: 'Kuching Emergency Veterinary Centre',
    address: 'Jalan Tun Jugah',
    city: 'Kuching, Sarawak 93350',
    phone: '+60 82-555 100',
    email: 'emergency@kuchingvetcare.my',
    website: 'www.kuchingvetcare.my',
    hours: 'Open 24/7',
    hoursDetail: {
      Monday: '24 Hours',
      Tuesday: '24 Hours',
      Wednesday: '24 Hours',
      Thursday: '24 Hours',
      Friday: '24 Hours',
      Saturday: '24 Hours',
      Sunday: '24 Hours'
    },
    distance: '1.2 km',
    isOpen: true,
    isEmergency: true,
    services: ['Emergency Care', 'Critical Care', 'Emergency Surgery', 'Toxicology', 'Trauma Care', 'Advanced Diagnostics'],
    species: ['Dogs', 'Cats', 'Rabbits', 'Small Animals'],
    rating: 4.8,
    reviews: 431,
    lat: 1.5261,
    lng: 110.3593
  },
  {
    id: 'sarawak-pet-care-clinic',
    name: 'Sarawak Pet Care Clinic',
    address: 'Jalan Song',
    city: 'Kuching, Sarawak 93350',
    phone: '+60 82-555 120',
    email: 'hello@sarawakpetcare.my',
    website: 'www.sarawakpetcare.my',
    hours: 'Mon-Fri: 9AM-6PM, Sat: 9AM-1PM',
    hoursDetail: {
      Monday: '9:00 AM - 6:00 PM',
      Tuesday: '9:00 AM - 6:00 PM',
      Wednesday: '9:00 AM - 6:00 PM',
      Thursday: '9:00 AM - 6:00 PM',
      Friday: '9:00 AM - 6:00 PM',
      Saturday: '9:00 AM - 1:00 PM',
      Sunday: 'Closed'
    },
    distance: '2.4 km',
    isOpen: true,
    isEmergency: false,
    services: ['General Practice', 'Vaccinations', 'Dental Care', 'Wellness Exams', 'Microchipping', 'Minor Surgery'],
    species: ['Dogs', 'Cats'],
    rating: 4.7,
    reviews: 286,
    lat: 1.5269,
    lng: 110.3784
  },
  {
    id: 'stutong-animal-hospital',
    name: 'Stutong Animal Hospital',
    address: 'Jalan Stutong',
    city: 'Kuching, Sarawak 93350',
    phone: '+60 82-555 130',
    email: 'reception@stutonganimal.my',
    website: 'www.stutonganimal.my',
    hours: 'Mon-Sun: 8AM-8PM',
    hoursDetail: {
      Monday: '8:00 AM - 8:00 PM',
      Tuesday: '8:00 AM - 8:00 PM',
      Wednesday: '8:00 AM - 8:00 PM',
      Thursday: '8:00 AM - 8:00 PM',
      Friday: '8:00 AM - 8:00 PM',
      Saturday: '8:00 AM - 8:00 PM',
      Sunday: '8:00 AM - 8:00 PM'
    },
    distance: '3.1 km',
    isOpen: true,
    isEmergency: false,
    services: ['General Practice', 'Surgery', 'Diagnostic Imaging', 'Laboratory Services', 'Nutrition Counseling'],
    species: ['Dogs', 'Cats', 'Birds', 'Rabbits'],
    rating: 4.6,
    reviews: 512,
    lat: 1.5128,
    lng: 110.3822
  },
  {
    id: 'pending-urgent-pet-hospital',
    name: 'Pending Urgent Pet Hospital',
    address: 'Jalan Pending',
    city: 'Kuching, Sarawak 93450',
    phone: '+60 82-555 140',
    email: 'urgent@pendingpethospital.my',
    website: 'www.pendingpethospital.my',
    hours: 'Open 24/7',
    hoursDetail: {
      Monday: '24 Hours',
      Tuesday: '24 Hours',
      Wednesday: '24 Hours',
      Thursday: '24 Hours',
      Friday: '24 Hours',
      Saturday: '24 Hours',
      Sunday: '24 Hours'
    },
    distance: '4.6 km',
    isOpen: true,
    isEmergency: true,
    services: ['Emergency Care', 'Critical Care', 'Emergency Surgery', 'Trauma Stabilisation', 'Pain Management'],
    species: ['Dogs', 'Cats', 'Exotic Pets'],
    rating: 4.9,
    reviews: 644,
    lat: 1.5534,
    lng: 110.3781
  },
  {
    id: 'batu-kawa-vet-clinic',
    name: 'Batu Kawa Veterinary Clinic',
    address: 'Jalan Batu Kawa',
    city: 'Kuching, Sarawak 93250',
    phone: '+60 82-555 150',
    email: 'care@batukawavet.my',
    website: 'www.batukawavet.my',
    hours: 'Tue-Sat: 9AM-5PM',
    hoursDetail: {
      Monday: 'Closed',
      Tuesday: '9:00 AM - 5:00 PM',
      Wednesday: '9:00 AM - 5:00 PM',
      Thursday: '9:00 AM - 5:00 PM',
      Friday: '9:00 AM - 5:00 PM',
      Saturday: '9:00 AM - 5:00 PM',
      Sunday: 'Closed'
    },
    distance: '6.8 km',
    isOpen: false,
    isEmergency: false,
    services: ['General Practice', 'Vaccinations', 'Spay/Neuter', 'Dental Cleaning', 'Grooming'],
    species: ['Dogs', 'Cats'],
    rating: 4.5,
    reviews: 198,
    lat: 1.5163,
    lng: 110.2917
  },
  {
    id: 'petra-jaya-animal-care',
    name: 'Petra Jaya Animal Care',
    address: 'Jalan Astana',
    city: 'Petra Jaya, Kuching, Sarawak 93050',
    phone: '+60 82-555 160',
    email: 'info@petrajayaanimal.my',
    website: 'www.petrajayaanimal.my',
    hours: 'Mon-Fri: 8AM-7PM, Sat-Sun: 9AM-5PM',
    hoursDetail: {
      Monday: '8:00 AM - 7:00 PM',
      Tuesday: '8:00 AM - 7:00 PM',
      Wednesday: '8:00 AM - 7:00 PM',
      Thursday: '8:00 AM - 7:00 PM',
      Friday: '8:00 AM - 7:00 PM',
      Saturday: '9:00 AM - 5:00 PM',
      Sunday: '9:00 AM - 5:00 PM'
    },
    distance: '5.2 km',
    isOpen: true,
    isEmergency: false,
    services: ['General Practice', 'Surgery', 'Ultrasound', 'X-Ray', 'Pharmacy', 'Pet Supplies'],
    species: ['Dogs', 'Cats', 'Rabbits', 'Guinea Pigs'],
    rating: 4.7,
    reviews: 377,
    lat: 1.5716,
    lng: 110.3458
  },
  {
    id: 'kuching-exotic-pet-care',
    name: 'Kuching Exotic Pet Care',
    address: 'Jalan Green',
    city: 'Kuching, Sarawak 93150',
    phone: '+60 82-555 170',
    email: 'care@kuchingexoticpets.my',
    website: 'www.kuchingexoticpets.my',
    hours: 'Mon-Sat: 10AM-6PM',
    hoursDetail: {
      Monday: '10:00 AM - 6:00 PM',
      Tuesday: '10:00 AM - 6:00 PM',
      Wednesday: '10:00 AM - 6:00 PM',
      Thursday: '10:00 AM - 6:00 PM',
      Friday: '10:00 AM - 6:00 PM',
      Saturday: '10:00 AM - 6:00 PM',
      Sunday: 'Closed'
    },
    distance: '3.9 km',
    isOpen: true,
    isEmergency: false,
    services: ['Exotic Animal Care', 'Avian Medicine', 'Small Mammal Care', 'Specialized Surgery'],
    species: ['Birds', 'Rabbits', 'Guinea Pigs', 'Hamsters', 'Reptiles'],
    rating: 4.8,
    reviews: 154,
    lat: 1.5401,
    lng: 110.3439
  },
  {
    id: 'kuching-mobile-vet',
    name: 'Kuching Mobile Vet Services',
    address: 'Mobile service across Kuching',
    city: 'Kuching, Sarawak',
    phone: '+60 82-555 180',
    email: 'booking@kuchingmobilevet.my',
    website: 'www.kuchingmobilevet.my',
    hours: 'Mon-Fri: 8AM-6PM (By Appointment)',
    hoursDetail: {
      Monday: '8:00 AM - 6:00 PM',
      Tuesday: '8:00 AM - 6:00 PM',
      Wednesday: '8:00 AM - 6:00 PM',
      Thursday: '8:00 AM - 6:00 PM',
      Friday: '8:00 AM - 6:00 PM',
      Saturday: 'Limited Hours',
      Sunday: 'Closed'
    },
    distance: 'Citywide',
    isOpen: true,
    isEmergency: false,
    services: ['Home Visits', 'Wellness Exams', 'Vaccinations', 'Senior Pet Care', 'Chronic Disease Management'],
    species: ['Dogs', 'Cats', 'Small Animals'],
    rating: 4.6,
    reviews: 209,
    lat: 1.5533,
    lng: 110.3592
  },
  {
    id: 'samarahan-after-hours-vet',
    name: 'Samarahan After-Hours Vet',
    address: 'Jalan Datuk Mohammad Musa',
    city: 'Kota Samarahan, Sarawak 94300',
    phone: '+60 82-555 190',
    email: 'afterhours@samarahanvet.my',
    website: 'www.samarahanvet.my',
    hours: 'Evenings & Weekends Only',
    hoursDetail: {
      Monday: '6:00 PM - 8:00 AM',
      Tuesday: '6:00 PM - 8:00 AM',
      Wednesday: '6:00 PM - 8:00 AM',
      Thursday: '6:00 PM - 8:00 AM',
      Friday: '6:00 PM - Monday 8:00 AM',
      Saturday: '24 Hours',
      Sunday: '24 Hours'
    },
    distance: '18.5 km',
    isOpen: true,
    isEmergency: true,
    services: ['After-Hours Emergency', 'Weekend Emergency Care', 'Urgent Surgery', 'Critical Care'],
    species: ['Dogs', 'Cats'],
    rating: 4.6,
    reviews: 228,
    lat: 1.4599,
    lng: 110.4983
  },
  {
    id: 'tabuan-companion-care',
    name: 'Tabuan Companion Care Veterinary Centre',
    address: 'Tabuan Jaya Commercial Centre',
    city: 'Kuching, Sarawak 93350',
    phone: '+60 82-555 200',
    email: 'hello@tabuancompanion.my',
    website: 'www.tabuancompanion.my',
    hours: 'Mon-Fri: 7:30AM-7:30PM, Sat: 8AM-4PM',
    hoursDetail: {
      Monday: '7:30 AM - 7:30 PM',
      Tuesday: '7:30 AM - 7:30 PM',
      Wednesday: '7:30 AM - 7:30 PM',
      Thursday: '7:30 AM - 7:30 PM',
      Friday: '7:30 AM - 7:30 PM',
      Saturday: '8:00 AM - 4:00 PM',
      Sunday: 'Closed'
    },
    distance: '2.9 km',
    isOpen: true,
    isEmergency: false,
    services: ['General Practice', 'Preventive Care', 'Surgery', 'Dental Care', 'Dermatology', 'Geriatric Care'],
    species: ['Dogs', 'Cats'],
    rating: 4.8,
    reviews: 333,
    lat: 1.5238,
    lng: 110.3686
  }
];

export const emergencyContacts = [
  {
    name: 'Kuching Emergency Veterinary Centre',
    phone: '+60 82-555 100',
    description: 'Prototype 24/7 emergency veterinary contact for Kuching pets.',
    available: '24/7'
  },
  {
    name: 'Pending Urgent Pet Hospital',
    phone: '+60 82-555 140',
    description: 'Prototype emergency and urgent care contact for Kuching area.',
    available: '24/7'
  },
  {
    name: 'Samarahan After-Hours Vet',
    phone: '+60 82-555 190',
    description: 'Prototype after-hours weekend support for Kuching and Kota Samarahan.',
    available: 'After hours'
  }
];
