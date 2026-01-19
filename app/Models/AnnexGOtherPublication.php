<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexGOtherPublication extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'name_of_publication',
        'department_unit_in_charge',
        'type_of_publication',
    ];

    public function submission()
    {
        return $this->belongsTo(AnnexGSubmission::class, 'submission_id', 'submission_id');
    }
}
