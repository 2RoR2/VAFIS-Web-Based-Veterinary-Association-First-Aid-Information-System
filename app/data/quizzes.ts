export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  species: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  passingScore: number;
  questions: QuizQuestion[];
  description: string;
}

export const quizzes: Quiz[] = [
  {
    id: 'dog-basics',
    title: 'Dog First-Aid Basics',
    species: 'Dogs',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    passingScore: 70,
    description: 'Test your knowledge of essential first-aid skills for dogs.',
    questions: [
      {
        question: 'What is the normal resting heart rate for an adult dog?',
        options: ['20-40 beats per minute', '60-100 beats per minute', '100-160 beats per minute', '200-250 beats per minute'],
        correct: 1,
        explanation: 'A normal resting heart rate for adult dogs is typically 60-100 beats per minute. Larger dogs tend to have slower heart rates, while smaller dogs have faster rates.'
      },
      {
        question: 'What color should a healthy dog\'s gums be?',
        options: ['White or pale', 'Pink', 'Bright red', 'Blue or purple'],
        correct: 1,
        explanation: 'Healthy gums should be pink and moist. Pale, white, blue, or bright red gums can indicate serious medical problems requiring immediate veterinary attention.'
      },
      {
        question: 'If your dog is choking, what should you do FIRST?',
        options: ['Perform the Heimlich maneuver immediately', 'Rush to the vet', 'Stay calm and check if the object is visible in the mouth', 'Give the dog water'],
        correct: 2,
        explanation: 'First, stay calm and check if you can see the obstruction. If visible and you can safely remove it, do so. Only perform the Heimlich if you cannot remove the object manually.'
      },
      {
        question: 'How long should you apply pressure to a bleeding wound?',
        options: ['30 seconds', '1 minute', '3-5 minutes', '10 minutes'],
        correct: 2,
        explanation: 'Apply firm, constant pressure for 3-5 minutes without lifting to check. This allows blood to clot. If bleeding doesn\'t stop, continue pressure and seek emergency vet care.'
      },
      {
        question: 'Which of these is TOXIC to dogs and requires immediate vet care?',
        options: ['Carrots', 'Green beans', 'Grapes and raisins', 'Blueberries'],
        correct: 2,
        explanation: 'Grapes and raisins are highly toxic to dogs and can cause kidney failure. Even small amounts require immediate veterinary attention. Carrots, green beans, and blueberries are safe.'
      },
      {
        question: 'What temperature indicates a fever in dogs?',
        options: ['Above 99 deg F (37.2 deg C)', 'Above 101.5 deg F (38.6 deg C)', 'Above 103 deg F (39.4 deg C)', 'Above 105 deg F (40.6 deg C)'],
        correct: 2,
        explanation: 'A dog\'s normal temperature is 100-102.5 deg F (37.8-39.2 deg C). A temperature above 103 deg F (39.4 deg C) indicates fever and requires veterinary attention.'
      },
      {
        question: 'If your dog has a seizure, you should:',
        options: ['Put your hand in its mouth to prevent tongue swallowing', 'Restrain the dog firmly', 'Clear the area of hazards and time the seizure', 'Pour cold water on the dog'],
        correct: 2,
        explanation: 'Clear the area of objects that could hurt your dog, time the duration, and stay calm. Never put your hands near the mouth. Dogs cannot swallow their tongues.'
      },
      {
        question: 'How can you check if your dog is dehydrated?',
        options: ['Check if their nose is wet', 'Gently pull up the skin on the back of their neck - it should spring back immediately', 'Look at their paw pads', 'Check their tail position'],
        correct: 1,
        explanation: 'The skin tent test is reliable: gently pull up skin on the back of the neck. In a hydrated dog, it should immediately spring back. Delayed return indicates dehydration.'
      },
      {
        question: 'What should you do if your dog is overheating?',
        options: ['Submerge in ice water immediately', 'Apply cool (not ice cold) water and move to shade', 'Cover with wet ice-cold towels', 'Give ice cubes to eat'],
        correct: 1,
        explanation: 'Cool gradually with cool (not ice cold) water, focusing on the head, neck, paws, and belly. Move to shade and ensure good air flow. Ice water can cause shock.'
      },
      {
        question: 'When should you seek emergency vet care for vomiting?',
        options: ['After any single episode of vomiting', 'Only if vomiting lasts more than a week', 'If there is blood in the vomit or multiple episodes in a short time', 'Never - vomiting always resolves on its own'],
        correct: 2,
        explanation: 'Seek immediate care if vomit contains blood, there are multiple episodes in a short time, severe abdominal pain, or if a toxin or foreign object was ingested.'
      }
    ]
  },
  {
    id: 'cat-emergency',
    title: 'Cat Emergency Care',
    species: 'Cats',
    category: 'Emergency Response',
    difficulty: 'Intermediate',
    passingScore: 70,
    description: 'Advanced scenarios for recognizing and responding to feline emergencies.',
    questions: [
      {
        question: 'A cat breathing with an open mouth is:',
        options: ['Normal when hot or after play', 'Always an emergency', 'Only concerning if it lasts more than an hour', 'A sign of happiness'],
        correct: 1,
        explanation: 'Open-mouth breathing in cats is ALWAYS abnormal and indicates severe respiratory distress or stress. This requires immediate emergency veterinary care.'
      },
      {
        question: 'What is the most common sign of a urinary blockage in male cats?',
        options: ['Excessive urination', 'Straining in the litter box with little to no urine output', 'Drinking more water', 'Sleeping more than usual'],
        correct: 1,
        explanation: 'Male cats with urinary blockages strain repeatedly with little to no urine produced. This is a life-threatening emergency requiring immediate vet care within hours.'
      },
      {
        question: 'If a cat ingests a lily plant, you should:',
        options: ['Wait to see if symptoms develop', 'Induce vomiting at home with hydrogen peroxide', 'Seek emergency veterinary care immediately', 'Give the cat milk to dilute the toxin'],
        correct: 2,
        explanation: 'All parts of true lilies are extremely toxic to cats and cause fatal kidney failure. Seek immediate emergency care even if no symptoms are present. Every minute counts.'
      },
      {
        question: 'What is the correct CPR compression rate for cats?',
        options: ['60 compressions per minute', '80 compressions per minute', '100-120 compressions per minute', '200 compressions per minute'],
        correct: 2,
        explanation: 'CPR for cats should be performed at 100-120 compressions per minute. Compressions should be about 1/3 to 1/2 the width of the chest.'
      },
      {
        question: 'A cat that suddenly cannot use its back legs may have:',
        options: ['Simple muscle strain - will resolve on its own', 'Saddle thrombus - a life-threatening emergency', 'Arthritis flare-up', 'Just been sleeping funny'],
        correct: 1,
        explanation: 'Sudden paralysis of back legs in cats often indicates saddle thrombus (blood clot), a critical emergency. Immediate veterinary care is essential. Cats may also cry in pain.'
      },
      {
        question: 'The normal temperature for a cat is:',
        options: ['98.6 deg F (37 deg C)', '100-102.5 deg F (37.8-39.2 deg C)', '103-105 deg F (39.4-40.6 deg C)', '95-98 deg F (35-36.7 deg C)'],
        correct: 1,
        explanation: 'Normal cat temperature is 100-102.5 deg F (37.8-39.2 deg C). Temperatures above 103 deg F or below 99 deg F require veterinary attention.'
      },
      {
        question: 'If a cat is having a seizure that lasts longer than 5 minutes:',
        options: ['Wait it out - most seizures resolve on their own', 'This is status epilepticus, a life-threatening emergency', 'Wake the cat up by splashing water on it', 'Feed the cat immediately after'],
        correct: 1,
        explanation: 'Seizures lasting over 5 minutes are status epilepticus, a life-threatening emergency requiring immediate veterinary intervention to prevent brain damage and death.'
      },
      {
        question: 'What is the most important thing to do if your cat is stung by a bee on the face?',
        options: ['Apply ice and monitor for allergic reaction or swelling that affects breathing', 'Immediately give Benadryl without calling a vet', 'Squeeze the sting site to remove venom', 'Apply heat to the area'],
        correct: 0,
        explanation: 'Remove the stinger if present, apply cold compress, and watch closely for allergic reactions or swelling that could affect breathing. Facial swelling can obstruct airways - seek vet care if worsening.'
      }
    ]
  },
  {
    id: 'rabbit-health',
    title: 'Rabbit Health & Safety',
    species: 'Rabbits',
    category: 'Small Animal Care',
    difficulty: 'Beginner',
    passingScore: 70,
    description: 'Essential knowledge for rabbit owners about common health emergencies.',
    questions: [
      {
        question: 'If a rabbit stops eating for more than 12 hours, this indicates:',
        options: ['The rabbit is just being picky', 'A potentially life-threatening emergency', 'Normal behavior - rabbits fast regularly', 'The rabbit needs a new type of hay'],
        correct: 1,
        explanation: 'Rabbits that stop eating (anorexia) for more than 12 hours are experiencing a serious emergency. GI stasis can be fatal. Immediate vet care is required.'
      },
      {
        question: 'A rabbit that is breathing rapidly and has its head tilted back is likely experiencing:',
        options: ['Normal stretching behavior', 'Heat stroke or respiratory distress', 'Happiness', 'Digestive upset'],
        correct: 1,
        explanation: 'Rapid breathing with head tilted back indicates severe respiratory distress or heat stroke - both life-threatening emergencies requiring immediate veterinary care.'
      },
      {
        question: 'The safest way to pick up a rabbit is:',
        options: ['By the ears', 'By the scruff of the neck', 'Supporting the chest with one hand and the hindquarters with the other', 'By grabbing around the belly'],
        correct: 2,
        explanation: 'Always support both the chest and hindquarters. Rabbits have fragile spines and can injure themselves if they kick while suspended. Never pick up by ears or scruff.'
      },
      {
        question: 'What is GI stasis in rabbits?',
        options: ['A type of fur', 'A slowing or stopping of digestive system movement - a life-threatening emergency', 'A normal sleeping position', 'A vitamin deficiency'],
        correct: 1,
        explanation: 'GI stasis is when the digestive system slows or stops, causing gas buildup and toxin absorption. It\'s life-threatening and requires immediate emergency veterinary care.'
      },
      {
        question: 'Signs of pain in rabbits include:',
        options: ['Loud vocalizations', 'Teeth grinding, hunched posture, and decreased activity', 'Running in circles', 'Standing on hind legs'],
        correct: 1,
        explanation: 'Rabbits rarely vocalize pain. Look for teeth grinding (different from normal tooth purring), hunched posture, reluctance to move, and decreased appetite. These require vet evaluation.'
      },
      {
        question: 'A rabbit\'s diet should consist primarily of:',
        options: ['Pellets', 'Fresh vegetables', 'Unlimited high-quality hay', 'Fruits and treats'],
        correct: 2,
        explanation: 'Hay should make up 80-90% of a rabbit\'s diet. It\'s essential for dental health, digestion, and preventing GI stasis. Fresh hay should always be available.'
      },
      {
        question: 'If a rabbit breaks a leg, you should:',
        options: ['Try to splint it yourself', 'Wait a few days to see if it improves', 'Minimize handling, confine to a small space, and seek immediate vet care', 'Give the rabbit aspirin for pain'],
        correct: 2,
        explanation: 'Rabbits have fragile bones. Confine to prevent movement, minimize handling (stress can be fatal), and get immediate vet care. Do not attempt splinting or give medications.'
      }
    ]
  },
  {
    id: 'general-firstaid',
    title: 'General Pet First-Aid',
    species: 'All Pets',
    category: 'Comprehensive',
    difficulty: 'Intermediate',
    passingScore: 70,
    description: 'Comprehensive first-aid knowledge applicable to all pet species.',
    questions: [
      {
        question: 'What is the universal sign that an animal is in shock?',
        options: ['Hyperactivity and aggression', 'Pale or white gums, rapid breathing, weakness', 'Excessive barking or meowing', 'Increased appetite'],
        correct: 1,
        explanation: 'Shock presents with pale/white gums, rapid shallow breathing, weak rapid pulse, and cold extremities. Shock is life-threatening and requires immediate emergency care.'
      },
      {
        question: 'When should you induce vomiting in a pet that has ingested a toxin?',
        options: ['Always, immediately', 'Never - always wait for a vet', 'Only when specifically instructed by a veterinarian or poison control', 'Only if the pet seems sick'],
        correct: 2,
        explanation: 'Only induce vomiting when directed by a vet or poison control. Some substances cause more damage coming back up. Caustic substances and petroleum products should NOT be vomited.'
      },
      {
        question: 'How should you transport a pet with a suspected spinal injury?',
        options: ['Carry in your arms', 'On a firm flat board, minimizing movement', 'In a soft-sided carrier', 'Allow the pet to walk to reduce stress'],
        correct: 1,
        explanation: 'Spinal injuries require transport on a firm flat surface (board, stretcher) with minimal movement to prevent paralysis. Keep the spine as straight as possible.'
      },
      {
        question: 'What does capillary refill time (CRT) tell you?',
        options: ['The pet\'s temperature', 'How well blood is circulating', 'If the pet is dehydrated', 'The pet\'s stress level'],
        correct: 1,
        explanation: 'CRT assesses circulation. Press on the gums until white, release, and time how long until pink returns. Normal is 1-2 seconds. Longer indicates poor circulation/shock.'
      },
      {
        question: 'The most important item in a pet first-aid kit is:',
        options: ['Bandages', 'Antiseptic wipes', 'Your veterinarian\'s emergency phone number', 'Tweezers'],
        correct: 2,
        explanation: 'While supplies are important, having emergency contact numbers (your vet, emergency clinic, poison control) is most critical for getting professional guidance quickly.'
      },
      {
        question: 'If a pet has been hit by a car and seems okay, you should:',
        options: ['Monitor at home for 24 hours', 'Seek immediate veterinary examination', 'Only go to the vet if symptoms develop', 'Give pain medication and rest'],
        correct: 1,
        explanation: 'Internal injuries may not be immediately apparent. Pets hit by cars can have internal bleeding, organ damage, or fractures that worsen hours later. Immediate vet exam is essential.'
      },
      {
        question: 'What is the best way to muzzle an injured dog?',
        options: ['Use a cloth or gauze strip wrapped around the snout', 'Hold the mouth shut with your hands', 'Don\'t muzzle - it will make them angrier', 'Use duct tape'],
        correct: 0,
        explanation: 'Use soft cloth or gauze wrapped around the snout, tied under the jaw, then behind the ears. Never muzzle if vomiting, breathing difficulty, or brachycephalic (flat-faced) breeds.'
      },
      {
        question: 'Which of these requires IMMEDIATE emergency care?',
        options: ['Minor limping that started today', 'Bloated, hard abdomen with unsuccessful vomiting attempts', 'Mild diarrhea', 'Slight decrease in appetite'],
        correct: 1,
        explanation: 'Bloat (GDV) is a life-threatening emergency. A hard, distended abdomen with unproductive vomiting requires immediate surgery. Minutes matter - this can be fatal within hours.'
      },
      {
        question: 'How often should you update your pet first-aid kit?',
        options: ['Never - supplies don\'t expire', 'Every 5 years', 'Every 6-12 months, checking expiration dates', 'Only when you use something'],
        correct: 2,
        explanation: 'Check your kit every 6-12 months. Replace expired medications, update emergency contact numbers, ensure supplies are adequate, and restock used items.'
      },
      {
        question: 'If you find your pet unconscious, what should you check FIRST?',
        options: ['Temperature', 'Airway, breathing, and circulation (ABC)', 'For external injuries', 'Pupil response'],
        correct: 1,
        explanation: 'Always check ABCs first: Airway (is it clear?), Breathing (is the pet breathing?), Circulation (is there a heartbeat?). Begin CPR if needed and get emergency help immediately.'
      },
      {
        question: 'What is the purpose of the "recovery position" for an unconscious pet?',
        options: ['To make them comfortable', 'To prevent aspiration if vomiting and facilitate breathing', 'To take their temperature', 'To perform CPR'],
        correct: 1,
        explanation: 'The recovery position (lying on right side with head extended) prevents aspiration if vomiting occurs and keeps the airway open. Monitor breathing continuously.'
      },
      {
        question: 'Which human medication is safe to give pets in an emergency?',
        options: ['Ibuprofen (Advil)', 'Acetaminophen (Tylenol)', 'Aspirin (in rare cases, with vet approval only)', 'Naproxen (Aleve)'],
        correct: 2,
        explanation: 'Most human pain medications are toxic to pets. Aspirin may be used in very specific situations ONLY with veterinary approval. Ibuprofen, acetaminophen, and naproxen can be fatal.'
      }
    ]
  },
  {
    id: 'poisoning-prevention',
    title: 'Poisoning & Toxins',
    species: 'All Pets',
    category: 'Toxicology',
    difficulty: 'Beginner',
    passingScore: 70,
    description: 'Learn to identify common pet toxins and respond appropriately.',
    questions: [
      {
        question: 'Which of these foods is MOST toxic to dogs?',
        options: ['Cheese', 'Chocolate', 'Rice', 'Chicken'],
        correct: 1,
        explanation: 'Chocolate contains theobromine and caffeine, both toxic to dogs. Dark chocolate and baking chocolate are most dangerous. Symptoms include vomiting, diarrhea, rapid heart rate, and seizures.'
      },
      {
        question: 'What should you do FIRST if your pet ingests a toxic substance?',
        options: ['Induce vomiting immediately', 'Give milk to dilute the poison', 'Call Pet Poison Helpline or your vet for guidance', 'Wait to see if symptoms develop'],
        correct: 2,
        explanation: 'Call poison control or your vet immediately for guidance. Some substances should NOT be vomited. Have the product container, amount ingested, and time of ingestion ready.'
      },
      {
        question: 'Xylitol (artificial sweetener) is particularly dangerous because it:',
        options: ['Causes kidney failure', 'Causes rapid insulin release and liver failure', 'Is a choking hazard', 'Causes diarrhea'],
        correct: 1,
        explanation: 'Xylitol causes rapid insulin release leading to life-threatening hypoglycemia, and can cause liver failure. Found in sugar-free gum, candy, peanut butter, and baked goods. Emergency treatment needed.'
      },
      {
        question: 'If instructed to induce vomiting, the proper dose of 3% hydrogen peroxide is:',
        options: ['1 tablespoon regardless of size', '1 teaspoon per 10 pounds of body weight', '1 cup for all dogs', 'As much as the pet will drink'],
        correct: 1,
        explanation: 'Use 1 teaspoon of 3% hydrogen peroxide per 10 pounds of body weight, maximum 3 tablespoons. Only use if directed by a vet and within 2 hours of ingestion.'
      },
      {
        question: 'Which common houseplant is extremely toxic to cats, causing kidney failure?',
        options: ['Spider plant', 'Lily', 'African violet', 'Snake plant'],
        correct: 1,
        explanation: 'All parts of true lilies (Easter, Tiger, Asiatic, Day lilies) are fatally toxic to cats, causing acute kidney failure. Even small exposures require immediate emergency care.'
      },
      {
        question: 'Antifreeze (ethylene glycol) is extremely toxic because:',
        options: ['It tastes bitter so pets avoid it', 'It tastes sweet so pets drink it readily, and causes rapid kidney failure', 'It causes mild stomach upset only', 'It\'s only toxic to cats, not dogs'],
        correct: 1,
        explanation: 'Antifreeze tastes sweet, attracting pets. Even tiny amounts cause rapid, often fatal kidney failure. Immediate treatment is critical - this is one of the most common and deadly pet poisonings.'
      }
    ]
  },
  {
    id: 'bird-emergencies',
    title: 'Bird Emergency Care',
    species: 'Birds',
    category: 'Avian Medicine',
    difficulty: 'Advanced',
    passingScore: 70,
    description: 'Specialized knowledge for recognizing and treating bird emergencies.',
    questions: [
      {
        question: 'What is the most critical sign that a bird needs emergency care?',
        options: ['Slight decrease in singing', 'Sitting fluffed up on the bottom of the cage', 'Eating slightly less food', 'Being more quiet than usual'],
        correct: 1,
        explanation: 'Birds are prey animals and hide illness. A bird sitting fluffed up on the cage floor is critically ill and requires immediate emergency care. This indicates severe illness or injury.'
      },
      {
        question: 'If a bird is bleeding from a broken blood feather, you should:',
        options: ['Apply pressure and wait for it to stop', 'Pull out the broken feather shaft completely', 'Spray with cold water', 'Ignore it - it will heal on its own'],
        correct: 1,
        explanation: 'Blood feathers have a blood supply. If broken and bleeding, the entire feather shaft must be removed to stop bleeding. Apply pressure, then carefully pull the shaft out completely with tweezers/pliers.'
      },
      {
        question: 'How much blood loss is dangerous for a small bird?',
        options: ['1 cup', '1 tablespoon', '1 teaspoon', 'Even a few drops can be life-threatening'],
        correct: 3,
        explanation: 'Small birds have very little blood volume. Even a few drops of blood loss can be life-threatening. Any bleeding requires immediate intervention to stop blood loss.'
      },
      {
        question: 'What is the proper way to restrain a bird for first-aid?',
        options: ['Wrap firmly in a blanket', 'Hold gently with the head between index and middle fingers, supporting the body', 'Grab around the body tightly', 'Place in a box'],
        correct: 1,
        explanation: 'Gently restrain with the head between your index and middle fingers, supporting the body in your palm. Birds can suffocate if the chest is compressed. Never squeeze the chest.'
      },
      {
        question: 'Teflon/PTFE fumes from overheated non-stick cookware can:',
        options: ['Cause mild respiratory irritation', 'Be rapidly fatal to birds within minutes', 'Only affect birds if exposed for hours', 'Have no effect on birds'],
        correct: 1,
        explanation: 'Teflon/PTFE fumes are instantly deadly to birds, causing acute respiratory failure. Birds can die within minutes of exposure. Never use non-stick cookware near birds.'
      }
    ]
  }
];

export const quizCategories = [
  'All Quizzes',
  'Fundamentals',
  'Emergency Response',
  'Small Animal Care',
  'Comprehensive',
  'Toxicology',
  'Avian Medicine'
];
