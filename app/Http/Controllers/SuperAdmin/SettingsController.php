<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $deadline = Setting::get('annual_submission_deadline');

        if (!$deadline) {
            // Default to current year Sept 1
            $deadline = date('Y') . '-09-01 00:00:00';
        }

        // Convert stored datetime to datetime-local format for input
        $formattedDeadline = date('Y-m-d\TH:i', strtotime($deadline));

        $settings = [
            'annual_submission_deadline' => $formattedDeadline,
            'maintenance_mode' => Setting::get('maintenance_mode', '0')
        ];

        return Inertia::render('SuperAdmin/Settings', [
            'settings' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'annual_submission_deadline' => 'required|date_format:Y-m-d\TH:i',
            'maintenance_mode' => 'boolean'
        ]);

        // Store as full datetime (year will be ignored when checking, only month-day-time matters)
        $deadline = date('Y-m-d H:i:s', strtotime($validated['annual_submission_deadline']));
        Setting::set('annual_submission_deadline', $deadline);

        Setting::set('maintenance_mode', $validated['maintenance_mode'] ?? false ? '1' : '0');

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
}
