<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();

        // For HEI users, include their HEI information
        if ($user->isHEI() && $user->hei) {
            return Inertia::render('HEI/Profile', [
                'hei' => [
                    'id'             => $user->hei->id,
                    'uii'            => $user->hei->uii,
                    'name'           => $user->hei->name,
                    'email'          => $user->hei->email,
                    'type'           => $user->hei->type,
                    'code'           => $user->hei->code,
                    'address'        => $user->hei->address ?? '',
                    'established_at' => $user->hei->established_at
                        ? $user->hei->established_at->format('Y-m-d')
                        : '',
                ]
            ]);
        }

        // For admin and superadmin, show general profile page
        return Inertia::render('Profile/Edit', [
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'account_type' => $user->account_type,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        // HEI users: validate expanded fields and sync both User + HEI records
        if ($user->isHEI() && $user->hei) {
            $validated = $request->validate([
                'name'           => 'required|string|max:255',
                'email'          => 'required|email|max:255|unique:users,email,' . $user->id,
                'address'        => 'nullable|string',
                'established_at' => 'nullable|date',
            ]);

            // Update the User record
            $user->update([
                'name'  => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Sync the HEI record (mirrors HEIManagementController::update behaviour)
            $user->hei->update([
                'name'           => $validated['name'],
                'email'          => $validated['email'],
                'address'        => $validated['address'] ?? null,
                'established_at' => $validated['established_at'] ?? null,
            ]);

            return redirect()->back()->with('success', 'Profile updated successfully.');
        }

        // Admin / superadmin: name + email only
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
}
