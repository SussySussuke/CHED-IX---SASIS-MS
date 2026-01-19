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
                    'id' => $user->hei->id,
                    'name' => $user->hei->name,
                    'email' => $user->hei->email,
                    'type' => $user->hei->type,
                    'code' => $user->hei->code,
                ]
            ]);
        }

        // For admin and superadmin, show general profile page
        return Inertia::render('Profile/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'account_type' => $user->account_type,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
}
