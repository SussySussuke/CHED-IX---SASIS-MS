<?php

/**
 * Annex Metadata Configuration
 * 
 * SINGLE SOURCE OF TRUTH for annex metadata in PHP
 * This mirrors the ANNEX_METADATA in resources/js/Config/formConfig.js
 * 
 * IMPORTANT: Keep this synchronized with formConfig.js
 * When you add/modify an annex in formConfig.js, update this file too!
 * 
 * Structure:
 * - serviceNumber: The number displayed in MER forms (e.g., "1", "2", "3")
 * - annexType: Database column/type identifier (e.g., "annex_a", "annex_c_1")
 * - name: Human-readable service name
 */

return [
    'A' => [
        'serviceNumber' => '1',
        'annexType' => 'annex_a',
        'name' => 'Information and Orientation Services',
    ],
    'B' => [
        'serviceNumber' => '2',
        'annexType' => 'annex_b',
        'name' => 'Guidance and Counseling Service',
    ],
    'C' => [
        'serviceNumber' => '3',
        'annexType' => 'annex_c',
        'name' => 'Career and Job Placement Services',
    ],
    'C-1' => [
        'serviceNumber' => '4',
        'annexType' => 'annex_c_1',
        'name' => 'Economic Enterprise Development',
    ],
    'D' => [
        'serviceNumber' => '5',
        'annexType' => 'annex_d',
        'name' => 'Student Handbook',
    ],
    'E' => [
        'serviceNumber' => '1',
        'annexType' => 'annex_e',
        'name' => 'Student Organizations',
    ],
    'F' => [
        'serviceNumber' => '5',
        'annexType' => 'annex_f',
        'name' => 'Student Discipline',
    ],
    'G' => [
        'serviceNumber' => '6',
        'annexType' => 'annex_g',
        'name' => 'Student Publication',
    ],
    'H' => [
        'serviceNumber' => '1',
        'annexType' => 'annex_h',
        'name' => 'Admission Services',
    ],
    'I' => [
        'serviceNumber' => '2',
        'annexType' => 'annex_i',
        'name' => 'Scholarships/Financial Assistance',
    ],
    'I-1' => [
        'serviceNumber' => '3',
        'annexType' => 'annex_i_1',
        'name' => 'Food Services',
    ],
    'J' => [
        'serviceNumber' => '4',
        'annexType' => 'annex_j',
        'name' => 'Health Services',
    ],
    'K' => [
        'serviceNumber' => '5',
        'annexType' => 'annex_k',
        'name' => 'Safety and Security Committees',
    ],
    'L' => [
        'serviceNumber' => '6',
        'annexType' => 'annex_l',
        'name' => 'Student Housing',
    ],
    'L-1' => [
        'serviceNumber' => '7',
        'annexType' => 'annex_l_1',
        'name' => 'Foreign/International Students Services',
    ],
    'M' => [
        'serviceNumber' => '8',
        'annexType' => 'annex_m',
        'name' => 'Sports Development',
    ],
    'N' => [
        'serviceNumber' => '9',
        'annexType' => 'annex_n',
        'name' => 'Culture and the Arts',
    ],
    'N-1' => [
        'serviceNumber' => '10',
        'annexType' => 'annex_n_1',
        'name' => 'Sports Development Program',
    ],
    'O' => [
        'serviceNumber' => '11',
        'annexType' => 'annex_o',
        'name' => 'Community Involvement/Outreach',
    ],
];
