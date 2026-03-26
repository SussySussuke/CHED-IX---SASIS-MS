MOTOPIGEON PROJECT RULES
========================

Read affected files first. Understand the data structure. Make the smallest change.

NEVER duplicate controllers to handle the same logic → extract to a Service or Action class
NEVER create multiple routes for the same resource → one resourceful controller, query params drive variation
NEVER let feature controllers import each other → lift shared logic to app/Services/ or app/Actions/
NEVER use raw numbers or magic strings → name everything with a const or enum
NEVER bypass Eloquent relationships → no raw DB::select() when a relationship or scope will do
NEVER mix business logic into controllers → controllers are thin, logic lives in Services/Actions


DATA-DRIVEN DESIGN
------------------
One Controller = HTTP handling. One Service = business logic. One Model = data + relationships.
Variation is expressed through query parameters and scopes, not duplicated controllers or routes.


ARCHITECTURE LAYERS
-------------------
- HTTP layer (Controllers)     → validate input, call service, return response — nothing else
- Business layer (Services)    → orchestrate logic, call repositories or models, throw exceptions
- Data layer (Models)          → Eloquent relationships, scopes, casts, accessors/mutators
- Jobs/Events                  → async work and side-effects, never inline in controllers


STATE / DATA FLOW
-----------------
- Authenticated user state     → Auth facade / auth() helper, never passed manually through layers
- Shared config values         → config() helper, .env via config files only — never env() in code
- Cross-request caching        → Cache facade with explicit keys and TTLs
- Real-time / push             → Laravel Broadcasting + Pusher/Soketi or queued notifications
- Never cross-import features  → pass data through Service method arguments or shared Services


CONSTANTS & ENUMS
-----------------
One file needs it              → const at top of that file or in the Model itself
Multiple files need it         → app/Enums/FeatureName.php (use PHP 8.1 backed enums)
Everything needs it            → app/Support/AppConstants.php or config/app_constants.php


FOLDER STRUCTURE
----------------
app/
  Console/                     → artisan commands
  Exceptions/                  → custom exception classes + Handler.php
  Http/
    Controllers/
      Auth/                    → login, register, password reset
      Account/                 → profile, settings
      Map/                     → location, routing endpoints
      Shop/                    → shop listing, products
      Order/                   → order flow, cart
      TripHistory/             → past trips
      Notification/            → notification management
      Search/                  → search endpoints
      Feedback/                → ratings, reviews
      Analysis/                → fuel/trip analytics
      BusinessAnalytics/       → shop owner stats
      BusinessVerification/    → shop owner onboarding
    Middleware/                → auth, throttle, role checks, etc.
    Requests/                  → FormRequest classes per feature (validation lives here)
    Resources/                 → API Resources and Resource Collections
  Models/                      → ALL Eloquent models live here (flat, not feature-based)
  Services/                    → Business logic classes, one per domain concept
  Actions/                     → Single-responsibility action classes for complex operations
  Jobs/                        → Queued jobs
  Events/                      → Event classes
  Listeners/                   → Event listeners
  Notifications/               → Laravel Notification classes (email, SMS, push)
  Policies/                    → Authorization policies, one per Model
  Enums/                       → PHP 8.1+ backed enums
  Support/                     → Helpers, Macros, custom casts, base classes
bootstrap/
config/
database/
  migrations/                  → one migration per schema change, never edit old ones
  seeders/
  factories/
resources/
  views/                       → Blade templates (if applicable)
routes/
  api.php                      → all API routes, versioned under /api/v1/
  web.php                      → web routes if applicable
  channels.php                 → broadcasting channel authorization
storage/
tests/
  Feature/                     → HTTP/integration tests per controller
  Unit/                        → isolated unit tests per Service/Action


MODELS (app/Models/)
--------------------
All models are flat in one folder. No subfolders. No feature grouping.
Models own: relationships, scopes, casts, accessors/mutators, constants local to that model.
Models do NOT own: business logic, HTTP handling, validation.

Examples: User.php, Shop.php, Order.php, Trip.php, Product.php, Review.php, Notification.php


ROUTING
-------
- All API routes in routes/api.php under Route::prefix('v1')->group(...)
- Use Route::apiResource() for standard CRUD — do not hand-write all 7 routes manually
- Non-resourceful routes get an explicit name: Route::get(...)->name('feature.action')
- Route model binding → always, for any route that resolves a model by ID
- Never put authorization logic in routes → use Policies and middleware


VALIDATION
----------
- All validation in FormRequest classes in app/Http/Requests/
- Controller methods type-hint the FormRequest, never use $request->validate() inline
- Authorization (can the user do this?) → also in FormRequest::authorize() or a Policy


DATABASE
--------
- Eloquent queries → always through the Model or a dedicated Repository/Service
- Raw DB::select() → only for complex reporting queries that Eloquent cannot express cleanly
- Eager load relationships → never lazy-load in loops (N+1 is heresy)
- Use query scopes for reusable filter logic on models
- Migrations: one change per migration file, never edit a migration that has been committed


API RESPONSES
-------------
- Always return API Resources (JsonResource / ResourceCollection) — never raw arrays or $model->toArray()
- Consistent envelope: { data: ..., message: ..., meta: ... }
- Use proper HTTP status codes — 200, 201, 422, 401, 403, 404, 500. Do not return 200 for errors.
- Errors → handled in app/Exceptions/Handler.php, not scattered in controllers


AUTHENTICATION
--------------
- Use Laravel Sanctum for API token auth (mobile clients) or session auth (web)
- Auth state → Auth::user() / auth()->user(), never pass user through layers manually
- Role/permission checks → Gates or Policies, never if($user->role == 'admin') scattered in code


QUEUE & JOBS
------------
- Any operation over ~200ms or with side-effects → dispatch to a Queue
- Email sends, push notifications, analytics processing → always queued
- Never call Mail::send() or Notification::send() synchronously in a controller


COMMENTS
--------
Keep comments minimal.
Formulas/calculations: one line max describing the output.
Inline comments: non-obvious values only.
PHPDoc blocks on Service and Action public methods only — not on every getter.


FIXING PROBLEMS
---------------
Before fixing a problem locally, ask: could this same problem occur across other
features too? If yes, the fix belongs in one shared upstream location — not
patched separately in each controller.

Prefer one enforcement point that covers all cases over multiple isolated fixes
that each solve the same class of problem independently.

Check middleware, base controllers, and shared Services before concluding a controller is broken.
A controller that looks correct in isolation may be wrong because of a middleware or service override.


VALIDATION CHECKLIST
--------------------
Before implementing, verify:

SEARCH FIRST
- Built-in Laravel feature for this? (Policies, FormRequests, ResourceCollections, Jobs, etc.)
- Official Laravel pattern exists? Check laravel.com/docs
- Common Laravel beginner mistake? (N+1, inline validation, logic in controllers, env() in code)

STRUCTURE
- Service/Action instead of fat controller?
- Correct class type for use case? (Job vs Event vs Notification vs Action)
- Missing response states? (empty collections, 404 handling, validation error shape)
- Verify return types before assigning — check what a Service method or Eloquent query actually returns

ORGANIZATION
- Belongs in app/Services/? Or is it truly specific to one Controller action?
- Using eager loading (with()) vs lazy loading correctly?
- Cleaning up jobs/listeners that are no longer needed?

OUTPUT FORMAT
-------------
✅ What's correct
⚠️ What to change + why
💡 Pro alternatives
🔍 Need to check code before answering


ADDITIONAL INSTRUCTIONS
-----------------------
Instructions/ may contain specialized guides. Read them AS NEEDED — not all at once.
Only read what is relevant to the current task.

HandMeDownKnowledge/ contains session notes from previous AI sessions.
Read the relevant file before starting any significant task.


USEFUL COMMANDS
---------------
php artisan serve
php artisan migrate
php artisan migrate:fresh --seed
php artisan make:model ModelName -mfsc
php artisan make:controller Feature/NameController --api
php artisan make:request Feature/StoreNameRequest
php artisan make:resource NameResource
php artisan make:service NameService
php artisan make:job ProcessNameJob
php artisan make:policy NamePolicy --model=ModelName
php artisan queue:work
php artisan test
php artisan test --filter=FeatureTest
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"


UI — LOADING STATES
--------------------
Prefer reactive/optimistic UI. Components should render structure immediately; data fills in after.

NEVER render null or a blank div while data loads — users read blank screens as broken.
NEVER use a spinner for content loading — spinners are only for point actions (save, approve, reject).

Skeleton screens MUST:
- Render immediately on mount, before any fetch resolves
- Mirror the real layout (same row count estimate, same positional hierarchy)
- Use Tailwind `animate-pulse` (built-in, no library needed)
- Be replaced by real content once data resolves, or by an inline error message on failure

All async fetch calls inside useEffect MUST use AbortController.
Cancel on unmount and on dependency change to prevent stale state and memory leaks.

Optimistic updates — preferred for low-failure-rate actions (approve, status toggle):
update UI immediately, roll back only on error. Not yet implemented; adopt incrementally.
