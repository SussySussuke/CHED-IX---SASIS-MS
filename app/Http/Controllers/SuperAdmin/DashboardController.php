<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function index(Request $request)
    {
        $selectedYear  = $request->get('year', $this->service->getCurrentAcademicYear());
        $academicYears = $this->service->getAvailableAcademicYears();
        $stats         = $this->service->getStats($selectedYear);

        // SuperAdmin-only extra stat
        $stats['totalAdmins'] = $this->service->getTotalAdmins();

        return inertia('SuperAdmin/Dashboard', [
            'academicYears' => $academicYears,
            'selectedYear'  => $selectedYear,
            'stats'         => $stats,
        ]);
    }
}
