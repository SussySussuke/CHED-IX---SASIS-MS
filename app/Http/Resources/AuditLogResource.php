<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    /**
     * Maps raw DB column names to human-readable labels per entity type.
     * Add new entity types here as the system grows.
     */
    private const FIELD_LABELS = [
        'HEI' => [
            'uii'            => 'UII',
            'name'           => 'Name',
            'type'           => 'Type',
            'abbreviation'   => 'Abbreviation',
            'email'          => 'Email',
            'address'        => 'Address',
            'established_at' => 'Established',
            'is_active'      => 'Active',
        ],
        'User' => [
            'name'         => 'Name',
            'email'        => 'Email',
            'account_type' => 'Role',
            'is_active'    => 'Active',
        ],
        'CHED Contact' => [
            'name'      => 'Name',
            'address'   => 'Address',
            'phone'     => 'Phone',
            'email'     => 'Email',
            'is_active' => 'Active',
            'order'     => 'Display Order',
        ],
        'Submission' => [
            'status'         => 'Status',
            'triggered_by'   => 'Triggered By',
        ],
        'Setting' => [
            'annual_submission_deadline' => 'Submission Deadline',
            'maintenance_mode'           => 'Maintenance Mode',
        ],
    ];

    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'user_name'           => $this->user_name,
            'user_role'           => $this->user_role,
            'action'              => $this->action,
            'action_color'        => $this->action_color,
            'entity_type'         => $this->entity_type,
            'entity_type_color'   => $this->entity_type_color,
            'entity_name'         => $this->entity_name,
            'description'         => $this->description,
            'old_values'          => $this->formatValues($this->old_values),
            'new_values'          => $this->formatValues($this->new_values),
            'ip_address'          => $this->ip_address,
            'created_at'          => $this->created_at->format('M d, Y h:i A'),
            'created_at_relative' => $this->created_at->diffForHumans(),
        ];
    }

    /**
     * Renames raw DB column keys to human-readable labels for the given entity type.
     * Unknown keys are title-cased as a fallback.
     */
    private function formatValues(?array $values): ?array
    {
        if (empty($values)) {
            return $values;
        }

        $map = self::FIELD_LABELS[$this->entity_type] ?? [];

        $formatted = [];
        foreach ($values as $key => $value) {
            $label = $map[$key] ?? $this->toTitleCase($key);
            $formatted[$label] = $value;
        }

        return $formatted;
    }

    /** Converts snake_case to Title Case as a fallback for unmapped keys. */
    private function toTitleCase(string $key): string
    {
        return ucwords(str_replace('_', ' ', $key));
    }
}
