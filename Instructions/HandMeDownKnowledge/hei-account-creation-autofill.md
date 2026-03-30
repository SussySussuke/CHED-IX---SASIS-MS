# HEI Account Creation — Autofill & Variable Rename

**Status:** Analysis complete, implementation pending. Next Claude does the actual coding.

---

## What Needs To Be Done (Two Separate Tasks)

### Task 1: Rename `code` → `abbreviation`
### Task 2: Add CHED HEI reference table + autofill combobox on creation form

---

## Context & Decisions Made

### Why `abbreviation` and not `code`
The field `code` in the `heis` table was always meant to store short human-readable abbreviations like `ADZU`, `ABC`, `USTP`. The supervisor confirmed the correct term is "HEI Abbreviation". It's a user-defined field — CHED's own dataset does NOT have an abbreviation column, so it stays as a manual input even after autofill is added.

### Where to store CHED reference data
**Decision: A dedicated `hei_reference` table, seeded from the spreadsheet.**

Rationale:
- The spreadsheet has columns (`barangay`, `province`, `region`, `zip`, `coordinates`, `head_name`, `head_title`, `land_area`, `fax`, `website`) that DON'T belong in the `heis` table and shouldn't be added there. The `heis` table is the operational account table; `hei_reference` is CHED's master catalog.
- Seeding directly into `heis` is wrong — it conflates reference data with account records. Re-seeding on CHED data updates would destroy real accounts.
- Static JSON in the codebase is not queryable, not updatable without a deploy, and not maintainable at 121+ rows.
- A separate DB table is read-only reference data, queryable via a lightweight API endpoint, and fully decoupled from account creation.

### How autofill works in the UI
The "Name of HEI" plain text input in the Add HEI modal becomes a **searchable combobox**. When the admin types (e.g. "Ateneo"), a dropdown shows matching HEIs from `hei_reference`. On selection, it autofills several fields. The abbreviation and password always stay manual since CHED's data has neither.

---

## Task 1: Rename `code` → `abbreviation`

### Files to touch

**1. New migration** (`database/migrations/`)
```php
// Rename column in heis table
Schema::table('heis', function (Blueprint $table) {
    $table->renameColumn('code', 'abbreviation');
});
```
Also update the comment to `'HEI abbreviation e.g. ADZU, ABC'`.

**2. `app/Models/HEI.php`**
- In `$fillable`: change `'code'` → `'abbreviation'`

**3. `app/Services/HEIManagementService.php`**
- In `list()`: change `'code' => $hei->code` → `'abbreviation' => $hei->abbreviation`
- In `create()`: change `'code' => $validated['code']` → `'abbreviation' => $validated['abbreviation']`
- In `update()`: same, both `oldValues` and `newValues` arrays, and `$hei->update([...])`
- In `delete()`: `$heiData` array, change `'code'` → `'abbreviation'`
- In AuditLog `entityName` strings: `$hei->name . ' (' . $hei->code . ')'` → `$hei->name . ' (' . $hei->abbreviation . ')'`
- All `$validated['code']` → `$validated['abbreviation']`
- All `$hei->code` → `$hei->abbreviation`

**4. `app/Http/Controllers/SuperAdmin/HEIManagementController.php`**
- `store()` validation: `'code' => ['required', 'string', 'max:50', 'unique:heis']` → `'abbreviation' => [...]`
- `update()` validation: `'code' => ['required', 'string', 'max:50', 'unique:heis,code,' . $hei->id]` → `'abbreviation' => ['required', 'string', 'max:50', 'unique:heis,abbreviation,' . $hei->id]`

**5. `resources/js/Pages/SuperAdmin/HEIAccounts.jsx`**
- `useForm` initial state: `code: ''` → `abbreviation: ''`
- `handleEdit`: `code: hei.code` → `abbreviation: hei.abbreviation`
- Form field: `data.code` → `data.abbreviation`, label "HEI Code" → "HEI Abbreviation"
- AG Grid column: `headerName: 'HEI Code'` → `'HEI Abbreviation'`, `field: 'code'` → `'abbreviation'`
- `errors.code` → `errors.abbreviation`

**6. Check these too:**
- `app/Http/Controllers/Admin/HEIManagementController.php` — check if it references `code`
- Audit log `FIELD_LABELS` map (see `audit-log-display-hardening.md`) — update `code` label if present

---

## Task 2: CHED HEI Reference Table + Autofill

### Spreadsheet Data Summary
- File: `Untitled_spreadsheet.xlsx`, sheet `2025`
- 121 rows total; **row index 0 is a variable name legend row — skip it**
- Rows 1–120 are the actual 120 HEIs for Region 09

**Column mapping (spreadsheet header → DB column name):**

| Spreadsheet Column | DB Column | Notes |
|---|---|---|
| `TYPE` | `type` | `P`=Private, `S`=SUC, `L`=LUC, `NEW`/`NEW-L`/`NEW-S` = new institutions |
| `Academic Year` | `academic_year` | e.g. `2025-26` |
| `UII` | `uii` | e.g. `09001` |
| `HEI Name` | `name` | Full institution name |
| `Street` | `street` | |
| `Barangay` | `barangay` | |
| `City / Municipality` | `municipality` | |
| `Province` | `province` | |
| `Region` | `region` | All `09` in this sheet |
| `ZIP` | `zip` | |
| `X Coordinates` | `longitude` | |
| `Y Coordinates` | `latitude` | |
| `Land Area` | `land_area` | |
| `Distance from SUC Main` | `distance_from_suc_main` | |
| `Telephone Number` | `telephone` | May contain multiple, newline-separated |
| `Fax Number` | `fax` | |
| `Email` | `email` | May contain multiple, newline-separated — take first for autofill |
| `Website` | `website` | |
| `Head Name` | `head_name` | |
| `Head Title` | `head_title` | |
| `head Educational Attaintment` | `head_educational_attainment` | |
| `Head Telephone Number` | `head_telephone` | |
| `Updated by` | `updated_by` | |
| `Date` | `updated_date` | |
| `Notes` | `notes` | |

### Step A: Migration — create `hei_reference` table

```php
Schema::create('hei_reference', function (Blueprint $table) {
    $table->id();
    $table->string('uii', 10)->nullable()->index();
    $table->string('name');
    $table->string('type', 20)->nullable();         // P, S, L, NEW, NEW-L, NEW-S
    $table->string('academic_year', 20)->nullable();
    $table->string('street')->nullable();
    $table->string('barangay')->nullable();
    $table->string('municipality')->nullable();
    $table->string('province')->nullable();
    $table->string('region', 10)->nullable();
    $table->string('zip', 10)->nullable();
    $table->decimal('longitude', 10, 6)->nullable();
    $table->decimal('latitude', 10, 6)->nullable();
    $table->decimal('land_area', 10, 2)->nullable();
    $table->decimal('distance_from_suc_main', 10, 2)->nullable();
    $table->text('telephone')->nullable();
    $table->text('fax')->nullable();
    $table->text('email')->nullable();
    $table->string('website')->nullable();
    $table->string('head_name')->nullable();
    $table->string('head_title')->nullable();
    $table->string('head_educational_attainment')->nullable();
    $table->string('head_telephone')->nullable();
    $table->string('updated_by')->nullable();
    $table->date('updated_date')->nullable();
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

### Step B: Model — `app/Models/HEIReference.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HEIReference extends Model
{
    protected $table = 'hei_reference';

    protected $fillable = [
        'uii', 'name', 'type', 'academic_year', 'street', 'barangay',
        'municipality', 'province', 'region', 'zip', 'longitude', 'latitude',
        'land_area', 'distance_from_suc_main', 'telephone', 'fax', 'email',
        'website', 'head_name', 'head_title', 'head_educational_attainment',
        'head_telephone', 'updated_by', 'updated_date', 'notes',
    ];

    protected $casts = [
        'updated_date' => 'date',
        'longitude' => 'decimal:6',
        'latitude' => 'decimal:6',
    ];
}
```

### Step C: Seeder — `database/seeders/HEIReferenceSeeder.php`

**Hardcode the 120 HEIs as a PHP array — do NOT read the xlsx at runtime.**

The next Claude should extract the data using bash_tool with pandas:

```bash
python3 -c "
import pandas as pd, json
df = pd.read_excel('/mnt/user-data/uploads/Untitled_spreadsheet.xlsx', sheet_name='2025')
df = df.iloc[1:].reset_index(drop=True)  # skip variable name legend row
# Clean up NaN
df = df.where(pd.notnull(df), None)
cols = ['UII','HEI Name','TYPE','Academic Year','Email','Street','Barangay',
        'City / Municipality','Province','Region','ZIP','X Coordinates','Y Coordinates',
        'Land Area','Distance from SUC Main','Telephone Number','Fax Number',
        'Website','Head Name','Head Title','head Educational Attaintment','Head Telephone Number',
        'Updated by','Date','Notes']
print(df[cols].to_json(orient='records', indent=2))
"
```

Then convert JSON output to a PHP array and use `HEIReference::insert([...])` in the seeder.

Call it from `DatabaseSeeder.php`:
```php
$this->call(HEIReferenceSeeder::class);
```

### Step D: API endpoint

Add to `routes/web.php` (public route, no auth needed — non-sensitive reference data):
```php
Route::get('/api/hei-reference/search', [HEIReferenceController::class, 'search'])
    ->name('hei-reference.search');
```

New controller `app/Http/Controllers/HEIReferenceController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\HEIReference;
use Illuminate\Http\Request;

class HEIReferenceController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->get('q', '');

        $results = HEIReference::where('name', 'like', "%{$q}%")
            ->orWhere('uii', 'like', "%{$q}%")
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'uii', 'name', 'type', 'email', 'telephone',
                   'street', 'barangay', 'municipality', 'province', 'region', 'zip']);

        return response()->json($results);
    }
}
```

### Step E: Frontend — Combobox in `HEIAccounts.jsx`

Replace the plain `<input>` for "Name of HEI" with a combobox component. The existing `AddressSearchInput` is a good reference for the pattern already used in this project.

**New state to add:**
```jsx
const [nameQuery, setNameQuery] = useState('');
const [referenceResults, setReferenceResults] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [isLoadingRef, setIsLoadingRef] = useState(false);
```

**Search handler:**
```jsx
const searchHEIReference = async (query) => {
    setNameQuery(query);
    setData('name', query);
    if (query.length < 2) {
        setReferenceResults([]);
        setShowSuggestions(false);
        return;
    }
    setIsLoadingRef(true);
    try {
        const res = await fetch(`/api/hei-reference/search?q=${encodeURIComponent(query)}`);
        const results = await res.json();
        setReferenceResults(results);
        setShowSuggestions(true);
    } finally {
        setIsLoadingRef(false);
    }
};
```

**Type map for autofill:**
```jsx
const HEI_TYPE_MAP = {
    P: 'Private',
    S: 'SUC',
    L: 'LUC',
    NEW: 'Private',
    'NEW-S': 'SUC',
    'NEW-L': 'LUC',
};
```

**Autofill on selection:**
```jsx
const selectReference = (ref) => {
    const firstEmail = ref.email?.split('\n')[0]?.trim() ?? '';
    const addressParts = [ref.street, ref.barangay, ref.municipality, ref.province]
        .filter(Boolean).join(', ');

    setData({
        ...data,
        name: ref.name,
        uii: ref.uii ?? '',
        type: HEI_TYPE_MAP[ref.type] ?? '',
        email: firstEmail,
        address: addressParts,
        // abbreviation stays manual — CHED data has no abbreviation column
    });
    setNameQuery(ref.name);
    setReferenceResults([]);
    setShowSuggestions(false);
};
```

**Also update `handleEdit` and `reset()` calls to reset `nameQuery` state:**
```jsx
// In handleEdit:
setNameQuery(hei.name);

// In openAddModal and onSuccess callbacks:
setNameQuery('');
setReferenceResults([]);
setShowSuggestions(false);
```

**JSX for the combobox field** (replace the plain input for "Name of HEI"):
```jsx
<div className="relative">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Name of HEI
    </label>
    <input
        type="text"
        value={nameQuery}
        onChange={(e) => searchHEIReference(e.target.value)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        placeholder="Type to search CHED reference..."
        required
    />
    {showSuggestions && referenceResults.length > 0 && (
        <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
            {referenceResults.map((ref) => (
                <li
                    key={ref.id}
                    onMouseDown={() => selectReference(ref)}
                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{ref.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {ref.uii} · {ref.type} · {ref.municipality}
                    </div>
                </li>
            ))}
        </ul>
    )}
    {errors.name && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
    )}
</div>
```

> **Important UX note:** `onMouseDown` is used on list items (not `onClick`) to prevent the input's `onBlur` firing before the selection registers.

---

## Fields: Autofill vs Manual

| Field | Autofill? | Notes |
|---|---|---|
| UII | ✅ Yes | |
| Name of HEI | ✅ Yes (typed to search, set on select) | |
| Type | ✅ Yes | Map `P/S/L/NEW` → `Private/SUC/LUC` |
| HEI Abbreviation | ❌ Manual | CHED data has no abbreviation column |
| Email | ✅ Yes | First email if multiple (newline-separated) |
| Address | ✅ Yes | Assembled from street + barangay + municipality + province |
| Established Date | ❌ Manual | Not in spreadsheet |
| Password | ❌ Manual | Obviously |

All autofilled values remain editable before submit.

---

## Full Checklist for Next Claude

- [ ] New migration: rename `heis.code` → `heis.abbreviation`
- [ ] New migration: create `hei_reference` table
- [ ] New model: `app/Models/HEIReference.php`
- [ ] New seeder: `database/seeders/HEIReferenceSeeder.php` (120 HEIs hardcoded as PHP array — extract from xlsx via bash/pandas first)
- [ ] Update `DatabaseSeeder.php`: add `$this->call(HEIReferenceSeeder::class)`
- [ ] New controller: `app/Http/Controllers/HEIReferenceController.php` with `search()`
- [ ] New public route in `routes/web.php`: `GET /api/hei-reference/search`
- [ ] Update `app/Models/HEI.php`: `$fillable` rename `code` → `abbreviation`
- [ ] Update `app/Services/HEIManagementService.php`: all `code` → `abbreviation` references
- [ ] Update `app/Http/Controllers/SuperAdmin/HEIManagementController.php`: validation rules
- [ ] Update `resources/js/Pages/SuperAdmin/HEIAccounts.jsx`: rename field + add combobox
- [ ] Check audit log `FIELD_LABELS` (see `audit-log-display-hardening.md`) — update `code` label if present
- [ ] Run `php artisan migrate` (NOT `migrate:fresh` — real data may exist)
- [ ] Run `php artisan db:seed --class=HEIReferenceSeeder`

---

## DO NOT

- Do NOT add CHED reference columns (`barangay`, `province`, `zip`, etc.) to the `heis` table — wrong table, wrong concerns
- Do NOT run `migrate:fresh` — there may be real HEI accounts already in the DB
- Do NOT make `abbreviation` auto-populated from reference — user always defines it manually
- Do NOT skip the type mapping — reference uses single letters (`P`, `S`, `L`) but `heis.type` is an enum `('Private', 'SUC', 'LUC')`
- Do NOT read the xlsx file at runtime in the seeder — hardcode the data as a PHP array
