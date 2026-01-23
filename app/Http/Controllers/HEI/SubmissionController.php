<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    /**
     * Show unified submission history page
     */
    public function history(Request $request)
    {
        $hei = Auth::user()->hei;
        $selectedAnnex = $request->get('annex', 'A');

        $annexTypes = $this->getAnnexTypes();
        $submissions = [];

        // Add Summary submissions
        $summarySubmissions = \App\Models\Summary::where('hei_id', $hei->id)
            ->orderBy('academic_year', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'batch_id' => $submission->id,
                    'annex' => 'SUMMARY',
                    'form_name' => 'Summary - School Detail',
                    'academic_year' => $submission->academic_year,
                    'status' => $submission->status,
                    'submitted_at' => $submission->created_at,
                    'request_notes' => $submission->request_notes ?? null,
                    'cancelled_notes' => $submission->cancelled_notes ?? null,
                ];
            });

        $submissions = array_merge($submissions, $summarySubmissions->toArray());

        // Add Annex submissions
        foreach ($annexTypes as $code => $config) {
            $batches = $config['model']::where('hei_id', $hei->id)
                ->orderBy('academic_year', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($batch) use ($code, $config) {
                    return [
                        'id' => $batch->id,
                        'batch_id' => $batch->batch_id ?? $batch->id,
                        'annex' => $code,
                        'form_name' => $config['name'],
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

        // Get available academic years
        $academicYears = $this->getAvailableAcademicYears();

        return inertia('HEI/Submissions/Index', [
            'submissions' => $submissions,
            'selectedAnnex' => $selectedAnnex,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Get batch data with related entities for HEI view
     */
    public function getBatchData($annexType, $batchId)
    {
        $hei = Auth::user()->hei;

        // Handle Summary
        if ($annexType === 'SUMMARY') {
            $summary = \App\Models\Summary::where('hei_id', $hei->id)
                ->where('id', $batchId)
                ->firstOrFail();

            return response()->json([
                'summary' => $summary,
            ]);
        }

        $annexTypes = $this->getAnnexTypes();

        if (!isset($annexTypes[$annexType])) {
            return response()->json(['error' => 'Invalid annex type'], 400);
        }

        $config = $annexTypes[$annexType];
        $modelClass = $config['model'];

        // Handle different ID fields for different annexes
        if ($annexType === 'D' || $annexType === 'G') {
            // These use 'id' or 'submission_id' instead of batch_id
            $query = $modelClass::where('hei_id', $hei->id)
                ->where(function ($q) use ($batchId) {
                    $q->where('id', $batchId)
                      ->orWhere('submission_id', $batchId);
                });

            // Eager load relationships for G
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

            // Eager load relationships for H
            if ($annexType === 'H') {
                $query->with(['admissionServices', 'admissionStatistics']);
            }

            // Eager load relationships for M
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
            ]);
        }

        if ($annexType === 'H') {
            return response()->json([
                'admission_services' => $batch->admissionServices,
                'admission_statistics' => $batch->admissionStatistics,
            ]);
        }

        if ($annexType === 'M') {
            // Transform statistics to flatten year_data into separate columns
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
            ]);
        }

        if ($annexType === 'D') {
            return response()->json([
                'submission' => $batch,
            ]);
        }

        // For standard Handsontable-based annexes
        $data = [
            'batch' => $batch,
            'entities' => []
        ];

        // Load related entities if relation exists
        if ($config['relation']) {
            try {
                // Check if relation method exists
                if (method_exists($batch, $config['relation'])) {
                    $data['entities'] = $batch->{$config['relation']}()->get();
                }
            } catch (\Exception $e) {
                // Relation doesn't exist, return empty entities
                $data['entities'] = [];
            }
        }

        return response()->json($data);
    }

    /**
     * Get annex types configuration
     */
    private function getAnnexTypes()
    {
        return [
            'A' => ['model' => \App\Models\AnnexABatch::class, 'name' => 'List of Programs Offered', 'relation' => 'programs'],
            'B' => ['model' => \App\Models\AnnexBBatch::class, 'name' => 'Curricular Programs', 'relation' => 'programs'],
            'C' => ['model' => \App\Models\AnnexCBatch::class, 'name' => 'Enrolment', 'relation' => 'programs'],
            'D' => ['model' => \App\Models\AnnexDSubmission::class, 'name' => 'Graduates', 'relation' => null],
            'E' => ['model' => \App\Models\AnnexEBatch::class, 'name' => 'Student Services', 'relation' => 'organizations'],
            'F' => ['model' => \App\Models\AnnexFBatch::class, 'name' => 'Institutional Linkages', 'relation' => 'activities'],
            'G' => ['model' => \App\Models\AnnexGSubmission::class, 'name' => 'Research', 'relation' => null],
            'H' => ['model' => \App\Models\AnnexHBatch::class, 'name' => 'Admission Statistics', 'relation' => 'admissionStatistics'],
            'I' => ['model' => \App\Models\AnnexIBatch::class, 'name' => 'Scholarship Grants', 'relation' => 'scholarships'],
            'J' => ['model' => \App\Models\AnnexJBatch::class, 'name' => 'Faculty Development', 'relation' => 'programs'],
            'K' => ['model' => \App\Models\AnnexKBatch::class, 'name' => 'Governance', 'relation' => 'committees'],
            'L' => ['model' => \App\Models\AnnexLBatch::class, 'name' => 'Physical Facilities', 'relation' => 'housing'],
            'M' => ['model' => \App\Models\AnnexMBatch::class, 'name' => 'Library Services', 'relation' => 'statistics'],
            'N' => ['model' => \App\Models\AnnexNBatch::class, 'name' => 'Extension Services', 'relation' => 'activities'],
            'O' => ['model' => \App\Models\AnnexOBatch::class, 'name' => 'Institutional Sustainability', 'relation' => 'programs'],
        ];
    }

    /**
     * Get available academic years from existing submissions
     */
    private function getAvailableAcademicYears()
    {
        $years = collect();

        $tables = [
            'annex_a_batches',
            'annex_b_batches',
            'annex_c_batches',
        ];

        foreach ($tables as $table) {
            $tableYears = DB::table($table)
                ->select('academic_year')
                ->distinct()
                ->pluck('academic_year');

            $years = $years->merge($tableYears);
        }

        return $years->unique()
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    }
}
