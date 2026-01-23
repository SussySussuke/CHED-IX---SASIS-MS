<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HEI;
use App\Models\CHEDRemark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    /**
     * Show all HEIs with submission stats
     */
    public function index()
    {
        $heis = HEI::where('is_active', true)
            ->withCount([
                'annexABatches as pending_requests' => function ($query) {
                    $query->where('status', 'request');
                }
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($hei) {
                // Get total pending requests across ALL annex types
                $pendingCount = $this->getPendingRequestsCount($hei->id);

                return [
                    'id' => $hei->id,
                    'name' => $hei->name,
                    'code' => $hei->code,
                    'pending_requests' => $pendingCount,
                ];
            });

        // Total pending requests for badge
        $totalPending = $heis->sum('pending_requests');

        return inertia('Admin/Submissions/Index', [
            'heis' => $heis,
            'totalPending' => $totalPending,
        ]);
    }

    /**
     * Show all submissions for a specific HEI
     */
    public function show($heiId)
    {
        $hei = HEI::findOrFail($heiId);

        $annexTypes = $this->getAnnexTypes();
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
                    'form_name' => 'Summary - School Detail',
                    'academic_year' => $submission->academic_year,
                    'status' => $submission->status,
                    'submitted_at' => $submission->created_at,
                    'request_notes' => $submission->request_notes ?? null,
                ];
            });

        $submissions = array_merge($submissions, $summarySubmissions->toArray());

        foreach ($annexTypes as $code => $config) {
            $batches = $config['model']::where('hei_id', $heiId)
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

        return inertia('Admin/Submissions/Show', [
            'hei' => $hei,
            'submissions' => $submissions,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Approve a request and publish it
     */
    public function approve(Request $request, $id)
    {
        $validated = $request->validate([
            'annex_type' => 'required|string|in:A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,SUMMARY',
        ]);

        $annexType = $validated['annex_type'];

        // Handle Summary
        if ($annexType === 'SUMMARY') {
            DB::beginTransaction();
            try {
                $newSubmission = \App\Models\Summary::findOrFail($id);

                if ($newSubmission->status !== 'request') {
                    return back()->with('error', 'Only requests can be approved.');
                }

                // Find the old published submission
                $oldSubmission = \App\Models\Summary::where('hei_id', $newSubmission->hei_id)
                    ->where('academic_year', $newSubmission->academic_year)
                    ->where('status', 'published')
                    ->first();

                // Archive old submission if exists
                if ($oldSubmission) {
                    $oldSubmission->update(['status' => 'overwritten']);
                }

                // Publish the new submission
                $newSubmission->update(['status' => 'published']);

                DB::commit();

                return back()->with('success', 'Request approved successfully. Previous submission has been overwritten.');
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->with('error', 'Failed to approve request: ' . $e->getMessage());
            }
        }

        $modelClass = $this->getModelClass($annexType);

        DB::beginTransaction();

        try {
            $newBatch = $modelClass::findOrFail($id);

            if ($newBatch->status !== 'request') {
                return back()->with('error', 'Only requests can be approved.');
            }

            // Find the old published batch
            $oldBatch = $modelClass::where('hei_id', $newBatch->hei_id)
                ->where('academic_year', $newBatch->academic_year)
                ->where('status', 'published')
                ->first();

            // Archive old batch remarks if exists
            if ($oldBatch) {
                CHEDRemark::archiveBatchRemarks($oldBatch->batch_id ?? $oldBatch->id);
                $oldBatch->update(['status' => 'overwritten']);
            }

            // Publish the new batch
            $newBatch->update(['status' => 'published']);

            DB::commit();

            return back()->with('success', 'Request approved successfully. Previous batch has been overwritten.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to approve request: ' . $e->getMessage());
        }
    }

    /**
     * Reject a request
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'annex_type' => 'required|string|in:A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,SUMMARY',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $annexType = $validated['annex_type'];

        // Handle Summary
        if ($annexType === 'SUMMARY') {
            $submission = \App\Models\Summary::findOrFail($id);

            if ($submission->status !== 'request') {
                return back()->with('error', 'Only requests can be rejected.');
            }

            $submission->update([
                'status' => 'rejected',
                'cancelled_notes' => $validated['rejection_reason'] ?? 'Rejected by admin',
            ]);

            return back()->with('success', 'Request rejected successfully.');
        }

        $modelClass = $this->getModelClass($annexType);

        $batch = $modelClass::findOrFail($id);

        if ($batch->status !== 'request') {
            return back()->with('error', 'Only requests can be rejected.');
        }

        $batch->update([
            'status' => 'rejected',
            'cancelled_notes' => $validated['rejection_reason'] ?? 'Rejected by admin',
        ]);

        return back()->with('success', 'Request rejected successfully.');
    }

    /**
     * Get batch data with related entities
     */
    public function getBatchData($annexType, $batchId)
    {
        // Handle Summary
        if ($annexType === 'SUMMARY') {
            $summary = \App\Models\Summary::findOrFail($batchId);

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
            $query = $modelClass::where('id', $batchId)
                ->orWhere('submission_id', $batchId);

            // Eager load relationships for G
            if ($annexType === 'G') {
                $query->with(['editorialBoards', 'otherPublications', 'programs']);
            }

            $batch = $query->firstOrFail();
        } else {
            $query = $modelClass::where('batch_id', $batchId)
                ->orWhere('id', $batchId);

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
     * Get total pending requests count for an HEI
     */
    private function getPendingRequestsCount($heiId)
    {
        $models = [
            \App\Models\Summary::class,
            \App\Models\AnnexABatch::class,
            \App\Models\AnnexBBatch::class,
            \App\Models\AnnexCBatch::class,
            \App\Models\AnnexDSubmission::class,
            \App\Models\AnnexEBatch::class,
            \App\Models\AnnexFBatch::class,
            \App\Models\AnnexGSubmission::class,
            \App\Models\AnnexHBatch::class,
            \App\Models\AnnexIBatch::class,
            \App\Models\AnnexJBatch::class,
            \App\Models\AnnexKBatch::class,
            \App\Models\AnnexLBatch::class,
            \App\Models\AnnexMBatch::class,
            \App\Models\AnnexNBatch::class,
            \App\Models\AnnexOBatch::class,
        ];

        $count = 0;
        foreach ($models as $model) {
            $count += $model::where('hei_id', $heiId)
                ->where('status', 'request')
                ->count();
        }

        return $count;
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
     * Get model class by annex type
     */
    private function getModelClass($annexType)
    {
        $annexTypes = $this->getAnnexTypes();
        return $annexTypes[$annexType]['model'];
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
