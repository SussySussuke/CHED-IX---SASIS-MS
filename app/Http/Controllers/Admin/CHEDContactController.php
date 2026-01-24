<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CHEDContact;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CHEDContactController extends Controller
{
    public function index()
    {
        $contacts = CHEDContact::orderBy('order')->get();

        return Inertia::render('Admin/CHEDContacts', [
            'contacts' => $contacts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean'
        ]);

        // Get the highest order number and increment
        $maxOrder = CHEDContact::max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $contact = CHEDContact::create($validated);

        // Create audit log
        AuditLog::log(
            action: 'created',
            entityType: 'CHED Contact',
            entityId: $contact->id,
            entityName: $contact->name,
            description: "Created CHED contact: {$contact->name}",
            newValues: [
                'name' => $contact->name,
                'address' => $contact->address,
                'phone' => $contact->phone,
                'email' => $contact->email,
                'is_active' => $contact->is_active,
                'order' => $contact->order,
            ]
        );

        return redirect()->back()->with('success', 'Contact added successfully!');
    }

    public function update(Request $request, CHEDContact $contact)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean'
        ]);

        // Store old values for audit log
        $oldValues = [
            'name' => $contact->name,
            'address' => $contact->address,
            'phone' => $contact->phone,
            'email' => $contact->email,
            'is_active' => $contact->is_active,
        ];

        $contact->update($validated);

        // Create audit log
        AuditLog::log(
            action: 'updated',
            entityType: 'CHED Contact',
            entityId: $contact->id,
            entityName: $contact->name,
            description: "Updated CHED contact: {$contact->name}",
            oldValues: $oldValues,
            newValues: [
                'name' => $contact->name,
                'address' => $contact->address,
                'phone' => $contact->phone,
                'email' => $contact->email,
                'is_active' => $contact->is_active,
            ]
        );

        return redirect()->back()->with('success', 'Contact updated successfully!');
    }

    public function destroy(CHEDContact $contact)
    {
        // Store contact info for audit log before deletion
        $contactId = $contact->id;
        $contactName = $contact->name;
        $contactData = [
            'name' => $contact->name,
            'address' => $contact->address,
            'phone' => $contact->phone,
            'email' => $contact->email,
            'is_active' => $contact->is_active,
            'order' => $contact->order,
        ];

        $contact->delete();

        // Create audit log - use the original ID before deletion
        AuditLog::log(
            action: 'deleted',
            entityType: 'CHED Contact',
            entityId: $contactId,
            entityName: $contactName,
            description: "Deleted CHED contact: {$contactName}",
            oldValues: $contactData
        );

        return redirect()->back()->with('success', 'Contact deleted successfully!');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'contacts' => 'required|array',
            'contacts.*.id' => 'required|exists:ched_contacts,id',
            'contacts.*.order' => 'required|integer'
        ]);

        // Store old order for audit log
        $oldOrder = CHEDContact::orderBy('order')->get()->map(function($contact) {
            return [
                'id' => $contact->id,
                'name' => $contact->name,
                'order' => $contact->order
            ];
        })->toArray();

        foreach ($validated['contacts'] as $contactData) {
            CHEDContact::where('id', $contactData['id'])
                ->update(['order' => $contactData['order']]);
        }

        // Get new order
        $newOrder = CHEDContact::orderBy('order')->get()->map(function($contact) {
            return [
                'id' => $contact->id,
                'name' => $contact->name,
                'order' => $contact->order
            ];
        })->toArray();

        // Create audit log with meaningful information
        $contactNames = CHEDContact::pluck('name')->implode(', ');
        
        AuditLog::log(
            action: 'updated',
            entityType: 'CHED Contact',
            entityId: $validated['contacts'][0]['id'] ?? null, // Use first contact ID as reference
            entityName: 'Contact Display Order',
            description: 'Reordered CHED contacts display order',
            oldValues: ['order' => $oldOrder],
            newValues: ['order' => $newOrder]
        );

        return redirect()->back()->with('success', 'Contact order updated successfully!');
    }

    /**
     * API endpoint for HEI users to get active contacts
     */
    public function getActiveContacts()
    {
        $contacts = CHEDContact::getActive();
        return response()->json($contacts);
    }
}
