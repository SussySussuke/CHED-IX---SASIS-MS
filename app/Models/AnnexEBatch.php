<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AnnexEBatch extends Model
{
    protected $table = 'annex_e_batches';

    protected $fillable = [
        'batch_id',
        'hei_id',
        'academic_year',
        'status',
        'request_notes',
        'cancelled_notes',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->batch_id)) {
                $model->batch_id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function hei()
    {
        return $this->belongsTo(HEI::class, 'hei_id');
    }

    public function organizations()
    {
        return $this->hasMany(AnnexEOrganization::class, 'batch_id', 'batch_id');
    }

    public function getOrganizationsCountAttribute()
    {
        return $this->organizations()->count();
    }
}
