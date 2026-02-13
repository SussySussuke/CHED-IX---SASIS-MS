╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║  MER MIGRATION EPIDEMIC - COMPLETE DOCUMENTATION                       ║
║  The Copy-Paste Disaster That Broke MER1, MER2, and MER3             ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝

=== THE PROBLEM ===

Three migrations (MER1, MER2, MER3) were created with identical bugs due to
copy-paste without reading the fix documentation. MER4A was the first one to
get it right.

BUG #1: Missing 'overwritten' in status enum
BUG #2: Unique constraint on (hei_id, academic_year) blocking workflow

These bugs prevent the overwrite workflow from functioning:
1. HEI submits → status='submitted'
2. Admin publishes → status='published'
3. HEI wants to update → NEW submission with status='request'
4. OLD published record → should be marked status='overwritten'

Without 'overwritten' in the enum: MySQL data truncation error
With unique constraint: Duplicate key error on step 3

=== THE TIMELINE ===

📅 MER1 Created:
   - Had both bugs
   - Fixed via separate migration: 2025_02_11_000001_remove_unique_constraint...
   - Documented in: MER1Problem/MER1Problem.txt

📅 MER2 Created:
   - Copy-pasted MER1's ORIGINAL code (not the fixed version)
   - Had both bugs again
   - Fixed in migration file
   - Documented in: MER1Problem/MER2Problem.txt

📅 MER3 Created:
   - Copy-pasted MER2's broken code
   - Had both bugs AGAIN
   - Fixed in migration file
   - Documented in: MER1Problem/MER3Problem.txt

📅 MER4A Created:
   - FINALLY someone read the docs
   - Created with correct code from the start
   - No bugs! 🎉

=== THE FIX ===

OPTION 1: Run the master fix script (RECOMMENDED)
```bash
cd C:\xampp\htdocs\ched-hei-system
php MER1Problem/fix-all-mer-tables.php
```

This will fix ALL tables (MER1, MER2, MER3) in one go with progress display.

OPTION 2: Manual fix via tinker
```bash
cd C:\xampp\htdocs\ched-hei-system
php artisan tinker
```

Then paste:
```php
// Fix MER1
DB::statement("ALTER TABLE mer1_submissions DROP INDEX mer1_hei_year_unique");
DB::statement("ALTER TABLE mer1_submissions MODIFY COLUMN status ENUM('pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled', 'overwritten') DEFAULT 'pending'");

// Fix MER2
DB::statement("ALTER TABLE mer2_submissions DROP INDEX mer2_hei_year_unique");
DB::statement("ALTER TABLE mer2_submissions MODIFY COLUMN status ENUM('pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled', 'overwritten') DEFAULT 'pending'");

// Fix MER3
DB::statement("ALTER TABLE mer3_submissions DROP INDEX mer3_hei_year_unique");
DB::statement("ALTER TABLE mer3_submissions MODIFY COLUMN status ENUM('pending', 'submitted', 'request', 'approved', 'published', 'rejected', 'cancelled', 'overwritten') DEFAULT 'pending'");

echo "✅ All tables fixed!\n";
```

=== VERIFICATION ===

After running the fix, verify each table:

```php
// Check MER1
echo "=== MER1 ===\n";
foreach (DB::select("SHOW INDEXES FROM mer1_submissions") as $i) {
    echo "- {$i->Key_name}\n";
}

// Check MER2
echo "\n=== MER2 ===\n";
foreach (DB::select("SHOW INDEXES FROM mer2_submissions") as $i) {
    echo "- {$i->Key_name}\n";
}

// Check MER3
echo "\n=== MER3 ===\n";
foreach (DB::select("SHOW INDEXES FROM mer3_submissions") as $i) {
    echo "- {$i->Key_name}\n";
}
```

Expected output for EACH table:
✅ PRIMARY
✅ merX_hei_year_status_idx (or similar)
❌ merX_hei_year_unique (SHOULD NOT EXIST)

=== TESTING ===

Test each form after fixing:

1. Submit for year 2025-2026
2. Submit AGAIN for 2025-2026 (should replace the first)
3. Check database:
   ```sql
   -- Replace merX with mer1, mer2, or mer3
   SELECT id, hei_id, academic_year, status, created_at 
   FROM merX_submissions 
   WHERE hei_id = 1 AND academic_year = '2025-2026'
   ORDER BY created_at;
   ```
4. Should see:
   - Old record: status='overwritten'
   - New record: status='submitted'

=== CORRECT MIGRATION PATTERN ===

For ANY future MER tables, use this pattern:

```php
Schema::create('merX_submissions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('hei_id');
    $table->string('academic_year');
    
    // ✅ INCLUDE 'overwritten' in enum
    $table->enum('status', [
        'pending',
        'submitted',
        'request',
        'approved',
        'published',
        'rejected',
        'cancelled',
        'overwritten'  // REQUIRED!
    ])->default('pending');
    
    $table->text('request_notes')->nullable();
    $table->text('cancelled_notes')->nullable();
    $table->text('admin_notes')->nullable();
    $table->timestamps();
    
    $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
    
    // ✅ USE INDEX, NOT UNIQUE
    $table->index(['hei_id', 'academic_year', 'status']);
    
    // ❌ DON'T DO THIS
    // $table->unique(['hei_id', 'academic_year']);
});
```

See MER4A migration for a working example!

=== LESSONS LEARNED ===

1. Read the fucking documentation before copy-pasting
2. When you fix a bug, document it clearly
3. When creating new migrations, check existing ones for patterns
4. Test overwrite workflows before deploying
5. Don't copy-paste broken code three times in a row

=== FILE MANIFEST ===

Documentation:
- MER1Problem/README.txt (this file)
- MER1Problem/MER1Problem.txt (original issue + fix)
- MER1Problem/MER2Problem.txt (second occurrence)
- MER1Problem/MER3Problem.txt (third occurrence)

Fix Script:
- MER1Problem/fix-all-mer-tables.php (master fix script)

Migration Files (FIXED):
- database/migrations/2025_02_02_000001_create_mer1_tables.php
- database/migrations/2025_02_03_000001_create_mer2_tables.php
- database/migrations/2025_02_04_000001_create_mer3_tables.php
- database/migrations/2025_02_06_000001_create_mer4a_tables.php (already correct)

Migration Files (separate fixes for MER1):
- database/migrations/2025_02_02_000002_add_overwritten_status_to_mer1_submissions.php
- database/migrations/2025_02_11_000001_remove_unique_constraint_from_mer1_submissions.php

Frontend:
- resources/js/Components/Common/SharedFormCreate.jsx (error message fixed)

Backend:
- app/Http/Controllers/HEI/BaseAnnexController.php (overwriteExisting method)
- app/Http/Controllers/HEI/MER1Controller.php
- app/Http/Controllers/HEI/MER2Controller.php
- app/Http/Controllers/HEI/MER3Controller.php

=== CURRENT STATUS ===

┌───────────┬──────────────────┬────────────┬────────────┐
│ Table     │ Migration Fixed  │ DB Fixed   │ Status     │
├───────────┼──────────────────┼────────────┼────────────┤
│ MER1      │ ✅               │ ✅         │ RESOLVED   │
│ MER2      │ ✅               │ ⏳         │ NEEDS SQL  │
│ MER3      │ ✅               │ ⏳         │ NEEDS SQL  │
│ MER4A     │ ✅               │ ✅         │ Already OK │
└───────────┴──────────────────┴────────────┴────────────┘

Run fix-all-mer-tables.php to complete the database fixes.

=== QUICK START ===

Just run this ONE command:

    cd C:\xampp\htdocs\ched-hei-system && php MER1Problem/fix-all-mer-tables.php

Done! 🎉
