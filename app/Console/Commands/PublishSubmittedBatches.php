<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
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

class PublishSubmittedBatches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'submissions:publish-past-deadline {--force : Force publish even if deadline has not passed}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-publish all submitted batches/submissions that are past the annual submission deadline';

    /**
     * Execute the console command.
     */
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

        $totalPublished = 0;

        // Define all models — must match PRIORITY_ORDER in formConfig.js:
        // SUMMARY, MER1-4A, Annexes A, B, C, C-1, D, E, F, G, H, I, I-1, J, K, L, L-1, M, N, N-1, O
        $allModels = [
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

        // Process all models uniformly
        foreach ($allModels as $model) {
            $count = $model::where('status', 'submitted')
                ->where('created_at', '<', $deadline)
                ->update(['status' => 'published', 'updated_at' => $now]);

            if ($count > 0) {
                $this->info("Published {$count} records from " . class_basename($model));
                $totalPublished += $count;
            }
        }

        $this->info("Total records published: {$totalPublished}");
        return 0;
    }
}
