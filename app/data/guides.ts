export interface Guide {
  id: string;
  title: string;
  species: string[];
  severity: 'low' | 'medium' | 'high';
  readTime: string;
  description: string;
  category: string;
  lastReviewed: string;
  reviewedBy: string;
  steps: GuideStep[];
  warnings: string[];
  relatedVideos: string[];
  relatedGuides: string[];
}

export interface GuideStep {
  number: number;
  title: string;
  description: string;
  details?: string[];
  image?: string;
}

export const guides: Guide[] = [
  {
    id: 'choking-emergency',
    title: 'Choking Emergency',
    species: ['Dogs', 'Cats'],
    severity: 'high',
    readTime: '3 min read',
    description: 'Immediate steps to help your pet if they are choking on food or objects',
    category: 'Airway Emergencies',
    lastReviewed: 'March 15, 2026',
    reviewedBy: 'Dr. Sarah Mitchell, DVM',
    steps: [
      {
        number: 1,
        title: 'Stay Calm and Assess the Situation',
        description: 'Approach your pet carefully. A choking animal may panic and bite or scratch. Ensure your own safety before attempting to help.',
        details: [
          'Look for signs of choking: pawing at mouth, difficulty breathing, blue/pale gums',
          'If your pet can still breathe and cough, let them try to expel the object naturally',
          'Do not attempt to help if the animal is aggressive or overly panicked'
        ]
      },
      {
        number: 2,
        title: 'Check for Breathing',
        description: 'Observe chest movement and listen for breathing sounds near the nose and mouth.',
        details: [
          'Look for rise and fall of the chest',
          'Listen for wheezing, gasping, or silent attempts to breathe',
          'Check gum color - pink is normal, blue/white indicates oxygen deprivation'
        ]
      },
      {
        number: 3,
        title: 'Open the Mouth and Look for Obstructions',
        description: 'Gently open your pet\'s mouth and look for any visible objects blocking the airway.',
        details: [
          'For dogs: Press on the upper jaw behind the canine teeth to open mouth',
          'For cats: Gently hold the head and open jaw carefully',
          'Use a flashlight if available to see clearly',
          'If you see an object and can grasp it safely, remove it with fingers or tweezers',
          'Never push the object deeper - only remove if you can safely extract it'
        ]
      },
      {
        number: 4,
        title: 'Perform Heimlich Maneuver',
        description: 'If the obstruction cannot be removed manually, perform abdominal thrusts to dislodge the object.',
        details: [
          'For small dogs/cats (under 30 lbs): Hold pet with back against your chest, find the soft spot below the ribcage, make a fist and give 5 quick upward thrusts',
          'For large dogs (over 30 lbs): Stand behind the dog, place fist just below the ribcage, give 5 sharp upward thrusts',
          'Check the mouth after each set of thrusts',
          'Repeat until object is dislodged or pet becomes unconscious',
          'If unconscious, begin CPR and transport to emergency vet immediately'
        ]
      },
      {
        number: 5,
        title: 'Seek Immediate Veterinary Care',
        description: 'Even if the obstruction is cleared, your pet needs professional examination.',
        details: [
          'Call ahead to the emergency clinic while transporting',
          'Internal damage may have occurred to the throat or airways',
          'Bring the object if it was expelled',
          'Monitor breathing carefully during transport'
        ]
      }
    ],
    warnings: [
      'Difficulty breathing or gasping for air',
      'Blue, purple, or pale gums and tongue',
      'Pawing frantically at the mouth or face',
      'Excessive drooling or foaming at the mouth',
      'Panic, distress, or inability to make sounds',
      'Loss of consciousness'
    ],
    relatedVideos: ['heimlich-dogs', 'heimlich-cats', 'cpr-basics'],
    relatedGuides: ['difficulty-breathing', 'cpr-emergency', 'unconscious-pet']
  },
  {
    id: 'bleeding-wounds',
    title: 'Bleeding & Wounds',
    species: ['All'],
    severity: 'high',
    readTime: '4 min read',
    description: 'How to stop bleeding and properly clean and dress wounds',
    category: 'Trauma',
    lastReviewed: 'March 10, 2026',
    reviewedBy: 'Dr. James Chen, DVM',
    steps: [
      {
        number: 1,
        title: 'Assess the Severity',
        description: 'Determine if the bleeding is life-threatening and requires immediate emergency care.',
        details: [
          'Arterial bleeding: bright red blood that spurts with each heartbeat - EMERGENCY',
          'Venous bleeding: darker red blood that flows steadily - serious',
          'Capillary bleeding: oozing from small cuts - usually manageable at home',
          'Check if there are multiple wounds or deep punctures'
        ]
      },
      {
        number: 2,
        title: 'Control the Bleeding',
        description: 'Apply direct pressure to stop blood flow.',
        details: [
          'Use clean gauze, cloth, or bandage material',
          'Apply firm, constant pressure directly on the wound for 3-5 minutes',
          'Do NOT peek to see if bleeding has stopped - maintain pressure',
          'If blood soaks through, add more material on top - do not remove the original layer',
          'For limb wounds, elevate the injured area above the heart if possible'
        ]
      },
      {
        number: 3,
        title: 'Clean the Wound',
        description: 'Once bleeding is controlled, clean the wound to prevent infection (for minor wounds only).',
        details: [
          'Wear gloves if available',
          'Clip hair around the wound carefully to prevent contamination',
          'Flush with clean water or sterile saline solution',
          'Gently remove visible debris',
          'Do NOT use hydrogen peroxide, alcohol, or other harsh chemicals',
          'Pat dry with clean gauze'
        ]
      },
      {
        number: 4,
        title: 'Apply Antibiotic Ointment',
        description: 'For minor wounds, apply a pet-safe antibiotic ointment.',
        details: [
          'Use only veterinary-approved ointments',
          'Apply a thin layer to the wound',
          'Avoid human products unless specifically approved by your vet',
          'Do NOT use ointments on deep wounds - these need veterinary care'
        ]
      },
      {
        number: 5,
        title: 'Bandage if Necessary',
        description: 'Protect the wound with appropriate bandaging.',
        details: [
          'Use non-stick gauze pad over the wound',
          'Wrap with soft bandage material (not too tight)',
          'Check circulation - toes should remain warm and normal color',
          'Change bandage daily or if it becomes wet or dirty',
          'Prevent your pet from licking or chewing the wound - use an e-collar if needed'
        ]
      },
      {
        number: 6,
        title: 'Monitor and Seek Veterinary Care',
        description: 'Watch for signs of infection and know when professional care is needed.',
        details: [
          'See a vet immediately for: arterial bleeding, deep wounds, bite wounds, wounds over joints',
          'Monitor for infection: redness, swelling, discharge, foul odor, fever',
          'Seek care if wound doesn\'t show improvement within 24-48 hours',
          'Any wound from an unknown animal requires immediate veterinary attention due to rabies risk'
        ]
      }
    ],
    warnings: [
      'Severe bleeding that doesn\'t stop after 5 minutes of pressure',
      'Deep puncture wounds or lacerations',
      'Wounds over joints or near vital organs',
      'Bite wounds from other animals',
      'Foreign objects embedded in the wound',
      'Signs of shock: pale gums, rapid breathing, weakness',
      'Wounds showing signs of infection: pus, swelling, redness, foul odor'
    ],
    relatedVideos: ['wound-care', 'bandaging-techniques', 'pressure-points'],
    relatedGuides: ['shock-emergency', 'infection-signs', 'bite-wounds']
  },
  {
    id: 'heatstroke',
    title: 'Heatstroke',
    species: ['All'],
    severity: 'high',
    readTime: '5 min read',
    description: 'Recognize signs of heatstroke and provide immediate cooling measures',
    category: 'Environmental Emergencies',
    lastReviewed: 'March 8, 2026',
    reviewedBy: 'Dr. Emily Rodriguez, DVM',
    steps: [
      {
        number: 1,
        title: 'Recognize the Signs',
        description: 'Early recognition is critical for survival.',
        details: [
          'Excessive panting and drooling',
          'Bright red tongue and gums',
          'Thick, sticky saliva',
          'Rapid heart rate',
          'Vomiting or diarrhea',
          'Weakness, collapse, or seizures',
          'Body temperature above 104 deg F (40 deg C)'
        ]
      },
      {
        number: 2,
        title: 'Move to a Cool Environment',
        description: 'Immediately remove your pet from the heat source.',
        details: [
          'Move to air-conditioned space or shaded area',
          'Turn on fans to increase air circulation',
          'Get out of hot cars, direct sunlight, or hot pavement immediately'
        ]
      },
      {
        number: 3,
        title: 'Begin Cooling Process',
        description: 'Cool your pet gradually - rapid cooling can be dangerous.',
        details: [
          'Wet the pet with cool (NOT ice cold) water',
          'Focus on head, neck, paws, and belly',
          'Place cool, wet towels on these areas - replace every few minutes',
          'Allow pet to drink small amounts of cool water',
          'Do NOT force water or use ice water - this can cause shock',
          'Do NOT cover pet with wet towels as this can trap heat'
        ]
      },
      {
        number: 4,
        title: 'Monitor Temperature',
        description: 'Take rectal temperature every 5 minutes if possible.',
        details: [
          'Goal: reduce temperature to 103 deg F (39.4 deg C)',
          'Once temperature reaches 103 deg F, stop active cooling to prevent hypothermia',
          'Continue monitoring as temperature may continue to drop or rise again'
        ]
      },
      {
        number: 5,
        title: 'Transport to Emergency Vet',
        description: 'Heatstroke requires immediate veterinary care even if symptoms improve.',
        details: [
          'Call ahead to alert the clinic',
          'Continue cooling measures during transport',
          'Keep car air conditioning on maximum',
          'Internal organ damage can occur even if pet seems to recover',
          'Complications can develop hours after the initial incident'
        ]
      }
    ],
    warnings: [
      'Body temperature above 106 deg F (41 deg C) - life-threatening',
      'Seizures or unconsciousness',
      'Blue or purple gums and tongue',
      'Bloody diarrhea or vomit',
      'Difficulty breathing',
      'Inability to stand or walk'
    ],
    relatedVideos: ['heatstroke-prevention', 'cooling-techniques', 'summer-safety'],
    relatedGuides: ['seizures', 'shock-emergency', 'dehydration']
  },
  {
    id: 'poisoning',
    title: 'Poisoning Emergency',
    species: ['All'],
    severity: 'high',
    readTime: '4 min read',
    description: 'Steps to take if your pet has ingested toxic substances',
    category: 'Toxicology',
    lastReviewed: 'March 12, 2026',
    reviewedBy: 'Dr. Lisa Thompson, DVM, Toxicology Specialist',
    steps: [
      {
        number: 1,
        title: 'Identify the Poison',
        description: 'Determine what substance your pet ingested and how much.',
        details: [
          'Locate the product container, plant, or substance',
          'Note the amount consumed if possible',
          'Record the time of ingestion',
          'Take photos of the substance, packaging, or plant',
          'Collect a sample if safe to do so'
        ]
      },
      {
        number: 2,
        title: 'Contact Poison Control or Emergency Vet',
        description: 'Call for professional guidance immediately - DO NOT wait for symptoms.',
        details: [
          'Pet Poison Helpline: 1-800-213-6680 (24/7 service)',
          'ASPCA Animal Poison Control: 1-888-426-4435',
          'Your local emergency veterinary clinic',
          'Be ready to provide: pet\'s weight, substance ingested, amount, time of ingestion'
        ]
      },
      {
        number: 3,
        title: 'Follow Professional Instructions',
        description: 'Do NOT induce vomiting unless specifically instructed by a veterinarian.',
        details: [
          'Some substances cause more damage if vomited',
          'Caustic substances (bleach, drain cleaner) should NOT be vomited',
          'Petroleum products should NOT be vomited',
          'Only induce vomiting if directed and within 2 hours of ingestion',
          'Method (if instructed): 3% hydrogen peroxide at 1 teaspoon per 10 lbs body weight'
        ]
      },
      {
        number: 4,
        title: 'Prevent Further Exposure',
        description: 'Stop additional contact with the toxin.',
        details: [
          'Remove remaining poison from reach',
          'If on skin/fur: flush with water for 10+ minutes, use mild dish soap',
          'If in eyes: flush with lukewarm water for 15+ minutes',
          'Separate other pets from the area',
          'Ventilate the area if fumes are involved'
        ]
      },
      {
        number: 5,
        title: 'Transport to Emergency Vet',
        description: 'Bring the poison container and any vomited material with you.',
        details: [
          'Call ahead so the clinic can prepare',
          'Bring packaging, plant samples, or photos',
          'Collect any vomited material in a plastic bag',
          'Monitor for symptoms: vomiting, diarrhea, drooling, tremors, seizures',
          'Keep pet warm and calm during transport'
        ]
      }
    ],
    warnings: [
      'Common pet poisons: chocolate, xylitol, grapes/raisins, onions/garlic, medications (human & pet)',
      'Household toxins: antifreeze, rodent poison, cleaning products, fertilizers',
      'Plants: lilies (cats), sago palm, azalea, oleander, tulip bulbs',
      'Symptoms requiring immediate care: seizures, difficulty breathing, unconsciousness, severe vomiting/diarrhea',
      'Never give activated charcoal at home unless directed by a vet'
    ],
    relatedVideos: ['poison-prevention', 'toxic-plants', 'safe-home-pets'],
    relatedGuides: ['seizures', 'vomiting-diarrhea', 'emergency-medications']
  },
  {
    id: 'difficulty-breathing',
    title: 'Difficulty Breathing',
    species: ['All'],
    severity: 'high',
    readTime: '3 min read',
    description: 'What to do when your pet is struggling to breathe',
    category: 'Airway Emergencies',
    lastReviewed: 'March 14, 2026',
    reviewedBy: 'Dr. Michael Foster, DVM',
    steps: [
      {
        number: 1,
        title: 'Recognize Breathing Difficulties',
        description: 'Identify if your pet is in respiratory distress.',
        details: [
          'Rapid, shallow breathing or panting (when not hot/exercising)',
          'Open-mouth breathing in cats (always abnormal)',
          'Blue or pale gums and tongue',
          'Extended neck and head held low',
          'Noisy breathing, wheezing, or gasping',
          'Flared nostrils',
          'Excessive effort to breathe - visible chest movement'
        ]
      },
      {
        number: 2,
        title: 'Keep Your Pet Calm',
        description: 'Stress makes breathing difficulties worse.',
        details: [
          'Speak in a calm, soothing voice',
          'Minimize handling and movement',
          'Keep other pets and people away',
          'Avoid restraining unless necessary for safety',
          'Allow pet to assume comfortable position (usually sitting with head extended)'
        ]
      },
      {
        number: 3,
        title: 'Ensure Good Air Flow',
        description: 'Optimize the environment for easier breathing.',
        details: [
          'Move to a cool, well-ventilated area',
          'Remove collar if present',
          'Clear any obvious obstructions from mouth (if safe to do so)',
          'Turn on fan or air conditioning',
          'Remove any possible allergens or irritants from area'
        ]
      },
      {
        number: 4,
        title: 'Do NOT Give Food, Water, or Medications',
        description: 'Avoid aspiration risk.',
        details: [
          'Do not offer anything by mouth',
          'Do not give any medications unless prescribed for this condition',
          'Keep airway clear at all times'
        ]
      },
      {
        number: 5,
        title: 'Seek Immediate Emergency Care',
        description: 'Breathing difficulties are ALWAYS an emergency.',
        details: [
          'Call emergency vet immediately while preparing to transport',
          'Minimize stress during transport - use carrier for cats/small pets',
          'Keep environment cool during travel',
          'If pet stops breathing, begin CPR (if trained)',
          'Drive safely but quickly to nearest emergency facility'
        ]
      }
    ],
    warnings: [
      'Blue, purple, or pale gums - indicates oxygen deprivation',
      'Gasping or choking sounds',
      'Collapse or loss of consciousness',
      'Inability to lie down comfortably',
      'This is ALWAYS an emergency - do not wait'
    ],
    relatedVideos: ['breathing-assessment', 'cpr-basics', 'oxygen-deprivation'],
    relatedGuides: ['choking-emergency', 'cpr-emergency', 'shock-emergency']
  },
  {
    id: 'broken-bones',
    title: 'Broken Bones & Fractures',
    species: ['Dogs', 'Cats', 'Rabbits'],
    severity: 'medium',
    readTime: '5 min read',
    description: 'How to stabilize fractures and transport safely to veterinary care',
    category: 'Trauma',
    lastReviewed: 'March 11, 2026',
    reviewedBy: 'Dr. Amanda Martinez, DVM, Orthopedic Specialist',
    steps: [
      {
        number: 1,
        title: 'Recognize a Fracture',
        description: 'Identify signs of broken bones.',
        details: [
          'Visible deformity or abnormal angle of limb',
          'Swelling at injury site',
          'Inability or refusal to bear weight',
          'Extreme pain when area is touched',
          'Limping or holding limb up completely',
          'Crepitus (grating sensation/sound)',
          'Open wound with bone visible (open fracture - emergency)'
        ]
      },
      {
        number: 2,
        title: 'Keep Pet Still and Calm',
        description: 'Prevent further injury by restricting movement.',
        details: [
          'Confine to small space - crate or carrier',
          'Speak calmly and reassuringly',
          'Do not allow jumping, running, or stairs',
          'For rabbits: handle minimally as stress can be fatal',
          'Do not attempt to set or straighten the bone yourself'
        ]
      },
      {
        number: 3,
        title: 'Control Bleeding (if present)',
        description: 'Open fractures require immediate bleeding control.',
        details: [
          'Apply clean gauze or cloth with gentle pressure',
          'Do NOT try to push bone back in',
          'Cover wound to prevent contamination',
          'This is a surgical emergency requiring immediate vet care'
        ]
      },
      {
        number: 4,
        title: 'Stabilize if Possible',
        description: 'Only attempt if you can do so without causing pain or stress.',
        details: [
          'For leg fractures below the knee/elbow: gently support the limb',
          'Use a rolled towel or magazine as a splint if pet tolerates',
          'Do NOT force splinting if pet resists',
          'Secure splint with soft bandage (not too tight)',
          'Check circulation - toes should remain warm and pink',
          'For spine, pelvis, or upper leg fractures: DO NOT splint, just transport carefully'
        ]
      },
      {
        number: 5,
        title: 'Transport to Veterinary Care',
        description: 'Careful transport is essential.',
        details: [
          'Call ahead to alert the veterinary hospital',
          'Use a firm board or flat surface for larger dogs',
          'Keep pet in carrier or box for smaller animals',
          'Support injured limb during transport',
          'Minimize movement and handling',
          'Monitor for signs of shock: pale gums, rapid breathing, weakness'
        ]
      }
    ],
    warnings: [
      'Open fracture (bone visible through skin) - immediate emergency',
      'Back or neck injury - extreme care required, use firm board',
      'Signs of shock: pale gums, rapid breathing, weakness',
      'Multiple injuries may be present - check entire body',
      'Never give pain medication without veterinary approval'
    ],
    relatedVideos: ['fracture-stabilization', 'safe-transport', 'bandaging-techniques'],
    relatedGuides: ['bleeding-wounds', 'shock-emergency', 'pain-management']
  },
  {
    id: 'seizures',
    title: 'Seizures',
    species: ['All'],
    severity: 'high',
    readTime: '4 min read',
    description: 'How to keep your pet safe during a seizure episode',
    category: 'Neurological',
    lastReviewed: 'March 9, 2026',
    reviewedBy: 'Dr. Robert Kim, DVM, Neurology Specialist',
    steps: [
      {
        number: 1,
        title: 'Recognize a Seizure',
        description: 'Seizures can present in many ways.',
        details: [
          'Generalized (grand mal): loss of consciousness, falling over, paddling legs, rigid muscles',
          'Focal: twitching of one body part, facial movements, behavioral changes',
          'May include: drooling, loss of bladder/bowel control, vocalizing',
          'Pre-seizure signs: restlessness, hiding, attention-seeking, pacing'
        ]
      },
      {
        number: 2,
        title: 'Ensure Safety',
        description: 'Protect your pet from injury during the seizure.',
        details: [
          'Do NOT put your hands near the mouth - pets do not swallow their tongue',
          'Clear the area of furniture, objects, and hazards',
          'Move pet away from stairs, pools, or other dangers if safe',
          'Gently cushion the head with a folded towel',
          'Do NOT restrain the pet',
          'Keep other pets and children away'
        ]
      },
      {
        number: 3,
        title: 'Time the Seizure',
        description: 'Duration is critical information for the veterinarian.',
        details: [
          'Note the start time immediately',
          'Most seizures last 1-3 minutes',
          'If seizure exceeds 5 minutes, this is a life-threatening emergency',
          'Video record if possible (helpful for vet diagnosis)',
          'Note all details: type of movements, consciousness level, duration'
        ]
      },
      {
        number: 4,
        title: 'Provide Post-Seizure Care',
        description: 'The recovery period can last minutes to hours.',
        details: [
          'Keep environment quiet, dim, and calm',
          'Allow pet to rest undisturbed',
          'May experience: confusion, disorientation, temporary blindness, hunger, thirst',
          'Offer small amount of water when fully alert',
          'Monitor carefully until completely back to normal',
          'Note recovery time and any abnormal behavior'
        ]
      },
      {
        number: 5,
        title: 'Seek Veterinary Care',
        description: 'Know when immediate emergency care is required.',
        details: [
          'EMERGENCY (go immediately): seizure lasting >5 minutes, multiple seizures in 24 hours, seizure during pregnancy',
          'URGENT (call vet same day): first-ever seizure, any unusual features',
          'SCHEDULED: follow-up for known seizure disorder',
          'Bring notes on: seizure duration, frequency, triggers, medications'
        ]
      }
    ],
    warnings: [
      'Status Epilepticus: continuous seizure >5 minutes - LIFE THREATENING',
      'Cluster seizures: multiple seizures within 24 hours - EMERGENCY',
      'Seizure in pregnant pet - EMERGENCY',
      'First seizure ever - requires veterinary evaluation',
      'Seizure followed by inability to walk or severe weakness'
    ],
    relatedVideos: ['seizure-first-aid', 'neurological-assessment', 'emergency-transport'],
    relatedGuides: ['poisoning', 'heatstroke', 'emergency-medications']
  },
  {
    id: 'eye-injuries',
    title: 'Eye Injuries',
    species: ['All'],
    severity: 'medium',
    readTime: '3 min read',
    description: 'First-aid for eye trauma and foreign objects',
    category: 'Sensory Injuries',
    lastReviewed: 'March 13, 2026',
    reviewedBy: 'Dr. Jennifer Lee, DVM, Ophthalmology',
    steps: [
      {
        number: 1,
        title: 'Assess the Injury',
        description: 'Determine the type and severity of eye injury.',
        details: [
          'Foreign object in eye (debris, plant material)',
          'Scratch or laceration to eye',
          'Chemical exposure',
          'Swelling or discharge',
          'Protruding eye (proptosis) - EMERGENCY',
          'Sudden blindness or vision changes'
        ]
      },
      {
        number: 2,
        title: 'Prevent Further Damage',
        description: 'Stop your pet from worsening the injury.',
        details: [
          'Use an Elizabethan collar (cone) immediately',
          'Prevent pawing, rubbing, or scratching at the eye',
          'Keep pet calm and in dim lighting',
          'Do NOT allow contact with other pets'
        ]
      },
      {
        number: 3,
        title: 'Rinse if Appropriate',
        description: 'For chemical exposure or loose foreign material only.',
        details: [
          'For chemical exposure: flush with room-temperature water or sterile saline for 15-20 minutes',
          'For loose debris: gentle saline rinse may help',
          'Do NOT rinse if there is a puncture wound or embedded object',
          'Do NOT use tap water if sterile saline is available',
          'Do NOT rub or put pressure on the eye'
        ]
      },
      {
        number: 4,
        title: 'Do NOT Remove Embedded Objects',
        description: 'Leave removal to veterinary professionals.',
        details: [
          'Do not attempt to remove objects stuck in the eye',
          'Do not apply ointments or medications unless prescribed',
          'Do not try to push a protruding eye back in',
          'Cover with clean, damp cloth if waiting to transport'
        ]
      },
      {
        number: 5,
        title: 'Seek Veterinary Care',
        description: 'All eye injuries should be examined by a veterinarian.',
        details: [
          'EMERGENCY: protruding eye, penetrating injury, chemical burns, sudden blindness',
          'URGENT (same day): any trauma, foreign object, redness, discharge, squinting',
          'Eyes can deteriorate rapidly - do not delay',
          'Vision loss can be permanent if not treated promptly'
        ]
      }
    ],
    warnings: [
      'Protruding eye (proptosis) - EMERGENCY, cover with moist cloth',
      'Penetrating injury - do NOT remove object',
      'Chemical exposure - flush immediately for 15-20 minutes',
      'Sudden vision loss or blindness',
      'Deep cuts or lacerations to the eye or eyelid',
      'Excessive swelling, discharge, or pain'
    ],
    relatedVideos: ['eye-examination', 'saline-flush', 'e-collar-use'],
    relatedGuides: ['facial-trauma', 'chemical-exposure', 'emergency-transport']
  },
  {
    id: 'allergic-reactions',
    title: 'Allergic Reactions & Anaphylaxis',
    species: ['All'],
    severity: 'high',
    readTime: '4 min read',
    description: 'Recognizing and responding to severe allergic reactions',
    category: 'Immune Response',
    lastReviewed: 'March 16, 2026',
    reviewedBy: 'Dr. Patricia Wong, DVM, Emergency Medicine',
    steps: [
      {
        number: 1,
        title: 'Recognize Allergic Reaction Severity',
        description: 'Mild reactions vs. life-threatening anaphylaxis.',
        details: [
          'Mild: localized swelling, hives, itching, facial swelling',
          'Moderate: more extensive swelling, vomiting, diarrhea',
          'Severe (Anaphylaxis): difficulty breathing, collapse, pale gums, rapid pulse, shock',
          'Common triggers: insect stings, vaccines, medications, foods, plants'
        ]
      },
      {
        number: 2,
        title: 'Remove the Allergen',
        description: 'Stop exposure to the triggering substance if identified.',
        details: [
          'Remove pet from area of exposure',
          'If insect sting: locate and remove stinger if visible (scrape, don\'t squeeze)',
          'Rinse skin contact allergens with cool water',
          'Do not give any more of the suspected food or medication'
        ]
      },
      {
        number: 3,
        title: 'Administer Emergency Medication (if prescribed)',
        description: 'Use pre-prescribed emergency medications if available.',
        details: [
          'Antihistamine (Benadryl/diphenhydramine): only if previously approved by your vet',
          'Typical dose: 1mg per pound of body weight',
          'Epinephrine auto-injector: only if prescribed and trained by vet',
          'Do NOT give any medication without prior veterinary approval'
        ]
      },
      {
        number: 4,
        title: 'Monitor Vital Signs',
        description: 'Watch for progression to life-threatening symptoms.',
        details: [
          'Check gum color: should be pink, not pale or blue',
          'Monitor breathing: rapid, labored breathing is concerning',
          'Watch for swelling progression, especially around neck and face',
          'Note mental status: lethargy or unresponsiveness is critical',
          'Be prepared to perform CPR if pet becomes unconscious'
        ]
      },
      {
        number: 5,
        title: 'Seek Immediate Veterinary Care',
        description: 'All moderate to severe reactions require professional treatment.',
        details: [
          'Call ahead to emergency vet',
          'For mild reactions: same-day vet appointment recommended',
          'For moderate reactions: urgent veterinary care within hours',
          'For severe reactions: immediate emergency transport',
          'Reactions can worsen rapidly or recur hours later',
          'Keep pet warm and calm during transport'
        ]
      }
    ],
    warnings: [
      'Difficulty breathing or rapid breathing',
      'Swelling of the face, especially around eyes, muzzle, or throat',
      'Vomiting and diarrhea together',
      'Pale or blue gums',
      'Weak pulse or collapse',
      'Cold limbs or body',
      'Seizures or loss of consciousness'
    ],
    relatedVideos: ['anaphylaxis-response', 'benadryl-administration', 'vital-signs-check'],
    relatedGuides: ['insect-stings', 'shock-emergency', 'difficulty-breathing']
  },
  {
    id: 'burns',
    title: 'Burns (Thermal & Chemical)',
    species: ['All'],
    severity: 'medium',
    readTime: '4 min read',
    description: 'Treatment for thermal and chemical burns',
    category: 'Trauma',
    lastReviewed: 'March 7, 2026',
    reviewedBy: 'Dr. Steven Anderson, DVM',
    steps: [
      {
        number: 1,
        title: 'Identify Burn Type and Severity',
        description: 'Different burns require different treatments.',
        details: [
          'Thermal burns: heat, fire, hot liquids, heating pads',
          'Chemical burns: cleaning products, acids, alkalis',
          'Electrical burns: chewing cords, lightning',
          'First-degree: redness, minor swelling, pain',
          'Second-degree: blistering, wet appearance, severe pain',
          'Third-degree: white/charred skin, may not be painful (nerve damage)'
        ]
      },
      {
        number: 2,
        title: 'Stop the Burning Process',
        description: 'Immediately halt contact with burn source.',
        details: [
          'Remove from heat source',
          'For thermal burns: apply cool (not ice cold) water for 10-20 minutes',
          'For chemical burns: flush with large amounts of cool water for 20+ minutes',
          'Remove contaminated collar, clothing, or materials',
          'Do NOT apply ice directly - can cause more tissue damage',
          'Do NOT use butter, oils, or home remedies'
        ]
      },
      {
        number: 3,
        title: 'Protect the Burn Area',
        description: 'Cover to prevent infection and contamination.',
        details: [
          'Gently pat dry with clean cloth',
          'Cover with clean, non-stick dressing',
          'Do NOT apply ointments, creams, or butter',
          'Do NOT pop blisters',
          'Prevent licking with Elizabethan collar if needed'
        ]
      },
      {
        number: 4,
        title: 'Monitor for Shock',
        description: 'Severe burns can cause life-threatening shock.',
        details: [
          'Watch for: pale gums, rapid breathing, weak pulse, cold extremities',
          'Keep pet warm with blankets (avoid burned areas)',
          'Do not give food or water if severely burned',
          'If shock develops, this is an emergency'
        ]
      },
      {
        number: 5,
        title: 'Seek Veterinary Care',
        description: 'Burns require professional treatment to prevent complications.',
        details: [
          'EMERGENCY: chemical burns, electrical burns, burns >2 inches, third-degree burns, burns on face/feet/genitals',
          'URGENT: second-degree burns, any burn showing signs of infection',
          'All but the most minor burns should be evaluated by a vet',
          'Burns continue to damage tissue for hours after initial injury',
          'Pain management and infection prevention are critical'
        ]
      }
    ],
    warnings: [
      'Chemical burns require immediate and prolonged flushing (20+ minutes)',
      'Electrical burns: check for mouth burns if pet chewed a cord',
      'Burns covering >10% of body are life-threatening',
      'Signs of shock: pale gums, rapid breathing, weakness',
      'Infection risk is high - watch for redness, swelling, discharge, foul odor'
    ],
    relatedVideos: ['burn-assessment', 'wound-flushing', 'shock-recognition'],
    relatedGuides: ['shock-emergency', 'wound-care', 'pain-management']
  },
  {
    id: 'insect-stings',
    title: 'Insect Stings & Bites',
    species: ['All'],
    severity: 'low',
    readTime: '3 min read',
    description: 'Managing bee stings and other insect bites',
    category: 'Environmental',
    lastReviewed: 'March 6, 2026',
    reviewedBy: 'Dr. Karen Martinez, DVM',
    steps: [
      {
        number: 1,
        title: 'Locate the Sting Site',
        description: 'Find where your pet was stung.',
        details: [
          'Common locations: paws, face, mouth (from snapping at insects)',
          'Look for: swelling, redness, pain when touched',
          'Check mouth and throat if pet was trying to eat the insect',
          'Multiple stings are more serious than single stings'
        ]
      },
      {
        number: 2,
        title: 'Remove the Stinger',
        description: 'Only bees leave stingers behind; wasps and hornets do not.',
        details: [
          'Look for a small black dot at the sting site',
          'Use a credit card edge or fingernail to scrape it out',
          'Do NOT use tweezers or pinch - this releases more venom',
          'Remove as quickly as possible to minimize venom release'
        ]
      },
      {
        number: 3,
        title: 'Clean and Cool the Area',
        description: 'Reduce pain and swelling.',
        details: [
          'Wash with mild soap and water',
          'Apply a cold compress or ice pack wrapped in cloth for 10 minutes',
          'Repeat ice application several times in first hour',
          'Do not apply ice directly to skin'
        ]
      },
      {
        number: 4,
        title: 'Apply Baking Soda Paste (Optional)',
        description: 'Can help neutralize bee venom.',
        details: [
          'Mix baking soda with small amount of water to make paste',
          'Apply to sting site',
          'This works for bee stings (acidic venom) but not wasp stings (alkaline)'
        ]
      },
      {
        number: 5,
        title: 'Monitor for Allergic Reaction',
        description: 'Watch closely for the next 24 hours.',
        details: [
          'Normal reaction: localized swelling and redness that resolves in 24-48 hours',
          'Allergic reaction signs: extensive swelling, hives, vomiting, difficulty breathing',
          'Anaphylaxis signs: collapse, pale gums, rapid breathing - EMERGENCY',
          'Multiple stings can cause severe reactions even without allergy'
        ]
      }
    ],
    warnings: [
      'Stings in the mouth or throat - can cause dangerous swelling',
      'Difficulty breathing or swallowing',
      'Extensive swelling beyond the sting site',
      'Hives or welts appearing all over the body',
      'Vomiting or diarrhea',
      'Pale gums, weakness, or collapse',
      'Multiple stings (>5 for small pets, >10 for large dogs)'
    ],
    relatedVideos: ['stinger-removal', 'allergic-reaction-signs', 'cold-compress-application'],
    relatedGuides: ['allergic-reactions', 'facial-swelling', 'difficulty-breathing']
  },
  {
    id: 'vomiting-diarrhea',
    title: 'Vomiting & Diarrhea',
    species: ['All'],
    severity: 'medium',
    readTime: '5 min read',
    description: 'When to be concerned and how to provide supportive care',
    category: 'Gastrointestinal',
    lastReviewed: 'March 5, 2026',
    reviewedBy: 'Dr. David Thompson, DVM',
    steps: [
      {
        number: 1,
        title: 'Assess Severity',
        description: 'Determine if this requires emergency care or home management.',
        details: [
          'EMERGENCY signs: blood in vomit/stool, severe abdominal pain, bloated abdomen, lethargy/weakness, multiple episodes in short time',
          'Monitor: frequency, volume, color, presence of blood or foreign material',
          'Check for dehydration: gently pull up skin on back of neck - should spring back immediately',
          'Note any possible causes: dietary indiscretion, toxin exposure, new food/treats'
        ]
      },
      {
        number: 2,
        title: 'Withhold Food (Not Water)',
        description: 'Give the digestive system time to rest.',
        details: [
          'Fast for 12-24 hours (adult pets only)',
          'For puppies/kittens under 6 months: DO NOT fast, see vet immediately',
          'For diabetic pets: consult vet before fasting',
          'Continue to offer small amounts of water frequently',
          'If vomiting water, offer ice chips instead'
        ]
      },
      {
        number: 3,
        title: 'Reintroduce Bland Diet',
        description: 'After fasting period, start with gentle foods.',
        details: [
          'Bland diet options: boiled chicken (no skin/bones) with white rice, or boiled ground turkey with pumpkin',
          'Feed small amounts every 2-3 hours',
          'If tolerated for 24 hours, gradually reintroduce regular food over 3-4 days',
          'Mix increasing amounts of regular food with bland diet',
          'Commercial bland diet foods are available from your vet'
        ]
      },
      {
        number: 4,
        title: 'Prevent Dehydration',
        description: 'Ensure adequate fluid intake.',
        details: [
          'Offer water frequently in small amounts',
          'If refusing water: try ice chips, low-sodium broth, or unflavored Pedialyte',
          'Check hydration: gently lift skin - should snap back immediately',
          'Watch for signs of dehydration: sunken eyes, dry gums, lethargy',
          'Dehydrated pets require veterinary IV fluids'
        ]
      },
      {
        number: 5,
        title: 'Know When to Seek Veterinary Care',
        description: 'Recognize warning signs requiring professional help.',
        details: [
          'IMMEDIATE: bloody vomit/diarrhea, severe pain, bloated abdomen, foreign object suspected, toxin ingestion',
          'URGENT (same day): vomiting/diarrhea lasting >24 hours, signs of dehydration, puppies/kittens, senior pets, known health conditions',
          'SCHEDULED: mild symptoms improving with supportive care but want to confirm',
          'Bring stool sample to appointment if diarrhea is present'
        ]
      }
    ],
    warnings: [
      'Blood in vomit (red or coffee-ground appearance) or stool',
      'Severe abdominal pain or bloating',
      'Multiple episodes of vomiting in short period',
      'Inability to keep water down',
      'Lethargy, weakness, or collapse',
      'Pale gums',
      'Suspected foreign object or toxin ingestion',
      'Projectile vomiting',
      'Puppies, kittens, or pets with chronic conditions'
    ],
    relatedVideos: ['dehydration-check', 'bland-diet-prep', 'medication-administration'],
    relatedGuides: ['poisoning', 'dehydration', 'foreign-object-ingestion']
  }
];

export const categories = [
  'All Categories',
  'Airway Emergencies',
  'Trauma',
  'Environmental Emergencies',
  'Toxicology',
  'Neurological',
  'Sensory Injuries',
  'Immune Response',
  'Environmental',
  'Gastrointestinal'
];
