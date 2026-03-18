<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $deadline = Setting::get('annual_submission_deadline');

        if (!$deadline) {
            // Default to current year Sept 1
            $deadline = date('Y') . '-09-01 00:00:00';
        }

        // Convert stored datetime to datetime-local format for input
        $formattedDeadline = date('Y-m-d\TH:i', strtotime($deadline));

        $settings = [
            'annual_submission_deadline' => $formattedDeadline,
            'maintenance_mode' => Setting::get('maintenance_mode', '0')
        ];

        return Inertia::render('SuperAdmin/Settings', [
            'settings' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'annual_submission_deadline' => 'required|date_format:Y-m-d\TH:i',
            'maintenance_mode' => 'boolean'
        ]);

        // Store as full datetime (year will be ignored when checking, only month-day-time matters)
        $deadline = date('Y-m-d H:i:s', strtotime($validated['annual_submission_deadline']));
        Setting::set('annual_submission_deadline', $deadline);

        Setting::set('maintenance_mode', $validated['maintenance_mode'] ?? false ? '1' : '0');

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }

    /**
     * Force-publish all submitted records past deadline.
     * Web equivalent of: php artisan submissions:publish-past-deadline --force
     */
    public function publishNow()
    {
        $deadline = Setting::getDeadline();

        if (!$deadline) {
            return response()->json([
                'success' => false,
                'message' => 'No deadline configured in settings.',
            ], 422);
        }

        $allModels = [
            Summary::class, MER1Submission::class, MER2Submission::class,
            MER3Submission::class, MER4ASubmission::class, AnnexABatch::class,
            AnnexBBatch::class, AnnexCBatch::class, AnnexC1Batch::class,
            AnnexDSubmission::class, AnnexEBatch::class, AnnexFBatch::class,
            AnnexGSubmission::class, AnnexHBatch::class, AnnexIBatch::class,
            AnnexI1Batch::class, AnnexJBatch::class, AnnexKBatch::class,
            AnnexLBatch::class, AnnexL1Batch::class, AnnexMBatch::class,
            AnnexNBatch::class, AnnexN1Batch::class, AnnexOBatch::class,
        ];

        // Collect affected pairs BEFORE updating (bulk UPDATE returns only a count)
        $affectedPairs = collect();
        foreach ($allModels as $model) {
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
            return response()->json([
                'success' => true,
                'message' => 'No submitted records found. Nothing to publish.',
                'published' => 0,
                'affectedPairs' => 0,
            ]);
        }

        $now           = new \DateTime();
        $totalPublished = 0;

        DB::transaction(function () use ($allModels, $deadline, $now, &$totalPublished) {
            foreach ($allModels as $model) {
                $totalPublished += $model::where('status', 'submitted')
                    ->where('created_at', '<', $deadline)
                    ->update(['status' => 'published', 'updated_at' => $now]);
            }
        });

        // Invalidate cache per affected HEI/year pair
        $affectedYears = collect();
        foreach ($affectedPairs as $pair) {
            [$heiId, $academicYear] = explode('|', $pair);
            CacheService::clearSubmissionCaches((int) $heiId);
            CacheService::clearHeiCaches((int) $heiId, $academicYear);
            $affectedYears->push($academicYear);
        }
        foreach ($affectedYears->unique() as $year) {
            Cache::forget("admin_dashboard_stats_{$year}");
        }

        AuditLog::log(
            action: 'published',
            entityType: 'Submission',
            entityId: null,
            entityName: 'Bulk Force-Publish',
            description: "Force-published {$totalPublished} submitted records (deadline: {$deadline->format('Y-m-d H:i:s')}). Affected HEI/year pairs: {$affectedPairs->count()}.",
            oldValues: ['status' => 'submitted'],
            newValues: ['status' => 'published', 'triggered_by' => 'superadmin/settings/publish-now']
        );

        return response()->json([
            'success'       => true,
            'message'       => "Successfully published {$totalPublished} record(s) across {$affectedPairs->count()} HEI/year pair(s).",
            'published'     => $totalPublished,
            'affectedPairs' => $affectedPairs->count(),
        ]);
    }
}
