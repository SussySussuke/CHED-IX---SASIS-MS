<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Summary;
use App\Models\HEI;
use Illuminate\Http\Request;

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
}
