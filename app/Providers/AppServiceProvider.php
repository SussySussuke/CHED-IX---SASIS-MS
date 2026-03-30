<?php

namespace App\Providers;

use App\Observers\SubmissionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the SubmissionObserver for all submission models.
        // This ensures cache invalidation happens automatically on any save/delete,
        // regardless of which controller or service triggers the mutation.
        $submissionModels = [
            \App\Models\Summary::class,
            \App\Models\MER1Submission::class,
            \App\Models\MER2Submission::class,
            \App\Models\MER3Submission::class,
            \App\Models\MER4ASubmission::class,
            \App\Models\AnnexABatch::class,
            \App\Models\AnnexBBatch::class,
            \App\Models\AnnexCBatch::class,
            \App\Models\AnnexC1Batch::class,
            \App\Models\AnnexDSubmission::class,
            \App\Models\AnnexEBatch::class,
            \App\Models\AnnexFBatch::class,
            \App\Models\AnnexGSubmission::class,
            \App\Models\AnnexHBatch::class,
            \App\Models\AnnexIBatch::class,
            \App\Models\AnnexI1Batch::class,
            \App\Models\AnnexJBatch::class,
            \App\Models\AnnexKBatch::class,
            \App\Models\AnnexLBatch::class,
            \App\Models\AnnexL1Batch::class,
            \App\Models\AnnexMBatch::class,
            \App\Models\AnnexNBatch::class,
            \App\Models\AnnexN1Batch::class,
            \App\Models\AnnexOBatch::class,
        ];

        foreach ($submissionModels as $model) {
            $model::observe(SubmissionObserver::class);
        }
    }
}
