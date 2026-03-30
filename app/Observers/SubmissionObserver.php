<?php

namespace App\Observers;

use App\Services\CacheService;

/**
 * Automatically invalidates all relevant caches whenever any submission
 * model is created, updated, or deleted.
 *
 * This is the safety net — controllers call CacheService explicitly too,
 * but if any code path ever mutates a submission without clearing the cache,
 * this observer catches it.
 *
 * Register in AppServiceProvider::boot() for each model.
 */
class SubmissionObserver
{
    /**
     * Handle the model "saved" event (fires for both create and update).
     */
    public function saved($model): void
    {
        $this->bust($model);
    }

    /**
     * Handle the model "deleted" event.
     */
    public function deleted($model): void
    {
        $this->bust($model);
    }

    private function bust($model): void
    {
        $heiId       = $model->hei_id ?? null;
        $academicYear = $model->academic_year ?? null;

        if ($heiId) {
            CacheService::clearSubmissionCaches($heiId, $academicYear);
        }
    }
}
