# Backend System Design
**VAFIS — Web-Based Veterinary Association First-Aid Information System**

# What the System Is
VAFIS is a web-based platform that gives pet owners reliable, veterinarian-approved first-aid guidance for small animals (dogs, cats, rabbits, hamsters, guinea pigs, birds). It combines three core pillars: emergency guidance search (step-by-step guides by species and scenario), educational content (instructional videos and quizzes), and emergency clinic location (finding nearby vets using location services). All published medical content must pass a two-stage review workflow — Veterinary Professional review, then Administrator approval — before it is accessible to the public.

## User Roles
- Veterinary Association Administrator
    - manages the entire platform backend. Creates and updates first-aid guides, videos, and quizzes. Submits guides for professional review. Approves reviewed guides for publication. Manages quiz questions and vet clinic records. Monitors content flagged as outdated. Requires MFA login.

- Veterinary Professional
    - clinical reviewer. Receives notifications when a guide is pending review. Reviews content for accuracy. Approves or requests changes with comments. Updates educational videos. Requires MFA login.

- Pet Owner
    - primary end-user. Accesses first-aid guides, watches videos, completes quizzes, locates nearby vet clinics, submits feedback. Can manage pet profiles. Core content (guides, videos, clinic directory) is accessible without login. Registration required only for quiz results, pet profiles, and feedback history.

## Registration & Pet Profile
- Pet Owner registers an account → Person factory method creates a PetOwner instance
- Pet Owner creates a PetProfile including: 
    - pet name
    - species (linked to Species)
    - pet age
- PetProfile is used to filter and personalise displayed first-aid content (guides, quizzes, scenarios)
- A Pet Owner may have multiple pet profiles (e.g. one dog, one cat)

**Authentication**
- Administrator and Veterinary Professional must log in with MFA
- System limits repeated failed login attempts to prevent brute force; account temporarily locked after repeated failures
- On invalid credentials
    - generic error message shown
- Pet Owner accounts use standard username/password; session auto-expires after 15 minutes of inactivity

## Content Lifecycle — First-Aid Guide
- This is the core workflow. All guides pass through Draft → Pending Review → Reviewed → Published before becoming visible to pet owners.

- Admin creates or updates a guide
    - Selects or creates a FirstAidGuide with
        - title
        - species
        - emergency scenario
        - step-by-step instructions
        - severity flag ("Seek Vet Now" if applicable)
        - linked Video and Quiz
        - assigned ContentCategory
    - GuideRepository persists the guide data to Database
    - Edit event logged in AuditLog

- Admin submits for review
    - Guide status set to Pending Review
    - FirstAidGuide triggers the Observer pattern → Notification generated → assigned VeterinaryProfessional is alerted (in-app or email)

- Veterinary Professional reviews
    - Receives Notification, accesses review queue via FirstAidGuide → GuideRepository fetches all pending guides from Database
    - Reviews full guide content for clinical accuracy
    - Approves:
        - review event logged in AuditLog; Notification sent to Administrator — guide is ready to publish
    - Requests changes: 
        - guide status set to Revision Required
        - FirstAidGuide returns revision comments to Administrator
        - Admin edits and resubmits → loop restarts from step 2

- Admin approves and publishes
    - Administrator verifies approval details and publishes the guide
    - Approval event logged in AuditLog
    - FirstAidGuide executes publish query via GuideRepository → Database updates publication status
    - Guide is now publicly visible to Pet Owners
    - Each published guide displays: "Last Reviewed" date + approving Veterinary Professional name

- Content expiry monitoring
    - Any guide not reviewed within 12 months is automatically flagged
    - Notification generated to Administrator and assigned Veterinary Professional within 24 hours of the flag triggering
    - Admin can unpublish or archive guides without developer intervention

## Pet Owner — Search for First-Aid Guidance
- Pet Owner lands on the home page; species selector cards displayed (dog, cat, rabbit, hamster, etc.)
- Pet Owner selects a species → PetOwner triggers EmergencyScenario with species ID from Species
- Flow of search:
    - Pet Owner enters a symptom keyword (e.g. "choking", "bleeding") → Strategy pattern routes the search (keyword search, species filter, or category filter — each is a separate concrete strategy)
- Flow after search:
    - EmergencyScenario returns matching guides → FirstAidGuide delegates retrieval to GuideRepository → GuideRepository executes query against Database → guide data returned
- FirstAidGuide displayed
    - numbered steps, images
    - severity flags
    - linked Video
    - linked Quiz
- Variant — No matching scenario found:
    - System redirects Pet Owner to ClinicDirectory to locate the nearest veterinary clinic

## Pet Owner — Watch Educational Video
- Pet Owner navigates to a species/scenario page or the video library
- Videos associated with the species or guide are displayed
    - Pet Owner can also filter by keyword or topic
- Pet Owner selects a video → embedded player loads on page
- Player includes a link back to the associated FirstAidGuide
- Variant — No matching video found:
    - System redirects to the relevant first-aid guide

## Pet Owner — Complete a Quiz
- Pet Owner selects a quiz topic (displayed organized by species and topic, linked to a FirstAidGuide)
- Quiz loads QuizQuestion objects; questions displayed one at a time
- Flow complete quiz:
    - Pet Owner selects an answer → QuizQuestion checks correctness → immediate feedback shown (correct/incorrect + brief explanation)
- Loop repeats until all questions answered
- Quiz creates a QuizResult with: 
    - quiz ID, pet owner ID
    - score, pass/fail
    - attempt date → saved to Database via Database class
- Final score summary displayed to Pet Owner
- Variant — Retake:
    - "Retake Quiz" button available on results screen; questions may be reshuffled
    - No retake limit; quiz can be attempted multiple times
- Scheduled quiz publish:
    - Admin can schedule a future publish date; system marks quiz as "Scheduled" and auto-publishes at the specified time

## Pet Owner — Locate an Emergency Veterinary Clinic
- Pet Owner accesses the clinic directory ("Find a Vet" link prominent on guide pages and main navigation)
- ClinicDirectory requests user coordinates from LocationService
- If location access granted:
    - LocationService returns coordinates to ClinicDirectory
    - ClinicDirectory asks VetClinic to find nearby clinics → Database queried for full clinic details
    - Results displayed: clinic name, address, phone number, operating hours, 24-hour/emergency indicator
    - Each entry includes click-to-call button and map directions link
- If location access denied:
    - ClinicDirectory prompts Pet Owner to enter suburb or postcode manually → same search executed
- Variant — Map link fails:
    - System displays clinic address and manual navigation instructions

## Pet Owner — Submit Feedback
- Feedback prompt displayed at the bottom of every guide page and quiz results page
- Pet Owner selects a star rating (1–5) for helpfulness
- Pet Owner optionally enters free-text comment (accuracy, clarity, missing information)
- Feedback object created — linked to the relevant FirstAidGuide or Quiz, linked to the PetOwner
- System displays a thank-you confirmation; feedback stored for Association to identify and improve outdated or unclear content
- Variant — Rating not selected:
    - System prompts Pet Owner to select a rating before allowing submission

## Admin — Manage Quiz Content
- Admin navigates to quiz management section from the admin dashboard
- Creates a new Quiz including:
    - specifies topic
    - associated species
    - pass mark
    - optional scheduled publish date
- Adds QuizQuestion objects
    - prompt
    - multiple-choice answer options
    - correct answer
    - explanatory note
- Admin can preview the quiz as Pet Owner would see it
- Admin publishes or schedules the quiz; Admin can also delete poorly designed questions at any point

## Admin — Manage Veterinary Clinic Records
- Admin registers VetClinic instances and links each to the relevant Species
- Each clinic stores: 
    - address
    - phone number
    - operating hours
    - species treated
- Clinics searchable by Pet Owners during emergencies via ClinicDirectory

## Content Audit Trail
- Every significant system event is recorded in AuditLog and is:
    - non-editable
    - accessible only to authorised administrators:

| Event | Logged |
|-------|--------|
| Guide created or edited | Admin identity, timestamp |
| Guide submitted for review | Admin identity, timestamp |
| Review outcome submitted | Vet Professional identity, outcome, timestamp |
| Guide approved and published | Admin identity, timestamp | 
| Quiz created, updated, published | Admin identity, timestamp |
| Login attempts | User identity, timestamp, outcome |

## Notifications
| Recipient | Trigger |
|-----------|---------|
| Veterinary Professional | Guide submitted for review |
| Administrator | Guide passed clinical review (ready to publish) |
| Administrator | Guide has revision comments (changes required) |
| Administrator | Content not reviewed within 12 months |

## Class Structure Summary
| Layer | Classes |
|-------|---------|
| Domain entities | PetProfile, Species, EmergencyScenario, FirstAidGuide, ContentCategory, Video, Quiz, QuizQuestion, QuizResult, Feedback, VetClinic |
| User roles (inherit from Person) | PetOwner, VeterinaryProfessional, VeterinaryAssociationAdministrator |
| Service/infrastructure | GuideRepository, ClinicDirectory, LocationService, Database (Singleton), Notification, AuditLog |

## Design patterns applied:
- Factory Method 
    - Person base class creates the correct user subtype (PetOwner, VeterinaryProfessional, VeterinaryAssociationAdministrator)
- Singleton 
    - Database class has exactly one instance throughout the system lifecycle
- Observer 
    - FirstAidGuide state changes trigger Notification to registered observers (VeterinaryProfessional, VeterinaryAssociationAdministrator)
- Strategy 
    - Pet Owner search behaviour (keyword, species, category) is interchangeable without modifying the PetOwner class
- MVC 
    - Domain classes are Model; web interface is View; Controller mediates between them
- Repository 
    - GuideRepository isolates all database access from FirstAidGuide, keeping domain logic separate from persistence logic