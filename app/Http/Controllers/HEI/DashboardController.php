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

        // Get deadline information
        $deadline = $this->getDeadlineInfo($selectedYear);

        // Get recent activities
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
     * Get submission checklist for all forms
     */
    private function getSubmissionChecklist($heiId, $academicYear)
    {
        $annexTypes = $this->getAnnexTypes();
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
     * Returns the actual status from database: 'submitted', 'published', 'request', 'draft', etc.
     */
    private function determineStatus($submission)
    {
        if (!$submission) {
            return 'not_started';
        }

        // Return the actual status from the database
        return $submission->status;
    }

    /**
     * Calculate dashboard statistics
     * 
     * Logic:
     * - Submitted: Counts submitted, published, AND request (all have been submitted at least once)
     * - Under Review: Counts only request status
     * - Not Started: Counts not_started and draft (nothing submitted yet)
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
                    // All these mean something has been submitted
                    $submitted++;
                    break;
                case 'not_started':
                case 'draft':
                default:
                    // Nothing submitted yet
                    $notStarted++;
                    break;
            }
            
            // Separately count under review for the second stat card
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
     */
    private function getDeadlineInfo($academicYear)
    {
        // Parse academic year (e.g., "2024-2025" -> end year is 2025)
        $yearParts = explode('-', $academicYear);
        $endYear = isset($yearParts[1]) ? (int)$yearParts[1] : (int)$yearParts[0] + 1;
        
        // Deadline is typically September 1st of the end year
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
     * Get recent activities for the HEI
     */
    private function getRecentActivities($heiId, $academicYear, $limit = 5)
    {
        $activities = [];
        
        // Collect recent submissions from Summary
        $summaryActivities = DB::table('summary')
            ->where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->select('updated_at', 'status', DB::raw("'Summary' as form_name"))
            ->get();
        
        // Collect from all annex batches
        $tables = [
            'annex_a_batches' => 'Annex A',
            'annex_b_batches' => 'Annex B',
            'annex_c_batches' => 'Annex C',
            'annex_d_submissions' => 'Annex D',
            'annex_e_batches' => 'Annex E',
            'annex_f_batches' => 'Annex F',
            'annex_g_submissions' => 'Annex G',
            'annex_h_batches' => 'Annex H',
            'annex_i_batches' => 'Annex I',
            'annex_j_batches' => 'Annex J',
            'annex_k_batches' => 'Annex K',
            'annex_l_batches' => 'Annex L',
            'annex_m_batches' => 'Annex M',
            'annex_n_batches' => 'Annex N',
            'annex_o_batches' => 'Annex O',
        ];
        
        foreach ($tables as $table => $formName) {
            try {
                $tableActivities = DB::table($table)
                    ->where('hei_id', $heiId)
                    ->where('academic_year', $academicYear)
                    ->select('updated_at', 'status', DB::raw("'$formName' as form_name"))
                    ->get();
                    
                $summaryActivities = $summaryActivities->merge($tableActivities);
            } catch (\Exception $e) {
                // Table might not exist, skip
                continue;
            }
        }
        
        // Sort by updated_at and take latest
        $recentSubmissions = $summaryActivities
            ->sortByDesc('updated_at')
            ->take($limit);
        
        foreach ($recentSubmissions as $submission) {
            // Map status to activity text
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
            
            // Format relative time
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
        $summaryYears = DB::table('summary')
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
