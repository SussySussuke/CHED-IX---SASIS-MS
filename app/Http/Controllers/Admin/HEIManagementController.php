<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HEI;
use App\Models\User;
use App\Models\AuditLog;
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
                    'established_at' => $hei->established_at ? $hei->established_at->format('Y-m-d') : null,
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
            'established_at' => ['nullable', 'date'],
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
            'established_at' => $validated['established_at'] ?? null,
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

        // Create audit log
        AuditLog::log(
            action: 'created',
            entityType: 'HEI',
            entityId: $hei->id,
            entityName: $hei->name . ' (' . $hei->code . ')',
            description: 'Created new HEI account',
            newValues: [
                'uii' => $hei->uii,
                'name' => $hei->name,
                'type' => $hei->type,
                'code' => $hei->code,
                'email' => $hei->email,
                'address' => $hei->address,
                'is_active' => true,
            ]
        );

        return redirect()->route('admin.hei-accounts')
            ->with('success', 'HEI account created successfully.');
    }

    public function update(Request $request, HEI $hei)
    {
        // Get the user associated with this HEI
        $user = $hei->users()->where('account_type', 'hei')->first();
        
        $rules = [
            'uii' => ['nullable', 'string', 'min:4', 'max:6', 'regex:/^[a-zA-Z0-9]+$/', 'unique:heis,uii,' . $hei->id],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'unique:heis,code,' . $hei->id],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . ($user ? $user->id : 'NULL')],
            'address' => ['nullable', 'string'],
            'established_at' => ['nullable', 'date'],
            'is_active' => ['required', 'boolean'],
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        }

        $validated = $request->validate($rules);

        // Capture old values for audit
        $oldValues = [
            'uii' => $hei->uii,
            'name' => $hei->name,
            'type' => $hei->type,
            'code' => $hei->code,
            'email' => $hei->email,
            'address' => $hei->address,
            'established_at' => $hei->established_at ? $hei->established_at->format('Y-m-d') : null,
            'is_active' => $hei->is_active,
        ];

        // Update HEI record
        $hei->update([
            'uii' => $validated['uii'] ?? null,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'code' => $validated['code'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'established_at' => $validated['established_at'] ?? null,
            'is_active' => $validated['is_active'],
        ]);

        // Update associated user account (user was fetched earlier)
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

        // Prepare new values for audit (exclude password)
        $newValues = [
            'uii' => $hei->uii,
            'name' => $hei->name,
            'type' => $hei->type,
            'code' => $hei->code,
            'email' => $hei->email,
            'address' => $hei->address,
            'established_at' => $hei->established_at ? $hei->established_at->format('Y-m-d') : null,
            'is_active' => $hei->is_active,
        ];

        // Determine what changed
        $changes = [];
        foreach ($oldValues as $key => $oldValue) {
            if ($oldValue !== $newValues[$key]) {
                if ($key === 'is_active') {
                    $changes[] = $newValues[$key] ? 'activated' : 'deactivated';
                } else {
                    $changes[] = $key;
                }
            }
        }
        if ($request->filled('password')) $changes[] = 'password';

        $description = 'Updated HEI account';
        if (!empty($changes)) {
            $description .= ': ' . implode(', ', $changes);
        }

        // Create audit log
        AuditLog::log(
            action: 'updated',
            entityType: 'HEI',
            entityId: $hei->id,
            entityName: $hei->name . ' (' . $hei->code . ')',
            description: $description,
            oldValues: $oldValues,
            newValues: $newValues
        );

        return redirect()->route('admin.hei-accounts')
            ->with('success', 'HEI account updated successfully.');
    }

    public function destroy(HEI $hei)
    {
        // Capture data before deletion
        $heiData = [
            'uii' => $hei->uii,
            'name' => $hei->name,
            'type' => $hei->type,
            'code' => $hei->code,
            'email' => $hei->email,
            'address' => $hei->address,
            'is_active' => $hei->is_active,
        ];

        $heiId = $hei->id;
        $heiName = $hei->name . ' (' . $hei->code . ')';

        // Delete associated users
        $hei->users()->delete();

        // Delete HEI record
        $hei->delete();

        // Create audit log
        AuditLog::log(
            action: 'deleted',
            entityType: 'HEI',
            entityId: $heiId,
            entityName: $heiName,
            description: 'Deleted HEI account and associated user accounts',
            oldValues: $heiData
        );

        return redirect()->route('admin.hei-accounts')
            ->with('success', 'HEI account deleted successfully.');
    }
}
