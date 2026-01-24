<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the HEI dashboard
     */
    public function index(Request $request)
    {
        $hei = Auth::user()->hei;
        $selectedYear = $request->get('year', $this->getCurrentAcademicYear());

        // Get all available academic years
        $academicYears = $this->getAvailableAcademicYears();

        // Get submission checklist for selected year
        $checklist = $this->getSubmissionChecklist($hei->id, $selectedYear);

        // Calculate stats based on checklist
        $stats = $this->calculateStats($checklist);

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
        ]);
    }

    /**
     * Get submission checklist for all forms
     */
    private function getSubmissionChecklist($heiId, $academicYear)
    {
        $annexTypes = $this->getAnnexTypes();
        $checklist = [];

        // Add Summary to checklist
        $summarySubmission = \App\Models\Summary::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
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
                ->orderBy('created_at', 'desc')
                ->first();

            $checklist[] = [
                'annex' => $code,
                'name' => $config['name'],
                'status' => $this->determineStatus($submission),
                'lastUpdated' => $submission?->updated_at?->format('Y-m-d H:i:s'),
                'submissionId' => $submission?->id ?? $submission?->batch_id ?? null,
            ];
        }

        return $checklist;
    }

    /**
     * Determine submission status for checklist
     */
    private function determineStatus($submission)
    {
        if (!$submission) {
            return 'not_started';
        }

        // Map published and submitted to 'completed'
        if (in_array($submission->status, ['published', 'submitted'])) {
            return 'completed';
        }

        // Map 'request' to 'pending'
        if ($submission->status === 'request') {
            return 'pending';
        }

        // Draft or any other status
        return 'not_started';
    }

    /**
     * Calculate dashboard statistics
     */
    private function calculateStats($checklist)
    {
        $completed = 0;
        $pending = 0;
        $notStarted = 0;

        foreach ($checklist as $item) {
            switch ($item['status']) {
                case 'completed':
                    $completed++;
                    break;
                case 'pending':
                    $pending++;
                    break;
                case 'not_started':
                    $notStarted++;
                    break;
            }
        }

        return [
            'completed' => $completed,
            'pending' => $pending,
            'notStarted' => $notStarted,
        ];
    }

    /**
     * Get current academic year (format: YYYY-YYYY)
     */
    private function getCurrentAcademicYear()
    {
        $currentYear = date('Y');
        $currentMonth = date('n');

        // Academic year typically starts in August/September
        if ($currentMonth >= 8) {
            // August onwards is current year to next year
            return $currentYear . '-' . ($currentYear + 1);
        } else {
            // Before August is previous year to current year
            return ($currentYear - 1) . '-' . $currentYear;
        }
    }

    /**
     * Get available academic years from existing submissions
     */
    private function getAvailableAcademicYears()
    {
        $years = collect();

        // Get years from Summary
        $summaryYears = DB::table('summaries')
            ->select('academic_year')
            ->distinct()
            ->pluck('academic_year');

        $years = $years->merge($summaryYears);

        // Get years from annex batches
        $tables = [
            'annex_a_batches',
            'annex_b_batches',
            'annex_c_batches',
            'annex_d_submissions',
            'annex_e_batches',
            'annex_f_batches',
            'annex_g_submissions',
            'annex_h_batches',
            'annex_i_batches',
            'annex_j_batches',
            'annex_k_batches',
            'annex_l_batches',
            'annex_m_batches',
            'annex_n_batches',
            'annex_o_batches',
        ];

        foreach ($tables as $table) {
            try {
                $tableYears = DB::table($table)
                    ->select('academic_year')
                    ->distinct()
                    ->pluck('academic_year');

                $years = $years->merge($tableYears);
            } catch (\Exception $e) {
                // Table might not exist yet, skip
                continue;
            }
        }

        // Always include current academic year
        $currentYear = $this->getCurrentAcademicYear();
        $years->push($currentYear);

        return $years->unique()
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    }

    /**
     * Get annex types configuration
     */
    private function getAnnexTypes()
    {
        return [
            'A' => ['model' => \App\Models\AnnexABatch::class, 'name' => 'List of Programs Offered'],
            'B' => ['model' => \App\Models\AnnexBBatch::class, 'name' => 'Curricular Programs'],
            'C' => ['model' => \App\Models\AnnexCBatch::class, 'name' => 'Enrolment'],
            'D' => ['model' => \App\Models\AnnexDSubmission::class, 'name' => 'Graduates'],
            'E' => ['model' => \App\Models\AnnexEBatch::class, 'name' => 'Student Services'],
            'F' => ['model' => \App\Models\AnnexFBatch::class, 'name' => 'Institutional Linkages'],
            'G' => ['model' => \App\Models\AnnexGSubmission::class, 'name' => 'Research'],
            'H' => ['model' => \App\Models\AnnexHBatch::class, 'name' => 'Admission Statistics'],
            'I' => ['model' => \App\Models\AnnexIBatch::class, 'name' => 'Scholarship Grants'],
            'J' => ['model' => \App\Models\AnnexJBatch::class, 'name' => 'Faculty Development'],
            'K' => ['model' => \App\Models\AnnexKBatch::class, 'name' => 'Governance'],
            'L' => ['model' => \App\Models\AnnexLBatch::class, 'name' => 'Physical Facilities'],
            'M' => ['model' => \App\Models\AnnexMBatch::class, 'name' => 'Library Services'],
            'N' => ['model' => \App\Models\AnnexNBatch::class, 'name' => 'Extension Services'],
            'O' => ['model' => \App\Models\AnnexOBatch::class, 'name' => 'Institutional Sustainability'],
        ];
    }
}
