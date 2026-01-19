<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnexMStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'category',
        'subcategory',
        'year_data',
        'is_subtotal',
        'display_order',
    ];

    protected $casts = [
        'year_data' => 'array',
        'is_subtotal' => 'boolean',
        'display_order' => 'integer',
    ];

    // Predefined structure for the fixed matrix
    const STRUCTURE = [
        [
            'category' => 'A. Persons with Disabilities',
            'subcategories' => [
                'Psychosocial',
                'Disability due to chronic illness',
                'Learning',
                'Visual / Hearing',
                'Orthopedic',
                'Communication',
                'Medical',
            ],
            'has_subtotal' => true,
        ],
        [
            'category' => 'B. Indigenous People',
            'subcategories' => [], // User-addable
            'has_subtotal' => true,
        ],
        [
            'category' => 'C. Dependents of Solo Parents / Solo Parents',
            'subcategories' => [
                'Living with Mother/Father only',
                'Young Parent',
            ],
            'has_subtotal' => true,
        ],
        [
            'category' => 'D. Other students with special needs',
            'subcategories' => [], // User-addable
            'has_subtotal' => false,
        ],
    ];

    public function batch()
    {
        return $this->belongsTo(AnnexMBatch::class, 'batch_id', 'batch_id');
    }

    /**
     * Calculate total enrollment for this row across all years
     */
    public function getTotalEnrollmentAttribute()
    {
        if (!$this->year_data) {
            return 0;
        }

        $total = 0;
        foreach ($this->year_data as $year => $data) {
            $total += intval($data['enrollment'] ?? 0);
        }
        return $total;
    }

    /**
     * Calculate total graduates for this row across all years
     */
    public function getTotalGraduatesAttribute()
    {
        if (!$this->year_data) {
            return 0;
        }

        $total = 0;
        foreach ($this->year_data as $year => $data) {
            $total += intval($data['graduates'] ?? 0);
        }
        return $total;
    }

    /**
     * Get enrollment for a specific academic year
     */
    public function getEnrollmentForYear(string $academicYear): int
    {
        return intval($this->year_data[$academicYear]['enrollment'] ?? 0);
    }

    /**
     * Get graduates for a specific academic year
     */
    public function getGraduatesForYear(string $academicYear): int
    {
        return intval($this->year_data[$academicYear]['graduates'] ?? 0);
    }
}
