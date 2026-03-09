<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Summary\EvidenceRequest;
use App\Models\HEI;
use App\Services\Summary\ProfileSummaryService;
use App\Services\Summary\PersonnelSummaryService;
use App\Services\Summary\InfoOrientationSummaryService;
use App\Services\Summary\GuidanceCounsellingSummaryService;
use App\Services\Summary\CareerJobSummaryService;
use App\Services\Summary\HealthSummaryService;
use App\Services\Summary\StaticSectionSummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SummaryViewController extends Controller
{
    public function __construct(
        private readonly ProfileSummaryService              $profile,
        private readonly PersonnelSummaryService            $personnel,
        private readonly InfoOrientationSummaryService      $infoOrientation,
        private readonly GuidanceCounsellingSummaryService  $guidanceCounselling,
        private readonly CareerJobSummaryService            $careerJob,
        private readonly HealthSummaryService               $health,
        private readonly StaticSectionSummaryService        $static,
    ) {}

    // ── Inertia entry point ───────────────────────────────────────────────────

    public function index(Request $request)
    {
        $availableYears = $this->profile->getAvailableYears();
        $selectedYear   = $request->query('year') ?? ($availableYears[count($availableYears) - 1] ?? null);

        $summaries = $selectedYear
            ? $this->profile->getRows($selectedYear, fullFields: true)
            : [];

        return inertia('Admin/SummaryView', [
            'summaries'      => $summaries,
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    // ── JSON data endpoints ───────────────────────────────────────────────────

    public function getProfileData(Request $request): JsonResponse
    {
        $availableYears = $this->profile->getAvailableYears();
        $selectedYear   = $request->query('year') ?? ($availableYears[count($availableYears) - 1] ?? null);

        return response()->json([
            'data'           => $selectedYear ? $this->profile->getRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getPersonnelData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->personnel->getAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->personnel->getRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getInfoOrientationData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->infoOrientation->getAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->infoOrientation->getRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getGuidanceCounsellingData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->guidanceCounselling->getAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->guidanceCounselling->getRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getCareerJobData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->careerJob->getAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->careerJob->getRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getHealthData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->health->getAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->health->getRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAdmissionData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getAdmissionAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getAdmissionRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getStudentDisciplineData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getStudentDisciplineAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getStudentDisciplineRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexOData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getSocialCommunityAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getSocialCommunityRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexEData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getStudentOrganizationAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getStudentOrganizationRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexNData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getCultureAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getCultureRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexIData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getScholarshipAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getScholarshipRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexKData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getSafetySecurityAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getSafetySecurityRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexLData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getDormAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getDormRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    public function getAnnexMStatsData(Request $request): JsonResponse
    {
        [$selectedYear, $availableYears] = $this->resolveYear(
            $request, $this->static->getSpecialNeedsStatsAvailableYears()
        );

        return response()->json([
            'data'           => $selectedYear ? $this->static->getSpecialNeedsStatsRows($selectedYear) : [],
            'availableYears' => $availableYears,
            'selectedYear'   => $selectedYear,
        ]);
    }

    // ── Evidence endpoints ────────────────────────────────────────────────────

    public function getPersonnelEvidence(EvidenceRequest $request, HEI $hei, string $category): JsonResponse
    {
        if (!in_array($category, $this->personnel->validCategories(), true)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $records = $this->personnel->getEvidence($hei->id, $category, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getInfoOrientationEvidence(EvidenceRequest $request, HEI $hei, string $category): JsonResponse
    {
        if (!in_array($category, $this->infoOrientation->validCategories(), true)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $records = $this->infoOrientation->getEvidence($hei->id, $category, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getGuidanceCounsellingEvidence(EvidenceRequest $request, HEI $hei, string $category): JsonResponse
    {
        if (!in_array($category, $this->guidanceCounselling->validCategories(), true)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $records = $this->guidanceCounselling->getEvidence($hei->id, $category, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getCareerJobEvidence(EvidenceRequest $request, HEI $hei, string $category): JsonResponse
    {
        if (!in_array($category, $this->careerJob->validCategories(), true)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $records = $this->careerJob->getEvidence($hei->id, $category, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getHealthEvidence(EvidenceRequest $request, HEI $hei, string $category): JsonResponse
    {
        if (!in_array($category, $this->health->validCategories(), true)) {
            return response()->json(['error' => 'Invalid category', 'records' => []], 422);
        }

        $records = $this->health->getEvidence($hei->id, $category, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'category'    => $category,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getAnnexOEvidence(EvidenceRequest $request, HEI $hei): JsonResponse
    {
        $records = $this->static->getSocialCommunityEvidence($hei->id, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getAnnexEEvidence(EvidenceRequest $request, HEI $hei): JsonResponse
    {
        $records = $this->static->getStudentOrganizationEvidence($hei->id, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getAnnexNEvidence(EvidenceRequest $request, HEI $hei): JsonResponse
    {
        $records = $this->static->getCultureEvidence($hei->id, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getAnnexIEvidence(EvidenceRequest $request, HEI $hei): JsonResponse
    {
        $records = $this->static->getScholarshipEvidence($hei->id, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    public function getAnnexLEvidence(EvidenceRequest $request, HEI $hei): JsonResponse
    {
        $records = $this->static->getDormEvidence($hei->id, $request->selectedYear());

        return response()->json([
            'hei_name'    => $hei->name,
            'records'     => $records,
            'total_count' => count($records),
        ]);
    }

    // ── Category override endpoints ───────────────────────────────────────────

    public function updatePersonnelCategory(Request $request): JsonResponse
    {
        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . implode(',', array_keys(\App\Services\Summary\CategoryKeywordMatcher::PERSONNEL_ROLE_KEYWORDS))],
        ]);

        $this->personnel->updateCategory(
            $request->integer('record_id'),
            $request->input('categories'),
            $request->user()->id
        );

        return response()->json(['success' => true]);
    }

    public function updateProgramCategory(Request $request): JsonResponse
    {
        $request->validate([
            'record_type'  => ['required', 'in:annex_a,annex_b'],
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . implode(',', array_keys(\App\Services\Summary\CategoryKeywordMatcher::INFO_ORIENTATION_KEYWORDS))],
        ]);

        $this->infoOrientation->updateCategory(
            $request->input('record_type'),
            $request->integer('record_id'),
            $request->input('categories'),
            $request->user()->id
        );

        return response()->json(['success' => true]);
    }

    public function updateGuidanceCounsellingCategory(Request $request): JsonResponse
    {
        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . implode(',', array_keys(\App\Services\Summary\CategoryKeywordMatcher::GUIDANCE_COUNSELLING_KEYWORDS))],
        ]);

        $this->guidanceCounselling->updateCategory(
            $request->integer('record_id'),
            $request->input('categories'),
            $request->user()->id
        );

        return response()->json(['success' => true]);
    }

    public function updateCareerJobCategory(Request $request): JsonResponse
    {
        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . implode(',', array_keys(\App\Services\Summary\CategoryKeywordMatcher::CAREER_JOB_KEYWORDS))],
        ]);

        $this->careerJob->updateCategory(
            $request->integer('record_id'),
            $request->input('categories'),
            $request->user()->id
        );

        return response()->json(['success' => true]);
    }

    public function updateHealthCategory(Request $request): JsonResponse
    {
        $request->validate([
            'record_id'    => ['required', 'integer', 'min:1'],
            'categories'   => ['nullable', 'array'],
            'categories.*' => ['string', 'in:' . implode(',', array_keys(\App\Services\Summary\CategoryKeywordMatcher::HEALTH_KEYWORDS))],
        ]);

        $this->health->updateCategory(
            $request->integer('record_id'),
            $request->input('categories'),
            $request->user()->id
        );

        return response()->json(['success' => true]);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    /**
     * Resolves the active year from the request or defaults to the latest available.
     * Returns [$selectedYear|null, $availableYears].
     */
    private function resolveYear(Request $request, array $availableYears): array
    {
        $year = $request->query('year')
            ?? ($availableYears[count($availableYears) - 1] ?? null);

        return [$year, $availableYears];
    }
}
