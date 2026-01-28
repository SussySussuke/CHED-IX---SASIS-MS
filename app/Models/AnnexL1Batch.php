<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AnnexL1Batch extends Model
{
    use HasFactory;

    protected $table = 'annex_l1_batches';

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

    public function internationalServices()
    {
        return $this->hasMany(AnnexL1InternationalService::class, 'batch_id', 'batch_id');
    }

    public function hei()
    {
        return $this->belongsTo(Hei::class);
    }
}
