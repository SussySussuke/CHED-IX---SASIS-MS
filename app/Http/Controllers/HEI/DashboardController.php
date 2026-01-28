<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Services\CacheService;
use App\Services\AnnexConfigService;
use App\Services\AcademicYearService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the HEI dashboard
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $hei = $user->hei; // This comes from the relationship, already optimized by Inertia
        $selectedYear = $request->get('year', AcademicYearService::getCurrentAcademicYear());

        // Get all available academic years (cached)
        $academicYears = AcademicYearService::getHeiAcademicYears($hei->id);

        // Get submission checklist for selected year (cached)
        $checklist = $this->getSubmissionChecklist($hei->id, $selectedYear);

        // Calculate stats based on checklist (in-memory, fast)
        $stats = $this->calculateStats($checklist);

        // Get deadline information (calculated, no DB)
        $deadline = $this->getDeadlineInfo($selectedYear);

        // Get recent activities (cached)
        $recentActivities = $this->getRecentActivities($hei->id, $selectedYear);

        return inertia('HEI/Dashboard', [
            'hei' => [
                'id' => $hei->id,
                'uii' => $hei->uii,
                'type' => $hei->type,
                'name' => $hei->name,
            ],
            'academicYears' => $academicYears,
            'selectedYear' => $selectedYear,
            'stats' => $stats,
            'checklist' => $checklist,
            'deadline' => $deadline,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * Get submission checklist for all forms (CACHED)
     */
    private function getSubmissionChecklist($heiId, $academicYear)
    {
        return Cache::remember(
            CacheService::dashboardChecklistKey($heiId, $academicYear),
            CacheService::TTL_SHORT, // 5 minutes - data changes when user submits
            function () use ($heiId, $academicYear) {
                $annexTypes = AnnexConfigService::getAnnexTypes();
                $checklist = [];

                // Add Summary to checklist
                $summarySubmission = \App\Models\Summary::where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->whereIn('status', ['published', 'submitted', 'request'])
                    ->orderBy('created_at', 'desc')
                    ->first();

                $checklist[] = [
                    'annex' => 'SUMMARY',
                    'name' => 'School Details',
                    'status' => $this->determineStatus($summarySubmission),
                    'lastUpdated' => $summarySubmission?->updated_at?->format('Y-m-d H:i:s'),
                    'submissionId' => $summarySubmission?->id,
                ];

                // Add all annexes to checklist
                foreach ($annexTypes as $code => $config) {
                    $modelClass = $config['model'];

                    $submission = $modelClass::where('hei_id', $heiId)
                        ->where('academic_year', $academicYear)
                        ->whereIn('status', ['published', 'submitted', 'request'])
                        ->orderBy('created_at', 'desc')
                        ->first();

                    $checklist[] = [
                    'annex' => $code,
                    'status' => $this->determineStatus($submission),
                    'lastUpdated' => $submission?->updated_at?->format('Y-m-d H:i:s'),
                    'submissionId' => $submission?->id ?? $submission?->batch_id ?? null,
                    ];
                }

                return $checklist;
            }
        );
    }

    /**
     * Determine submission status for checklist
     */
    private function determineStatus($submission)
    {
        if (!$submission) {
            return 'not_started';
        }

        return $submission->status;
    }

    /**
     * Calculate dashboard statistics
     * This is fast in-memory calculation, no caching needed
     */
    private function calculateStats($checklist)
    {
        $submitted = 0;
        $underReview = 0;
        $notStarted = 0;

        foreach ($checklist as $item) {
            switch ($item['status']) {
                case 'submitted':
                case 'published':
                case 'request':
                    $submitted++;
                    break;
                case 'not_started':
                case 'draft':
                default:
                    $notStarted++;
                    break;
            }
            
            if ($item['status'] === 'request') {
                $underReview++;
            }
        }

        return [
            'totalForms' => count($checklist),
            'submitted' => $submitted,
            'underReview' => $underReview,
            'notStarted' => $notStarted,
        ];
    }

    /**
     * Get deadline information for the academic year
     * Pure calculation, no DB access
     */
    private function getDeadlineInfo($academicYear)
    {
        $yearParts = explode('-', $academicYear);
        $endYear = isset($yearParts[1]) ? (int)$yearParts[1] : (int)$yearParts[0] + 1;
        
        $deadlineDate = "$endYear-09-01";
        $deadline = new \DateTime($deadlineDate);
        $now = new \DateTime();
        
        $daysRemaining = (int)$now->diff($deadline)->format('%r%a');
        $isPastDeadline = $daysRemaining < 0;
        
        return [
            'date' => $deadlineDate,
            'daysRemaining' => abs($daysRemaining),
            'isPastDeadline' => $isPastDeadline,
        ];
    }

    /**
     * Get recent activities for the HEI (CACHED)
     */
    private function getRecentActivities($heiId, $academicYear, $limit = 5)
    {
        return Cache::remember(
            CacheService::dashboardActivitiesKey($heiId, $academicYear),
            CacheService::TTL_SHORT, // 5 minutes
            function () use ($heiId, $academicYear, $limit) {
                $activities = [];
                
                // Collect recent submissions from Summary
                $summaryActivities = DB::table('summary')
                    ->where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->select('updated_at', 'status', DB::raw("'Summary' as form_name"))
                    ->get();
                
                // Collect from all annex batches using AnnexConfigService
                $annexTypes = AnnexConfigService::getAnnexTypes();
                $tables = [];
                
                foreach ($annexTypes as $code => $config) {
                    $modelClass = $config['model'];
                    
                    // Get table name from model
                    $model = new $modelClass();
                    $tableName = $model->getTable();
                    
                    $tables[$tableName] = "Annex {$code}";
                }
                
                foreach ($tables as $table => $formName) {
                    try {
                        $tableActivities = DB::table($table)
                            ->where('hei_id', $heiId)
                            ->where('academic_year', $academicYear)
                            ->select('updated_at', 'status', DB::raw("'$formName' as form_name"))
                            ->get();
                            
                        $summaryActivities = $summaryActivities->merge($tableActivities);
                    } catch (\Exception $e) {
                        continue;
                    }
                }
                
                // Sort by updated_at and take latest
                $recentSubmissions = $summaryActivities
                    ->sortByDesc('updated_at')
                    ->take($limit);
                
                foreach ($recentSubmissions as $submission) {
                    $statusText = match($submission->status) {
                        'published' => 'Published',
                        'submitted' => 'Submitted',
                        'request' => 'Change Requested',
                        'draft' => 'Draft Saved',
                        default => ucfirst($submission->status),
                    };
                    
                    $updatedAt = new \DateTime($submission->updated_at);
                    $now = new \DateTime();
                    $diff = $now->diff($updatedAt);
                    
                    if ($diff->days == 0) {
                        $timeAgo = 'Today';
                    } elseif ($diff->days == 1) {
                        $timeAgo = 'Yesterday';
                    } else {
                        $timeAgo = $diff->days . ' days ago';
                    }
                    
                    $activities[] = [
                        'id' => uniqid(),
                        'title' => "{$submission->form_name} {$statusText}",
                        'date' => $timeAgo,
                        'status' => $submission->status,
                    ];
                }
                
                return $activities;
            }
        );
    }
}
