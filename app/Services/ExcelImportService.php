<?php

namespace App\Services;

use App\Models\AnnexABatch;
use App\Models\AnnexBBatch;
use App\Models\AnnexC1Batch;
use App\Models\AnnexCBatch;
use App\Models\AnnexDSubmission;
use App\Models\AnnexEBatch;
use App\Models\AnnexFBatch;
use App\Models\AnnexGSubmission;
use App\Models\AnnexHBatch;
use App\Models\AnnexI1Batch;
use App\Models\AnnexIBatch;
use App\Models\AnnexJBatch;
use App\Models\AnnexKBatch;
use App\Models\AnnexL1Batch;
use App\Models\AnnexLBatch;
use App\Models\AnnexMBatch;
use App\Models\AnnexN1Batch;
use App\Models\AnnexNBatch;
use App\Models\AnnexOBatch;
use App\Services\Excel\Parsers\AnnexDParser;
use App\Services\Excel\Parsers\AnnexEParser;
use App\Services\Excel\Parsers\AnnexFParser;
use App\Services\Excel\Parsers\AnnexGParser;
use App\Services\Excel\Parsers\AnnexHParser;
use App\Services\Excel\Parsers\AnnexI1Parser;
use App\Services\Excel\Parsers\AnnexIParser;
use App\Services\Excel\Parsers\AnnexJParser;
use App\Services\Excel\Parsers\AnnexKParser;
use App\Services\Excel\Parsers\AnnexL1Parser;
use App\Services\Excel\Parsers\AnnexLParser;
use App\Services\Excel\Parsers\AnnexMParser;
use App\Services\Excel\Parsers\AnnexN1Parser;
use App\Services\Excel\Parsers\AnnexNParser;
use App\Services\Excel\Parsers\AnnexOParser;
use App\Services\Excel\Parsers\BaseParser;
use App\Services\Excel\Parsers\ParseResult;
use App\Services\Excel\Parsers\TabularProgramParser;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ExcelImportService
{
    /** Map sheet ID tag → parser instance */
    private array $parsers;

    /** Map sheet ID tag → Eloquent model class for conflict detection */
    private const MODEL_MAP = [
        'ANNEX_A'  => AnnexABatch::class,
        'ANNEX_B'  => AnnexBBatch::class,
        'ANNEX_C'  => AnnexCBatch::class,
        'ANNEX_C1' => AnnexC1Batch::class,
        'ANNEX_D'  => AnnexDSubmission::class,
        'ANNEX_E'  => AnnexEBatch::class,
        'ANNEX_F'  => AnnexFBatch::class,
        'ANNEX_G'  => AnnexGSubmission::class,
        'ANNEX_H'  => AnnexHBatch::class,
        'ANNEX_I'  => AnnexIBatch::class,
        'ANNEX_I1' => AnnexI1Batch::class,
        'ANNEX_J'  => AnnexJBatch::class,
        'ANNEX_K'  => AnnexKBatch::class,
        'ANNEX_L'  => AnnexLBatch::class,
        'ANNEX_L1' => AnnexL1Batch::class,
        'ANNEX_M'  => AnnexMBatch::class,
        'ANNEX_N'  => AnnexNBatch::class,
        'ANNEX_N1' => AnnexN1Batch::class,
        'ANNEX_O'  => AnnexOBatch::class,
    ];

    public function __construct()
    {
        $this->parsers = $this->buildParsers();
    }

    /**
     * Parse the uploaded Excel file and detect conflicts.
     *
     * Returns:
     * [
     *   'clean'     => ParseResult[],  // no existing record — safe to insert
     *   'conflicts' => [               // existing record found — needs user decision
     *     ['incoming' => ParseResult, 'existing_summary' => string, 'existing_data' => array]
     *   ],
     *   'errors'    => ParseResult[],  // had row-level validation errors
     *   'skipped'   => ParseResult[],  // empty sheets
     * ]
     */
    public function parse(UploadedFile $file, string $academicYear, int $heiId): array
    {
        $spreadsheet = IOFactory::load($file->getPathname());

        $clean     = [];
        $conflicts = [];
        $errors    = [];
        $skipped   = [];

        foreach ($spreadsheet->getAllSheets() as $ws) {
            $tag = strtoupper(trim((string) $ws->getCell('A1')->getValue()));

            // Strip brackets if present: [ANNEX_A] → ANNEX_A
            $tag = trim($tag, '[]');

            if (!isset($this->parsers[$tag])) {
                continue; // Unknown sheet — silently skip
            }

            /** @var BaseParser $parser */
            $parser = $this->parsers[$tag];
            $result = $parser->parse($ws);

            if ($result->isEmpty) {
                $skipped[] = $result;
                continue;
            }

            if ($result->hasErrors()) {
                $errors[] = $result;
                continue;
            }

            // Conflict detection
            $conflict = $this->detectConflict($tag, $heiId, $academicYear);
            if ($conflict) {
                $conflicts[] = [
                    'incoming'         => $result,
                    'existing_summary' => $conflict['summary'],
                    'existing_data'    => $conflict['data'],
                ];
            } else {
                $clean[] = $result;
            }
        }

        return compact('clean', 'conflicts', 'errors', 'skipped');
    }

    /**
     * Build the payload for a confirmed import (clean + user-approved overwrites).
     * Returns an array keyed by sheet ID of payloads ready for the controllers.
     *
     * @param  ParseResult[] $results
     */
    public function collectPayloads(array $results): array
    {
        $out = [];
        foreach ($results as $result) {
            $out[$result->sheetId] = $result->payload;
        }
        return $out;
    }

    // ── private helpers ────────────────────────────────────────────────────

    /**
     * Detect a conflicting existing record.
     * Returns ['summary' => string, 'data' => array] or null if no conflict.
     * 'data' uses the same payload keys the parsers use — safe for the frontend.
     */
    private function detectConflict(string $tag, int $heiId, string $academicYear): ?array
    {
        $modelClass = self::MODEL_MAP[$tag] ?? null;
        if (!$modelClass) return null;

        $existing = $modelClass::where('hei_id', $heiId)
            ->where('academic_year', $academicYear)
            ->whereIn('status', ['submitted', 'published', 'request'])
            ->first();

        if (!$existing) return null;

        return [
            'summary' => "Status: {$existing->status}, submitted on " . $existing->created_at?->format('M d, Y'),
            'data'    => $this->serializeExisting($tag, $existing),
        ];
    }

    /**
     * Serialize an existing model record into the same payload shape the parsers produce.
     * No raw column names or model class names reach the frontend.
     */
    private function serializeExisting(string $tag, mixed $existing): array
    {
        return match ($tag) {
            // Tabular batch forms — load the relation and return rows as plain arrays
            'ANNEX_A', 'ANNEX_B', 'ANNEX_C', 'ANNEX_C1'
                => ['programs' => $existing->programs()->get()->map->only([
                        'title', 'objectives', 'target_group', 'duration_hours',
                        'number_of_sessions', 'number_of_participants', 'budget',
                        'fund_source', 'implementing_office', 'remarks',
                    ])->toArray()],

            'ANNEX_E'
                => ['organizations' => $existing->organizations()->get()->map->only([
                        'organization_name', 'description', 'number_of_members',
                        'president', 'adviser', 'recognition_status', 'remarks',
                    ])->toArray()],

            'ANNEX_F'
                => [
                    'activities'                   => $existing->activities()->get()->map->only([
                        'activity_title', 'objectives', 'date', 'budget', 'fund_source',
                        'implementing_office', 'remarks',
                    ])->toArray(),
                    'student_discipline_committee' => $existing->student_discipline_committee,
                    'procedure_mechanism'          => $existing->procedure_mechanism,
                    'complaint_desk'               => $existing->complaint_desk,
                ],

            'ANNEX_G'
                => [
                    'form_data' => [
                        'official_school_name'            => $existing->official_school_name,
                        'student_publication_name'        => $existing->student_publication_name,
                        'publication_fee_per_student'     => $existing->publication_fee_per_student,
                        'adviser_name'                    => $existing->adviser_name,
                        'adviser_position_designation'    => $existing->adviser_position_designation,
                        'frequency_monthly'               => $existing->frequency_monthly,
                        'frequency_quarterly'             => $existing->frequency_quarterly,
                        'frequency_annual'                => $existing->frequency_annual,
                        'frequency_per_semester'          => $existing->frequency_per_semester,
                        'frequency_others'                => $existing->frequency_others,
                        'frequency_others_specify'        => $existing->frequency_others_specify,
                        'publication_type_newsletter'     => $existing->publication_type_newsletter,
                        'publication_type_gazette'        => $existing->publication_type_gazette,
                        'publication_type_magazine'       => $existing->publication_type_magazine,
                        'publication_type_others'         => $existing->publication_type_others,
                        'publication_type_others_specify' => $existing->publication_type_others_specify,
                    ],
                    'editorial_boards'   => $existing->editorialBoards()->get()->map->only([
                        'name', 'position', 'course', 'year_level',
                    ])->toArray(),
                    'other_publications' => $existing->otherPublications()->get()->map->only([
                        'title', 'type', 'frequency', 'remarks',
                    ])->toArray(),
                    'programs'           => $existing->programs()->get()->map->only([
                        'title', 'objectives', 'duration_hours', 'number_of_participants',
                        'budget', 'fund_source', 'implementing_office', 'remarks',
                    ])->toArray(),
                ],

            'ANNEX_H'
                => [
                    'admission_services'   => $existing->admissionServices()->get()->map->only([
                        'service_type', 'with', 'supporting_documents', 'remarks',
                    ])->toArray(),
                    'admission_statistics' => $existing->admissionStatistics()->get()->map->only([
                        'program', 'applicants', 'admitted', 'enrolled',
                    ])->toArray(),
                ],

            'ANNEX_I'
                => ['scholarships' => $existing->scholarships()->get()->map->only([
                        'scholarship_name', 'granting_body', 'number_of_grantees',
                        'amount_per_grantee', 'total_amount', 'remarks',
                    ])->toArray()],

            'ANNEX_I1'
                => ['foodServices' => $existing->foodServices()->get()->map->only([
                        'type_of_service', 'location', 'capacity', 'operating_hours', 'remarks',
                    ])->toArray()],

            'ANNEX_J'
                => ['programs' => $existing->programs()->get()->map->only([
                        'title', 'objectives', 'date', 'venue', 'budget', 'fund_source',
                        'implementing_office', 'participants_online',
                        'participants_face_to_face', 'remarks',
                    ])->toArray()],

            'ANNEX_K'
                => ['committees' => $existing->committees()->get()->map->only([
                        'committee_name', 'chairperson', 'members', 'mandate', 'remarks',
                    ])->toArray()],

            'ANNEX_L'
                => ['housing' => $existing->housing()->get()->map->only([
                        'type_of_facility', 'capacity', 'actual_occupancy',
                        'monthly_rate', 'remarks',
                    ])->toArray()],

            'ANNEX_L1'
                => ['internationalServices' => $existing->internationalServices()->get()->map->only([
                        'service_type', 'description', 'number_served', 'remarks',
                    ])->toArray()],

            'ANNEX_M'
                => [
                    'statistics' => $existing->statistics()->get()->map->only([
                        'category', 'subcategory', 'year_data', 'is_subtotal',
                    ])->toArray(),
                    'services'   => $existing->services()->get()->map->only([
                        'section', 'institutional_services_programs_activities',
                        'number_of_beneficiaries_participants', 'remarks',
                    ])->toArray(),
                ],

            'ANNEX_N'
                => ['activities' => $existing->activities()->get()->map->only([
                        'activity_title', 'objectives', 'date', 'venue', 'budget',
                        'fund_source', 'implementing_office', 'participants_online',
                        'participants_face_to_face', 'remarks',
                    ])->toArray()],

            'ANNEX_N1'
                => ['sportsPrograms' => $existing->sportsPrograms()->get()->map->only([
                        'sport', 'level', 'achievement', 'number_of_participants', 'remarks',
                    ])->toArray()],

            'ANNEX_O'
                => ['programs' => $existing->programs()->get()->map->only([
                        'title', 'objectives', 'duration_hours', 'number_of_participants',
                        'budget', 'fund_source', 'implementing_office', 'remarks',
                    ])->toArray()],

            'ANNEX_D'
                => ['submission' => collect($existing->getAttributes())->only([
                        'version_publication_date', 'officer_in_charge', 'handbook_committee',
                        'mode_print', 'mode_digital', 'mode_online', 'mode_others',
                        'type_student', 'type_faculty', 'type_administrative', 'type_others',
                        'contains_vision_mission', 'contains_core_values', 'contains_history',
                        'contains_organizational_chart', 'contains_services', 'contains_programs',
                        'contains_policies', 'contains_code_of_conduct', 'contains_scholarships',
                        'contains_health_services', 'contains_library_services',
                        'contains_sports_facilities', 'contains_dormitory', 'contains_canteen',
                        'contains_others',
                    ])->toArray()],

            default => [],
        };
    }

    private function buildParsers(): array
    {
        $parsers = [
            new TabularProgramParser('ANNEX_A',  'Annex A - Information and Orientation Services', hasTargetGroup: true,  dataRowStart: 9),
            new TabularProgramParser('ANNEX_B',  'Annex B - Guidance and Counseling Services',     hasTargetGroup: true,  dataRowStart: 9),
            new TabularProgramParser('ANNEX_C',  'Annex C - Career and Job Placement Services',    hasTargetGroup: false, dataRowStart: 8),
            new TabularProgramParser('ANNEX_C1', 'Annex C-1 - Economic Enterprise Development',    hasTargetGroup: true,  dataRowStart: 8),
            new AnnexDParser(),
            new AnnexEParser(),
            new AnnexFParser(),
            new AnnexGParser(),
            new AnnexHParser(),
            new AnnexIParser(),
            new AnnexI1Parser(),
            new AnnexJParser(),
            new AnnexKParser(),
            new AnnexLParser(),
            new AnnexL1Parser(),
            new AnnexMParser(),
            new AnnexNParser(),
            new AnnexN1Parser(),
            new AnnexOParser(),
        ];

        $map = [];
        foreach ($parsers as $parser) {
            $map[$parser->sheetId()] = $parser;
        }
        return $map;
    }
}
