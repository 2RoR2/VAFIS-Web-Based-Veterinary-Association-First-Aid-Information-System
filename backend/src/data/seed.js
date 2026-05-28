import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'vafis',
});

const SALT_ROUNDS = 10;

// ── Users ─────────────────────────────────────────────────────────────────────

const users = [
  { email: 'owner@gmail.com',  password: 'vafis123', fullName: 'Pet Owner',                  role: 'user'         },
  { email: 'vet@gmail.com',    password: 'vafis123', fullName: 'Veterinary Professional',     role: 'professional' },
  { email: 'admin@gmail.com',  password: 'vafis123', fullName: 'Association Administrator',   role: 'admin'        },
];

// ── Sample quiz data (INSERT IGNORE — won't overwrite if already seeded via db:seed) ──

const quizzes = [
  {
    id: 'dog-basics',
    title: 'Dog First-Aid Basics',
    species: 'Dogs',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    passingScore: 70,
    description: 'Test your knowledge of essential first-aid skills for dogs.',
    questions: JSON.stringify([
      {
        question: 'What is the normal resting heart rate for an adult dog?',
        options: ['20-40 beats per minute', '60-100 beats per minute', '100-160 beats per minute', '200-250 beats per minute'],
        correct: 1,
        explanation: 'A normal resting heart rate for adult dogs is 60-100 bpm. Larger dogs tend to have slower heart rates, while smaller dogs have faster ones.'
      },
      {
        question: 'What color should a healthy dog\'s gums be?',
        options: ['White or pale', 'Pink', 'Bright red', 'Blue or purple'],
        correct: 1,
        explanation: 'Healthy gums should be pink and moist. Any other color — pale, blue, bright red — can indicate a serious emergency requiring immediate vet care.'
      },
      {
        question: 'Which of the following is a sign of heatstroke in dogs?',
        options: ['Shivering', 'Excessive panting and drooling', 'Decreased heart rate', 'Cold ears'],
        correct: 1,
        explanation: 'Excessive panting and drooling are key early signs of heatstroke. Move the dog to shade and apply cool (not cold) water immediately.'
      },
      {
        question: 'How deep should chest compressions be when performing CPR on a medium-sized dog?',
        options: ['Half an inch', '1–2 inches (one-third of chest width)', '4–5 inches', 'As deep as possible'],
        correct: 1,
        explanation: 'Compressions should be about 1–2 inches deep (roughly one-third of the chest width) at a rate of 100–120 per minute, same as human CPR.'
      },
      {
        question: 'If a dog ingests a known toxin, what should you do first?',
        options: ['Induce vomiting immediately', 'Contact a vet or poison hotline before doing anything', 'Give the dog milk to dilute the poison', 'Wait to see if symptoms appear'],
        correct: 1,
        explanation: 'Always contact a vet or poison control hotline first. Inducing vomiting is NOT safe for all toxins and can cause further injury in some cases.'
      }
    ])
  },
  {
    id: 'cat-emergency',
    title: 'Cat Emergency Care',
    species: 'Cats',
    category: 'Emergency Response',
    difficulty: 'Intermediate',
    passingScore: 70,
    description: 'Key skills for responding to feline emergencies quickly and safely.',
    questions: JSON.stringify([
      {
        question: 'What is the normal respiratory rate for a resting cat?',
        options: ['5-10 breaths per minute', '15-30 breaths per minute', '40-60 breaths per minute', '70-100 breaths per minute'],
        correct: 1,
        explanation: 'A normal resting respiratory rate for cats is 15-30 breaths per minute. Rates above 30 at rest may indicate respiratory distress.'
      },
      {
        question: 'A cat is choking and still conscious. What should you do first?',
        options: ['Give water immediately', 'Safely open the mouth and check for visible obstructions', 'Put the cat in a dark room to calm it', 'Feed the cat to dislodge the object'],
        correct: 1,
        explanation: 'First safely open the mouth and look for visible obstructions. If visible and reachable, gently try to remove it. Never perform blind finger sweeps.'
      },
      {
        question: 'Which sign most clearly indicates a cat may be in severe pain?',
        options: ['Purring', 'Hiding and reluctance to move', 'Increased appetite', 'Grooming more than usual'],
        correct: 1,
        explanation: 'Hiding and reluctance to move are classic signs of pain in cats. Unlike dogs, cats often hide pain, so behavioral changes are important signals.'
      },
      {
        question: 'What is the correct compression-to-breath ratio for cat CPR?',
        options: ['15:2', '30:2', '5:1', '50:1'],
        correct: 1,
        explanation: 'The recommended ratio for cat CPR is 30 chest compressions to 2 rescue breaths, consistent with small animal CPR guidelines.'
      }
    ])
  },
  {
    id: 'general-firstaid',
    title: 'General Pet First-Aid',
    species: 'All Pets',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    passingScore: 60,
    description: 'Universal first-aid principles that apply across all pet species.',
    questions: JSON.stringify([
      {
        question: 'What is the first priority when you encounter a pet emergency?',
        options: ['Administer medication', 'Ensure your own safety before approaching', 'Call a friend for advice', 'Feed the pet to keep its energy up'],
        correct: 1,
        explanation: 'Your safety always comes first. An injured or frightened animal may bite or scratch. Approach calmly and carefully.'
      },
      {
        question: 'When should you use a muzzle on an injured pet?',
        options: ['Never — it is cruel', 'When the pet is in pain and may bite during treatment', 'Only on large dogs', 'Only when the vet asks'],
        correct: 1,
        explanation: 'Even the friendliest pet may bite when in pain. A muzzle protects both you and the animal during first-aid treatment — never apply one if breathing is compromised.'
      },
      {
        question: 'How should you transport an injured pet to the vet?',
        options: ['Let it walk on its own to avoid further injury', 'Use a flat board or blanket as a stretcher to minimize movement', 'Carry it upright in your arms', 'Place it loose in the back seat'],
        correct: 1,
        explanation: 'A flat surface minimizes spinal movement and is safest for injuries. Use a board, tray, or firm blanket to keep the animal as still as possible.'
      },
      {
        question: 'Which of the following is NOT recommended first-aid for a bleeding wound?',
        options: ['Apply firm direct pressure', 'Use a tourniquet as a first response', 'Keep the pet calm and still', 'Cover the wound with a clean cloth'],
        correct: 1,
        explanation: 'Tourniquets should only be a last resort for life-threatening limb bleeding. Direct pressure is always the first step for wound control.'
      },
      {
        question: 'What should you do if you are unsure whether a substance your pet ate is poisonous?',
        options: ['Wait 24 hours and monitor', 'Induce vomiting with salt water', 'Contact a vet or animal poison control immediately', 'Give the pet extra food to dilute the substance'],
        correct: 2,
        explanation: 'Always call a vet or animal poison control line immediately. Waiting can be dangerous, and home remedies like salt water or milk can cause additional harm.'
      }
    ])
  }
];

// ── Clinic data (INSERT IGNORE — safe if already seeded via db:seed) ──────────
// Uses INSERT IGNORE on primary key — no duplicate if same id already exists.

const clinics = [
  {
    id: 'kuching-emergency-vet',
    name: 'Kuching Emergency Veterinary Centre',
    address: 'Jalan Tun Jugah',
    city: 'Kuching, Sarawak 93350',
    phone: '+60 82-555 100',
    email: 'emergency@kuchingvetcare.my',
    website: 'www.kuchingvetcare.my',
    hours: 'Open 24/7',
    hoursDetail: JSON.stringify({ Monday: '24 Hours', Tuesday: '24 Hours', Wednesday: '24 Hours', Thursday: '24 Hours', Friday: '24 Hours', Saturday: '24 Hours', Sunday: '24 Hours' }),
    distance: '1.2 km',
    isOpen: 1,
    isEmergency: 1,
    services: JSON.stringify(['Emergency Care', 'Critical Care', 'Emergency Surgery', 'Toxicology', 'Trauma Care', 'Advanced Diagnostics']),
    species: JSON.stringify(['Dogs', 'Cats', 'Rabbits', 'Small Animals']),
    rating: 4.8,
    reviews: 431,
    lat: 1.5261,
    lng: 110.3593,
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
    hoursDetail: JSON.stringify({ Monday: '9:00 AM - 6:00 PM', Tuesday: '9:00 AM - 6:00 PM', Wednesday: '9:00 AM - 6:00 PM', Thursday: '9:00 AM - 6:00 PM', Friday: '9:00 AM - 6:00 PM', Saturday: '9:00 AM - 1:00 PM', Sunday: 'Closed' }),
    distance: '2.4 km',
    isOpen: 1,
    isEmergency: 0,
    services: JSON.stringify(['General Practice', 'Vaccinations', 'Dental Care', 'Wellness Exams', 'Microchipping', 'Minor Surgery']),
    species: JSON.stringify(['Dogs', 'Cats']),
    rating: 4.7,
    reviews: 286,
    lat: 1.5269,
    lng: 110.3784,
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
    hoursDetail: JSON.stringify({ Monday: '8:00 AM - 8:00 PM', Tuesday: '8:00 AM - 8:00 PM', Wednesday: '8:00 AM - 8:00 PM', Thursday: '8:00 AM - 8:00 PM', Friday: '8:00 AM - 8:00 PM', Saturday: '8:00 AM - 8:00 PM', Sunday: '8:00 AM - 8:00 PM' }),
    distance: '3.1 km',
    isOpen: 1,
    isEmergency: 0,
    services: JSON.stringify(['General Practice', 'Surgery', 'Diagnostic Imaging', 'Laboratory Services', 'Nutrition Counseling']),
    species: JSON.stringify(['Dogs', 'Cats', 'Birds', 'Rabbits']),
    rating: 4.6,
    reviews: 512,
    lat: 1.5128,
    lng: 110.3822,
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
    hoursDetail: JSON.stringify({ Monday: '24 Hours', Tuesday: '24 Hours', Wednesday: '24 Hours', Thursday: '24 Hours', Friday: '24 Hours', Saturday: '24 Hours', Sunday: '24 Hours' }),
    distance: '4.6 km',
    isOpen: 1,
    isEmergency: 1,
    services: JSON.stringify(['Emergency Care', 'Critical Care', 'Emergency Surgery', 'Trauma Stabilisation', 'Pain Management']),
    species: JSON.stringify(['Dogs', 'Cats', 'Exotic Pets']),
    rating: 4.9,
    reviews: 644,
    lat: 1.5534,
    lng: 110.3781,
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
    hoursDetail: JSON.stringify({ Monday: 'Closed', Tuesday: '9:00 AM - 5:00 PM', Wednesday: '9:00 AM - 5:00 PM', Thursday: '9:00 AM - 5:00 PM', Friday: '9:00 AM - 5:00 PM', Saturday: '9:00 AM - 5:00 PM', Sunday: 'Closed' }),
    distance: '6.8 km',
    isOpen: 0,
    isEmergency: 0,
    services: JSON.stringify(['General Practice', 'Vaccinations', 'Spay/Neuter', 'Dental Cleaning', 'Grooming']),
    species: JSON.stringify(['Dogs', 'Cats']),
    rating: 4.5,
    reviews: 198,
    lat: 1.5163,
    lng: 110.2917,
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
    hoursDetail: JSON.stringify({ Monday: '8:00 AM - 7:00 PM', Tuesday: '8:00 AM - 7:00 PM', Wednesday: '8:00 AM - 7:00 PM', Thursday: '8:00 AM - 7:00 PM', Friday: '8:00 AM - 7:00 PM', Saturday: '9:00 AM - 5:00 PM', Sunday: '9:00 AM - 5:00 PM' }),
    distance: '5.2 km',
    isOpen: 1,
    isEmergency: 0,
    services: JSON.stringify(['General Practice', 'Surgery', 'Ultrasound', 'X-Ray', 'Pharmacy', 'Pet Supplies']),
    species: JSON.stringify(['Dogs', 'Cats', 'Rabbits', 'Guinea Pigs']),
    rating: 4.7,
    reviews: 377,
    lat: 1.5716,
    lng: 110.3458,
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
    hoursDetail: JSON.stringify({ Monday: '10:00 AM - 6:00 PM', Tuesday: '10:00 AM - 6:00 PM', Wednesday: '10:00 AM - 6:00 PM', Thursday: '10:00 AM - 6:00 PM', Friday: '10:00 AM - 6:00 PM', Saturday: '10:00 AM - 6:00 PM', Sunday: 'Closed' }),
    distance: '3.9 km',
    isOpen: 1,
    isEmergency: 0,
    services: JSON.stringify(['Exotic Animal Care', 'Avian Medicine', 'Small Mammal Care', 'Specialized Surgery']),
    species: JSON.stringify(['Birds', 'Rabbits', 'Guinea Pigs', 'Hamsters', 'Reptiles']),
    rating: 4.8,
    reviews: 154,
    lat: 1.5401,
    lng: 110.3439,
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
    hoursDetail: JSON.stringify({ Monday: '8:00 AM - 6:00 PM', Tuesday: '8:00 AM - 6:00 PM', Wednesday: '8:00 AM - 6:00 PM', Thursday: '8:00 AM - 6:00 PM', Friday: '8:00 AM - 6:00 PM', Saturday: 'Limited Hours', Sunday: 'Closed' }),
    distance: 'Citywide',
    isOpen: 1,
    isEmergency: 0,
    services: JSON.stringify(['Home Visits', 'Wellness Exams', 'Vaccinations', 'Senior Pet Care', 'Chronic Disease Management']),
    species: JSON.stringify(['Dogs', 'Cats', 'Small Animals']),
    rating: 4.6,
    reviews: 209,
    lat: 1.5533,
    lng: 110.3592,
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
    hoursDetail: JSON.stringify({ Monday: '6:00 PM - 8:00 AM', Tuesday: '6:00 PM - 8:00 AM', Wednesday: '6:00 PM - 8:00 AM', Thursday: '6:00 PM - 8:00 AM', Friday: '6:00 PM - Monday 8:00 AM', Saturday: '24 Hours', Sunday: '24 Hours' }),
    distance: '18.5 km',
    isOpen: 1,
    isEmergency: 1,
    services: JSON.stringify(['After-Hours Emergency', 'Weekend Emergency Care', 'Urgent Surgery', 'Critical Care']),
    species: JSON.stringify(['Dogs', 'Cats']),
    rating: 4.6,
    reviews: 228,
    lat: 1.4599,
    lng: 110.4983,
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
    hoursDetail: JSON.stringify({ Monday: '7:30 AM - 7:30 PM', Tuesday: '7:30 AM - 7:30 PM', Wednesday: '7:30 AM - 7:30 PM', Thursday: '7:30 AM - 7:30 PM', Friday: '7:30 AM - 7:30 PM', Saturday: '8:00 AM - 4:00 PM', Sunday: 'Closed' }),
    distance: '2.9 km',
    isOpen: 1,
    isEmergency: 0,
    services: JSON.stringify(['General Practice', 'Preventive Care', 'Surgery', 'Dental Care', 'Dermatology', 'Geriatric Care']),
    species: JSON.stringify(['Dogs', 'Cats']),
    rating: 4.8,
    reviews: 333,
    lat: 1.5238,
    lng: 110.3686,
  },
];

// ── Emergency contacts ─────────────────────────────────────────────────────────
// emergency_contacts uses auto-increment id — no unique key for INSERT IGNORE.
// We only insert these if the table is currently empty.

const emergencyContacts = [
  {
    name: 'Kuching Emergency Veterinary Centre',
    phone: '+60 82-555 100',
    description: '24/7 emergency veterinary contact for Kuching pets.',
    available: '24/7',
  },
  {
    name: 'Pending Urgent Pet Hospital',
    phone: '+60 82-555 140',
    description: 'Emergency and urgent care contact for Kuching area.',
    available: '24/7',
  },
  {
    name: 'Samarahan After-Hours Vet',
    phone: '+60 82-555 190',
    description: 'After-hours and weekend support for Kuching and Kota Samarahan.',
    available: 'After hours',
  },
];

try {
  await connection.beginTransaction();

  // ── Seed default users (INSERT IGNORE on email — never overwrites real accounts) ──
  // Uses a unique-email check so running this script multiple times won't
  // delete accounts created via Sign Up (like real user accounts).
  for (const user of users) {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [user.email]);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
      const id = crypto.randomUUID();
      await connection.execute(
        'INSERT INTO users (id, fullName, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
        [id, user.fullName, user.email, passwordHash, user.role],
      );
      console.log(`  Seeded ${user.role}: ${user.email}`);
    } else {
      console.log(`  Skipped ${user.email} (already exists)`);
    }
  }

  // ── Seed sample quizzes (INSERT IGNORE — safe to run alongside db:seed) ──────
  for (const quiz of quizzes) {
    await connection.execute(
      `INSERT IGNORE INTO quizzes (id, title, species, category, difficulty, passingScore, questions, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [quiz.id, quiz.title, quiz.species, quiz.category, quiz.difficulty, quiz.passingScore, quiz.questions, quiz.description],
    );
    console.log(`  Seeded quiz: ${quiz.title}`);
  }

  // ── Seed clinics (INSERT IGNORE on primary key — safe to run alongside db:seed) ──
  for (const clinic of clinics) {
    await connection.execute(
      `INSERT IGNORE INTO clinics
         (id, name, address, city, phone, email, website, hours, hoursDetail,
          distance, isOpen, isEmergency, services, species, rating, reviews, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clinic.id, clinic.name, clinic.address, clinic.city, clinic.phone,
        clinic.email, clinic.website, clinic.hours, clinic.hoursDetail,
        clinic.distance, clinic.isOpen, clinic.isEmergency,
        clinic.services, clinic.species, clinic.rating, clinic.reviews,
        clinic.lat, clinic.lng,
      ],
    );
    console.log(`  Seeded clinic: ${clinic.name}`);
  }

  // ── Seed emergency contacts (only if table is empty) ─────────────────────────
  // emergency_contacts has no unique key other than auto-increment id,
  // so we skip inserting if rows already exist to avoid duplicates.
  const [[{ cnt }]] = await connection.query('SELECT COUNT(*) AS cnt FROM emergency_contacts');
  if (Number(cnt) === 0) {
    for (const contact of emergencyContacts) {
      await connection.execute(
        'INSERT INTO emergency_contacts (name, phone, description, available) VALUES (?, ?, ?, ?)',
        [contact.name, contact.phone, contact.description, contact.available],
      );
      console.log(`  Seeded emergency contact: ${contact.name}`);
    }
  } else {
    console.log(`  Skipped emergency_contacts (${cnt} row(s) already exist)`);
  }

  await connection.commit();
  console.log('Backend seed complete.');
} catch (error) {
  await connection.rollback();
  console.error('Backend seed failed.', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
