<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\CHEDContact;
use App\Services\CHEDContactService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CHEDContactController extends Controller
{
    public function __construct(private CHEDContactService $service) {}

    public function index()
    {
        return Inertia::render('SuperAdmin/CHEDContacts', [
            'contacts' => $this->service->list(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'address'   => 'nullable|string',
            'phone'     => 'nullable|string|max:50',
            'email'     => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $this->service->create($validated);

        return redirect()->back()->with('success', 'Contact added successfully!');
    }

    public function update(Request $request, CHEDContact $contact)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'address'   => 'nullable|string',
            'phone'     => 'nullable|string|max:50',
            'email'     => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $this->service->update($contact, $validated);

        return redirect()->back()->with('success', 'Contact updated successfully!');
    }

    public function destroy(CHEDContact $contact)
    {
        $this->service->delete($contact);

        return redirect()->back()->with('success', 'Contact deleted successfully!');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'contacts'          => 'required|array',
            'contacts.*.id'     => 'required|exists:ched_contacts,id',
            'contacts.*.order'  => 'required|integer',
        ]);

        $this->service->reorder($validated['contacts']);

        return redirect()->back()->with('success', 'Contact order updated successfully!');
    }
}
