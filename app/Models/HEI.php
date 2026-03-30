<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Database\Factories\HEIFactory;

class HEI extends Model
{
    use HasFactory;

    protected $table = 'heis';

    protected static function newFactory(): HEIFactory
    {
        return HEIFactory::new();
    }

    // Use 'id' as primary key (default behavior, but explicit for clarity)
    protected $primaryKey = 'id';

    // Primary key is auto-incrementing
    public $incrementing = true;

    // Primary key type
    protected $keyType = 'int';

    protected $fillable = [
        'uii',
        'name',
        'type',
        'abbreviation',
        'email',
        'phone',
        'address',
        'established_at',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'established_at' => 'date',
    ];

    // Relationships
    public function users()
    {
        return $this->hasMany(User::class, 'hei_id');
    }

    public function annexABatches()
    {
        return $this->hasMany(AnnexABatch::class, 'hei_id');
    }
}
