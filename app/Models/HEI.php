<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HEI extends Model
{
    use HasFactory;

    protected $table = 'heis';

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
        'code',
        'email',
        'phone',
        'address',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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
