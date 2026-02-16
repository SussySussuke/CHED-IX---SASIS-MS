<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Summary;
use App\Models\HEI;
use App\Models\AnnexABatch;
use App\Models\AnnexAProgram;
use App\Models\AnnexBBatch;
use App\Models\AnnexBProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SummaryViewController extends Controller
{
    /**
     * Display all Summary submissions across all HEIs for a selected academic year
     */
    public function index(Request $request)
    {
        // Get academic year from query parameter
        $selectedYear = $request->query('year');
        
        // Get all available academic years from Summary submissions
        $availableYears = Summary::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year')
            ->sort()
            ->values()
            ->toArray();
        
        // Default to most recent year if none selected
        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }
        
        // Fetch ALL HEIs with their summary data for selected year
        $summaries = [];
        
        if ($selectedYear) {
            // Get all active HEIs
            $heis = HEI::where('is_active', true)
                ->orderBy('name')
                ->get();
            
            // Get summaries for this year
            $summaryData = Summary::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->get()
                ->keyBy('hei_id');
            
            // Map all HEIs, include summary data if exists
            $summaries = $heis->map(function ($hei) use ($summaryData, $selectedYear) {
                $summary = $summaryData->get($hei->id);
                
                if ($summary) {
                    // HEI has submitted summary
                    return [
                        'id' => $summary->id,
                        'hei_id' => $hei->id,
                        'hei_code' => $hei->code,
                        'hei_name' => $hei->name,
                        'hei_type' => $hei->type,
                        'academic_year' => $summary->academic_year,
                        'population_male' => $summary->population_male,
                        'population_female' => $summary->population_female,
                        'population_intersex' => $summary->population_intersex,
                        'population_total' => $summary->population_total,
                        'submitted_org_chart' => $summary->submitted_org_chart,
                        'hei_website' => $summary->hei_website,
                        'sas_website' => $summary->sas_website,
                        'social_media_contacts' => $summary->social_media_contacts ? implode(', ', $summary->social_media_contacts) : '',
                        'student_handbook' => $summary->student_handbook,
                        'student_publication' => $summary->student_publication,
                        'status' => $summary->status,
                        'submitted_at' => $summary->created_at->format('Y-m-d H:i:s'),
                        'has_submission' => true,
                    ];
                } else {
                    // HEI has NOT submitted summary - show empty row
                    return [
                        'id' => null,
                        'hei_id' => $hei->id,
                        'hei_code' => $hei->code,
                        'hei_name' => $hei->name,
                        'hei_type' => $hei->type,
                        'academic_year' => $selectedYear,
                        'population_male' => null,
                        'population_female' => null,
                        'population_intersex' => null,
                        'population_total' => null,
                        'submitted_org_chart' => null,
                        'hei_website' => null,
                        'sas_website' => null,
                        'social_media_contacts' => '',
                        'student_handbook' => null,
                        'student_publication' => null,
                        'status' => 'not_submitted',
                        'submitted_at' => null,
                        'has_submission' => false,
                    ];
                }
            })->toArray();
        }
        
        return inertia('Admin/SummaryView', [
            'summaries' => $summaries,
            'availableYears' => $availableYears,
            'selectedYear' => $selectedYear,
        ]);
    }

    /**
     * Get Information and Orientation Services & Activities data (Annex A + B)
     * for all HEIs for a selected academic year
     * 
     * Annex A: Information and Orientation Services
     * Annex B: Guidance and Counseling Service
     * 
     * Both annexes are aggregated and categorized by activity type based on title keywords.
     * This mimics the manual categorization process done by supervisors.
     */
    public function getInfoOrientationData(Request $request)
    {
        $selectedYear = $request->query('year');
        
        // Get all available academic years from both Annex A and B
        $availableYearsA = AnnexABatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year');
            
        $availableYearsB = AnnexBBatch::whereIn('status', ['published', 'submitted', 'request'])
            ->distinct()
            ->pluck('academic_year');
            
        $availableYears = $availableYearsA->merge($availableYearsB)
            ->unique()
            ->sort()
            ->values()
            ->toArray();
        
        // Default to most recent year if none selected
        if (!$selectedYear && count($availableYears) > 0) {
            $selectedYear = $availableYears[count($availableYears) - 1];
        }
        
        $infoOrientationData = [];
        
        if ($selectedYear) {
            // Get all active HEIs
            $heis = HEI::where('is_active', true)
                ->orderBy('name')
                ->get();
            
            // Get Annex A batches for this year with their programs
            $annexABatches = AnnexABatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');
            
            // Get Annex B batches for this year with their programs
            $annexBBatches = AnnexBBatch::where('academic_year', $selectedYear)
                ->whereIn('status', ['published', 'submitted', 'request'])
                ->with('programs')
                ->get()
                ->keyBy('hei_id');
            
            // Process each HEI
            $infoOrientationData = $heis->map(function ($hei) use ($annexABatches, $annexBBatches, $selectedYear) {
                $batchA = $annexABatches->get($hei->id);
                $batchB = $annexBBatches->get($hei->id);
                
                // Merge programs from both annexes
                $allPrograms = collect();
                if ($batchA && $batchA->programs->count() > 0) {
                    $allPrograms = $allPrograms->merge($batchA->programs);
                }
                if ($batchB && $batchB->programs->count() > 0) {
                    $allPrograms = $allPrograms->merge($batchB->programs);
                }
                
                if ($allPrograms->count() > 0) {
                    // Initialize counters for each category
                    $categories = [
                        'campus_orientation' => ['activities' => 0, 'students' => 0],
                        'gender_sensitivity' => ['activities' => 0, 'students' => 0],
                        'anti_hazing' => ['activities' => 0, 'students' => 0],
                        'substance_abuse' => ['activities' => 0, 'students' => 0],
                        'sexual_health' => ['activities' => 0, 'students' => 0],
                        'mental_health' => ['activities' => 0, 'students' => 0],
                        'disaster_risk' => ['activities' => 0, 'students' => 0],
                    ];
                    
                    $allActivityTitles = [];
                    
                    // Categorize each program based on title keywords
                    // This mimics manual supervisor categorization process
                    foreach ($allPrograms as $program) {
                        $titleLower = strtolower($program->title);
                        $targetLower = strtolower($program->target_group ?? '');
                        $searchText = $titleLower . ' ' . $targetLower;
                        
                        $allActivityTitles[] = $program->title;
                        
                        // Calculate total participants
                        $totalStudents = ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0);
                        
                        $categorized = false;
                        
                        // Campus Orientation - freshmen, orientation, welcome, induction
                        if (str_contains($searchText, 'orientation') || 
                            str_contains($searchText, 'freshmen') || 
                            str_contains($searchText, 'freshman') ||
                            str_contains($searchText, 'new student') ||
                            str_contains($searchText, 'welcome') ||
                            str_contains($searchText, 'induction')) {
                            $categories['campus_orientation']['activities']++;
                            $categories['campus_orientation']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Gender Sensitivity - gender, vawc, women, harassment, sensitivity
                        if (str_contains($searchText, 'gender') || 
                            str_contains($searchText, 'vawc') || 
                            str_contains($searchText, 'women') ||
                            str_contains($searchText, 'harassment') ||
                            str_contains($searchText, 'sensitivity') ||
                            str_contains($searchText, 'safe space')) {
                            $categories['gender_sensitivity']['activities']++;
                            $categories['gender_sensitivity']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Anti-Hazing
                        if (str_contains($searchText, 'hazing') || 
                            str_contains($searchText, 'anti-hazing') ||
                            str_contains($searchText, 'bullying') ||
                            str_contains($searchText, 'fraternity')) {
                            $categories['anti_hazing']['activities']++;
                            $categories['anti_hazing']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Substance Abuse - drugs, alcohol, tobacco, smoking, vaping
                        if (str_contains($searchText, 'substance') || 
                            str_contains($searchText, 'drug') || 
                            str_contains($searchText, 'alcohol') ||
                            str_contains($searchText, 'tobacco') ||
                            str_contains($searchText, 'smoking') ||
                            str_contains($searchText, 'vape') ||
                            str_contains($searchText, 'vaping')) {
                            $categories['substance_abuse']['activities']++;
                            $categories['substance_abuse']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Sexual/Reproductive Health - hiv, aids, sexual, reproductive, std, sti
                        if (str_contains($searchText, 'sexual') || 
                            str_contains($searchText, 'reproductive') || 
                            str_contains($searchText, 'hiv') ||
                            str_contains($searchText, 'aids') ||
                            str_contains($searchText, 'std') ||
                            str_contains($searchText, 'sti') ||
                            str_contains($searchText, 'pregnancy')) {
                            $categories['sexual_health']['activities']++;
                            $categories['sexual_health']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Mental Health - mental, wellness, wellbeing, counseling, stress, anxiety
                        if (str_contains($searchText, 'mental') || 
                            str_contains($searchText, 'wellness') || 
                            str_contains($searchText, 'well-being') ||
                            str_contains($searchText, 'wellbeing') ||
                            str_contains($searchText, 'counseling') ||
                            str_contains($searchText, 'stress') ||
                            str_contains($searchText, 'anxiety') ||
                            str_contains($searchText, 'depression') ||
                            str_contains($searchText, 'psychological')) {
                            $categories['mental_health']['activities']++;
                            $categories['mental_health']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Disaster Risk - earthquake, fire drill, disaster, emergency, evacuation
                        if (str_contains($searchText, 'disaster') || 
                            str_contains($searchText, 'earthquake') || 
                            str_contains($searchText, 'fire drill') ||
                            str_contains($searchText, 'emergency') ||
                            str_contains($searchText, 'evacuation') ||
                            str_contains($searchText, 'preparedness') ||
                            str_contains($searchText, 'risk reduction')) {
                            $categories['disaster_risk']['activities']++;
                            $categories['disaster_risk']['students'] += $totalStudents;
                            $categorized = true;
                        }
                        
                        // Note: An activity can be counted in multiple categories if it matches multiple criteria
                    }
                    
                    // Calculate totals
                    $totalActivities = array_sum(array_column($categories, 'activities'));
                    $totalStudents = array_sum(array_column($categories, 'students'));
                    
                    // Determine submission status (use whichever batch exists, prefer A)
                    $status = 'not_submitted';
                    if ($batchA && $batchB) {
                        // Both submitted - use the more recent or more complete one
                        $status = $batchA->status;
                    } elseif ($batchA) {
                        $status = $batchA->status;
                    } elseif ($batchB) {
                        $status = $batchB->status;
                    }
                    
                    return [
                        'hei_id' => $hei->id,
                        'hei_name' => $hei->name,
                        'hei_code' => $hei->code,
                        'campus_orientation_activities' => $categories['campus_orientation']['activities'],
                        'campus_orientation_students' => $categories['campus_orientation']['students'],
                        'gender_sensitivity_activities' => $categories['gender_sensitivity']['activities'],
                        'gender_sensitivity_students' => $categories['gender_sensitivity']['students'],
                        'anti_hazing_activities' => $categories['anti_hazing']['activities'],
                        'anti_hazing_students' => $categories['anti_hazing']['students'],
                        'substance_abuse_activities' => $categories['substance_abuse']['activities'],
                        'substance_abuse_students' => $categories['substance_abuse']['students'],
                        'sexual_health_activities' => $categories['sexual_health']['activities'],
                        'sexual_health_students' => $categories['sexual_health']['students'],
                        'mental_health_activities' => $categories['mental_health']['activities'],
                        'mental_health_students' => $categories['mental_health']['students'],
                        'disaster_risk_activities' => $categories['disaster_risk']['activities'],
                        'disaster_risk_students' => $categories['disaster_risk']['students'],
                        'total_activities' => $totalActivities,
                        'total_students' => $totalStudents,
                        'services_activities_list' => implode(', ', array_slice($allActivityTitles, 0, 3)) . (count($allActivityTitles) > 3 ? '...' : ''),
                        'status' => $status,
                        'has_submission' => true,
                    ];
                } else {
                    // HEI has NOT submitted Annex A or B
                    return [
                        'hei_id' => $hei->id,
                        'hei_name' => $hei->name,
                        'hei_code' => $hei->code,
                        'campus_orientation_activities' => 0,
                        'campus_orientation_students' => 0,
                        'gender_sensitivity_activities' => 0,
                        'gender_sensitivity_students' => 0,
                        'anti_hazing_activities' => 0,
                        'anti_hazing_students' => 0,
                        'substance_abuse_activities' => 0,
                        'substance_abuse_students' => 0,
                        'sexual_health_activities' => 0,
                        'sexual_health_students' => 0,
                        'mental_health_activities' => 0,
                        'mental_health_students' => 0,
                        'disaster_risk_activities' => 0,
                        'disaster_risk_students' => 0,
                        'total_activities' => 0,
                        'total_students' => 0,
                        'services_activities_list' => '',
                        'status' => 'not_submitted',
                        'has_submission' => false,
                    ];
                }
            })->toArray();
        }
        
        return response()->json([
            'data' => $infoOrientationData,
            'availableYears' => $availableYears,
            'selectedYear' => $selectedYear,
        ]);
    }

    /**
     * Get detailed program evidence for a specific HEI and category
     * Used for drill-down when clicking on activity counts
     * 
     * @param Request $request
     * @param int $heiId
     * @param string $category - One of: campus_orientation, gender_sensitivity, anti_hazing, 
     *                           substance_abuse, sexual_health, mental_health, disaster_risk
     * @return \Illuminate\Http\JsonResponse
     */
    public function getInfoOrientationEvidence(Request $request, $heiId, $category)
    {
        $selectedYear = $request->query('year');
        
        if (!$selectedYear) {
            return response()->json([
                'error' => 'Academic year is required',
                'programs' => [],
            ], 400);
        }
        
        // Get HEI info
        $hei = HEI::find($heiId);
        if (!$hei) {
            return response()->json([
                'error' => 'HEI not found',
                'programs' => [],
            ], 404);
        }
        
        // Get Annex A programs
        $annexAPrograms = AnnexAProgram::whereHas('batch', function ($query) use ($heiId, $selectedYear) {
            $query->where('hei_id', $heiId)
                  ->where('academic_year', $selectedYear)
                  ->whereIn('status', ['published', 'submitted', 'request']);
        })->get();
        
        // Get Annex B programs
        $annexBPrograms = AnnexBProgram::whereHas('batch', function ($query) use ($heiId, $selectedYear) {
            $query->where('hei_id', $heiId)
                  ->where('academic_year', $selectedYear)
                  ->whereIn('status', ['published', 'submitted', 'request']);
        })->get();
        
        // Merge both annexes
        $allPrograms = $annexAPrograms->merge($annexBPrograms);
        
        // Filter by category using the same logic as aggregation
        $filteredPrograms = [];
        
        foreach ($allPrograms as $program) {
            $titleLower = strtolower($program->title);
            $targetLower = strtolower($program->target_group ?? '');
            $searchText = $titleLower . ' ' . $targetLower;
            
            $matches = false;
            
            switch ($category) {
                case 'campus_orientation':
                    $matches = str_contains($searchText, 'orientation') || 
                               str_contains($searchText, 'freshmen') || 
                               str_contains($searchText, 'freshman') ||
                               str_contains($searchText, 'new student') ||
                               str_contains($searchText, 'welcome') ||
                               str_contains($searchText, 'induction');
                    break;
                    
                case 'gender_sensitivity':
                    $matches = str_contains($searchText, 'gender') || 
                               str_contains($searchText, 'vawc') || 
                               str_contains($searchText, 'women') ||
                               str_contains($searchText, 'harassment') ||
                               str_contains($searchText, 'sensitivity') ||
                               str_contains($searchText, 'safe space');
                    break;
                    
                case 'anti_hazing':
                    $matches = str_contains($searchText, 'hazing') || 
                               str_contains($searchText, 'anti-hazing') ||
                               str_contains($searchText, 'bullying') ||
                               str_contains($searchText, 'fraternity');
                    break;
                    
                case 'substance_abuse':
                    $matches = str_contains($searchText, 'substance') || 
                               str_contains($searchText, 'drug') || 
                               str_contains($searchText, 'alcohol') ||
                               str_contains($searchText, 'tobacco') ||
                               str_contains($searchText, 'smoking') ||
                               str_contains($searchText, 'vape') ||
                               str_contains($searchText, 'vaping');
                    break;
                    
                case 'sexual_health':
                    $matches = str_contains($searchText, 'sexual') || 
                               str_contains($searchText, 'reproductive') || 
                               str_contains($searchText, 'hiv') ||
                               str_contains($searchText, 'aids') ||
                               str_contains($searchText, 'std') ||
                               str_contains($searchText, 'sti') ||
                               str_contains($searchText, 'pregnancy');
                    break;
                    
                case 'mental_health':
                    $matches = str_contains($searchText, 'mental') || 
                               str_contains($searchText, 'wellness') || 
                               str_contains($searchText, 'well-being') ||
                               str_contains($searchText, 'wellbeing') ||
                               str_contains($searchText, 'counseling') ||
                               str_contains($searchText, 'stress') ||
                               str_contains($searchText, 'anxiety') ||
                               str_contains($searchText, 'depression') ||
                               str_contains($searchText, 'psychological');
                    break;
                    
                case 'disaster_risk':
                    $matches = str_contains($searchText, 'disaster') || 
                               str_contains($searchText, 'earthquake') || 
                               str_contains($searchText, 'fire drill') ||
                               str_contains($searchText, 'emergency') ||
                               str_contains($searchText, 'evacuation') ||
                               str_contains($searchText, 'preparedness') ||
                               str_contains($searchText, 'risk reduction');
                    break;
            }
            
            if ($matches) {
                $filteredPrograms[] = [
                    'id' => $program->id,
                    'title' => $program->title,
                    'venue' => $program->venue,
                    'implementation_date' => $program->implementation_date ? $program->implementation_date->format('Y-m-d') : null,
                    'target_group' => $program->target_group,
                    'participants_online' => $program->participants_online ?? 0,
                    'participants_face_to_face' => $program->participants_face_to_face ?? 0,
                    'total_participants' => ($program->participants_online ?? 0) + ($program->participants_face_to_face ?? 0),
                    'organizer' => $program->organizer,
                    'remarks' => $program->remarks,
                ];
            }
        }
        
        return response()->json([
            'hei_name' => $hei->name,
            'hei_code' => $hei->code,
            'category' => $category,
            'academic_year' => $selectedYear,
            'programs' => $filteredPrograms,
            'total_count' => count($filteredPrograms),
        ]);
    }
}
