<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\HEI;
use App\Services\HEIManagementService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class HEIManagementController extends Controller
{
    public function __construct(private HEIManagementService $service) {}

    public function index()
    {
        return inertia('SuperAdmin/HEIAccounts', [
            'heis' => $this->service->list(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'uii'            => ['nullable', 'string', 'min:4', 'max:6', 'regex:/^[a-zA-Z0-9]+$/', 'unique:heis'],
            'name'           => ['required', 'string', 'max:255'],
            'type'           => ['required', 'string', 'max:100'],
            'code'           => ['required', 'string', 'max:50', 'unique:heis'],
            'email'          => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'address'        => ['nullable', 'string'],
            'established_at' => ['nullable', 'date'],
            'password'       => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $this->service->create($validated);

        return redirect()->route('superadmin.hei-accounts')
            ->with('success', 'HEI account created successfully.');
    }

    public function update(Request $request, HEI $hei)
    {
        $user = $hei->users()->where('account_type', 'hei')->first();

        $rules = [
            'uii'            => ['nullable', 'string', 'min:4', 'max:6', 'regex:/^[a-zA-Z0-9]+$/', 'unique:heis,uii,' . $hei->id],
            'name'           => ['required', 'string', 'max:255'],
            'type'           => ['required', 'string', 'max:100'],
            'code'           => ['required', 'string', 'max:50', 'unique:heis,code,' . $hei->id],
            'email'          => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . ($user?->id ?? 'NULL')],
            'address'        => ['nullable', 'string'],
            'established_at' => ['nullable', 'date'],
            'is_active'      => ['required', 'boolean'],
        ];

        if ($request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Password::defaults()];
        }

        $validated = $request->validate($rules);

        $this->service->update($hei, $validated, $request->filled('password'), $request->input('password'));

        return redirect()->route('superadmin.hei-accounts')
            ->with('success', 'HEI account updated successfully.');
    }

    public function destroy(HEI $hei)
    {
        $this->service->delete($hei);

        return redirect()->route('superadmin.hei-accounts')
            ->with('success', 'HEI account deleted successfully.');
    }
}
