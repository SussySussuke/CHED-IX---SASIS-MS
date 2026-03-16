<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HEI;
use App\Models\AnnexABatch;
use App\Services\MER4FormBuilder;
use Illuminate\Http\Request;

class MER4FormController extends Controller
{
    public function __construct(private readonly MER4FormBuilder $formBuilder) {}

    public function form1Index()
    {
        return $this->formIndex(1, 'Admin/MER4/Form1Index');
    }

    public function form1Load($heiId, $academicYear)
    {
        return $this->formLoad(1, 'Admin/MER4/Form1Index', $heiId, $academicYear);
    }

    public function form2Index()
    {
        return $this->formIndex(2, 'Admin/MER4/Form2Index');
    }

    public function form2Load($heiId, $academicYear)
    {
        return $this->formLoad(2, 'Admin/MER4/Form2Index', $heiId, $academicYear);
    }

    public function form3Index()
    {
        return $this->formIndex(3, 'Admin/MER4/Form3Index');
    }

    public function form3Load($heiId, $academicYear)
    {
        return $this->formLoad(3, 'Admin/MER4/Form3Index', $heiId, $academicYear);
    }

    private function formIndex(int $formNumber, string $component)
    {
        $academicYears     = $this->getAvailableAcademicYears();
        $defaultYear       = $this->resolveDefaultAcademicYear($academicYears);

        return inertia($component, [
            'heis'               => $this->activeHeis(),
            'academicYears'      => $academicYears,
            'initialHeiId'       => null,
            'initialAcademicYear' => $defaultYear,
            'formData'           => null,
        ]);
    }

    private function formLoad(int $formNumber, string $component, $heiId, $academicYear)
    {
        $buildMethod = 'buildForm' . $formNumber;
        $result      = $this->formBuilder->$buildMethod($heiId, $academicYear);

        return inertia($component, [
            'heis'               => $this->activeHeis(),
            'academicYears'      => $this->getAvailableAcademicYears(),
            'initialHeiId'       => $heiId,
            'initialAcademicYear' => $academicYear,
            'formData'           => $result['success'] ? $result['data'] : null,
        ]);
    }

    private function activeHeis()
    {
        return HEI::where('is_active', true)->orderBy('name')->get();
    }

    /** Default year based on September deadline: before Sep → previous AY, else current AY. */
    private function resolveDefaultAcademicYear(array &$academicYears): string
    {
        $now       = now();
        $startYear = $now->month < 9 ? $now->year - 1 : $now->year;
        $default   = "{$startYear}-" . ($startYear + 1);

        if (!in_array($default, $academicYears)) {
            $academicYears[] = $default;
            sort($academicYears);
        }

        return $default;
    }

    /** Academic years sourced from published/submitted data. */
    private function getAvailableAcademicYears(): array
    {
        return AnnexABatch::distinct()
            ->orderBy('academic_year')
            ->pluck('academic_year')
            ->filter()
            ->values()
            ->toArray();
    }
}
