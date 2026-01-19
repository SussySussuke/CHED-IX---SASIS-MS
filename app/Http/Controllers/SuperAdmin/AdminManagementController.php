<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AdminManagementController extends Controller
{
    public function index()
    {
        $admins = User::where('account_type', 'admin')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'is_active' => $admin->is_active,
                    'created_at' => $admin->created_at->format('M d, Y'),
                ];
            });

        return inertia('SuperAdmin/AdminManagement', [
            'admins' => $admins,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'account_type' => 'admin',
            'is_active' => true,
        ]);

        return redirect()->route('superadmin.admin-management')
            ->with('success', 'Administrator created successfully.');
    }

    public function update(Request $request, User $admin)
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $admin->id],
            'is_active' => ['required', 'boolean'],
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        }

        $validated = $request->validate($rules);

        // Update password only if provided
        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $admin->update($validated);

        return redirect()->route('superadmin.admin-management')
            ->with('success', 'Administrator updated successfully.');
    }

    public function destroy(User $admin)
    {
        if ($admin->account_type !== 'admin') {
            return redirect()->route('superadmin.admin-management')
                ->with('error', 'Cannot delete non-admin users.');
        }

        $admin->delete();

        return redirect()->route('superadmin.admin-management')
            ->with('success', 'Administrator deleted successfully.');
    }
}
