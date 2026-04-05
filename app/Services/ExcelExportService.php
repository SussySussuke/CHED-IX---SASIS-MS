<?php

namespace App\Services;

use App\Models\AnnexABatch;
use App\Models\AnnexBBatch;
use App\Models\AnnexC1Batch;
use App\Models\AnnexCBatch;
use App\Models\AnnexEBatch;
use App\Models\AnnexI1Batch;
use App\Models\AnnexIBatch;
use App\Models\AnnexJBatch;
use App\Models\AnnexKBatch;
use App\Models\AnnexL1Batch;
use App\Models\AnnexLBatch;
use App\Models\AnnexN1Batch;
use App\Models\AnnexNBatch;
use App\Models\AnnexOBatch;
use App\Services\Excel\Sheets\AnnexDSheet;
use App\Services\Excel\Sheets\AnnexFSheet;
use App\Services\Excel\Sheets\AnnexGSheet;
use App\Services\Excel\Sheets\AnnexHSheet;
use App\Services\Excel\Sheets\AnnexMSheet;
use App\Services\Excel\Sheets\InstructionsSheet;
use App\Services\Excel\Sheets\TabularAnnexSheet;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExcelExportService
{
    public function downloadTemplate(int $heiId, string $academicYear): StreamedResponse
    {
        $spreadsheet = $this->buildSpreadsheet($heiId, $academicYear);

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="SAS_Template_' . $academicYear . '.xlsx"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    public function downloadEmptyTemplate(string $academicYear): StreamedResponse
    {
        // heiId 0 matches no DB records — all fetchers return empty arrays naturally.
        $spreadsheet = $this->buildSpreadsheet(0, $academicYear);

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="SAS_Template_' . $academicYear . '_blank.xlsx"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    // ── build ──────────────────────────────────────────────────────────────

    private function buildSpreadsheet(int $heiId, string $academicYear): Spreadsheet
    {
        $ss = new Spreadsheet();
        $ss->getDefaultStyle()->getFont()->setName('Arial')->setSize(10);
        $ss->removeSheetByIndex(0);

        $tabular = new TabularAnnexSheet();

        (new InstructionsSheet())->attach($ss, $academicYear);

        $tabular->attach($ss, 'ANNEX_A', 'Annex A', 'Information and Orientation Services',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Target Group', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexAData($heiId, $academicYear), $academicYear,
            subRow: [4 => '(e.g. faculty, students, graduating class, etc.)']
        );
        $tabular->attach($ss, 'ANNEX_B', 'Annex B', 'Guidance and Counseling Services',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Target Group', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexBData($heiId, $academicYear), $academicYear,
            subRow: [1 => '(list all services provided)', 4 => '(e.g. faculty, students, graduating class, etc.)']
        );
        $tabular->attach($ss, 'ANNEX_C', 'Annex C', 'Career and Job Placement Services',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexCData($heiId, $academicYear), $academicYear
        );
        $tabular->attach($ss, 'ANNEX_C1', 'Annex C-1', 'Economic Enterprise Development',
            ['Title', 'Venue', 'Date (YYYY-MM-DD)', 'Target Group', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexC1Data($heiId, $academicYear), $academicYear
        );

        (new AnnexDSheet())->attach($ss, $heiId, $academicYear);

        $tabular->attach($ss, 'ANNEX_E', 'Annex E', 'Student Organizations',
            ['Name of Org/Council/Govt', 'Years of Existence', 'Accredited Since', 'Faculty Adviser', 'President/Officers', 'Specialization', 'Fee Collected', 'Programs/Activities'],
            $this->fetchAnnexEData($heiId, $academicYear), $academicYear,
            subRow: [
                5 => '(please use additional sheet of paper, if necessary)',
                6 => '(e.g. Drug Education, Academic, Community Services, Environmental Awareness, Peer Counseling, Tutorial Services, others)',
            ]
        );

        (new AnnexFSheet())->attach($ss, $heiId, $academicYear);
        (new AnnexGSheet())->attach($ss, $heiId, $academicYear);
        (new AnnexHSheet())->attach($ss, $heiId, $academicYear);

        $tabular->attach($ss, 'ANNEX_I', 'Annex I', 'Scholarships/Financial Assistance',
            ['Scholarship Name', 'Type', 'Category/Beneficiaries', 'Number of Beneficiaries', 'Remarks'],
            $this->fetchAnnexIData($heiId, $academicYear), $academicYear,
            subRow: [
                2 => '(Institutional, Scholarship, Grant, Loan, etc.)',
                3 => '(e.g. PWD, IPs, 4Ps, Solo Parent/ Dependent of Solo Parent, etc.)',
            ]
        );
        $tabular->attach($ss, 'ANNEX_I1', 'Annex I-1', 'Food Services',
            ['Service/Facility Name', 'Type of Service', 'Operator', 'Location', 'Students Served Daily', 'Remarks'],
            $this->fetchAnnexI1Data($heiId, $academicYear), $academicYear
        );
        $tabular->attach($ss, 'ANNEX_J', 'Annex J', 'Health Services',
            ['Title of Program', 'Organizer', 'Participants (Online)', 'Participants (F2F)', 'Remarks'],
            $this->fetchAnnexJData($heiId, $academicYear), $academicYear
        );
        $tabular->attach($ss, 'ANNEX_K', 'Annex K', 'Safety and Security Committees',
            ['Committee Name', 'Committee Head', 'Members/Composition', 'Programs/Activities/Trainings', 'Remarks'],
            $this->fetchAnnexKData($heiId, $academicYear), $academicYear,
            subRow: [1 => '(fill-in applicable)']
        );
        $tabular->attach($ss, 'ANNEX_L', 'Annex L', 'Student Housing',
            ['Housing Name', 'Complete Address', 'House Manager', 'Type: Male', 'Type: Female', 'Type: Coed (M+F)', 'Others (specify)', 'Remarks'],
            $this->fetchAnnexLData($heiId, $academicYear), $academicYear,
            subRow: [4 => 'YES / NO', 5 => 'YES / NO', 6 => 'YES / NO'],
            yesNoCols: [4, 5, 6],
        );
        $tabular->attach($ss, 'ANNEX_L1', 'Annex L-1', 'Foreign/International Student Services',
            ['Service Name', 'Type of Service', 'Target Nationality', 'Students Served', 'Officer-in-Charge', 'Remarks'],
            $this->fetchAnnexL1Data($heiId, $academicYear), $academicYear
        );

        (new AnnexMSheet())->attach($ss, $heiId, $academicYear);

        $tabular->attach($ss, 'ANNEX_N', 'Annex N', 'Culture and the Arts',
            ['Title of Activity', 'Date (YYYY-MM-DD)', 'Venue', 'Participants (Online)', 'Participants (F2F)', 'Organizer', 'Remarks'],
            $this->fetchAnnexNData($heiId, $academicYear), $academicYear,
            subRow: [1 => '(e.g. dance troupe, choir, cheering squad and other extra-curricular activities)'],
            subRowMerges: [],
            headerColor: 'FFE2EFD9'
        );
        $tabular->attach($ss, 'ANNEX_N1', 'Annex N-1', 'Sports Development Program',
            ['Program Title', 'Sport Type', 'Date (YYYY-MM-DD)', 'Venue', 'Participants Count', 'Organizer', 'Remarks'],
            $this->fetchAnnexN1Data($heiId, $academicYear), $academicYear
        );
        $tabular->attach($ss, 'ANNEX_O', 'Annex O', 'Community Involvement/Outreach',
            ['Title of Program', 'Date Conducted (YYYY-MM-DD)', 'No. of Beneficiaries', 'Type of Community Service', 'Community/Population Served'],
            $this->fetchAnnexOData($heiId, $academicYear), $academicYear,
            subRow: [
                1 => '(to include GAD activities)',
                4 => '(e.g. blood letting, tree planting, medical mission, fund-raising events, clean-up drive, livelihood training, etc.)',
                5 => '(e.g. Aetas, flood victims, etc.)',
            ],
            subRowMerges: [],
            headerColor: 'FFE2EFD9'
        );

        return $ss;
    }

    // ── data fetchers ──────────────────────────────────────────────────────

    private function fetchAnnexAData(int $heiId, string $ay): array
    {
        $batch = AnnexABatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->target_group, $p->participants_online, $p->participants_face_to_face,
            $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexBData(int $heiId, string $ay): array
    {
        $batch = AnnexBBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->target_group, $p->participants_online, $p->participants_face_to_face,
            $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexCData(int $heiId, string $ay): array
    {
        $batch = AnnexCBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->participants_online, $p->participants_face_to_face, $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexC1Data(int $heiId, string $ay): array
    {
        $batch = AnnexC1Batch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title, $p->venue, $p->implementation_date?->format('Y-m-d') ?? '',
            $p->target_group, $p->participants_online, $p->participants_face_to_face,
            $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexEData(int $heiId, string $ay): array
    {
        $batch = AnnexEBatch::with('organizations')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->organizations->map(fn($o) => [
            $o->name_of_accredited, $o->years_of_existence, $o->accredited_since,
            $o->faculty_adviser, $o->president_and_officers, $o->specialization,
            $o->fee_collected, $o->programs_projects_activities,
        ])->toArray() ?? [];
    }

    private function fetchAnnexIData(int $heiId, string $ay): array
    {
        $batch = AnnexIBatch::with('scholarships')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->scholarships->map(fn($s) => [
            $s->scholarship_name, $s->type, $s->category_intended_beneficiaries,
            $s->number_of_beneficiaries, $s->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexI1Data(int $heiId, string $ay): array
    {
        $batch = AnnexI1Batch::with('foodServices')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->foodServices->map(fn($f) => [
            $f->service_name, $f->service_type, $f->operator_name, $f->location,
            $f->number_of_students_served, $f->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexJData(int $heiId, string $ay): array
    {
        $batch = AnnexJBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title_of_program, $p->organizer,
            $p->participants_online, $p->participants_face_to_face, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexKData(int $heiId, string $ay): array
    {
        $batch = AnnexKBatch::with('committees')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->committees->map(fn($c) => [
            $c->committee_name, $c->committee_head_name, $c->members_composition,
            $c->programs_projects_activities_trainings, $c->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexLData(int $heiId, string $ay): array
    {
        $batch = AnnexLBatch::with('housing')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->housing->map(fn($h) => [
            $h->housing_name, $h->complete_address, $h->house_manager_name,
            $h->male   ? 'YES' : 'NO',
            $h->female ? 'YES' : 'NO',
            $h->coed   ? 'YES' : 'NO',
            $h->others, $h->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexL1Data(int $heiId, string $ay): array
    {
        $batch = AnnexL1Batch::with('internationalServices')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->internationalServices->map(fn($s) => [
            $s->service_name, $s->service_type, $s->target_nationality,
            $s->number_of_students_served, $s->officer_in_charge, $s->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexNData(int $heiId, string $ay): array
    {
        $batch = AnnexNBatch::with('activities')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->activities->map(fn($a) => [
            $a->title_of_activity, $a->implementation_date?->format('Y-m-d') ?? '',
            $a->implementation_venue, $a->participants_online, $a->participants_face_to_face,
            $a->organizer, $a->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexN1Data(int $heiId, string $ay): array
    {
        $batch = AnnexN1Batch::with('sportsPrograms')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->sportsPrograms->map(fn($p) => [
            $p->program_title, $p->sport_type, $p->implementation_date ?? '',
            $p->venue, $p->participants_count, $p->organizer, $p->remarks,
        ])->toArray() ?? [];
    }

    private function fetchAnnexOData(int $heiId, string $ay): array
    {
        $batch = AnnexOBatch::with('programs')->where('hei_id', $heiId)->where('academic_year', $ay)
            ->whereIn('status', ['submitted', 'published', 'request'])->first();
        return $batch?->programs->map(fn($p) => [
            $p->title_of_program, $p->date_conducted?->format('Y-m-d') ?? '',
            $p->number_of_beneficiaries, $p->type_of_community_service,
            $p->community_population_served,
        ])->toArray() ?? [];
    }
}
