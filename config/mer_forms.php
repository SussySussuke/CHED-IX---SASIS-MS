<?php

/**
 * MER Forms Configuration
 * 
 * Defines which annexes belong to which MER form for CHED review
 * This mirrors the MER_FORM_GROUPINGS in resources/js/Config/formConfig.js
 * 
 * IMPORTANT: Keep this synchronized with formConfig.js
 * When you reorganize MER forms in formConfig.js, update this file too!
 * 
 * Structure:
 * - Key: MER form number (1, 2, 3)
 * - Value: Array of annex letters that belong to this form
 */

return [
    1 => ['A', 'B', 'C', 'C-1', 'D'],
    2 => ['E', 'F', 'G'],
    3 => ['H', 'I', 'I-1', 'J', 'K', 'L', 'L-1', 'M', 'N', 'N-1', 'O'],
];
