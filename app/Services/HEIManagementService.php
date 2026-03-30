<?php

namespace App\Services;

use App\Models\HEI;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;

class HEIManagementService
{
    /**
     * Return all HEIs formatted for the management view.
     */
    public function list(): array
    {
        return HEI::orderBy('created_at', 'desc')
            ->get()
            ->map(fn($hei) => [
                'id'             => $hei->id,
                'uii'            => $hei->uii,
                'name'           => $hei->name,
                'type'           => $hei->type,
                'abbreviation'   => $hei->abbreviation,
                'email'          => $hei->email,
                'address'        => $hei->address,
                'established_at' => $hei->established_at?->format('Y-m-d'),
                'is_active'      => $hei->is_active,
                'created_at'     => $hei->created_at->format('M d, Y'),
            ])
            ->all();
    }

    /**
     * Create a new HEI and its associated user account.
     */
    public function create(array $validated): HEI
    {
        $hei = HEI::create([
            'uii'            => $validated['uii'] ?? null,
            'name'           => $validated['name'],
            'type'           => $validated['type'],
            'abbreviation'   => $validated['abbreviation'],
            'email'          => $validated['email'],
            'address'        => $validated['address'] ?? null,
            'established_at' => $validated['established_at'] ?? null,
            'is_active'      => true,
        ]);

        User::create([
            'name'         => $validated['name'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password'] ?? 'password'),
            'account_type' => 'hei',
            'hei_id'       => $hei->id,
            'is_active'    => true,
        ]);

        AuditLog::log(
            action: 'created',
            entityType: 'HEI',
            entityId: $hei->id,
            entityName: $hei->name . ' (' . $hei->abbreviation . ')',
            description: 'Created new HEI account',
            newValues: [
                'uii'          => $hei->uii,
                'name'         => $hei->name,
                'type'         => $hei->type,
                'abbreviation' => $hei->abbreviation,
                'email'     => $hei->email,
                'address'   => $hei->address,
                'is_active' => true,
            ]
        );

        return $hei;
    }

    /**
     * Update an existing HEI and its associated user account.
     */
    public function update(HEI $hei, array $validated, bool $passwordProvided, ?string $rawPassword): HEI
    {
        $user = $hei->users()->where('account_type', 'hei')->first();

        $oldValues = [
            'uii'            => $hei->uii,
            'name'           => $hei->name,
            'type'           => $hei->type,
            'abbreviation'   => $hei->abbreviation,
            'email'          => $hei->email,
            'address'        => $hei->address,
            'established_at' => $hei->established_at?->format('Y-m-d'),
            'is_active'      => $hei->is_active,
        ];

        $hei->update([
            'uii'            => $validated['uii'] ?? null,
            'name'           => $validated['name'],
            'type'           => $validated['type'],
            'abbreviation'   => $validated['abbreviation'],
            'email'          => $validated['email'],
            'address'        => $validated['address'] ?? null,
            'established_at' => $validated['established_at'] ?? null,
            'is_active'      => $validated['is_active'],
        ]);

        if ($user) {
            $userUpdate = [
                'name'      => $validated['name'],
                'email'     => $validated['email'],
                'is_active' => $validated['is_active'],
            ];

            if ($passwordProvided) {
                $userUpdate['password'] = Hash::make($rawPassword);
            } elseif (!$user->password) {
                $userUpdate['password'] = Hash::make('password');
            }

            $user->update($userUpdate);
        }

        $newValues = [
            'uii'            => $hei->uii,
            'name'           => $hei->name,
            'type'           => $hei->type,
            'abbreviation'   => $hei->abbreviation,
            'email'          => $hei->email,
            'address'        => $hei->address,
            'established_at' => $hei->established_at?->format('Y-m-d'),
            'is_active'      => $hei->is_active,
        ];

        $changes = [];
        foreach ($oldValues as $key => $oldValue) {
            if ($oldValue !== $newValues[$key]) {
                $changes[] = $key === 'is_active'
                    ? ($newValues[$key] ? 'activated' : 'deactivated')
                    : $key;
            }
        }
        if ($passwordProvided) {
            $changes[] = 'password';
        }

        AuditLog::log(
            action: 'updated',
            entityType: 'HEI',
            entityId: $hei->id,
            entityName: $hei->name . ' (' . $hei->abbreviation . ')',
            description: 'Updated HEI account' . (!empty($changes) ? ': ' . implode(', ', $changes) : ''),
            oldValues: $oldValues,
            newValues: $newValues
        );

        return $hei;
    }

    /**
     * Delete an HEI and all associated user accounts.
     */
    public function delete(HEI $hei): void
    {
        $heiData = [
            'uii'          => $hei->uii,
            'name'         => $hei->name,
            'type'         => $hei->type,
            'abbreviation' => $hei->abbreviation,
            'email'     => $hei->email,
            'address'   => $hei->address,
            'is_active' => $hei->is_active,
        ];

        $heiId   = $hei->id;
        $heiName = $hei->name . ' (' . $hei->abbreviation . ')';

        $hei->users()->delete();
        $hei->delete();

        AuditLog::log(
            action: 'deleted',
            entityType: 'HEI',
            entityId: $heiId,
            entityName: $heiName,
            description: 'Deleted HEI account and associated user accounts',
            oldValues: $heiData
        );
    }
}
