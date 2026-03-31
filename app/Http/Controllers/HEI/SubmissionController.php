<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\CacheService;
use App\Services\FormConfigService;
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
        $selectedYear = $request->get('year', $this->getDefaultAcademicYear());

        // Get submissions (cached)
        $submissions = $this->getSubmissions($hei->id);

        // Get available academic years (cached)
        $academicYears = $this->getHeiAcademicYears($hei->id);

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
     * Current academic year based on deadline setting.
     * Before deadline: previous year is "current". After deadline: current calendar year is "current".
     */
    private function getDefaultAcademicYear(): string
    {
        $currentYear = (int) date('Y');
        return Setting::isPastDeadline()
            ? $currentYear . '-' . ($currentYear + 1)
            : ($currentYear - 1) . '-' . $currentYear;
    }

    /**
     * Get distinct academic years this HEI has submissions in (cached).
     * Always includes the default year so the dropdown is never empty.
     */
    private function getHeiAcademicYears(int $heiId): array
    {
        return Cache::remember(
            CacheService::heiAcademicYearsKey($heiId),
            CacheService::TTL_MEDIUM,
            function () use ($heiId) {
                $years = collect();

                foreach (FormConfigService::getAllFormTypes() as $config) {
                    try {
                        $table = (new $config['model']())->getTable();
                        $years = $years->merge(
                            DB::table($table)
                                ->where('hei_id', $heiId)
                                ->distinct()
                                ->pluck('academic_year')
                        );
                    } catch (\Exception $e) {
                        continue;
                    }
                }

                $years->push($this->getDefaultAcademicYear());

                return $years->unique()->filter()->sort()->values()->toArray();
            }
        );
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
                $annexTypes = FormConfigService::getAnnexTypes();
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

                // Add MER4A submissions
                $mer4aSubmissions = \App\Models\MER4ASubmission::where('hei_id', $heiId)
                    ->orderBy('academic_year', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($submission) {
                        return [
                            'id' => $submission->id,
                            'batch_id' => $submission->id,
                            'annex' => 'MER4A',
                            'academic_year' => $submission->academic_year,
                            'status' => $submission->status,
                            'submitted_at' => $submission->created_at,
                            'request_notes' => $submission->request_notes ?? null,
                            'cancelled_notes' => $submission->cancelled_notes ?? null,
                        ];
                    });

                $submissions = array_merge($submissions, $mer4aSubmissions->toArray());

                // Add Annex submissions
                foreach ($annexTypes as $code => $config) {
                    $batches = $config['model']::where('hei_id', $heiId)
                        ->orderBy('academic_year', 'desc')
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($batch) use ($code) {
                            // Determine which ID to use based on annex type
                            // Annex D and G use submission_id (UUID) instead of batch_id
                            $routeId = ($code === 'D' || $code === 'G') 
                                ? ($batch->submission_id ?? $batch->id)
                                : ($batch->batch_id ?? $batch->id);

                            // batch_id must also be submission_id for G/D so the
                            // fetch URL resolves correctly in getBatchData()
                            $batchId = ($code === 'D' || $code === 'G')
                                ? ($batch->submission_id ?? $batch->id)
                                : ($batch->batch_id ?? $batch->id);

                            return [
                                'id' => $batch->id,
                                'route_id' => $routeId,
                                'batch_id' => $batchId,
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
     * Get batch data with related entities for HEI view.
     * Not cached — this is called on demand when a user opens a submission,
     * and caching it risks showing stale form data after an update/request.
     * The query is a single-record lookup and is fast enough without caching.
     */
    public function getBatchData($annexType, $batchId)
    {
        $user = Auth::user();
        $hei  = $user->hei;

        if ($annexType === 'SUMMARY') {
            $summary = \App\Models\Summary::where('hei_id', $hei->id)
                ->where('id', $batchId)
                ->firstOrFail();
            return response()->json(['summary' => $summary]);
        }

        if ($annexType === 'MER1') {
            $submission = \App\Models\MER1Submission::where('hei_id', $hei->id)
                ->where('id', $batchId)
                ->with(['educationalAttainments', 'trainings'])
                ->firstOrFail();
            return response()->json([
                'batch'                  => $submission,
                'educational_attainments'=> $submission->educationalAttainments,
                'trainings'              => $submission->trainings,
            ]);
        }

        if ($annexType === 'MER2') {
            $submission = \App\Models\MER2Submission::where('hei_id', $hei->id)
                ->where('id', $batchId)
                ->with(['personnel'])
                ->firstOrFail();
            return response()->json(['batch' => $submission, 'personnel' => $submission->personnel]);
        }

        if ($annexType === 'MER3') {
            $submission = \App\Models\MER3Submission::where('hei_id', $hei->id)
                ->where('id', $batchId)
                ->with(['schoolFees'])
                ->firstOrFail();
            return response()->json(['batch' => $submission, 'school_fees' => $submission->schoolFees]);
        }

        if ($annexType === 'MER4A') {
            $submission = \App\Models\MER4ASubmission::where('hei_id', $hei->id)
                ->where('id', $batchId)
                ->with(['sasManagementItems', 'guidanceCounselingItems'])
                ->firstOrFail();
            return response()->json([
                'batch'                    => $submission,
                'sas_management_items'     => $submission->sasManagementItems,
                'guidance_counseling_items'=> $submission->guidanceCounselingItems,
            ]);
        }

        if (!FormConfigService::isValidFormType($annexType)) {
            return response()->json(['error' => 'Invalid annex type'], 400);
        }

        $config     = FormConfigService::getFormConfig($annexType);
        $modelClass = $config['model'];

        if ($annexType === 'D' || $annexType === 'G') {
            $query = $modelClass::where('hei_id', $hei->id)
                ->where(function ($q) use ($batchId) {
                    $q->where('id', $batchId)->orWhere('submission_id', $batchId);
                });
            if ($annexType === 'G') {
                $query->with(['editorialBoards', 'otherPublications', 'programs']);
            }
            $batch = $query->firstOrFail();
        } else {
            $query = $modelClass::where('hei_id', $hei->id)
                ->where(function ($q) use ($batchId) {
                    $q->where('batch_id', $batchId)->orWhere('id', $batchId);
                });
            if ($annexType === 'H') {
                $query->with(['admissionServices', 'admissionStatistics']);
            }
            if ($annexType === 'M') {
                $query->with(['statistics', 'services']);
            }
            $batch = $query->firstOrFail();
        }

        if ($annexType === 'G') {
            return response()->json([
                'editorial_boards'   => $batch->editorialBoards,
                'other_publications' => $batch->otherPublications,
                'programs'           => $batch->programs,
                'form_data'          => [
                    'official_school_name'             => $batch->official_school_name,
                    'student_publication_name'         => $batch->student_publication_name,
                    'publication_fee_per_student'      => $batch->publication_fee_per_student,
                    'adviser_name'                     => $batch->adviser_name,
                    'adviser_position_designation'     => $batch->adviser_position_designation,
                    'frequency_monthly'                => $batch->frequency_monthly,
                    'frequency_quarterly'              => $batch->frequency_quarterly,
                    'frequency_annual'                 => $batch->frequency_annual,
                    'frequency_per_semester'           => $batch->frequency_per_semester,
                    'frequency_others'                 => $batch->frequency_others,
                    'frequency_others_specify'         => $batch->frequency_others_specify,
                    'publication_type_newsletter'      => $batch->publication_type_newsletter,
                    'publication_type_gazette'         => $batch->publication_type_gazette,
                    'publication_type_magazine'        => $batch->publication_type_magazine,
                    'publication_type_others'          => $batch->publication_type_others,
                    'publication_type_others_specify'  => $batch->publication_type_others_specify,
                ],
            ]);
        }

        if ($annexType === 'H') {
            return response()->json([
                'admission_services'   => $batch->admissionServices,
                'admission_statistics' => $batch->admissionStatistics,
            ]);
        }

        if ($annexType === 'M') {
            return app(\App\Http\Controllers\HEI\AnnexMController::class)->getBatchData($batchId);
        }

        if ($annexType === 'D') {
            return response()->json(['submission' => $batch]);
        }

        // Standard Handsontable-based annexes
        $data = ['batch' => $batch, 'entities' => []];

        if ($config['relation']) {
            try {
                if (method_exists($batch, $config['relation'])) {
                    $data['entities'] = $batch->{$config['relation']}()->get();
                }
            } catch (\Exception $e) {
                $data['entities'] = [];
            }
        }

        return response()->json($data);
    }
}
