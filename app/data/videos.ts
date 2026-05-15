export interface Video {
  id: string;
  title: string;
  duration: string;
  species: string;
  category: string;
  description: string;
  thumbnail: string;
  instructor: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  views: number;
}

export const videos: Video[] = [
  {
    id: 'cpr-dogs',
    title: 'How to Perform CPR on Dogs',
    duration: '5:30',
    species: 'Dogs',
    category: 'Life-Saving Techniques',
    description: 'Learn the proper technique for cardiopulmonary resuscitation in dogs of all sizes. This critical skill can save your dog\'s life in an emergency.',
    thumbnail: 'Dog',
    instructor: 'Dr. Sarah Mitchell, DVM',
    difficulty: 'Advanced',
    views: 15420
  },
  {
    id: 'heimlich-cats',
    title: 'Heimlich Maneuver for Choking Cats',
    duration: '3:45',
    species: 'Cats',
    category: 'Airway Emergencies',
    description: 'Step-by-step demonstration of how to help a choking cat using the Heimlich maneuver adapted for felines.',
    thumbnail: 'Cat',
    instructor: 'Dr. James Chen, DVM',
    difficulty: 'Intermediate',
    views: 12305
  },
  {
    id: 'wound-care',
    title: 'Treating Minor Cuts and Wounds',
    duration: '4:20',
    species: 'All Pets',
    category: 'Wound Care',
    description: 'Comprehensive guide to cleaning, treating, and bandaging minor wounds at home. Learn when professional care is needed.',
    thumbnail: 'Aid',
    instructor: 'Dr. Emily Rodriguez, DVM',
    difficulty: 'Beginner',
    views: 23150
  },
  {
    id: 'heatstroke-signs',
    title: 'Recognizing and Treating Heatstroke',
    duration: '6:15',
    species: 'Dogs',
    category: 'Environmental Emergencies',
    description: 'Identify early warning signs of heatstroke and learn life-saving cooling techniques. Essential summer knowledge for all dog owners.',
    thumbnail: 'Heat',
    instructor: 'Dr. Michael Foster, DVM',
    difficulty: 'Beginner',
    views: 18920
  },
  {
    id: 'rabbit-firstaid',
    title: 'Basic First-Aid Kit for Rabbits',
    duration: '5:45',
    species: 'Rabbits',
    category: 'Preparation',
    description: 'Essential items every rabbit owner should have for emergencies, including proper handling techniques for stressed rabbits.',
    thumbnail: 'Rabbit',
    instructor: 'Dr. Lisa Thompson, DVM',
    difficulty: 'Beginner',
    views: 8650
  },
  {
    id: 'bird-injuries',
    title: 'Emergency Care for Bird Injuries',
    duration: '4:45',
    species: 'Birds',
    category: 'Trauma',
    description: 'Learn how to safely handle injured birds and provide first-aid for common injuries including broken wings and bleeding.',
    thumbnail: 'Bird',
    instructor: 'Dr. Patricia Wong, DVM',
    difficulty: 'Intermediate',
    views: 7230
  },
  {
    id: 'paw-bandaging',
    title: 'How to Bandage a Pet\'s Paw',
    duration: '5:10',
    species: 'All Pets',
    category: 'Wound Care',
    description: 'Proper bandaging technique for paw injuries. Learn to secure bandages that won\'t slip while maintaining proper circulation.',
    thumbnail: 'Paw',
    instructor: 'Dr. Amanda Martinez, DVM',
    difficulty: 'Intermediate',
    views: 14580
  },
  {
    id: 'medication-admin',
    title: 'Administering Medication Safely',
    duration: '7:20',
    species: 'All Pets',
    category: 'Care Techniques',
    description: 'Techniques for giving pills, liquids, and eye drops to reluctant pets. Includes safety tips and common mistakes to avoid.',
    thumbnail: 'Meds',
    instructor: 'Dr. Robert Kim, DVM',
    difficulty: 'Beginner',
    views: 19870
  },
  {
    id: 'seizure-response',
    title: 'What to Do During a Pet Seizure',
    duration: '4:55',
    species: 'Dogs',
    category: 'Neurological Emergencies',
    description: 'Stay calm and learn proper protocol for keeping your pet safe during a seizure, including when to seek emergency care.',
    thumbnail: 'Dog',
    instructor: 'Dr. Jennifer Lee, DVM',
    difficulty: 'Intermediate',
    views: 11940
  },
  {
    id: 'poisoning-response',
    title: 'Pet Poisoning: First Response',
    duration: '6:30',
    species: 'All Pets',
    category: 'Toxicology',
    description: 'Critical steps to take when you suspect poisoning. Learn what to do, what NOT to do, and when to induce vomiting.',
    thumbnail: 'Toxin',
    instructor: 'Dr. Lisa Thompson, DVM, Toxicology',
    difficulty: 'Advanced',
    views: 16230
  },
  {
    id: 'heimlich-dogs',
    title: 'Heimlich Maneuver for Dogs',
    duration: '4:10',
    species: 'Dogs',
    category: 'Airway Emergencies',
    description: 'Learn the correct hand position and technique for performing the Heimlich maneuver on dogs of different sizes.',
    thumbnail: 'Dog',
    instructor: 'Dr. Sarah Mitchell, DVM',
    difficulty: 'Intermediate',
    views: 13670
  },
  {
    id: 'cat-cpr',
    title: 'CPR for Cats: Life-Saving Skills',
    duration: '5:00',
    species: 'Cats',
    category: 'Life-Saving Techniques',
    description: 'Master the technique of feline CPR including proper compression rate and rescue breathing for cats.',
    thumbnail: 'Cat',
    instructor: 'Dr. David Thompson, DVM',
    difficulty: 'Advanced',
    views: 10550
  },
  {
    id: 'bleeding-control',
    title: 'Controlling Severe Bleeding',
    duration: '4:30',
    species: 'All Pets',
    category: 'Trauma',
    description: 'Learn pressure point techniques and proper bandaging to control life-threatening bleeding until veterinary care is available.',
    thumbnail: 'Blood',
    instructor: 'Dr. Steven Anderson, DVM',
    difficulty: 'Intermediate',
    views: 12890
  },
  {
    id: 'broken-bones',
    title: 'Stabilizing Fractures for Transport',
    duration: '6:45',
    species: 'Dogs',
    category: 'Orthopedic Emergencies',
    description: 'Safe techniques for stabilizing suspected fractures and transporting injured pets to prevent further damage.',
    thumbnail: 'Bone',
    instructor: 'Dr. Amanda Martinez, DVM, Orthopedics',
    difficulty: 'Advanced',
    views: 9320
  },
  {
    id: 'shock-recognition',
    title: 'Recognizing and Responding to Shock',
    duration: '5:20',
    species: 'All Pets',
    category: 'Life-Threatening Emergencies',
    description: 'Identify the warning signs of shock and learn immediate care steps while transporting to emergency veterinary care.',
    thumbnail: 'Shock',
    instructor: 'Dr. Patricia Wong, DVM',
    difficulty: 'Intermediate',
    views: 11240
  },
  {
    id: 'eye-flush',
    title: 'How to Flush an Injured Eye',
    duration: '3:50',
    species: 'All Pets',
    category: 'Eye Injuries',
    description: 'Proper technique for flushing chemical irritants or debris from your pet\'s eye using sterile saline solution.',
    thumbnail: 'Eye',
    instructor: 'Dr. Jennifer Lee, DVM, Ophthalmology',
    difficulty: 'Beginner',
    views: 8970
  },
  {
    id: 'guinea-pig-care',
    title: 'Emergency Care for Guinea Pigs',
    duration: '5:30',
    species: 'Guinea Pigs',
    category: 'Small Animal Care',
    description: 'Common emergencies in guinea pigs including respiratory issues, bloat, and safe handling during stress.',
    thumbnail: 'Small Pet',
    instructor: 'Dr. Karen Martinez, DVM',
    difficulty: 'Beginner',
    views: 6840
  },
  {
    id: 'dehydration-check',
    title: 'Checking for Dehydration in Pets',
    duration: '3:15',
    species: 'All Pets',
    category: 'Assessment Skills',
    description: 'Learn the skin tent test and other methods to assess hydration status. Understand when IV fluids are necessary.',
    thumbnail: 'Water',
    instructor: 'Dr. Michael Foster, DVM',
    difficulty: 'Beginner',
    views: 10670
  },
  {
    id: 'tick-removal',
    title: 'Safe Tick Removal Technique',
    duration: '3:30',
    species: 'Dogs',
    category: 'Parasite Management',
    description: 'Proper method to remove ticks without leaving the head embedded. Prevent disease transmission with correct technique.',
    thumbnail: 'Bite',
    instructor: 'Dr. James Chen, DVM',
    difficulty: 'Beginner',
    views: 15320
  },
  {
    id: 'vital-signs',
    title: 'How to Check Your Pet\'s Vital Signs',
    duration: '6:00',
    species: 'All Pets',
    category: 'Assessment Skills',
    description: 'Learn to measure heart rate, respiratory rate, temperature, and capillary refill time - essential baseline health information.',
    thumbnail: 'Heart',
    instructor: 'Dr. Robert Kim, DVM',
    difficulty: 'Beginner',
    views: 17540
  },
  {
    id: 'snake-bite',
    title: 'Venomous Snake Bite Response',
    duration: '5:40',
    species: 'Dogs',
    category: 'Environmental Emergencies',
    description: 'Identify venomous snake bites and learn immediate first-aid. Understand what NOT to do and the importance of rapid transport.',
    thumbnail: 'Snake',
    instructor: 'Dr. Emily Rodriguez, DVM',
    difficulty: 'Advanced',
    views: 8190
  },
  {
    id: 'birthing-emergency',
    title: 'Assisting with Pet Birth Complications',
    duration: '8:15',
    species: 'Cats',
    category: 'Reproductive Emergencies',
    description: 'Recognize normal vs. complicated labor. Learn when and how to assist, and when emergency veterinary intervention is critical.',
    thumbnail: 'Cat',
    instructor: 'Dr. Lisa Thompson, DVM',
    difficulty: 'Advanced',
    views: 7650
  },
  {
    id: 'hamster-emergencies',
    title: 'Common Hamster Emergencies',
    duration: '4:50',
    species: 'Hamsters',
    category: 'Small Animal Care',
    description: 'Recognize and respond to hamster emergencies including wet tail, respiratory distress, and injuries from falls.',
    thumbnail: 'Small Pet',
    instructor: 'Dr. David Thompson, DVM',
    difficulty: 'Beginner',
    views: 5920
  },
  {
    id: 'allergic-reaction',
    title: 'Recognizing Severe Allergic Reactions',
    duration: '4:25',
    species: 'All Pets',
    category: 'Allergic Emergencies',
    description: 'Identify anaphylaxis symptoms and learn when to administer emergency medications like Benadryl or epinephrine.',
    thumbnail: 'Alert',
    instructor: 'Dr. Patricia Wong, DVM',
    difficulty: 'Intermediate',
    views: 13480
  }
];

export const videoCategories = [
  'All Videos',
  'Life-Saving Techniques',
  'Airway Emergencies',
  'Wound Care',
  'Environmental Emergencies',
  'Preparation',
  'Trauma',
  'Care Techniques',
  'Neurological Emergencies',
  'Toxicology',
  'Orthopedic Emergencies',
  'Life-Threatening Emergencies',
  'Eye Injuries',
  'Small Animal Care',
  'Assessment Skills',
  'Parasite Management',
  'Reproductive Emergencies',
  'Allergic Emergencies'
];
