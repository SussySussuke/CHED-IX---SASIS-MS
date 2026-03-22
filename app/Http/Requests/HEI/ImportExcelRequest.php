<?php

namespace App\Http\Requests\HEI;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ImportExcelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->role === 'hei';
    }

    public function rules(): array
    {
        return [
            'file'          => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
            'academic_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required'          => 'Please select an Excel file to import.',
            'file.mimes'             => 'Only .xlsx and .xls files are accepted.',
            'file.max'               => 'File size must not exceed 10MB.',
            'academic_year.required' => 'Academic year is required.',
            'academic_year.regex'    => 'Academic year must be in YYYY-YYYY format.',
        ];
    }
}
