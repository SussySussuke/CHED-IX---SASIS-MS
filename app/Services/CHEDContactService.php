<?php

namespace App\Services;

use App\Models\CHEDContact;
use App\Models\AuditLog;

class CHEDContactService
{
    public function list(): \Illuminate\Database\Eloquent\Collection
    {
        return CHEDContact::orderBy('order')->get();
    }

    public function create(array $validated): CHEDContact
    {
        $maxOrder = CHEDContact::max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $contact = CHEDContact::create($validated);

        AuditLog::log(
            action: 'created',
            entityType: 'CHED Contact',
            entityId: $contact->id,
            entityName: $contact->name,
            description: "Created CHED contact: {$contact->name}",
            newValues: [
                'name'      => $contact->name,
                'address'   => $contact->address,
                'phone'     => $contact->phone,
                'email'     => $contact->email,
                'is_active' => $contact->is_active,
                'order'     => $contact->order,
            ]
        );

        return $contact;
    }

    public function update(CHEDContact $contact, array $validated): CHEDContact
    {
        $oldValues = [
            'name'      => $contact->name,
            'address'   => $contact->address,
            'phone'     => $contact->phone,
            'email'     => $contact->email,
            'is_active' => $contact->is_active,
        ];

        $contact->update($validated);

        AuditLog::log(
            action: 'updated',
            entityType: 'CHED Contact',
            entityId: $contact->id,
            entityName: $contact->name,
            description: "Updated CHED contact: {$contact->name}",
            oldValues: $oldValues,
            newValues: [
                'name'      => $contact->name,
                'address'   => $contact->address,
                'phone'     => $contact->phone,
                'email'     => $contact->email,
                'is_active' => $contact->is_active,
            ]
        );

        return $contact;
    }

    public function delete(CHEDContact $contact): void
    {
        $contactId   = $contact->id;
        $contactName = $contact->name;
        $contactData = [
            'name'      => $contact->name,
            'address'   => $contact->address,
            'phone'     => $contact->phone,
            'email'     => $contact->email,
            'is_active' => $contact->is_active,
            'order'     => $contact->order,
        ];

        $contact->delete();

        AuditLog::log(
            action: 'deleted',
            entityType: 'CHED Contact',
            entityId: $contactId,
            entityName: $contactName,
            description: "Deleted CHED contact: {$contactName}",
            oldValues: $contactData
        );
    }

    public function reorder(array $contactsData): void
    {
        $oldOrder = CHEDContact::orderBy('order')->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'order' => $c->order])
            ->toArray();

        foreach ($contactsData as $item) {
            CHEDContact::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        $newOrder = CHEDContact::orderBy('order')->get()
            ->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'order' => $c->order])
            ->toArray();

        AuditLog::log(
            action: 'updated',
            entityType: 'CHED Contact',
            entityId: $contactsData[0]['id'] ?? null,
            entityName: 'Contact Display Order',
            description: 'Reordered CHED contacts display order',
            oldValues: ['order' => $oldOrder],
            newValues: ['order' => $newOrder]
        );
    }

    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return CHEDContact::getActive();
    }
}
