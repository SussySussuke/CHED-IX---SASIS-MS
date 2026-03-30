<?php

namespace App\Http\Controllers;

use App\Models\HEIReference;
use Illuminate\Http\Request;

class HEIReferenceController extends Controller
{
    public function search(Request $request)
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $results = HEIReference::where('name', 'like', "%{$q}%")
            ->orWhere('uii', 'like', "%{$q}%")
            ->orderBy('name')
            ->limit(15)
            ->get(['id', 'uii', 'name', 'type', 'email', 'telephone',
                   'street', 'barangay', 'municipality', 'province', 'region', 'zip']);

        return response()->json($results);
    }
}
