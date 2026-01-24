<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SystemAuditLogController extends Controller
{
    /**
     * Display all system audit logs (both superadmin and admin actions)
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Apply filters if provided
        if ($request->filled('user_role')) {
            $query->where('user_role', $request->user_role);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate(50)->through(function ($log) {
            return [
                'id' => $log->id,
                'user_name' => $log->user_name,
                'user_role' => $log->user_role,
                'action' => $log->action,
                'action_color' => $log->action_color,
                'entity_type' => $log->entity_type,
                'entity_type_color' => $log->entity_type_color,
                'entity_name' => $log->entity_name,
                'description' => $log->description,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->format('M d, Y h:i A'),
                'created_at_relative' => $log->created_at->diffForHumans(),
            ];
        });

        // Get filter options
        $userRoles = AuditLog::distinct()
            ->pluck('user_role')
            ->sort()
            ->values();

        $actions = AuditLog::distinct()
            ->pluck('action')
            ->sort()
            ->values();

        $entityTypes = AuditLog::distinct()
            ->pluck('entity_type')
            ->sort()
            ->values();

        return inertia('SuperAdmin/SystemAuditLogs', [
            'logs' => $logs,
            'filters' => [
                'user_roles' => $userRoles,
                'actions' => $actions,
                'entity_types' => $entityTypes,
            ],
            'queryParams' => $request->only(['user_role', 'action', 'entity_type', 'date_from', 'date_to']),
        ]);
    }
}
