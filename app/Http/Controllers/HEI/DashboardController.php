<?php

namespace App\Http\Controllers\HEI;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $heiId = $user->hei_id;
        $currentYear = date('Y') . '-' . (date('Y') + 1);

        // Get deadline information
        $deadline = Setting::getDeadline();
        $deadlineData = null;
        
        if ($deadline) {
            $now = new \DateTime();
            $interval = $now->diff($deadline);
            $daysRemaining = $interval->days;
            $isPastDeadline = $now > $deadline;

            if ($isPastDeadline) {
                $daysRemaining = -$daysRemaining;
            }

            $deadlineData = [
                'date' => $deadline->format('Y-m-d'),
                'formatted' => $deadline->format('F d, Y'),
                'days_remaining' => $daysRemaining,
                'is_past_deadline' => $isPastDeadline,
            ];
        }

        // Get summary status
        $summary = DB::table('summary')
            ->where('hei_id', $heiId)
            ->where('academic_year', $currentYear)
            ->first();

        // Get all annex statuses
        $annexes = [
            'A' => $this->getAnnexStatus('annex_a_batches', $heiId, $currentYear),
            'B' => $this->getAnnexStatus('annex_b_batches', $heiId, $currentYear),
            'C' => $this->getAnnexStatus('annex_c_batches', $heiId, $currentYear),
            'D' => $this->getAnnexStatus('annex_d_submissions', $heiId, $currentYear, 'submission_id'),
            'E' => $this->getAnnexStatus('annex_e_batches', $heiId, $currentYear),
            'F' => $this->getAnnexStatus('annex_f_batches', $heiId, $currentYear),
            'G' => $this->getAnnexStatus('annex_g_submissions', $heiId, $currentYear, 'submission_id'),
            'H' => $this->getAnnexStatus('annex_h_batches', $heiId, $currentYear),
            'I' => $this->getAnnexStatus('annex_i_batches', $heiId, $currentYear),
            'J' => $this->getAnnexStatus('annex_j_batches', $heiId, $currentYear),
            'K' => $this->getAnnexStatus('annex_k_batches', $heiId, $currentYear),
            'L' => $this->getAnnexStatus('annex_l_batches', $heiId, $currentYear),
            'M' => $this->getAnnexStatus('annex_m_batches', $heiId, $currentYear),
            'N' => $this->getAnnexStatus('annex_n_batches', $heiId, $currentYear),
            'O' => $this->getAnnexStatus('annex_o_batches', $heiId, $currentYear),
        ];

        // Calculate statistics
        $stats = $this->calculateStats($summary, $annexes);

        // Get annex names
        $annexData = $this->getAnnexData($annexes, $heiId, $currentYear);

        return Inertia::render('HEI/Dashboard', [
            'hei' => [
                'name' => $user->hei->name,
                'uii' => $user->hei->uii,
                'type' => $user->hei->type,
            ],
            'academic_year' => $currentYear,
            'deadline' => $deadlineData,
            'summary' => $summary ? [
                'status' => $summary->status,
                'last_updated' => $summary->updated_at,
            ] : null,
            'annexes' => $annexData,
            'stats' => $stats,
        ]);
    }

    private function getAnnexStatus($table, $heiId, $academicYear, $idColumn = 'batch_id')
    {
        return DB::table($table)
            ->where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->select('status', 'updated_at', $idColumn)
            ->first();
    }

    private function calculateStats($summary, $annexes)
    {
        $total = 16; // 1 summary + 15 annexes
        $published = 0;
        $submitted = 0;
        $notSubmitted = 0;

        // Check summary
        if ($summary && $summary->status === 'published') {
            $published++;
        } elseif ($summary && $summary->status === 'submitted') {
            $submitted++;
        } else {
            $notSubmitted++;
        }

        // Check annexes
        foreach ($annexes as $annex) {
            if ($annex && $annex->status === 'published') {
                $published++;
            } elseif ($annex && $annex->status === 'submitted') {
                $submitted++;
            } else {
                $notSubmitted++;
            }
        }

        return [
            'total' => $total,
            'published' => $published,
            'submitted' => $submitted,
            'not_submitted' => $notSubmitted,
        ];
    }

    private function getAnnexData($annexStatuses, $heiId, $academicYear)
    {
        $annexNames = [
            'A' => 'GAD Programs',
            'B' => 'Student Development Programs',
            'C' => 'Guidance & Counseling',
            'D' => 'Student Handbook',
            'E' => 'Student Organizations',
            'F' => 'Student Support Services',
            'G' => 'Student Publications',
            'H' => 'Admission Services',
            'I' => 'Scholarships & Grants',
            'J' => 'Career & Employment',
            'K' => 'Committees',
            'L' => 'Student Housing',
            'M' => 'Health Services',
            'N' => 'Sports & Recreation',
            'O' => 'Community Extension',
        ];

        $data = [];

        foreach ($annexNames as $id => $name) {
            $status = $annexStatuses[$id];
            $recordCount = 0;

            if ($status) {
                // Get record count based on annex type
                $recordCount = $this->getRecordCount($id, $status, $heiId, $academicYear);
            }

            $data[] = [
                'id' => $id,
                'name' => $name,
                'status' => $status ? $status->status : 'not_submitted',
                'record_count' => $recordCount,
                'last_updated' => $status ? $status->updated_at : null,
            ];
        }

        return $data;
    }

    private function getRecordCount($annexId, $status, $heiId, $academicYear)
    {
        $idField = in_array($annexId, ['D', 'G']) ? 'submission_id' : 'batch_id';
        $idValue = $status->{$idField};

        $tableMap = [
            'A' => 'annex_a_programs',
            'B' => 'annex_b_programs',
            'C' => 'annex_c_programs',
            'D' => null, // D is a single submission, no child records
            'E' => 'annex_e_organizations',
            'F' => 'annex_f_activities',
            'G' => ['annex_g_editorial_boards', 'annex_g_other_publications', 'annex_g_programs'],
            'H' => ['annex_h_admission_services', 'annex_h_admission_statistics'],
            'I' => 'annex_i_scholarships',
            'J' => 'annex_j_programs',
            'K' => 'annex_k_committees',
            'L' => 'annex_l_housings',
            'M' => ['annex_m_statistics', 'annex_m_services'],
            'N' => 'annex_n_activities',
            'O' => 'annex_o_programs',
        ];

        $table = $tableMap[$annexId] ?? null;

        if (!$table) {
            return $annexId === 'D' ? 1 : 0; // D has 1 submission record
        }

        if (is_array($table)) {
            // Multiple tables, sum them up
            $count = 0;
            foreach ($table as $t) {
                $count += DB::table($t)->where($idField, $idValue)->count();
            }
            return $count;
        }

        return DB::table($table)->where($idField, $idValue)->count();
    }
}
