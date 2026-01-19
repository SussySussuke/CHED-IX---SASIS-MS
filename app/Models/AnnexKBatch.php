<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AnnexKBatch extends Model
{
    use HasFactory;

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
            if (!$model->batch_id) {
                $model->batch_id = (string) Str::uuid();
            }
        });
    }

    public function committees()
    {
        return $this->hasMany(AnnexKCommittee::class, 'batch_id', 'batch_id');
    }

    public function hei()
    {
        return $this->belongsTo(Hei::class);
    }
}
