<?php

namespace App\Http\Requests\Summary;

use Illuminate\Foundation\Http\FormRequest;

/**
 * EvidenceRequest
 *
 * Shared validation for all summary evidence drilldown endpoints.
 * Every evidence route requires a valid academic year query parameter.
 * Category validation is intentionally left to the service layer since
 * each section has its own valid category set.
 */
class EvidenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by role middleware on the route group
    }

    public function rules(): array
    {
        return [
            'year' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'year.required' => 'Academic year is required.',
        ];
    }

    /** Convenience accessor used by controllers. */
    public function selectedYear(): string
    {
        return $this->query('year');
    }
}
