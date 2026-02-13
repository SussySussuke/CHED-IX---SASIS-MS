#!/usr/bin/env php
<?php
/**
 * MASTER FIX SCRIPT FOR ALL MER MIGRATIONS
 * 
 * Fixes the copy-paste epidemic of broken unique constraints and missing 'overwritten' status
 * 
 * RUN THIS:
 * cd C:\xampp\htdocs\ched-hei-system
 * php MER1Problem/fix-all-mer-tables.php
 */

echo "\n";
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  MASTER FIX SCRIPT FOR MER TABLES                         ║\n";
echo "║  Fixing MER1, MER2, MER3 unique constraints & enums       ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";
echo "\n";

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = [
    'mer1_submissions' => 'mer1_hei_year_unique',
    'mer2_submissions' => 'mer2_hei_year_unique',
    'mer3_submissions' => 'mer3_hei_year_unique',
];

$fixed = [];
$failed = [];

foreach ($tables as $table => $indexName) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "Processing: {$table}\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    try {
        // Check if table exists
        $tableExists = DB::select("SHOW TABLES LIKE '{$table}'");
        if (empty($tableExists)) {
            echo "⚠️  Table {$table} doesn't exist, skipping...\n\n";
            continue;
        }
        
        // Step 1: Check if unique constraint exists
        $indexes = DB::select("SHOW INDEXES FROM {$table} WHERE Key_name = '{$indexName}'");
        
        if (!empty($indexes)) {
            echo "🔧 Dropping unique constraint: {$indexName}\n";
            DB::statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
            echo "✅ Unique constraint dropped\n";
        } else {
            echo "✓  Unique constraint already removed\n";
        }
        
        // Step 2: Modify enum to add 'overwritten'
        echo "🔧 Adding 'overwritten' to status enum\n";
        DB::statement("
            ALTER TABLE {$table} 
            MODIFY COLUMN status ENUM(
                'pending',
                'submitted',
                'request',
                'approved',
                'published',
                'rejected',
                'cancelled',
                'overwritten'
            ) DEFAULT 'pending'
        ");
        echo "✅ Status enum updated\n";
        
        // Step 3: Verify
        echo "\n📋 Current indexes for {$table}:\n";
        $allIndexes = DB::select("SHOW INDEXES FROM {$table}");
        foreach ($allIndexes as $idx) {
            $unique = $idx->Non_unique == 0 ? '[UNIQUE]' : '[INDEX]';
            echo "   {$unique} {$idx->Key_name}\n";
        }
        
        $fixed[] = $table;
        echo "\n✅ {$table} successfully fixed!\n\n";
        
    } catch (\Exception $e) {
        $failed[] = $table;
        echo "\n❌ Failed to fix {$table}: {$e->getMessage()}\n\n";
    }
}

echo "\n";
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  SUMMARY                                                   ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";
echo "\n";

if (!empty($fixed)) {
    echo "✅ Successfully fixed (" . count($fixed) . "):\n";
    foreach ($fixed as $table) {
        echo "   - {$table}\n";
    }
    echo "\n";
}

if (!empty($failed)) {
    echo "❌ Failed to fix (" . count($failed) . "):\n";
    foreach ($failed as $table) {
        echo "   - {$table}\n";
    }
    echo "\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "🎯 All done! Now test your MER submissions.\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "\n";
