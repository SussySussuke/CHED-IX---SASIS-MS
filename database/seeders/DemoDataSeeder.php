<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\HEI;
use App\Models\User;
use Faker\Factory as Faker;

/**
 * DemoDataSeeder
 *
 * Seeds THREE complete academic years of realistic demo data:
 *   - AY 2024-2025  (status = 'submitted')
 *   - AY 2025-2026  (status = 'submitted')
 *   - AY 2026-2027  (status = 'submitted')
 *
 * HEI #1 (Demo State University)     — FULL DATA, all 3 years
 * HEI #2 (Lakeview College)          — FULL DATA, all 3 years
 * HEI #3 (Mindanao Tech Institute)   — PARTIAL ~70%, all 3 years
 * HEI #4 (Visayas Christian College) — PARTIAL ~40%, all 3 years
 * HEI #5 (Cordillera Arts College)   — PARTIAL ~20%, all 3 years
 *
 * Covers: Summary, Annex A–O (incl. C1, I1, L1, N1), MER1–MER4A
 */
class DemoDataSeeder extends Seeder
{
    private \Faker\Generator $faker;

    private const YEARS = [
        '2024-2025',
        '2025-2026',
        '2026-2027',
    ];

    private const AY_DATES = [
        '2024-2025' => ['2024-06-01', '2025-05-31'],
        '2025-2026' => ['2025-06-01', '2026-05-31'],
        '2026-2027' => ['2026-06-01', '2027-05-31'],
    ];

    public function run(): void
    {
        $this->faker = Faker::create('en_PH');

        $this->command->info('🌱 Creating demo HEI and user accounts...');
        $hei = $this->createHeiAndUsers();

        foreach (self::YEARS as $ay) {
            $this->command->info("📅 Seeding AY {$ay}...");
            $this->seedYear($hei, $ay);
        }

        $this->command->info('✅ All demo data seeded for: ' . $hei->name);
    }

    // =========================================================================
    // ENTRY POINT PER YEAR
    // =========================================================================

    private function seedYear(HEI $hei, string $ay): void
    {
        $this->seedSummary($hei, $ay);
        $this->seedAnnexA($hei, $ay);
        $this->seedAnnexB($hei, $ay);
        $this->seedAnnexC($hei, $ay);
        $this->seedAnnexC1($hei, $ay);
        $this->seedAnnexD($hei, $ay);
        $this->seedAnnexE($hei, $ay);
        $this->seedAnnexF($hei, $ay);
        $this->seedAnnexG($hei, $ay);
        $this->seedAnnexH($hei, $ay);
        $this->seedAnnexI($hei, $ay);
        $this->seedAnnexI1($hei, $ay);
        $this->seedAnnexJ($hei, $ay);
        $this->seedAnnexK($hei, $ay);
        $this->seedAnnexL($hei, $ay);
        $this->seedAnnexL1($hei, $ay);
        $this->seedAnnexM($hei, $ay);
        $this->seedAnnexN($hei, $ay);
        $this->seedAnnexN1($hei, $ay);
        $this->seedAnnexO($hei, $ay);
        $this->seedMer1($hei, $ay);
        $this->seedMer2($hei, $ay);
        $this->seedMer3($hei, $ay);
        $this->seedMer4a($hei, $ay);
    }

    // =========================================================================
    // HEI + USERS
    // =========================================================================

    private function createHeiAndUsers(): HEI
    {
        // ── HEI #1 — Demo State University (SUC) ─────────────────────────────
        $hei = HEI::create([
            'uii'            => 'DEMO01',
            'name'           => 'Demo State University',
            'type'           => 'SUC',
            'abbreviation'   => 'DSU',
            'email'          => 'info@demostateuniversity.edu.ph',
            'phone'          => '(02) 8123-4567',
            'address'        => '123 University Avenue, Quezon City, Metro Manila',
            'established_at' => '1980-06-15',
            'is_active'      => true,
        ]);

        User::create([
            'name'         => 'Demo HEI Administrator',
            'email'        => 'hei@demostateuniversity.edu.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'hei',
            'hei_id'       => $hei->id,
            'is_active'    => true,
        ]);

        // ── HEI #2 — Lakeview College of Technology (Private) ────────────────
        $hei2 = HEI::create([
            'uii'            => 'DEMO02',
            'name'           => 'Lakeview College of Technology',
            'type'           => 'Private',
            'abbreviation'   => 'LCT',
            'email'          => 'info@lakeviewcollege.edu.ph',
            'phone'          => '(02) 8765-4321',
            'address'        => '88 Technoplex Road, Pasig City, Metro Manila',
            'established_at' => '1995-03-20',
            'is_active'      => true,
        ]);

        User::create([
            'name'         => 'LCT HEI Administrator',
            'email'        => 'hei@lakeviewcollege.edu.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'hei',
            'hei_id'       => $hei2->id,
            'is_active'    => true,
        ]);

        $this->command->info('🌱 Seeding HEI #2 (Lakeview College) — full 3 years...');
        foreach (self::YEARS as $ay) {
            $this->seedYear($hei2, $ay);
        }

        // ── HEI #3 — Mindanao Tech Institute (~70% complete) ─────────────────
        $hei3 = HEI::create([
            'uii'            => 'DEMO03',
            'name'           => 'Mindanao Tech Institute',
            'type'           => 'SUC',
            'abbreviation'   => 'MTI',
            'email'          => 'info@mindanaotech.edu.ph',
            'phone'          => '(082) 555-1234',
            'address'        => '45 Davao del Sur Highway, Davao City',
            'established_at' => '2001-08-10',
            'is_active'      => true,
        ]);

        User::create([
            'name'         => 'MTI HEI Administrator',
            'email'        => 'hei@mindanaotech.edu.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'hei',
            'hei_id'       => $hei3->id,
            'is_active'    => true,
        ]);

        $this->command->info('🌱 Seeding HEI #3 (Mindanao Tech) — ~70% partial, 3 years...');
        foreach (self::YEARS as $ay) {
            $this->seedYearPartialHeavy($hei3, $ay);
        }

        // ── HEI #4 — Visayas Christian College (~40% complete) ───────────────
        $hei4 = HEI::create([
            'uii'            => 'DEMO04',
            'name'           => 'Visayas Christian College',
            'type'           => 'Private',
            'abbreviation'   => 'VCC',
            'email'          => 'info@visayaschristian.edu.ph',
            'phone'          => '(032) 234-5678',
            'address'        => '12 Colon Street, Cebu City',
            'established_at' => '1968-05-14',
            'is_active'      => true,
        ]);

        User::create([
            'name'         => 'VCC HEI Administrator',
            'email'        => 'hei@visayaschristian.edu.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'hei',
            'hei_id'       => $hei4->id,
            'is_active'    => true,
        ]);

        $this->command->info('🌱 Seeding HEI #4 (Visayas Christian College) — ~40% partial, 3 years...');
        foreach (self::YEARS as $ay) {
            $this->seedYearPartialMid($hei4, $ay);
        }

        // ── HEI #5 — Cordillera Arts College (~20% complete) ─────────────────
        $hei5 = HEI::create([
            'uii'            => 'DEMO05',
            'name'           => 'Cordillera Arts College',
            'type'           => 'Private',
            'abbreviation'   => 'CAC',
            'email'          => 'info@cordilleraarts.edu.ph',
            'phone'          => '(074) 444-9876',
            'address'        => '7 Session Road, Baguio City',
            'established_at' => '2010-06-01',
            'is_active'      => true,
        ]);

        User::create([
            'name'         => 'CAC HEI Administrator',
            'email'        => 'hei@cordilleraarts.edu.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'hei',
            'hei_id'       => $hei5->id,
            'is_active'    => true,
        ]);

        $this->command->info('🌱 Seeding HEI #5 (Cordillera Arts College) — ~20% partial, 3 years...');
        foreach (self::YEARS as $ay) {
            $this->seedYearPartialLight($hei5, $ay);
        }

        // Admin user
        User::create([
            'name'         => 'CHED Region Admin',
            'email'        => 'admin@ched.gov.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'admin',
            'is_active'    => true,
        ]);

        return $hei;
    }

    // =========================================================================
    // PARTIAL YEAR ENTRY POINTS
    // =========================================================================

    /**
     * HEI #3 — ~70% complete.
     * Missing: Annex C1, D, I1, L1, N1, MER4A
     */
    private function seedYearPartialHeavy(HEI $hei, string $ay): void
    {
        $this->seedSummary($hei, $ay);
        $this->seedAnnexA($hei, $ay);
        $this->seedAnnexB($hei, $ay);
        $this->seedAnnexC($hei, $ay);
        // C1 skipped
        // D skipped
        $this->seedAnnexE($hei, $ay);
        $this->seedAnnexF($hei, $ay);
        $this->seedAnnexG($hei, $ay);
        $this->seedAnnexH($hei, $ay);
        $this->seedAnnexI($hei, $ay);
        // I1 skipped
        $this->seedAnnexJ($hei, $ay);
        $this->seedAnnexK($hei, $ay);
        $this->seedAnnexL($hei, $ay);
        // L1 skipped
        $this->seedAnnexM($hei, $ay);
        $this->seedAnnexN($hei, $ay);
        // N1 skipped
        $this->seedAnnexO($hei, $ay);
        $this->seedMer1($hei, $ay);
        $this->seedMer2($hei, $ay);
        $this->seedMer3($hei, $ay);
        // MER4A skipped
    }

    /**
     * HEI #4 — ~40% complete.
     * Has: Summary, Annex A, B, E, G, J, MER1 only
     */
    private function seedYearPartialMid(HEI $hei, string $ay): void
    {
        $this->seedSummary($hei, $ay);
        $this->seedAnnexA($hei, $ay);
        $this->seedAnnexB($hei, $ay);
        // C, C1, D skipped
        $this->seedAnnexE($hei, $ay);
        // F skipped
        $this->seedAnnexG($hei, $ay);
        // H, I, I1 skipped
        $this->seedAnnexJ($hei, $ay);
        // K, L, L1, M, N, N1, O skipped
        $this->seedMer1($hei, $ay);
        // MER2, MER3, MER4A skipped
    }

    /**
     * HEI #5 — ~20% complete.
     * Has: Summary, Annex A, D only. No MERs.
     */
    private function seedYearPartialLight(HEI $hei, string $ay): void
    {
        $this->seedSummary($hei, $ay);
        $this->seedAnnexA($hei, $ay);
        // Everything else skipped
        $this->seedAnnexD($hei, $ay);
        // No MERs
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private function ayDate(string $ay): string
    {
        [$from, $to] = self::AY_DATES[$ay];
        return $this->faker->dateTimeBetween($from, $to)->format('Y-m-d');
    }

    private function uuid(): string
    {
        return (string) Str::uuid();
    }

    private function ts(): array
    {
        return ['created_at' => now(), 'updated_at' => now()];
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================

    private function seedSummary(HEI $hei, string $ay): void
    {
        $populations = [
            '2024-2025' => ['male' => 3020, 'female' => 3890, 'intersex' => 10, 'total' => 6920],
            '2025-2026' => ['male' => 3200, 'female' => 4100, 'intersex' => 12, 'total' => 7312],
            '2026-2027' => ['male' => 3380, 'female' => 4250, 'intersex' => 15, 'total' => 7645],
        ];
        $pop = $populations[$ay] ?? $populations['2025-2026'];

        DB::table('summary')->insert(array_merge([
            'hei_id'                => $hei->id,
            'academic_year'         => $ay,
            'status'                => 'submitted',
            'population_male'       => $pop['male'],
            'population_female'     => $pop['female'],
            'population_intersex'   => $pop['intersex'],
            'population_total'      => $pop['total'],
            'submitted_org_chart'   => 'https://drive.google.com/file/d/demo_org_chart_' . strtolower($hei->abbreviation) . '_' . str_replace('-', '_', $ay) . '/view',
            'hei_website'           => 'https://www.' . strtolower(str_replace([' ', "'"], ['-', ''], $hei->name)) . '.edu.ph',
            'sas_website'           => 'https://sas.' . strtolower(str_replace([' ', "'"], ['-', ''], $hei->name)) . '.edu.ph',
            'social_media_contacts' => json_encode([
                'facebook'  => 'https://facebook.com/' . $hei->abbreviation,
                'twitter'   => 'https://twitter.com/' . $hei->abbreviation,
                'instagram' => 'https://instagram.com/' . $hei->abbreviation,
            ]),
            'student_handbook'      => 'yes',
            'student_publication'   => 'yes',
            'request_notes'         => null,
            'cancelled_notes'       => null,
        ], $this->ts()));
    }

    // =========================================================================
    // ANNEX A — Co-Curricular / Extra-Curricular Programs
    // =========================================================================

    private function seedAnnexA(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_a_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['Student Leadership Seminar 2024', 'University Auditorium', 'Student Leaders', 'Office of Student Affairs'],
                ['Drug Awareness Campaign 2024', 'Gymnasium', 'All Students', 'Office of Student Affairs'],
                ['Mental Health Week 2024', 'Open Grounds', 'All Students', 'Guidance Center'],
                ['Entrepreneurship Forum 2024', 'Multipurpose Hall', 'Business Students', 'College of Business'],
                ['Environmental Awareness Drive 2024', 'Campus Grounds', 'All Students', 'Green Campus Committee'],
                ['Cultural Night 2024', 'University Auditorium', 'All Students', 'Cultural Affairs Office'],
            ],
            '2025-2026' => [
                ['Leadership Enhancement Seminar', 'University Auditorium', 'Student Leaders', 'Office of Student Affairs'],
                ['Drug Awareness and Prevention Program', 'Gymnasium', 'All Students', 'Office of Student Affairs'],
                ['Mental Health Awareness Week', 'Open Grounds', 'All Students', 'Guidance Center'],
                ['Entrepreneurship Summit 2025', 'Multipurpose Hall', 'Business Students', 'College of Business'],
                ['Environmental Sustainability Drive', 'Campus Grounds', 'All Students', 'Green Campus Committee'],
                ['National Heroes Day Commemoration', 'University Amphitheater', 'All Students', 'Office of Student Affairs'],
                ['Cultural Night and Arts Festival', 'University Auditorium', 'All Students', 'Cultural Affairs Office'],
                ['Anti-Bullying Awareness Campaign', 'Various Classrooms', 'All Students', 'Guidance Center'],
            ],
            '2026-2027' => [
                ['Student Leadership Congress 2026', 'University Auditorium', 'Student Leaders', 'Office of Student Affairs'],
                ['Substance Abuse Prevention Seminar', 'Gymnasium', 'All Students', 'Health Services Unit'],
                ['Mental Wellness and Resilience Training', 'Function Hall A', 'All Students', 'Guidance Center'],
                ['Innovation and Startup Forum 2026', 'Multipurpose Hall', 'STEM Students', 'College of Engineering'],
                ['Climate Change Action Week', 'Campus Grounds', 'All Students', 'Green Campus Committee'],
                ['Disability Awareness and Inclusion Week', 'University Auditorium', 'All Students', 'Office of Student Affairs'],
                ['University Foundation Day Celebration', 'Main Grounds', 'All Students', 'Cultural Affairs Office'],
                ['Financial Literacy Seminar', 'Lecture Hall B', 'Graduating Students', 'Career Development Center'],
                ['Social Media Responsibility Forum', 'IT Building Auditorium', 'All Students', 'Office of Student Affairs'],
            ],
        ];

        $programs = $allPrograms[$ay] ?? $allPrograms['2025-2026'];

        foreach ($programs as [$title, $venue, $group, $organizer]) {
            DB::table('annex_a_programs')->insert(array_merge([
                'batch_id'                  => $batchId,
                'title'                     => $title,
                'venue'                     => $venue,
                'implementation_date'       => $this->ayDate($ay),
                'target_group'              => $group,
                'participants_online'       => $this->faker->numberBetween(40, 250),
                'participants_face_to_face' => $this->faker->numberBetween(80, 600),
                'organizer'                 => $organizer,
                'remarks'                   => 'Successfully conducted with positive participant feedback.',
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX B — Gender & Development Programs
    // =========================================================================

    private function seedAnnexB(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_b_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['GAD Orientation for New Students 2024', 'Lecture Hall A', 'Freshmen'],
                ['Safe Spaces Act Awareness 2024', 'Function Room 2', 'All Students'],
                ['Women Empowerment Forum 2024', 'University Auditorium', 'Female Students'],
                ['SOGIESC Rights Workshop 2024', 'Conference Room B', 'Student Leaders'],
            ],
            '2025-2026' => [
                ['GAD Orientation for New Students', 'Lecture Hall A', 'Freshmen'],
                ['Safe Spaces Act Awareness Seminar', 'Function Room 2', 'All Students'],
                ['Women Empowerment Forum', 'University Auditorium', 'Female Students'],
                ['Men Engage PH: Masculinity and Responsibility', 'Covered Court', 'Male Students'],
                ['SOGIESC Rights and Campus Inclusivity Workshop', 'Conference Room B', 'Student Leaders and Faculty'],
            ],
            '2026-2027' => [
                ['GAD Orientation — New Student Intake 2026', 'Lecture Hall B', 'Freshmen'],
                ['Safe Spaces Act Refresher for Returning Students', 'Function Hall A', 'All Students'],
                ['Women in Leadership Symposium', 'University Auditorium', 'Female Students'],
                ['Gender-Fair Language Workshop', 'Conference Room A', 'Faculty and Student Leaders'],
                ['Gender-Based Violence Awareness Month Activities', 'Various Venues', 'All Students'],
                ['GAD Plan Consultative Assembly', 'Board Room', 'Faculty and Staff GAD Focal Points'],
            ],
        ];

        $programs = $allPrograms[$ay] ?? $allPrograms['2025-2026'];

        foreach ($programs as [$title, $venue, $group]) {
            DB::table('annex_b_programs')->insert(array_merge([
                'batch_id'                  => $batchId,
                'title'                     => $title,
                'venue'                     => $venue,
                'implementation_date'       => $this->ayDate($ay),
                'target_group'              => $group,
                'participants_online'       => $this->faker->numberBetween(20, 150),
                'participants_face_to_face' => $this->faker->numberBetween(60, 350),
                'organizer'                 => 'GAD Focal Point Office',
                'remarks'                   => 'Conducted in compliance with RA 9710 (Magna Carta of Women).',
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX C — Career Development Programs
    // =========================================================================

    private function seedAnnexC(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_c_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['Job Fair 2024', 'Gymnasium', 'Final Year Students', 55],
                ['Resume Writing Workshop 2024', 'Computer Lab 3', 'All Students', 0],
                ['Mock Interview Training 2024', 'Function Room 1', 'Graduating Students', 0],
                ['Career Pathing Seminar 2024', 'Lecture Hall C', 'All Students', 20],
                ['Entrepreneurship Forum 2024', 'Multipurpose Hall', 'Business Students', 30],
            ],
            '2025-2026' => [
                ['Job Fair 2025', 'Gymnasium', 'Final Year Students', 68],
                ['Resume Writing and LinkedIn Optimization Workshop', 'Computer Lab 3', 'All Students', 0],
                ['Mock Interview Training', 'Function Room 1', 'Graduating Students', 0],
                ['Industry Immersion Program – ICT Sector', 'Off-Campus, Ortigas', 'OJT Students', 0],
                ['Career Pathing Seminar: Navigating Your First Job', 'Lecture Hall C', 'All Students', 25],
                ['Entrepreneurship and Self-Employment Forum', 'Multipurpose Hall', 'Business and STEM Students', 40],
            ],
            '2026-2027' => [
                ['Job Fair 2026', 'Gymnasium', 'Final Year Students', 75],
                ['Portfolio and Cover Letter Masterclass', 'Computer Lab 2', 'All Students', 20],
                ['Industry Talks Series: Tech, Healthcare, Business', 'Lecture Hall A', 'All Students', 30],
                ['Graduate School Preparation Workshop', 'Conference Room A', 'Graduating Students', 10],
                ['OJT and Practicum Orientation', 'Auditorium', '3rd Year Students', 0],
                ['Career Coaching One-on-One Sessions', 'Career Dev Center', 'Graduating Students', 0],
                ['Alumni Mentoring Night', 'Function Hall B', 'All Students', 50],
            ],
        ];

        $programs = $allPrograms[$ay] ?? $allPrograms['2025-2026'];

        foreach ($programs as [$title, $venue, $group, $online]) {
            DB::table('annex_c_programs')->insert(array_merge([
                'batch_id'                  => $batchId,
                'title'                     => $title,
                'venue'                     => $venue,
                'implementation_date'       => $this->ayDate($ay),
                'participants_online'       => $online ?: $this->faker->numberBetween(20, 120),
                'participants_face_to_face' => $this->faker->numberBetween(80, 450),
                'organizer'                 => 'Career Development Center',
                'remarks'                   => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX C1 — Guidance & Counseling Programs
    // =========================================================================

    private function seedAnnexC1(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_c1_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['Stress Management Seminar 2024', 'Guidance Center', 'Guidance Center', 'College Freshmen'],
                ['Individual Counseling Program 2024', 'Guidance Center', 'Guidance Center', 'All Year Levels'],
                ['Peer Facilitator Training 2024', 'Conference Room A', 'Guidance Center', 'Selected Peer Counselors'],
            ],
            '2025-2026' => [
                ['Stress Management Seminar', 'Guidance Center', 'Guidance Center', 'College Freshmen'],
                ['Individual Counseling Program', 'Guidance Center', 'Guidance Center', 'All Year Levels'],
                ['Group Dynamics and Team Building', 'Covered Court', 'Guidance Center', '2nd Year and Above'],
                ['Test Anxiety and Study Skills Workshop', 'Lecture Hall A', 'Guidance Center', 'All Year Levels'],
                ['Peer Facilitator Training Program', 'Conference Room A', 'Guidance Center', 'Selected Peer Counselors'],
            ],
            '2026-2027' => [
                ['Psychological First Aid Training', 'Guidance Center', 'Guidance Center', 'Peer Counselors and Student Leaders'],
                ['Mindfulness and Self-Care Workshop', 'Function Hall A', 'Guidance Center', 'All Students'],
                ['Individual Counseling Program – AY 2026-2027', 'Guidance Center', 'Guidance Center', 'All Year Levels'],
                ['Academic Adjustment Seminar for Freshmen', 'Lecture Hall B', 'Guidance Center', 'Freshmen'],
                ['Crisis Intervention Orientation', 'Conference Room B', 'Guidance Center', 'Faculty and Staff'],
                ['Group Counseling: Relationships and Social Boundaries', 'Guidance Center', 'Guidance Center', '1st and 2nd Year'],
            ],
        ];

        $programs = $allPrograms[$ay] ?? $allPrograms['2025-2026'];

        foreach ($programs as [$title, $venue, $organizer, $group]) {
            DB::table('annex_c1_programs')->insert(array_merge([
                'batch_id'                  => $batchId,
                'title'                     => $title,
                'venue'                     => $venue,
                'implementation_date'       => $this->ayDate($ay),
                'target_group'              => $group,
                'participants_online'       => $this->faker->numberBetween(10, 100),
                'participants_face_to_face' => $this->faker->numberBetween(40, 280),
                'organizer'                 => $organizer,
                'remarks'                   => 'Conducted with active participation; follow-up sessions scheduled.',
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX D — Student Handbook
    // =========================================================================

    private function seedAnnexD(HEI $hei, string $ay): void
    {
        $versions = [
            '2024-2025' => 'June 2024',
            '2025-2026' => 'June 2025',
            '2026-2027' => 'June 2026 (Revised Edition)',
        ];

        DB::table('annex_d_submissions')->insert(array_merge([
            'submission_id'               => $this->uuid(),
            'hei_id'                      => $hei->id,
            'academic_year'               => $ay,
            'status'                      => 'submitted',
            'version_publication_date'    => $versions[$ay] ?? 'June 2025',
            'officer_in_charge'           => 'Dr. Maria Angela Santos, VP for Student Affairs',
            'handbook_committee'          => 'Dr. Maria Santos, Prof. Jose Reyes, Ms. Ana Cruz, Mr. Ben Torres',
            'dissemination_orientation'   => true,
            'orientation_dates'           => $ay === '2024-2025' ? 'June 12-14, 2024' : ($ay === '2025-2026' ? 'June 10-12, 2025' : 'June 8-10, 2026'),
            'mode_of_delivery'            => 'Face-to-face and Online',
            'dissemination_uploaded'      => true,
            'dissemination_others'        => $ay === '2026-2027',
            'dissemination_others_text'   => $ay === '2026-2027' ? 'Distributed via University LMS (Canvas)' : null,
            'type_digital'                => true,
            'type_printed'                => true,
            'type_others'                 => false,
            'type_others_text'            => null,
            'has_academic_policies'       => true,
            'has_admission_requirements'  => true,
            'has_code_of_conduct'         => true,
            'has_scholarships'            => true,
            'has_student_publication'     => true,
            'has_housing_services'        => true,
            'has_disability_services'     => true,
            'has_student_council'         => true,
            'has_refund_policies'         => true,
            'has_drug_education'          => true,
            'has_foreign_students'        => $ay === '2026-2027',
            'has_disaster_management'     => true,
            'has_safe_spaces'             => true,
            'has_anti_hazing'             => true,
            'has_anti_bullying'           => true,
            'has_violence_against_women'  => true,
            'has_gender_fair'             => true,
            'has_others'                  => $ay === '2026-2027',
            'has_others_text'             => $ay === '2026-2027' ? 'Mental Health Policy (RA 11036)' : null,
            'request_notes'               => null,
            'cancelled_notes'             => null,
        ], $this->ts()));
    }

    // =========================================================================
    // ANNEX E — Recognized Student Organizations
    // =========================================================================

    private function seedAnnexE(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_e_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allOrgs = [
            '2024-2025' => [
                ['Supreme Student Government', 7, '2017', 'Prof. Lina Reyes', 'Student Governance', '₱480/year'],
                ['Science and Technology Society', 4, '2020', 'Engr. Mark Dela Cruz', 'Academic/Technical', '₱300/year'],
                ['University Chorale', 11, '2013', 'Dr. Elena Magsino', 'Arts and Culture', '₱380/year'],
                ['Red Cross Youth Chapter', 5, '2019', 'Nurse Carla Santos', 'Civic / Humanitarian', '₱250/year'],
                ['Engineering Students Society', 2, '2022', 'Engr. Ryan Flores', 'Academic/Technical', '₱350/year'],
                ['DSU Sports Club', 3, '2021', 'Coach Mario Bautista', 'Sports and Recreation', '₱300/year'],
            ],
            '2025-2026' => [
                ['Supreme Student Government', 8, '2017', 'Prof. Lina Reyes', 'Student Governance and Civic Engagement', '₱500/year'],
                ['Science and Technology Society', 5, '2020', 'Engr. Mark Dela Cruz', 'Academic/Technical', '₱300/year'],
                ['University Chorale', 12, '2013', 'Dr. Elena Magsino', 'Arts and Culture', '₱400/year'],
                ['Red Cross Youth Chapter', 6, '2019', 'Nurse Carla Santos', 'Civic / Humanitarian', '₱250/year'],
                ['Engineering Students Society', 3, '2022', 'Engr. Ryan Flores', 'Academic/Technical', '₱350/year'],
                ['DSU Sports Club', 4, '2021', 'Coach Mario Bautista', 'Sports and Recreation', '₱300/year'],
                ['Environmental Advocates Group', 2, '2023', 'Prof. Rina Valdez', 'Environmental Advocacy', '₱200/year'],
            ],
            '2026-2027' => [
                ['Supreme Student Government', 9, '2017', 'Prof. Lina Reyes', 'Student Governance and Civic Engagement', '₱550/year'],
                ['Science and Technology Society', 6, '2020', 'Engr. Mark Dela Cruz', 'Academic/Technical', '₱300/year'],
                ['University Chorale', 13, '2013', 'Dr. Elena Magsino', 'Arts and Culture', '₱450/year'],
                ['Red Cross Youth Chapter', 7, '2019', 'Nurse Carla Santos', 'Civic / Humanitarian', '₱250/year'],
                ['Engineering Students Society', 4, '2022', 'Engr. Ryan Flores', 'Academic/Technical', '₱350/year'],
                ['DSU Sports Club', 5, '2021', 'Coach Mario Bautista', 'Sports and Recreation', '₱300/year'],
                ['Environmental Advocates Group', 3, '2023', 'Prof. Rina Valdez', 'Environmental Advocacy', '₱200/year'],
                ['Nursing Students Association', 2, '2025', 'Dr. Grace Tan', 'Academic/Health', '₱300/year'],
                ['Business and Entrepreneurship Society', 1, '2026', 'Prof. Allan Chua', 'Academic/Business', '₱250/year'],
            ],
        ];

        $orgs = $allOrgs[$ay] ?? $allOrgs['2025-2026'];

        foreach ($orgs as [$name, $years, $since, $adviser, $spec, $fee]) {
            DB::table('annex_e_organizations')->insert(array_merge([
                'batch_id'                     => $batchId,
                'name_of_accredited'           => $name,
                'years_of_existence'           => $years,
                'accredited_since'             => $since,
                'faculty_adviser'              => $adviser,
                'president_and_officers'       => 'President: ' . $this->faker->name()
                    . '; VP Internal: ' . $this->faker->name()
                    . '; Secretary: ' . $this->faker->name()
                    . '; Treasurer: ' . $this->faker->name(),
                'specialization'               => $spec,
                'fee_collected'                => $fee,
                'programs_projects_activities' => 'General assemblies, outreach programs, leadership training, fundraising events.',
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX F — Student Discipline
    // =========================================================================

    private function seedAnnexF(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_f_batches')->insert(array_merge([
            'batch_id'                     => $batchId,
            'hei_id'                       => $hei->id,
            'academic_year'                => $ay,
            'status'                       => 'submitted',
            'procedure_mechanism'          => 'Written complaint filed at the Student Discipline Office. SDO conducts preliminary investigation within 5 working days, followed by formal hearing if warranted. Decision rendered within 30 days.',
            'complaint_desk'               => 'Student Discipline Office, Administration Building Room 102, open Monday–Friday 8AM–5PM',
            'student_discipline_committee' => 'Dr. Jose Dela Torre (Chair), Prof. Ana Ramos, Prof. Ben Reyes, Ms. Cris Ocampo (Student Rep), Atty. Ramon Torres (Legal Adviser)',
            'request_notes'                => null,
            'cancelled_notes'              => null,
        ], $this->ts()));

        $allActivities = [
            '2024-2025' => [
                ['Anti-Hazing Orientation 2024', '2024-07-10', 'Conducted'],
                ['Student Discipline Forum 2024', '2024-09-05', 'Conducted'],
                ['Safe Spaces Act Compliance Audit 2024', '2024-11-12', 'Conducted'],
                ['Year-End Disciplinary Case Review 2024', '2025-03-10', 'Conducted'],
            ],
            '2025-2026' => [
                ['Anti-Hazing Orientation for New Students', '2025-07-15', 'Conducted'],
                ['Student Discipline Forum – Policies and Procedures', '2025-09-10', 'Conducted'],
                ['Safe Spaces Act (RA 11313) Compliance Audit', '2025-11-20', 'Conducted'],
                ['Year-End Disciplinary Case Review and Documentation', '2026-03-15', 'Conducted'],
                ['Student Rights and Responsibilities Seminar', '2025-08-22', 'Conducted'],
            ],
            '2026-2027' => [
                ['Anti-Hazing Orientation – AY 2026-2027', '2026-07-20', 'Conducted'],
                ['Student Code of Conduct Walkthrough', '2026-09-05', 'Conducted'],
                ['Safe Spaces Act Refresher', '2026-11-18', 'Conducted'],
                ['Year-End Disciplinary Case Review', '2027-03-20', 'Conducted'],
                ['Due Process Rights Seminar for Students', '2026-08-28', 'Conducted'],
                ['Social Media Conduct and Cyber-Bullying Forum', '2026-10-14', 'Conducted'],
            ],
        ];

        $activities = $allActivities[$ay] ?? $allActivities['2025-2026'];

        foreach ($activities as [$activity, $date, $status]) {
            DB::table('annex_f_activities')->insert(array_merge([
                'batch_id'   => $batchId,
                'activity'   => $activity,
                'date'       => $date,
                'status'     => $status,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX G — Student Publication
    // =========================================================================

    private function seedAnnexG(HEI $hei, string $ay): void
    {
        $subId = $this->uuid();

        $fees = ['2024-2025' => 70.00, '2025-2026' => 75.00, '2026-2027' => 80.00];

        DB::table('annex_g_submissions')->insert(array_merge([
            'submission_id'                   => $subId,
            'hei_id'                          => $hei->id,
            'academic_year'                   => $ay,
            'status'                          => 'submitted',
            'official_school_name'            => $hei->name,
            'student_publication_name'        => 'The ' . $hei->abbreviation . ' Torch',
            'publication_fee_per_student'     => $fees[$ay] ?? 75.00,
            'frequency_monthly'               => false,
            'frequency_quarterly'             => true,
            'frequency_annual'                => false,
            'frequency_per_semester'          => false,
            'frequency_others'                => false,
            'frequency_others_specify'        => null,
            'publication_type_newsletter'     => false,
            'publication_type_gazette'        => false,
            'publication_type_magazine'       => true,
            'publication_type_others'         => $ay === '2026-2027',
            'publication_type_others_specify' => $ay === '2026-2027' ? 'Digital Blog / Online Edition' : null,
            'adviser_name'                    => 'Prof. Josephine Reyes',
            'adviser_position_designation'    => 'Faculty Adviser, Department of Communication',
            'request_notes'                   => null,
            'cancelled_notes'                 => null,
        ], $this->ts()));

        foreach ([
            ['Editor-in-Chief', 'BS Communication, 4th Year'],
            ['Managing Editor', 'BS Journalism, 3rd Year'],
            ['News Editor', 'BS Communication, 3rd Year'],
            ['Features Editor', 'BS Journalism, 2nd Year'],
            ['Opinion Editor', 'BA Political Science, 3rd Year'],
            ['Layout Artist / Designer', 'BS Multimedia Arts, 2nd Year'],
        ] as [$position, $program]) {
            DB::table('annex_g_editorial_boards')->insert(array_merge([
                'submission_id'               => $subId,
                'name'                        => $this->faker->name(),
                'position_in_editorial_board' => $position,
                'degree_program_year_level'   => $program,
            ], $this->ts()));
        }

        DB::table('annex_g_other_publications')->insert(array_merge([
            'submission_id'             => $subId,
            'name_of_publication'       => 'Engineering Tribune',
            'department_unit_in_charge' => 'College of Engineering',
            'type_of_publication'       => 'Newsletter',
        ], $this->ts()));

        $allGPrograms = [
            '2024-2025' => [
                ['Campus Journalism Basics 2024', '2024-09-15', 'Media Center', 'Student Journalists'],
            ],
            '2025-2026' => [
                ['Campus Journalism Training Workshop', '2025-09-20', 'Media Center, Communication Building', 'Student Journalists'],
                ['Press Conference Simulation', '2026-01-15', 'Journalism Lab', 'Student Publication Staff'],
            ],
            '2026-2027' => [
                ['Investigative Journalism Bootcamp', '2026-10-10', 'Media Center', 'Student Journalists'],
                ['Digital Media and Content Creation Workshop', '2027-01-22', 'IT Building Computer Lab', 'Publication Staff'],
                ['Press Freedom and Ethics Seminar', '2026-11-25', 'Function Hall B', 'All Student Media'],
            ],
        ];

        foreach (($allGPrograms[$ay] ?? $allGPrograms['2025-2026']) as [$title, $date, $venue, $group]) {
            DB::table('annex_g_programs')->insert(array_merge([
                'submission_id'                => $subId,
                'title_of_program'             => $title,
                'implementation_date'          => $date,
                'implementation_venue'         => $venue,
                'target_group_of_participants' => $group,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX H — Admissions Services & Statistics
    // =========================================================================

    private function seedAnnexH(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_h_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        foreach ([
            ['Application Assistance and Enrollment Guidance', true, 'Online application portal, guide sheets, walk-in assistance'],
            ['Entrance Examination Administration', true, 'Test permits, exam rooms, answer sheets'],
            ['Scholarship and Financial Aid Information Desk', true, 'Scholarship brochures, eligibility FAQs, application forms'],
            ['PWD and Special Needs Accommodation Services', true, 'Accessible testing rooms, priority lanes, readers if needed'],
            ['Student Transfer and Cross-Enrollment Processing', true, 'Permit to Transfer, grades evaluation form'],
        ] as [$type, $with, $docs]) {
            DB::table('annex_h_admission_services')->insert(array_merge([
                'batch_id'             => $batchId,
                'service_type'         => $type,
                'with'                 => $with,
                'supporting_documents' => $docs,
                'remarks'              => null,
            ], $this->ts()));
        }

        $baseMultiplier = $ay === '2024-2025' ? 0.88 : ($ay === '2026-2027' ? 1.12 : 1.0);

        foreach ([
            ['BS Computer Science', 520, 0.72, 0.88],
            ['BS Nursing', 480, 0.65, 0.90],
            ['BS Education (BEEd)', 310, 0.78, 0.85],
            ['BS Business Administration', 560, 0.70, 0.87],
            ['BS Civil Engineering', 390, 0.60, 0.82],
        ] as [$prog, $baseApplicants, $admitRate, $enrollRate]) {
            $applicants = (int) ($baseApplicants * $baseMultiplier * $this->faker->randomFloat(2, 0.90, 1.10));
            $admitted   = (int) ($applicants * $admitRate  * $this->faker->randomFloat(2, 0.95, 1.05));
            $enrolled   = (int) ($admitted   * $enrollRate * $this->faker->randomFloat(2, 0.95, 1.05));
            DB::table('annex_h_admission_statistics')->insert(array_merge([
                'batch_id'   => $batchId,
                'program'    => $prog,
                'applicants' => $applicants,
                'admitted'   => $admitted,
                'enrolled'   => $enrolled,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX I — Scholarship Programs
    // =========================================================================

    private function seedAnnexI(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_i_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        foreach ([
            ['CHED Excellence Scholarship (CHED-ES)', 'Government', 'Academically Excellent Undergraduate Students', 45, null],
            ['Tulong Dunong Program (TDP)', 'Government', 'Economically Disadvantaged Students', 120, 'In coordination with CHED Regional Office'],
            ['Free Higher Education (RA 10931)', 'Government', 'Qualified Filipino Students in SUCs', 2800, 'Covers full tuition and other school fees'],
            ['Institutional Academic Excellence Award', 'Institutional', 'Top 5% GPA per Department per Semester', 85, null],
            ['Athletics Scholarship', 'Institutional', 'Varsity Athletes with Academic Standing', 28, 'Requires maintenance of 2.0 GWA'],
            ['Student Leaders Scholarship', 'Institutional', 'SSG and College Council Officers', 35, null],
            ['DSWD Scholarship (AICS)', 'Government', 'Solo Parents, PWDs, and Disadvantaged Youth', 60, null],
        ] as [$name, $type, $category, $beneficiaries, $remarks]) {
            DB::table('annex_i_scholarships')->insert(array_merge([
                'batch_id'                        => $batchId,
                'scholarship_name'                => $name,
                'type'                            => $type,
                'category_intended_beneficiaries' => $category,
                'number_of_beneficiaries'         => $beneficiaries,
                'remarks'                         => $remarks,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX I1 — Food Services
    // =========================================================================

    private function seedAnnexI1(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_i1_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        foreach ([
            ['University Main Cafeteria', 'Institutional Cafeteria', 'Food Services Office', 'Main Building, Ground Floor', 1800],
            ['Library Building Coffee Shop', 'Concessionaire', 'Brew & Go PH Corp.', 'Library Building Lobby', 210],
            ['Engineering Building Canteen', 'Institutional Cafeteria', 'Food Services Office', 'Engineering Building, Ground Floor', 550],
            ['Health Bar', 'Institutional', 'Health Services Unit', 'Student Center Building', 150],
        ] as [$name, $type, $operator, $location, $served]) {
            DB::table('annex_i1_food_services')->insert(array_merge([
                'batch_id'                  => $batchId,
                'service_name'              => $name,
                'service_type'              => $type,
                'operator_name'             => $operator,
                'location'                  => $location,
                'number_of_students_served' => $served,
                'remarks'                   => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX J — Health Services Programs
    // =========================================================================

    private function seedAnnexJ(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_j_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['Annual Medical, Dental, and Optical Examination 2024', 'University Medical Center', 3400],
                ['Blood Donation Drive 2024', 'Philippine Red Cross', 160],
                ['Drug Testing Program (RA 9165) 2024', 'University Medical Center', 1100],
                ['Mental Health Screening 2024', 'Guidance Center', 180],
                ['Nutrition Month Activities 2024', 'Gymnasium', 700],
            ],
            '2025-2026' => [
                ['Annual Medical, Dental, and Optical Examination', 'University Medical Center', 3600],
                ['Blood Donation Drive in Partnership with Philippine Red Cross', 'Philippine Red Cross', 180],
                ['Basic Life Support and First Aid Training', 'University Health Unit', 95],
                ['Mental Health Screening and Psychosocial Support', 'Guidance Center', 210],
                ['Drug Testing Program (RA 9165)', 'University Medical Center', 1200],
                ['HIV/AIDS Awareness and Free Testing', 'University Health Unit', 140],
                ['Nutrition Month Celebration and BMI Monitoring', 'Gymnasium', 800],
            ],
            '2026-2027' => [
                ['Annual Medical, Dental, and Optical Examination', 'University Medical Center', 3800],
                ['Blood Donation Drive', 'Philippine Red Cross', 200],
                ['Advanced First Aid and Emergency Response Training', 'University Health Unit', 110],
                ['Mental Wellness Screening and Referral System', 'Guidance Center', 250],
                ['Mandatory Drug Testing Program', 'University Medical Center', 1350],
                ['Sexual and Reproductive Health Seminar', 'Lecture Hall C', 320],
                ['Dengue and Water-Borne Disease Prevention Campaign', 'Gymnasium', 600],
                ['Cervical Cancer Awareness and Vaccination Drive', 'University Medical Center', 430],
            ],
        ];

        foreach (($allPrograms[$ay] ?? $allPrograms['2025-2026']) as [$title, $organizer, $participants]) {
            // Split total participants roughly 30% online / 70% face-to-face for realistic demo data
            $online = (int) round($participants * 0.3);
            $f2f    = $participants - $online;
            DB::table('annex_j_programs')->insert(array_merge([
                'batch_id'                  => $batchId,
                'title_of_program'          => $title,
                'organizer'                 => $organizer,
                'participants_online'       => $online,
                'participants_face_to_face' => $f2f,
                'remarks'                   => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX K — Student Welfare Committees
    // =========================================================================

    private function seedAnnexK(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_k_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        foreach ([
            ['Student Welfare and Development Committee (SWDC)', 'Dr. Maria Angela Santos', 'Dr. Maria Santos (Chair); Prof. Jose Reyes; Ms. Ana Cruz; Student Rep', 'Monthly welfare monitoring; scholarship processing; grievance resolution.'],
            ['Student Discipline Board (SDB)', 'Atty. Ramon Torres', 'Atty. Ramon Torres (Chair); Prof. Elena Bautista; Student Rep; Dean Rep', 'Disciplinary hearings; code of conduct review; anti-hazing compliance.'],
            ['Student Health and Wellness Committee', 'Dr. Grace Tan', 'Dr. Grace Tan (Chair); Nurse Carla Santos; Ms. Ana Ramos (Guidance); Student Health Rep', 'Health program planning; annual medical exam coordination; mental health implementation.'],
            ['Scholarship and Financial Aid Committee', 'Dr. Liza Macaraeg', 'Dr. Liza Macaraeg (Chair); Finance Officer; Registrar Rep; SSG Treasurer', 'Scholarship policy review; beneficiary selection; coordination with CHED and DSWD.'],
        ] as [$name, $head, $members, $activities]) {
            DB::table('annex_k_committees')->insert(array_merge([
                'batch_id'                               => $batchId,
                'committee_name'                         => $name,
                'committee_head_name'                    => $head,
                'members_composition'                    => $members,
                'programs_projects_activities_trainings' => $activities,
                'remarks'                                => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX L — Housing / Dormitory Services
    // =========================================================================

    private function seedAnnexL(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_l_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        foreach ([
            ["Women's Dormitory – Sampaguita Hall", 'Inside University Compound', 'Ms. Carla Ramos', false, true, false, 'Capacity: 120 residents; with common kitchen, study rooms, and laundry area.'],
            ["Men's Dormitory – Narra Hall", 'Inside University Compound', 'Mr. Eduardo Cruz', true, false, false, 'Capacity: 90 residents; curfew at 10PM enforced.'],
            ['Graduate Students Residence Hall – Acacia Hall', 'Inside University Compound', 'Dr. Liza Macaraeg', false, false, true, 'Co-ed by floor; capacity 60 residents; graduate and post-grad only.'],
        ] as [$name, $address, $manager, $male, $female, $coed, $remarks]) {
            DB::table('annex_l_housings')->insert(array_merge([
                'batch_id'           => $batchId,
                'housing_name'       => $name,
                'complete_address'   => $hei->address . ' — ' . $address,
                'house_manager_name' => $manager,
                'male'               => $male,
                'female'             => $female,
                'coed'               => $coed,
                'others'             => null,
                'remarks'            => $remarks,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX L1 — International Student Services
    // =========================================================================

    private function seedAnnexL1(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_l1_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        foreach ([
            ['Student Visa Assistance and Extension Support', 'Administrative Support', 'Korean', 14, 'International Affairs Office'],
            ['Cultural Integration and Orientation Program', 'Orientation Program', 'All Nationalities', 38, 'Student Affairs'],
            ['International Student Buddy System', 'Peer Support', 'Chinese', 22, 'Student Affairs'],
            ['English Language Support Program', 'Academic Support', 'Non-English Speaking Students', 18, 'Language Center'],
        ] as [$name, $type, $nationality, $served, $officer]) {
            DB::table('annex_l1_international_services')->insert(array_merge([
                'batch_id'                  => $batchId,
                'service_name'              => $name,
                'service_type'              => $type,
                'target_nationality'        => $nationality,
                'number_of_students_served' => $served,
                'officer_in_charge'         => $officer,
                'remarks'                   => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX M — Health and Wellness Statistics & Services
    // =========================================================================

    private function seedAnnexM(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_m_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $ayStats = [
            '2024-2025' => [
                ['Medical Consultation',   json_encode(['sem1' => 760, 'sem2' => 820]),  false, 1],
                ['Dental Consultation',    json_encode(['sem1' => 390, 'sem2' => 440]),  false, 2],
                ['Mental Health Referrals',json_encode(['sem1' => 80,  'sem2' => 95]),   false, 3],
                ['Drug Testing (RA 9165)', json_encode(['sem1' => 550, 'sem2' => 550]),  false, 4],
                ['Emergency Cases Handled',json_encode(['sem1' => 38,  'sem2' => 32]),   false, 5],
                ['Health Services Total',  json_encode(['sem1' => 1818,'sem2' => 1937]), true,  6],
            ],
            '2025-2026' => [
                ['Medical Consultation',   json_encode(['sem1' => 820, 'sem2' => 910]),  false, 1],
                ['Dental Consultation',    json_encode(['sem1' => 430, 'sem2' => 510]),  false, 2],
                ['Mental Health Referrals',json_encode(['sem1' => 95,  'sem2' => 115]),  false, 3],
                ['Drug Testing (RA 9165)', json_encode(['sem1' => 600, 'sem2' => 600]),  false, 4],
                ['Emergency Cases Handled',json_encode(['sem1' => 42,  'sem2' => 38]),   false, 5],
                ['Health Services Total',  json_encode(['sem1' => 1987,'sem2' => 2173]), true,  6],
            ],
            '2026-2027' => [
                ['Medical Consultation',   json_encode(['sem1' => 890, 'sem2' => 970]),  false, 1],
                ['Dental Consultation',    json_encode(['sem1' => 470, 'sem2' => 540]),  false, 2],
                ['Mental Health Referrals',json_encode(['sem1' => 120, 'sem2' => 135]),  false, 3],
                ['Drug Testing (RA 9165)', json_encode(['sem1' => 680, 'sem2' => 680]),  false, 4],
                ['Emergency Cases Handled',json_encode(['sem1' => 50,  'sem2' => 44]),   false, 5],
                ['Vaccination (Flu)',       json_encode(['sem1' => 200, 'sem2' => 0]),    false, 6],
                ['Health Services Total',  json_encode(['sem1' => 2410,'sem2' => 2369]), true,  7],
            ],
        ];

        foreach (($ayStats[$ay] ?? $ayStats['2025-2026']) as [$category, $yearData, $isSubtotal, $order]) {
            DB::table('annex_m_statistics')->insert(array_merge([
                'batch_id'      => $batchId,
                'category'      => $category,
                'subcategory'   => null,
                'year_data'     => $yearData,
                'is_subtotal'   => $isSubtotal,
                'display_order' => $order,
            ], $this->ts()));
        }

        foreach ([
            ['Health Services', 'Primary Care',      'Free outpatient medical consultation, basic laboratory, prescription', 1500, 1],
            ['Health Services', 'Dental Care',        'Dental examination, oral prophylaxis, tooth extraction',              400,  2],
            ['Health Services', 'Emergency Care',     'First aid, stabilization, ambulance referral to partner hospitals',  80,   3],
            ['Psychological Services', null,           'Individual counseling, group therapy, psychological assessments',   250,  4],
            ['Preventive Programs', 'Health Education','Health promotion seminars, nutrition month, anti-smoking campaign',  2000, 5],
        ] as [$section, $category, $program, $beneficiaries, $order]) {
            DB::table('annex_m_services')->insert(array_merge([
                'batch_id'                                   => $batchId,
                'section'                                    => $section,
                'category'                                   => $category,
                'institutional_services_programs_activities' => $program,
                'number_of_beneficiaries_participants'       => $beneficiaries,
                'remarks'                                    => null,
                'display_order'                              => $order,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX N — Sports and Recreation Activities
    // =========================================================================

    private function seedAnnexN(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_n_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allActivities = [
            '2024-2025' => [
                ['Intramural Sports Festival 2024', 'University Sports Complex', 'Sports and Recreation Office', 880],
                ['Inter-College Basketball League 2024', 'Covered Gymnasium', 'Athletics Department', 240],
                ['DSU Fun Run 2024', 'Campus Grounds', 'Health and Wellness Office', 500],
                ['Volleyball Tournament 2024', 'Covered Gymnasium', 'Athletics Department', 160],
            ],
            '2025-2026' => [
                ['Intramural Sports Festival 2025', 'University Sports Complex', 'Sports and Recreation Office', 920],
                ['Inter-College Basketball League', 'Covered Gymnasium', 'Athletics Department', 260],
                ['Inter-College Volleyball Tournament', 'Covered Gymnasium', 'Athletics Department', 175],
                ['DSU Fun Run and Health Walk', 'Campus Grounds to Quezon Memorial Circle', 'Health and Wellness Office', 540],
                ['Badminton and Table Tennis Doubles Open', 'Covered Court', 'Athletics Department', 130],
                ['Yoga and Mindfulness Fitness Class (Semester-long)', 'Dance Studio', 'PE Department', 80],
            ],
            '2026-2027' => [
                ['Intramural Sports Festival 2026', 'University Sports Complex', 'Sports and Recreation Office', 1000],
                ['Inter-College Basketball League 2026', 'Covered Gymnasium', 'Athletics Department', 280],
                ['Inter-College Volleyball and Sepak Takraw', 'Covered Gymnasium', 'Athletics Department', 190],
                ['DSU Run for Health 2026', 'Campus Grounds', 'Health and Wellness Office', 600],
                ['Chess, Darts, and Billiards Tournament', 'Student Center', 'Athletics Department', 145],
                ['Zumba and Dance Fitness Open Class', 'Dance Studio', 'PE Department', 95],
                ['Swimming Lessons and Water Safety Program', 'University Pool', 'Athletics Department', 120],
            ],
        ];

        foreach (($allActivities[$ay] ?? $allActivities['2025-2026']) as [$title, $venue, $organizer, $participants]) {
            DB::table('annex_n_activities')->insert(array_merge([
                'batch_id'               => $batchId,
                'title_of_activity'      => $title,
                'implementation_date'    => $this->ayDate($ay),
                'implementation_venue'   => $venue,
                'number_of_participants' => $participants,
                'organizer'              => $organizer,
                'remarks'                => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX N1 — Varsity / Competitive Sports Programs
    // =========================================================================

    private function seedAnnexN1(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_n1_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['Basketball Varsity Development Program 2024', 'Basketball', 'Athletics Department', 'DSU Gymnasium', 22],
                ['Swimming Varsity Training 2024', 'Swimming', 'Athletics Department', 'University Pool', 18],
                ['SCUAA/PRISAA 2024 Campaign', 'Multi-Sport', 'Athletics Department', 'Various Regional Venues', 52],
            ],
            '2025-2026' => [
                ['Basketball Varsity Development Program', 'Basketball', 'Athletics Department', 'DSU Gymnasium', 24],
                ['Swimming Varsity Training Program', 'Swimming', 'Athletics Department', 'University Pool', 20],
                ['SCUAA / PRISAA Sports Participation', 'Multi-Sport', 'Athletics Department', 'Various Venues – Regional', 58],
                ['Badminton Varsity Program', 'Badminton', 'Athletics Department', 'DSU Covered Court', 16],
                ['Volleyball Varsity (Men and Women)', 'Volleyball', 'Athletics Department', 'DSU Gymnasium', 24],
            ],
            '2026-2027' => [
                ['Basketball Varsity Development Program 2026', 'Basketball', 'Athletics Department', 'DSU Gymnasium', 26],
                ['Swimming and Aquatics Varsity Program', 'Swimming', 'Athletics Department', 'University Pool', 22],
                ['SCUAA / PRISAA Multi-Sport Campaign 2026', 'Multi-Sport', 'Athletics Department', 'Various Regional Venues', 65],
                ['Badminton and Tennis Varsity Program', 'Badminton/Tennis', 'Athletics Department', 'DSU Covered Court', 20],
                ['Volleyball Varsity (Men and Women)', 'Volleyball', 'Athletics Department', 'DSU Gymnasium', 24],
                ['Athletics (Track and Field) Program', 'Track and Field', 'Athletics Department', 'DSU Track Oval', 18],
            ],
        ];

        foreach (($allPrograms[$ay] ?? $allPrograms['2025-2026']) as [$title, $sport, $organizer, $venue, $count]) {
            DB::table('annex_n1_sports_programs')->insert(array_merge([
                'batch_id'            => $batchId,
                'program_title'       => $title,
                'sport_type'          => $sport,
                'implementation_date' => $this->ayDate($ay),
                'venue'               => $venue,
                'participants_count'  => $count,
                'organizer'           => $organizer,
                'remarks'             => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX O — Community Extension Services
    // =========================================================================

    private function seedAnnexO(HEI $hei, string $ay): void
    {
        $batchId = $this->uuid();
        DB::table('annex_o_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $allPrograms = [
            '2024-2025' => [
                ['Brigada Eskwela 2024', '2024-06-03', 320, 'School Maintenance', 'Elementary Students and Parents'],
                ['Free Medical and Dental Mission 2024', '2024-10-12', 450, 'Health Service', 'Urban Poor Residents'],
                ['Tree Planting Activity 2024', '2024-11-03', 150, 'Environmental Service', 'Rural Community'],
                ['Technology Literacy for Senior Citizens 2024', '2024-10-25', 80, 'Technology Education', 'Senior Citizens'],
            ],
            '2025-2026' => [
                ['Brigada Eskwela 2025', '2025-06-02', 350, 'School Maintenance', 'Elementary Students, Parents, and LGU Workers'],
                ['Coastal Clean-Up Drive – Manila Bay', '2025-09-25', 220, 'Environmental Service', 'Coastal Community Residents'],
                ['Free Medical and Dental Mission', '2025-10-15', 480, 'Health Service', 'Urban Poor Residents, Barangay Batasan Hills'],
                ['Tree Planting and Urban Gardening Activity', '2025-11-05', 170, 'Environmental Service', 'Rural Community, San Jose del Monte, Bulacan'],
                ['Livelihood Training for Out-of-School Youth', '2026-02-20', 80, 'Livelihood Training', 'Out-of-School Youth, Payatas, Quezon City'],
                ['Disaster Preparedness Simulation (Earthquake)', '2025-08-10', 300, 'Disaster Risk Reduction', 'Barangay Officials and Residents'],
                ['Technology Literacy for Senior Citizens', '2025-10-28', 90, 'Technology Education', 'Senior Citizens, Barangay Commonwealth'],
            ],
            '2026-2027' => [
                ['Brigada Eskwela 2026', '2026-06-01', 380, 'School Maintenance', 'Elementary Students and Parents'],
                ['River and Watershed Cleanup Campaign', '2026-09-22', 250, 'Environmental Service', 'Marikina River Community Residents'],
                ['Free Medical Mission and Wellness Fair', '2026-10-20', 520, 'Health Service', 'Urban Poor Residents, Barangay Holy Spirit'],
                ['Mangrove Reforestation Project', '2026-11-08', 190, 'Environmental Service', 'Coastal Community, Cavite City'],
                ['Skills Training for Women Returnees', '2027-02-10', 95, 'Livelihood Training', 'Women Returnees from Overseas Work'],
                ['Food Security and Organic Farming Seminar', '2026-08-15', 120, 'Agricultural Extension', 'Urban Farmers'],
                ['Financial Literacy for Marginalized Families', '2026-10-05', 110, 'Community Education', 'Low-Income Families, Barangay Batasan Hills'],
                ['Scholarship Awareness Campaign in High Schools', '2027-01-20', 450, 'Educational Outreach', 'High School Students and Parents'],
            ],
        ];

        foreach (($allPrograms[$ay] ?? $allPrograms['2025-2026']) as [$title, $date, $beneficiaries, $type, $community]) {
            DB::table('annex_o_programs')->insert(array_merge([
                'batch_id'                    => $batchId,
                'title_of_program'            => $title,
                'date_conducted'              => $date,
                'number_of_beneficiaries'     => $beneficiaries,
                'type_of_community_service'   => $type,
                'community_population_served' => $community,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // MER1 — SAS Head Profile
    // =========================================================================

    private function seedMer1(HEI $hei, string $ay): void
    {
        $achievements = [
            '2024-2025' => 'Best SAS Head Award, CHED Region IV-A (2022); Certified Student Affairs Professional (CSAP)',
            '2025-2026' => 'Best SAS Head Award, CHED Region IV-A (2023); Certified Student Affairs Professional (CSAP); Published: "Student Affairs Governance in Philippine SUCs" (2022)',
            '2026-2027' => 'National Outstanding SAS Head Award (CHED, 2025); Doctor of Education (EdD) conferred 2024, PNU; Guest Speaker, CHED National SAS Summit 2026',
        ];

        $mer1 = DB::table('mer1_submissions')->insertGetId(array_merge([
            'hei_id'             => $hei->id,
            'academic_year'      => $ay,
            'status'             => 'submitted',
            'sas_head_name'      => 'Dr. Maria Angela Santos',
            'sas_head_position'  => 'Vice President for Student Affairs and Services',
            'permanent_status'   => 'Permanent',
            'other_achievements' => $achievements[$ay] ?? $achievements['2025-2026'],
            'request_notes'      => null,
            'cancelled_notes'    => null,
            'admin_notes'        => null,
        ], $this->ts()));

        foreach ([
            ['Doctor of Philosophy in Educational Management', 'University of the Philippines Diliman', '2015'],
            ['Master of Arts in Student Personnel Administration', 'De La Salle University', '2008'],
            ['Bachelor of Science in Psychology', 'Ateneo de Manila University', '2003'],
        ] as [$degree, $school, $year]) {
            DB::table('mer1_educational_attainments')->insert(array_merge([
                'mer1_submission_id' => $mer1,
                'degree_program'     => $degree,
                'school'             => $school,
                'year'               => $year,
            ], $this->ts()));
        }

        $allTrainings = [
            '2024-2025' => [
                ['SAS Foundations and Best Practices (CHED)', 'October 14-16, 2024'],
                ['Mental Health in Higher Education Conference', 'August 5, 2024'],
                ['Student Affairs Leadership Program', 'November 20-22, 2024'],
            ],
            '2025-2026' => [
                ['Strategic Leadership in Higher Education', 'March 12-14, 2025'],
                ['Student Affairs Management in the New Normal', 'July 8-10, 2025'],
                ['CHED SAS Compliance and Best Practices Workshop', 'November 5-6, 2025'],
                ['Mental Health in Higher Education: Institutional Response', 'September 20, 2025'],
            ],
            '2026-2027' => [
                ['ASEAN Student Affairs Summit – Singapore', 'April 5-7, 2026'],
                ['Advanced SAS Leadership Program (CHED)', 'August 14-16, 2026'],
                ['Inclusive Education and Universal Design for Learning', 'October 20-21, 2026'],
                ['Research Methods in Student Affairs Practice', 'January 12-13, 2027'],
                ['Campus Crisis Management and Response', 'March 3-4, 2027'],
            ],
        ];

        foreach (($allTrainings[$ay] ?? $allTrainings['2025-2026']) as [$title, $period]) {
            DB::table('mer1_trainings')->insert(array_merge([
                'mer1_submission_id' => $mer1,
                'training_title'     => $title,
                'period_date'        => $period,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // MER2 — Directory of SAS Personnel
    // =========================================================================

    private function seedMer2(HEI $hei, string $ay): void
    {
        $studentCounts = [
            '2024-2025' => [6920, 3300, 2600, 4000],
            '2025-2026' => [7312, 3500, 2800, 4200],
            '2026-2027' => [7645, 3750, 3100, 4400],
        ];
        [$total, $gc, $cdc, $sdw] = $studentCounts[$ay] ?? $studentCounts['2025-2026'];

        $mer2 = DB::table('mer2_submissions')->insertGetId(array_merge([
            'hei_id'                                  => $hei->id,
            'academic_year'                           => $ay,
            'status'                                  => 'submitted',
            'office_student_affairs_students_handled' => $total,
            'guidance_office_students_handled'        => $gc,
            'career_dev_center_students_handled'      => $cdc,
            'student_dev_welfare_students_handled'    => $sdw,
            'request_notes'                           => null,
            'cancelled_notes'                         => null,
            'admin_notes'                             => null,
        ], $this->ts()));

        foreach ([
            ['office_student_affairs', 'Vice President for Student Affairs and Services', 'Permanent', 10, 'PhD Educational Management', null, null],
            ['office_student_affairs', 'SAS Director / Head', 'Permanent', 7, 'MA Student Personnel Administration', null, null],
            ['office_student_affairs', 'SAS Administrative Officer III', 'Permanent', 5, 'BSBA', null, null],
            ['guidance_office', 'Guidance Services Coordinator', 'Permanent', 6, 'MS Counseling Psychology', 'RPsy-00234', '2028-06-30'],
            ['guidance_office', 'Registered Guidance Counselor I', 'Permanent', 3, 'MS Counseling', 'RGC-00567', '2028-06-30'],
            ['guidance_office', 'Registered Guidance Counselor II', 'Contractual', 2, 'MA Counseling', 'RGC-00891', '2027-06-30'],
            ['career_dev_center', 'Career Development Center Head', 'Permanent', 4, 'MBA Human Resources', null, null],
            ['career_dev_center', 'Career Development Specialist', 'Permanent', 2, 'BS Psychology', null, null],
            ['career_dev_center', 'Job Placement Coordinator', 'Contractual', 1, 'BS Business Administration', null, null],
            ['student_dev_welfare', 'Student Development and Welfare Officer', 'Permanent', 5, 'MA Sociology', null, null],
            ['student_dev_welfare', 'Student Organization Adviser', 'Permanent', 3, 'MA Public Administration', null, null],
            ['student_dev_welfare', 'Student Welfare Assistant', 'Job Order', 1, 'AB Political Science', null, null],
        ] as [$officeType, $position, $tenure, $years, $qualification, $licenseNo, $licenseExpiry]) {
            DB::table('mer2_personnel')->insert(array_merge([
                'mer2_submission_id'               => $mer2,
                'office_type'                      => $officeType,
                'name_of_personnel'                => $this->faker->name(),
                'position_designation'             => $position,
                'tenure_nature_of_appointment'     => $tenure,
                'years_in_office'                  => $years,
                'qualification_highest_degree'     => $qualification,
                'license_no_type'                  => $licenseNo,
                'license_expiry_date'              => $licenseExpiry,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // MER3 — Matrix of School Fees for SAS Programs
    // =========================================================================

    private function seedMer3(HEI $hei, string $ay): void
    {
        $feeMultiplier = $ay === '2024-2025' ? 1.0 : ($ay === '2025-2026' ? 1.05 : 1.10);

        $mer3 = DB::table('mer3_submissions')->insertGetId(array_merge([
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        foreach ([
            ['Student Development Fee',     'Covers co-curricular and extra-curricular program costs',            350.00],
            ['Medical and Dental Fee',       'Annual medical, dental, and optical examination costs',             200.00],
            ['Student Publication Fee',      'Supports printing and operations of the student publication',       70.00],
            ['Athletics and Sports Fee',     'Intramurals, varsity programs, use of sports facilities',           150.00],
            ['Guidance and Counseling Fee',  'Individual and group counseling, psychological testing materials',  100.00],
            ['Student Organization Fee',     'Distributed among CHED-recognized student organizations',          200.00],
            ['Cultural and Arts Fee',        'Cultural night, chorale, dance troupes, competitions',             80.00],
            ['Community Extension Fee',      'Community service programs and materials costs',                    50.00],
            ['Disaster Preparedness Fee',    'Campus emergency drills, first aid kits, evacuation materials',    30.00],
        ] as [$name, $description, $baseAmount]) {
            DB::table('mer3_school_fees')->insert(array_merge([
                'mer3_submission_id'  => $mer3,
                'name_of_school_fees' => $name,
                'description'         => $description,
                'amount'              => round($baseAmount * $feeMultiplier, 2),
                'remarks'             => null,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // MER4A — Checklist of Compliance Requirements
    // =========================================================================

    private function seedMer4a(HEI $hei, string $ay): void
    {
        $mer4a = DB::table('mer4a_submissions')->insertGetId(array_merge([
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        $sasLinks = [
            'sas_admin_1' => 'https://drive.google.com/drive/folders/1A2B3C_sas_orgchart',
            'sas_admin_2' => 'https://drive.google.com/drive/folders/1A2B3C_sas_personnel',
            'sas_admin_3' => 'https://drive.google.com/drive/folders/1A2B3C_sas_fees',
            'sas_admin_4' => 'https://drive.google.com/drive/folders/1A2B3C_sas_consortia',
            'sas_admin_5' => null,
        ];

        foreach ([
            ['sas_admin_1', 'Established functional/ operational/ accessible SAS office to manage SAS programs and activities', true, 'SAS office open Mon-Fri, 8AM-5PM; accessible to students'],
            ['sas_admin_2', 'Ensured adequate number of qualified and competent personnel to deliver SAS programs and services to students', true, 'All permanent SAS staff with relevant graduate degrees and professional licenses'],
            ['sas_admin_3', 'Ensured that specific school fees that have been collected to students are judiciously utilized for the delivery of SAS programs and activities', true, 'Audited by COA; utilization report submitted to Finance Office'],
            ['sas_admin_4', 'Developed collaborations or consortia with peer HEIs to be able to deliver critical SAS programs and activities [2]', true, 'MOAs signed with 3 partner HEIs in the region'],
            ['sas_admin_5', 'Conducted researches related to SAS', false, null],
        ] as [$rowId, $requirement, $compiled, $remarks]) {
            DB::table('mer4a_sas_management_items')->insert(array_merge([
                'mer4a_submission_id' => $mer4a,
                'row_id'              => $rowId,
                'requirement'         => $requirement,
                'evidence_link'       => $sasLinks[$rowId] ?? null,
                'status_compiled'     => $compiled,
                'hei_remarks'         => $remarks,
            ], $this->ts()));
        }

        $gcLinks = [
            'guidance_1' => 'https://drive.google.com/drive/folders/1A2B3C_gc_office',
            'guidance_2' => 'https://drive.google.com/drive/folders/1A2B3C_gc_pandemic',
            'guidance_3' => 'https://drive.google.com/drive/folders/1A2B3C_gc_personnel',
        ];

        foreach ([
            ['guidance_1', 'Established functional/ operational/ accessible SAS office to manage SAS programs and activities', true, 'Guidance Center open Mon-Fri; accessible via ramp and elevator'],
            ['guidance_2', 'Maintained operations of SAS during pandemic and other similar situation', true, 'Online counseling sessions conducted; LMS-based guidance resources deployed'],
            ['guidance_3', 'Ensured adequate number of qualified and competent personnel to deliver SAS programs and services to students', true, 'Three (3) RGCs on staff; ratio within PRC standard of 1:1500'],
        ] as [$rowId, $requirement, $compiled, $remarks]) {
            DB::table('mer4a_guidance_counseling_items')->insert(array_merge([
                'mer4a_submission_id' => $mer4a,
                'row_id'              => $rowId,
                'requirement'         => $requirement,
                'evidence_link'       => $gcLinks[$rowId] ?? null,
                'status_compiled'     => $compiled,
                'hei_remarks'         => $remarks,
            ], $this->ts()));
        }
    }
}
