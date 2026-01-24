<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    // Disable updated_at since audit logs are immutable
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_role',
        'action',
        'entity_type',
        'entity_id',
        'entity_name',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create an audit log entry
     */
    public static function log(
        string $action,
        string $entityType,
        ?int $entityId,
        ?string $entityName,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        $user = auth()->user();
        
        return self::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_role' => $user->account_type,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_name' => $entityName,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get action badge color
     */
    public function getActionColorAttribute(): string
    {
        return match($this->action) {
            'created' => 'green',
            'updated' => 'blue',
            'deleted' => 'red',
            'approved' => 'green',
            'rejected' => 'red',
            'activated' => 'green',
            'deactivated' => 'orange',
            default => 'gray',
        };
    }

    /**
     * Get entity type badge color
     */
    public function getEntityTypeColorAttribute(): string
    {
        return match($this->entity_type) {
            'User' => 'purple',
            'HEI' => 'blue',
            'Submission' => 'indigo',
            'Setting' => 'gray',
            'CHED Contact' => 'blue',
            default => 'gray',
        };
    }
}
