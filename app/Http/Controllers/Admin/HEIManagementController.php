<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HEI;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class HEIManagementController extends Controller
{
    public function index()
    {
        $heis = HEI::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($hei) {
                return [
                    'id' => $hei->id,
                    'uii' => $hei->uii,
                    'name' => $hei->name,
                    'type' => $hei->type,
                    'code' => $hei->code,
                    'email' => $hei->email,
                    'address' => $hei->address,
                    'is_active' => $hei->is_active,
                    'created_at' => $hei->created_at->format('M d, Y'),
                ];
            });

        return inertia('Admin/HEIAccounts', [
            'heis' => $heis,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'uii' => ['nullable', 'string', 'min:4', 'max:6', 'regex:/^[a-zA-Z0-9]+$/', 'unique:heis'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'unique:heis'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'address' => ['nullable', 'string'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        // Create HEI record
        $hei = HEI::create([
            'uii' => $validated['uii'] ?? null,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'code' => $validated['code'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'is_active' => true,
        ]);

        // Create associated user account
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'password'),
            'account_type' => 'hei',
            'hei_id' => $hei->id,
            'is_active' => true,
        ]);

        return redirect()->route('admin.hei-accounts')
            ->with('success', 'HEI account created successfully.');
    }

    public function update(Request $request, HEI $hei)
    {
        $rules = [
            'uii' => ['nullable', 'string', 'min:4', 'max:6', 'regex:/^[a-zA-Z0-9]+$/', 'unique:heis,uii,' . $hei->id],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'unique:heis,code,' . $hei->id],
            'email' => ['required', 'string', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        }

        $validated = $request->validate($rules);

        // Update HEI record
        $hei->update([
            'uii' => $validated['uii'] ?? null,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'code' => $validated['code'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        // Update associated user account
        $user = $hei->users()->where('account_type', 'hei')->first();
        if ($user) {
            $userUpdate = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'is_active' => $validated['is_active'],
            ];

            if ($request->filled('password')) {
                $userUpdate['password'] = Hash::make($validated['password']);
            } else if (!$user->password) {
                // If user doesn't have a password, set default
                $userUpdate['password'] = Hash::make('password');
            }

            $user->update($userUpdate);
        }

        return redirect()->route('admin.hei-accounts')
            ->with('success', 'HEI account updated successfully.');
    }

    public function destroy(HEI $hei)
    {
        // Delete associated users
        $hei->users()->delete();

        // Delete HEI record
        $hei->delete();

        return redirect()->route('admin.hei-accounts')
            ->with('success', 'HEI account deleted successfully.');
    }
}
