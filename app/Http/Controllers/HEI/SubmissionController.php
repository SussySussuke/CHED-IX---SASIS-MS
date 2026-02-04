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

class SubmissionController extends Controller
{
    /**
     * Show unified submission history page
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        $hei = $user->hei;
        $selectedAnnex = $request->get('annex', 'A');
        $selectedYear = $request->get('year', AcademicYearService::getCurrentAcademicYear());

        // Get submissions (cached)
        $submissions = $this->getSubmissions($hei->id);

        // Get available academic years (cached)
        $academicYears = AcademicYearService::getHeiAcademicYears($hei->id);

        return inertia('HEI/Submissions/Index', [
            'hei' => [
                'id' => $hei->id,
                'uii' => $hei->uii,
                'type' => $hei->type,
                'name' => $hei->name,
            ],
            'academicYears' => $academicYears,
            'selectedYear' => $selectedYear,
            'submissions' => $submissions,
            'selectedAnnex' => $selectedAnnex,
        ]);
    }

    /**
     * Get all submissions for an HEI (CACHED)
     */
    private function getSubmissions($heiId)
    {
        return Cache::remember(
            CacheService::submissionsListKey($heiId),
            CacheService::TTL_SHORT, // 5 minutes
            function () use ($heiId) {
                $annexTypes = AnnexConfigService::getAnnexTypes();
                $submissions = [];

                // Add Summary submissions
                $summarySubmissions = \App\Models\Summary::where('hei_id', $heiId)
                    ->orderBy('academic_year', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($submission) {
                        return [
                            'id' => $submission->id,
                            'batch_id' => $submission->id,
                            'annex' => 'SUMMARY',
                            'academic_year' => $submission->academic_year,
                            'status' => $submission->status,
                            'submitted_at' => $submission->created_at,
                            'request_notes' => $submission->request_notes ?? null,
                            'cancelled_notes' => $submission->cancelled_notes ?? null,
                        ];
                    });

                $submissions = array_merge($submissions, $summarySubmissions->toArray());

                // Add MER1 submissions
                $mer1Submissions = \App\Models\MER1Submission::where('hei_id', $heiId)
                    ->orderBy('academic_year', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($submission) {
                        return [
                            'id' => $submission->id,
                            'batch_id' => $submission->id,
                            'annex' => 'MER1',
                            'academic_year' => $submission->academic_year,
                            'status' => $submission->status,
                            'submitted_at' => $submission->created_at,
                            'request_notes' => $submission->request_notes ?? null,
                            'cancelled_notes' => $submission->cancelled_notes ?? null,
                        ];
                    });

                $submissions = array_merge($submissions, $mer1Submissions->toArray());

                // Add MER2 submissions
                $mer2Submissions = \App\Models\MER2Submission::where('hei_id', $heiId)
                    ->orderBy('academic_year', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($submission) {
                        return [
                            'id' => $submission->id,
                            'batch_id' => $submission->id,
                            'annex' => 'MER2',
                            'academic_year' => $submission->academic_year,
                            'status' => $submission->status,
                            'submitted_at' => $submission->created_at,
                            'request_notes' => $submission->request_notes ?? null,
                            'cancelled_notes' => $submission->cancelled_notes ?? null,
                        ];
                    });

                $submissions = array_merge($submissions, $mer2Submissions->toArray());

                // Add MER3 submissions
                $mer3Submissions = \App\Models\MER3Submission::where('hei_id', $heiId)
                    ->orderBy('academic_year', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($submission) {
                        return [
                            'id' => $submission->id,
                            'batch_id' => $submission->id,
                            'annex' => 'MER3',
                            'academic_year' => $submission->academic_year,
                            'status' => $submission->status,
                            'submitted_at' => $submission->created_at,
                            'request_notes' => $submission->request_notes ?? null,
                            'cancelled_notes' => $submission->cancelled_notes ?? null,
                        ];
                    });

                $submissions = array_merge($submissions, $mer3Submissions->toArray());

                // Add Annex submissions
                foreach ($annexTypes as $code => $config) {
                    $batches = $config['model']::where('hei_id', $heiId)
                        ->orderBy('academic_year', 'desc')
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($batch) use ($code) {
                            // Determine which ID to use based on annex type
                            $routeId = ($code === 'D' || $code === 'G') 
                                ? ($batch->submission_id ?? $batch->id)
                                : ($batch->batch_id ?? $batch->id);

                            return [
                                'id' => $batch->id,
                                'route_id' => $routeId,
                                'batch_id' => $batch->batch_id ?? $batch->id,
                                'annex' => $code,
                                'academic_year' => $batch->academic_year,
                                'status' => $batch->status,
                                'submitted_at' => $batch->created_at,
                                'request_notes' => $batch->request_notes ?? null,
                                'cancelled_notes' => $batch->cancelled_notes ?? null,
                            ];
                        });

                    $submissions = array_merge($submissions, $batches->toArray());
                }

                // Sort by academic year desc, then by created_at desc
                usort($submissions, function ($a, $b) {
                    $yearCompare = strcmp($b['academic_year'], $a['academic_year']);
                    if ($yearCompare !== 0) return $yearCompare;
                    return strtotime($b['submitted_at']) - strtotime($a['submitted_at']);
                });

                return $submissions;
            }
        );
    }

    /**
     * Get batch data with related entities for HEI view (CACHED)
     */
    public function getBatchData($annexType, $batchId)
    {
        $user = Auth::user();
        $hei = $user->hei;

        // Cache the batch data
        return Cache::remember(
            CacheService::batchDataKey($annexType, $batchId),
            CacheService::TTL_MEDIUM, // 30 minutes - this data rarely changes after submission
            function () use ($hei, $annexType, $batchId) {
                // Handle Summary
                if ($annexType === 'SUMMARY') {
                    $summary = \App\Models\Summary::where('hei_id', $hei->id)
                        ->where('id', $batchId)
                        ->firstOrFail();

                    return response()->json([
                        'summary' => $summary,
                    ])->getData();
                }

                // Handle MER1 - SharedRenderer compatible format
                if ($annexType === 'MER1') {
                    $submission = \App\Models\MER1Submission::where('hei_id', $hei->id)
                        ->where('id', $batchId)
                        ->with(['educationalAttainments', 'trainings'])
                        ->firstOrFail();

                    return response()->json([
                        'batch' => $submission,  // Changed from 'mer1' to 'batch' for SharedRenderer compatibility
                        'educational_attainments' => $submission->educationalAttainments,
                        'trainings' => $submission->trainings,
                    ])->getData();
                }

                // Handle MER2 - SharedRenderer compatible format
                if ($annexType === 'MER2') {
                    $submission = \App\Models\MER2Submission::where('hei_id', $hei->id)
                        ->where('id', $batchId)
                        ->with(['personnel'])
                        ->firstOrFail();

                    return response()->json([
                        'batch' => $submission,
                        'personnel' => $submission->personnel,
                    ])->getData();
                }

                // Handle MER3 - SharedRenderer compatible format
                if ($annexType === 'MER3') {
                    $submission = \App\Models\MER3Submission::where('hei_id', $hei->id)
                        ->where('id', $batchId)
                        ->with(['schoolFees'])
                        ->firstOrFail();

                    return response()->json([
                        'batch' => $submission,
                        'school_fees' => $submission->schoolFees,
                    ])->getData();
                }

                if (!AnnexConfigService::isValidAnnexType($annexType)) {
                    return response()->json(['error' => 'Invalid annex type'], 400)->getData();
                }

                $config = AnnexConfigService::getAnnexConfig($annexType);
                $modelClass = $config['model'];

                // Handle different ID fields for different annexes
                if ($annexType === 'D' || $annexType === 'G') {
                    $query = $modelClass::where('hei_id', $hei->id)
                        ->where(function ($q) use ($batchId) {
                            $q->where('id', $batchId)
                              ->orWhere('submission_id', $batchId);
                        });

                    if ($annexType === 'G') {
                        $query->with(['editorialBoards', 'otherPublications', 'programs']);
                    }

                    $batch = $query->firstOrFail();
                } else {
                    $query = $modelClass::where('hei_id', $hei->id)
                        ->where(function ($q) use ($batchId) {
                            $q->where('batch_id', $batchId)
                              ->orWhere('id', $batchId);
                        });

                    if ($annexType === 'H') {
                        $query->with(['admissionServices', 'admissionStatistics']);
                    }

                    if ($annexType === 'M') {
                        $query->with(['statistics', 'services']);
                    }

                    $batch = $query->firstOrFail();
                }

                // Return annex-specific data structure
                if ($annexType === 'G') {
                    return response()->json([
                        'editorial_boards' => $batch->editorialBoards,
                        'other_publications' => $batch->otherPublications,
                        'programs' => $batch->programs,
                        'form_data' => [
                            'official_school_name' => $batch->official_school_name,
                            'student_publication_name' => $batch->student_publication_name,
                            'publication_fee_per_student' => $batch->publication_fee_per_student,
                            'adviser_name' => $batch->adviser_name,
                        ]
                    ])->getData();
                }

                if ($annexType === 'H') {
                    return response()->json([
                        'admission_services' => $batch->admissionServices,
                        'admission_statistics' => $batch->admissionStatistics,
                    ])->getData();
                }

                if ($annexType === 'M') {
                    $statistics = $batch->statistics->map(function ($stat) {
                        $yearData = $stat->year_data ?? [];

                        return [
                            'id' => $stat->id,
                            'category' => $stat->category,
                            'subcategory' => $stat->subcategory,
                            'is_subtotal' => $stat->is_subtotal,
                            'ay_2023_2024_enrollment' => $yearData['2023-2024']['enrollment'] ?? 0,
                            'ay_2023_2024_graduates' => $yearData['2023-2024']['graduates'] ?? 0,
                            'ay_2022_2023_enrollment' => $yearData['2022-2023']['enrollment'] ?? 0,
                            'ay_2022_2023_graduates' => $yearData['2022-2023']['graduates'] ?? 0,
                            'ay_2021_2022_enrollment' => $yearData['2021-2022']['enrollment'] ?? 0,
                            'ay_2021_2022_graduates' => $yearData['2021-2022']['graduates'] ?? 0,
                        ];
                    });

                    return response()->json([
                        'statistics' => $statistics,
                        'services' => $batch->services,
                    ])->getData();
                }

                if ($annexType === 'D') {
                    return response()->json([
                        'submission' => $batch,
                    ])->getData();
                }

                // For standard Handsontable-based annexes
                $data = [
                    'batch' => $batch,
                    'entities' => []
                ];

                if ($config['relation']) {
                    try {
                        if (method_exists($batch, $config['relation'])) {
                            $data['entities'] = $batch->{$config['relation']}()->get();
                        }
                    } catch (\Exception $e) {
                        $data['entities'] = [];
                    }
                }

                return response()->json($data)->getData();
            }
        );
    }
}
