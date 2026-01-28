<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AnnexC1Batch extends Model
{
    protected $table = 'annex_c1_batches';

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

    public function programs()
    {
        return $this->hasMany(AnnexC1Program::class, 'batch_id', 'batch_id');
    }

    public function getProgramsCountAttribute()
    {
        return $this->programs()->count();
    }
}
