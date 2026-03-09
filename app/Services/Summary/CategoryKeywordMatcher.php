<?php

namespace App\Services\Summary;

/**
 * CategoryKeywordMatcher
 *
 * Single source of truth for all keyword-to-category maps used across
 * the Summary section services. Each section service calls the relevant
 * match*() method here instead of defining its own keyword list.
 */
class CategoryKeywordMatcher
{
    // ── Info-Orientation ──────────────────────────────────────────────────────

    public const INFO_ORIENTATION_KEYWORDS = [
        'campus_orientation' => [
            'orientation', 'freshmen', 'freshman', 'new student', 'welcome', 'induction',
        ],
        'gender_sensitivity' => [
            'gender', 'vawc', 'women', 'harassment', 'sensitivity', 'safe space',
        ],
        'anti_hazing' => [
            'hazing', 'anti-hazing', 'bullying', 'fraternity',
        ],
        'substance_abuse' => [
            'substance', 'drug', 'alcohol', 'tobacco', 'smoking', 'vape', 'vaping',
        ],
        'sexual_health' => [
            'sexual', 'reproductive', 'hiv', 'aids', 'std', 'sti', 'pregnancy',
        ],
        'mental_health' => [
            'mental', 'wellness', 'well-being', 'wellbeing', 'counseling',
            'stress', 'anxiety', 'depression', 'psychological',
        ],
        'disaster_risk' => [
            'disaster', 'earthquake', 'fire drill', 'emergency',
            'evacuation', 'preparedness', 'risk reduction',
        ],
    ];

    // ── Personnel ─────────────────────────────────────────────────────────────

    public const PERSONNEL_ROLE_KEYWORDS = [
        'registered_guidance_counselors' => [
            'registered guidance counselor',
        ],
        'guidance_counseling' => [
            'guidance counselor', 'guidance & counseling', 'guidance and counseling',
            'school counselor', 'guidance counseling', 'mental health counselor',
            'psychological services', 'psychologist',
        ],
        'career_guidance_placement' => [
            'career guidance', 'career counselor', 'career development',
            'placement officer', 'job placement', 'ojt coordinator',
            'internship coordinator', 'practicum coordinator', 'industry linkages',
            'tracer study', 'alumni relations',
        ],
        'registrars' => [
            'registrar',
        ],
        'admission_personnel' => [
            'admission officer', 'admissions coordinator', 'admission personnel',
            'enrollment officer', 'admissions officer',
        ],
        'physician' => [
            'physician', 'medical officer', 'school physician', 'doctor',
        ],
        'dentist' => [
            'dentist', 'dental health', 'school dentist',
        ],
        'nurse' => [
            'nurse', 'nursing personnel', 'school nurse',
        ],
        'other_medical_health' => [
            'medical technologist', 'pharmacist', 'pharmacy', 'nutritionist',
            'dietitian', 'sanitation officer', 'health services coordinator',
            'medical records', 'first aid', 'health education',
        ],
        'security_personnel' => [
            'security personnel', 'security officer', 'campus security',
            'safety officer', 'traffic',
        ],
        'food_service_personnel' => [
            'food service', 'cafeteria', 'canteen manager', 'food safety',
            'nutrition program',
        ],
        'cultural_affairs' => [
            'cultural affairs', 'cultural activities', 'arts & culture',
            'arts and culture', 'campus ministry', 'chaplain',
        ],
        'sports_development' => [
            'sports development', 'athletics coordinator', 'sports & recreation',
            'sports and recreation', 'varsity coach', 'physical education',
        ],
        'student_discipline' => [
            'discipline', 'conduct officer', 'student discipline',
        ],
        'scholarship_personnel' => [
            'scholarship coordinator', 'scholarship officer', 'financial aid',
            'student grants',
        ],
        'housing_residential' => [
            'housing officer', 'dormitory manager', 'dormitory supervisor',
            'residence hall', 'residential life', 'dorm personnel',
            'hostel manager',
        ],
        'pwd_special_needs' => [
            'pwd', 'disability support', 'special needs', 'sped coordinator',
            'inclusive education', 'learning support', 'accessibility services',
            'persons with disabilities',
        ],
        'student_governance' => [
            'student government', 'student council', 'student governance',
        ],
        'student_publication' => [
            'student publication', 'campus journalism', 'student media',
        ],
        'multi_faith' => [
            'multi-faith', 'multifaith', 'religious affairs', 'chaplain',
            'campus ministry',
        ],
    ];

    // ── Guidance Counselling ──────────────────────────────────────────────────

    public const GUIDANCE_COUNSELLING_KEYWORDS = [
        'individual_inventory' => [
            'individual inventory', 'individual record', 'case study', 'intake form',
            'personal data', 'student record', 'cumulative record',
        ],
        'counseling_service' => [
            'counseling', 'counselling', 'individual counseling', 'group counseling',
            'crisis counseling', 'crisis intervention', 'psychosocial',
        ],
        'referral' => [
            'referral', 'refer', 'endorsement', 'case referral',
        ],
        'testing_appraisal' => [
            'testing', 'appraisal', 'psychological test', 'aptitude', 'interest inventory',
            'assessment', 'evaluation test', 'intelligence test', 'personality test',
        ],
        'follow_up' => [
            'follow-up', 'follow up', 'followup', 'monitoring', 'progress check',
        ],
        'peer_facilitating' => [
            'peer facilitat', 'peer helper', 'peer counselor', 'peer educator',
            'peer support', 'peer program', 'peer activity',
        ],
    ];

    // ── Career / Job Placement ────────────────────────────────────────────────

    public const CAREER_JOB_KEYWORDS = [
        'labor_empowerment' => [
            'labor empowerment', 'career guidance conference', 'graduating student',
            'ra 11551', 'republic act 11551', 'career congress', 'career readiness',
            'pre-employment', 'employment readiness', 'career conference',
        ],
        'job_fairs' => [
            'job fair', 'jobfair', 'job expo', 'career fair', 'career expo',
            'dole', 'peso', 'employment fair', 'recruitment fair',
            'hiring fair', 'job hunt', 'job market',
        ],
        'phil_job_net' => [
            'philjobnet', 'phil job net', 'jobnet', 'job portal',
            'job registration', 'online job registration', 'career portal',
            'employment portal', 'job matching',
        ],
        'career_counseling' => [
            'career counseling', 'career counselling', 'vocational counseling',
            'vocational counselling', 'employment counseling', 'job counseling',
            'career advising', 'career advice', 'career planning',
            'career assessment', 'career coaching',
        ],
    ];

    // ── Health Services ───────────────────────────────────────────────────────

    public const HEALTH_KEYWORDS = [
        'medical_checkup' => [
            'medical', 'medical check', 'check-up', 'checkup', 'check up',
            'consultation', 'physician', 'clinic', 'annual physical',
            'physical exam', 'health exam', 'health check', 'medical exam',
            'general check', 'medical consultation',
        ],
        'dental_checkup' => [
            'dental', 'dentist', 'oral health', 'oral exam', 'dental check',
            'dental exam', 'teeth', 'tooth', 'dental consultation',
            'dental clinic', 'oral checkup',
        ],
        'seminar_educational' => [
            'seminar', 'educational tour', 'tour', 'field trip', 'webinar',
            'lecture', 'forum', 'symposium', 'health seminar', 'health forum',
            'health education', 'wellness seminar', 'talk', 'orientation',
            'health awareness', 'first aid', 'training',
        ],
    ];

    // ── Match helpers ─────────────────────────────────────────────────────────

    /** Returns all Info-Orientation category keys that match the given text. */
    public function matchInfoOrientation(string $text): array
    {
        return $this->match(self::INFO_ORIENTATION_KEYWORDS, $text);
    }

    /** Returns all Personnel role category keys that match the given position text. */
    public function matchPersonnel(string $text): array
    {
        return $this->match(self::PERSONNEL_ROLE_KEYWORDS, $text);
    }

    /** Returns all Guidance Counselling category keys that match the given text. */
    public function matchGuidanceCounselling(string $text): array
    {
        return $this->match(self::GUIDANCE_COUNSELLING_KEYWORDS, $text);
    }

    /** Returns all Career/Job category keys that match the given text. */
    public function matchCareerJob(string $text): array
    {
        return $this->match(self::CAREER_JOB_KEYWORDS, $text);
    }

    /** Returns all Health category keys that match the given text. */
    public function matchHealth(string $text): array
    {
        return $this->match(self::HEALTH_KEYWORDS, $text);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private function match(array $keywordMap, string $text): array
    {
        $lower   = strtolower($text);
        $matched = [];

        foreach ($keywordMap as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    $matched[] = $category;
                    break; // one keyword per category is enough
                }
            }
        }

        return $matched;
    }
}
