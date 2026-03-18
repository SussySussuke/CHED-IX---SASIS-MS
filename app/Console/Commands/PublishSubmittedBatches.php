<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AuditLog;
use App\Models\Setting;
use App\Models\Summary;
use App\Models\MER1Submission;
use App\Models\MER2Submission;
use App\Models\MER3Submission;
use App\Models\MER4ASubmission;
use App\Models\AnnexABatch;
use App\Models\AnnexBBatch;
use App\Models\AnnexCBatch;
use App\Models\AnnexC1Batch;
use App\Models\AnnexDSubmission;
use App\Models\AnnexEBatch;
use App\Models\AnnexFBatch;
use App\Models\AnnexGSubmission;
use App\Models\AnnexHBatch;
use App\Models\AnnexIBatch;
use App\Models\AnnexI1Batch;
use App\Models\AnnexJBatch;
use App\Models\AnnexKBatch;
use App\Models\AnnexLBatch;
use App\Models\AnnexL1Batch;
use App\Models\AnnexMBatch;
use App\Models\AnnexNBatch;
use App\Models\AnnexN1Batch;
use App\Models\AnnexOBatch;
use App\Services\CacheService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PublishSubmittedBatches extends Command
{
    protected $signature = 'submissions:publish-past-deadline {--force : Force publish even if deadline has not passed}';

    protected $description = 'Auto-publish all submitted batches/submissions that are past the annual submission deadline';

    // All 24 form models — must match PRIORITY_ORDER in formConfig.js
    private array $allModels = [
        Summary::class,
        MER1Submission::class,
        MER2Submission::class,
        MER3Submission::class,
        MER4ASubmission::class,
        AnnexABatch::class,
        AnnexBBatch::class,
        AnnexCBatch::class,
        AnnexC1Batch::class,
        AnnexDSubmission::class,
        AnnexEBatch::class,
        AnnexFBatch::class,
        AnnexGSubmission::class,
        AnnexHBatch::class,
        AnnexIBatch::class,
        AnnexI1Batch::class,
        AnnexJBatch::class,
        AnnexKBatch::class,
        AnnexLBatch::class,
        AnnexL1Batch::class,
        AnnexMBatch::class,
        AnnexNBatch::class,
        AnnexN1Batch::class,
        AnnexOBatch::class,
    ];

    public function handle()
    {
        $deadline = Setting::getDeadline();

        if (!$deadline) {
            $this->error('No deadline configured in settings.');
            return 1;
        }

        $now = new \DateTime();

        if ($now <= $deadline && !$this->option('force')) {
            $this->info('Deadline has not passed yet. No action taken.');
            $this->info('Use --force to publish anyway.');
            return 0;
        }

        if ($this->option('force')) {
            $this->warn('Force flag enabled. Publishing regardless of deadline.');
        }

        $this->info("Publishing all submitted records past deadline: {$deadline->format('Y-m-d H:i:s')}");

        // --- Step 1: Collect affected hei_id + academic_year pairs BEFORE updating ---
        // A bulk UPDATE returns only a count, not the rows. We must query first.
        $affectedPairs = collect();

        foreach ($this->allModels as $model) {
            $pairs = $model::where('status', 'submitted')
                ->where('created_at', '<', $deadline)
                ->select('hei_id', 'academic_year')
                ->distinct()
                ->get()
                ->map(fn($r) => $r->hei_id . '|' . $r->academic_year);

            $affectedPairs = $affectedPairs->merge($pairs);
        }

        $affectedPairs = $affectedPairs->unique()->values();

        if ($affectedPairs->isEmpty()) {
            $this->info('No submitted records found past deadline. Nothing to publish.');
            return 0;
        }

        $totalPublished = 0;

        // --- Step 2: Wrap all updates in a single transaction (all-or-nothing) ---
        DB::transaction(function () use ($deadline, $now, &$totalPublished) {
            foreach ($this->allModels as $model) {
                $count = $model::where('status', 'submitted')
                    ->where('created_at', '<', $deadline)
                    ->update(['status' => 'published', 'updated_at' => $now]);

                if ($count > 0) {
                    $this->info("Published {$count} records from " . class_basename($model));
                    $totalPublished += $count;
                }
            }
        });

        $this->info("Total records published: {$totalPublished}");

        // --- Step 3: Invalidate cache for every affected HEI + year pair ---
        $affectedYears = collect();

        foreach ($affectedPairs as $pair) {
            [$heiId, $academicYear] = explode('|', $pair);
            $heiId = (int) $heiId;

            CacheService::clearSubmissionCaches($heiId);
            CacheService::clearHeiCaches($heiId, $academicYear);

            $affectedYears->push($academicYear);
        }

        // Clear admin dashboard cache per affected year
        foreach ($affectedYears->unique() as $year) {
            Cache::forget("admin_dashboard_stats_{$year}");
        }

        $this->info("Cache invalidated for {$affectedPairs->count()} HEI/year pairs.");

        // --- Step 4: Write a system audit log entry ---
        AuditLog::logSystem(
            action: 'published',
            entityType: 'Submission',
            entityId: null,
            entityName: 'Bulk Auto-Publish',
            description: "Auto-published {$totalPublished} submitted records past deadline ({$deadline->format('Y-m-d H:i:s')}). Affected HEI/year pairs: {$affectedPairs->count()}.",
            oldValues: ['status' => 'submitted'],
            newValues: ['status' => 'published', 'triggered_by' => 'submissions:publish-past-deadline']
        );

        $this->info('Audit log entry created.');

        return 0;
    }
}
