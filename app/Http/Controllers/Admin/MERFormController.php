<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HEI;
use App\Services\MERFormBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MERFormController extends Controller
{
    protected $formBuilder;

    public function __construct(MERFormBuilder $formBuilder)
    {
        $this->formBuilder = $formBuilder;
    }

    /**
     * Show Form 1 selector page
     */
    public function form1Index()
    {
        $heis = HEI::where('is_active', true)
            ->orderBy('name')
            ->get();

        $academicYears = $this->getAvailableAcademicYears();

        // Calculate default academic year (based on September 1st deadline)
        $now = now();
        $currentYear = $now->year;
        $currentMonth = $now->month;

        // If before September, use previous year
        $startYear = $currentMonth < 9 ? $currentYear - 1 : $currentYear;
        $defaultAcademicYear = "{$startYear}-" . ($startYear + 1);

        // Ensure default year exists in the list
        if (!in_array($defaultAcademicYear, $academicYears)) {
            $academicYears[] = $defaultAcademicYear;
            sort($academicYears);
        }

        return inertia('Admin/MER/Form1Index', [
            'heis' => $heis,
            'academicYears' => $academicYears,
            'initialHeiId' => null, // No default selection
            'initialAcademicYear' => $defaultAcademicYear,
            'formData' => null, // Initially no form data
        ]);
    }

    /**
     * Load Form 1 with data
     */
    public function form1Load($heiId, $academicYear)
    {
        $result = $this->formBuilder->buildForm1($heiId, $academicYear);

        // Return the same page with form data
        return inertia('Admin/MER/Form1Index', [
            'heis' => HEI::where('is_active', true)->orderBy('name')->get(),
            'academicYears' => $this->getAvailableAcademicYears(),
            'initialHeiId' => $heiId,
            'initialAcademicYear' => $academicYear,
            'formData' => $result['success'] ? $result['data'] : null,
        ]);
    }

    /**
     * Show Form 2 selector page
     */
    public function form2Index()
    {
        $heis = HEI::where('is_active', true)
            ->orderBy('name')
            ->get();

        $academicYears = $this->getAvailableAcademicYears();

        // Calculate default academic year
        $now = now();
        $currentYear = $now->year;
        $currentMonth = $now->month;
        $startYear = $currentMonth < 9 ? $currentYear - 1 : $currentYear;
        $defaultAcademicYear = "{$startYear}-" . ($startYear + 1);

        if (!in_array($defaultAcademicYear, $academicYears)) {
            $academicYears[] = $defaultAcademicYear;
            sort($academicYears);
        }

        return inertia('Admin/MER/Form2Index', [
            'heis' => $heis,
            'academicYears' => $academicYears,
            'initialHeiId' => null,
            'initialAcademicYear' => $defaultAcademicYear,
            'formData' => null,
        ]);
    }

    /**
     * Load Form 2 with data
     */
    public function form2Load($heiId, $academicYear)
    {
        $result = $this->formBuilder->buildForm2($heiId, $academicYear);

        return inertia('Admin/MER/Form2Index', [
            'heis' => HEI::where('is_active', true)->orderBy('name')->get(),
            'academicYears' => $this->getAvailableAcademicYears(),
            'initialHeiId' => $heiId,
            'initialAcademicYear' => $academicYear,
            'formData' => $result['success'] ? $result['data'] : null,
        ]);
    }

    /**
     * Show Form 3 selector page
     */
    public function form3Index()
    {
        $heis = HEI::where('is_active', true)
            ->orderBy('name')
            ->get();

        $academicYears = $this->getAvailableAcademicYears();

        // Calculate default academic year
        $now = now();
        $currentYear = $now->year;
        $currentMonth = $now->month;
        $startYear = $currentMonth < 9 ? $currentYear - 1 : $currentYear;
        $defaultAcademicYear = "{$startYear}-" . ($startYear + 1);

        if (!in_array($defaultAcademicYear, $academicYears)) {
            $academicYears[] = $defaultAcademicYear;
            sort($academicYears);
        }

        return inertia('Admin/MER/Form3Index', [
            'heis' => $heis,
            'academicYears' => $academicYears,
            'initialHeiId' => null,
            'initialAcademicYear' => $defaultAcademicYear,
            'formData' => null,
        ]);
    }

    /**
     * Load Form 3 with data
     */
    public function form3Load($heiId, $academicYear)
    {
        $result = $this->formBuilder->buildForm3($heiId, $academicYear);

        return inertia('Admin/MER/Form3Index', [
            'heis' => HEI::where('is_active', true)->orderBy('name')->get(),
            'academicYears' => $this->getAvailableAcademicYears(),
            'initialHeiId' => $heiId,
            'initialAcademicYear' => $academicYear,
            'formData' => $result['success'] ? $result['data'] : null,
        ]);
    }

    /**
     * Get available academic years from existing submissions
     */
    private function getAvailableAcademicYears()
    {
        // Query all batch tables to find distinct academic years
        $years = collect();

        // Get years from a few representative tables
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
