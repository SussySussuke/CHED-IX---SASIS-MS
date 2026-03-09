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
 * Seeds TWO complete academic years of realistic demo data for ONE HEI:
 *   - AY 2025-2026  (status = 'submitted')
 *   - AY 2026-2027  (status = 'submitted')
 *
 * Covers: Summary, Annex A–O (incl. C1, I1, L1, N1), MER1–MER4A
 *
 * Based on:
 *  - Laravel 11 official Seeder documentation (laravel.com/docs/seeding)
 *  - FakerPHP locale-aware generation best practices
 *  - Single-responsibility seeder pattern; year loop avoids duplication
 *
 * Usage:
 *   php artisan db:seed --class=DemoDataSeeder
 *   php artisan migrate:fresh --seed
 */
class DemoDataSeeder extends Seeder
{
    private \Faker\Generator $faker;

    private const YEARS = [
        '2025-2026',
        '2026-2027',
    ];

    // Date ranges per AY so generated dates stay in-period
    private const AY_DATES = [
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
        $hei = HEI::create([
            'uii'            => 'DEMO01',
            'name'           => 'Demo State University',
            'type'           => 'SUC',
            'code'           => 'HEI-DEMO',
            'email'          => 'info@demostateuniversity.edu.ph',
            'phone'          => '(02) 8123-4567',
            'address'        => '123 University Avenue, Quezon City, Metro Manila',
            'established_at' => '1980-06-15',
            'is_active'      => true,
        ]);

        // HEI user
        User::create([
            'name'         => 'Demo HEI Administrator',
            'email'        => 'hei@demostateuniversity.edu.ph',
            'password'     => Hash::make('password123'),
            'account_type' => 'hei',
            'hei_id'       => $hei->id,
            'is_active'    => true,
        ]);

        // Second HEI (Private) for variety
        $hei2 = HEI::create([
            'uii'            => 'DEMO02',
            'name'           => 'Lakeview College of Technology',
            'type'           => 'Private',
            'code'           => 'HEI-LCT',
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

        // Seed second HEI too (one year only — 2025-2026)
        $this->command->info('🌱 Seeding secondary HEI (Lakeview College)...');
        $this->seedYear($hei2, '2025-2026');

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
        $isFirst = $ay === '2025-2026';
        DB::table('summary')->insert(array_merge([
            'hei_id'                => $hei->id,
            'academic_year'         => $ay,
            'status'                => 'submitted',
            'population_male'       => $isFirst ? 3200 : 3380,
            'population_female'     => $isFirst ? 4100 : 4250,
            'population_intersex'   => $isFirst ? 12   : 15,
            'population_total'      => $isFirst ? 7312 : 7645,
            'submitted_org_chart'   => 'yes',
            'hei_website'           => 'https://www.demostateuniversity.edu.ph',
            'sas_website'           => 'https://sas.demostateuniversity.edu.ph',
            'social_media_contacts' => json_encode([
                'facebook'  => 'https://facebook.com/DemoStateUniv',
                'twitter'   => 'https://twitter.com/DemoStateUniv',
                'instagram' => 'https://instagram.com/DemoStateUniv',
                'youtube'   => 'https://youtube.com/@DemoStateUniv',
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

        $programs = $ay === '2025-2026' ? [
            ['Leadership Enhancement Seminar', 'University Auditorium', 'Student Leaders', 'Office of Student Affairs'],
            ['Drug Awareness and Prevention Program', 'Gymnasium', 'All Students', 'Office of Student Affairs'],
            ['Mental Health Awareness Week', 'Open Grounds', 'All Students', 'Guidance Center'],
            ['Entrepreneurship Summit 2025', 'Multipurpose Hall', 'Business Students', 'College of Business'],
            ['Environmental Sustainability Drive', 'Campus Grounds', 'All Students', 'DSU Green Campus Committee'],
            ['National Heroes Day Commemoration', 'University Amphitheater', 'All Students', 'Office of Student Affairs'],
            ['Cultural Night and Arts Festival', 'University Auditorium', 'All Students', 'Cultural Affairs Office'],
            ['Anti-Bullying Awareness Campaign', 'Various Classrooms', 'All Students', 'Guidance Center'],
        ] : [
            ['Student Leadership Congress 2026', 'University Auditorium', 'Student Leaders', 'Office of Student Affairs'],
            ['Substance Abuse Prevention Seminar', 'Gymnasium', 'All Students', 'Health Services Unit'],
            ['Mental Wellness and Resilience Training', 'Function Hall A', 'All Students', 'Guidance Center'],
            ['Innovation and Startup Forum 2026', 'Multipurpose Hall', 'STEM Students', 'College of Engineering'],
            ['Climate Change Action Week', 'Campus Grounds', 'All Students', 'DSU Green Campus Committee'],
            ['Disability Awareness and Inclusion Week', 'University Auditorium', 'All Students', 'Office of Student Affairs'],
            ['University Foundation Day Celebration', 'Main Grounds', 'All Students', 'Cultural Affairs Office'],
            ['Financial Literacy Seminar', 'Lecture Hall B', 'Graduating Students', 'Career Development Center'],
            ['Social Media Responsibility Forum', 'IT Building Auditorium', 'All Students', 'Office of Student Affairs'],
        ];

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

        $programs = $ay === '2025-2026' ? [
            ['GAD Orientation for New Students', 'Lecture Hall A', 'Freshmen'],
            ['Safe Spaces Act Awareness Seminar', 'Function Room 2', 'All Students'],
            ['Women Empowerment Forum', 'University Auditorium', 'Female Students'],
            ['Men Engage PH: Masculinity and Responsibility', 'Covered Court', 'Male Students'],
            ['SOGIESC Rights and Campus Inclusivity Workshop', 'Conference Room B', 'Student Leaders and Faculty'],
        ] : [
            ['GAD Orientation — New Student Intake 2026', 'Lecture Hall B', 'Freshmen'],
            ['Safe Spaces Act Refresher for Returning Students', 'Function Hall A', 'All Students'],
            ['Women in Leadership Symposium', 'University Auditorium', 'Female Students'],
            ['Gender-Fair Language Workshop', 'Conference Room A', 'Faculty and Student Leaders'],
            ['Gender-Based Violence Awareness Month Activities', 'Various Venues', 'All Students'],
            ['GAD Plan Consultative Assembly', 'Board Room', 'Faculty and Staff GAD Focal Points'],
        ];

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

        $programs = $ay === '2025-2026' ? [
            ['Job Fair 2025', 'Gymnasium', 'Final Year Students', 68],
            ['Resume Writing and LinkedIn Optimization Workshop', 'Computer Lab 3', 'All Students', 0],
            ['Mock Interview Training', 'Function Room 1', 'Graduating Students', 0],
            ['Industry Immersion Program – ICT Sector', 'Off-Campus, Ortigas', 'OJT Students', 0],
            ['Career Pathing Seminar: Navigating Your First Job', 'Lecture Hall C', 'All Students', 25],
            ['Entrepreneurship and Self-Employment Forum', 'Multipurpose Hall', 'Business and STEM Students', 40],
        ] : [
            ['Job Fair 2026', 'Gymnasium', 'Final Year Students', 75],
            ['Portfolio and Cover Letter Masterclass', 'Computer Lab 2', 'All Students', 20],
            ['Industry Talks Series: Tech, Healthcare, Business', 'Lecture Hall A', 'All Students', 30],
            ['Graduate School Preparation Workshop', 'Conference Room A', 'Graduating Students', 10],
            ['OJT and Practicum Orientation', 'Auditorium', '3rd Year Students', 0],
            ['Career Coaching One-on-One Sessions', 'Career Dev Center', 'Graduating Students', 0],
            ['Alumni Mentoring Night', 'Function Hall B', 'All Students', 50],
        ];

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

        $programs = $ay === '2025-2026' ? [
            ['Stress Management Seminar', 'Guidance Center', 'Guidance Center', 'College Freshmen'],
            ['Individual Counseling Program', 'Guidance Center', 'Guidance Center', 'All Year Levels'],
            ['Group Dynamics and Team Building', 'Covered Court', 'Guidance Center', '2nd Year and Above'],
            ['Test Anxiety and Study Skills Workshop', 'Lecture Hall A', 'Guidance Center', 'All Year Levels'],
            ['Peer Facilitator Training Program', 'Conference Room A', 'Guidance Center', 'Selected Peer Counselors'],
        ] : [
            ['Psychological First Aid Training', 'Guidance Center', 'Guidance Center', 'Peer Counselors and Student Leaders'],
            ['Mindfulness and Self-Care Workshop', 'Function Hall A', 'Guidance Center', 'All Students'],
            ['Individual Counseling Program – AY 2026-2027', 'Guidance Center', 'Guidance Center', 'All Year Levels'],
            ['Academic Adjustment Seminar for Freshmen', 'Lecture Hall B', 'Guidance Center', 'Freshmen'],
            ['Crisis Intervention Orientation', 'Conference Room B', 'Guidance Center', 'Faculty and Staff'],
            ['Group Counseling: Relationships and Social Boundaries', 'Guidance Center', 'Guidance Center', '1st and 2nd Year'],
        ];

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
        $isFirst = $ay === '2025-2026';
        DB::table('annex_d_submissions')->insert(array_merge([
            'submission_id'               => $this->uuid(),
            'hei_id'                      => $hei->id,
            'academic_year'               => $ay,
            'status'                      => 'submitted',
            'version_publication_date'    => $isFirst ? 'June 2025' : 'June 2026 (Revised Edition)',
            'officer_in_charge'           => 'Dr. Maria Angela Santos, VP for Student Affairs',
            'handbook_committee'          => $isFirst
                ? 'Dr. Maria Santos, Prof. Jose Reyes, Ms. Ana Cruz, Mr. Ben Torres'
                : 'Dr. Maria Santos, Prof. Jose Reyes, Atty. Ramon Torres, Ms. Ana Cruz, Dr. Liza Macaraeg',
            'dissemination_orientation'   => true,
            'orientation_dates'           => $isFirst ? 'June 10-12, 2025' : 'June 8-10, 2026',
            'mode_of_delivery'            => 'Face-to-face and Online',
            'dissemination_uploaded'      => true,
            'dissemination_others'        => $isFirst ? false : true,
            'dissemination_others_text'   => $isFirst ? null : 'Distributed via University LMS (Canvas)',
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
            'has_foreign_students'        => !$isFirst,
            'has_disaster_management'     => true,
            'has_safe_spaces'             => true,
            'has_anti_hazing'             => true,
            'has_anti_bullying'           => true,
            'has_violence_against_women'  => true,
            'has_gender_fair'             => true,
            'has_others'                  => !$isFirst,
            'has_others_text'             => $isFirst ? null : 'Mental Health Policy (RA 11036)',
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

        $orgs = $ay === '2025-2026' ? [
            ['Supreme Student Government', 8, '2017', 'Prof. Lina Reyes', 'Student Governance and Civic Engagement', '₱500/year'],
            ['Science and Technology Society', 5, '2020', 'Engr. Mark Dela Cruz', 'Academic/Technical', '₱300/year'],
            ['University Chorale', 12, '2013', 'Dr. Elena Magsino', 'Arts and Culture', '₱400/year'],
            ['Red Cross Youth Chapter', 6, '2019', 'Nurse Carla Santos', 'Civic / Humanitarian', '₱250/year'],
            ['Engineering Students Society', 3, '2022', 'Engr. Ryan Flores', 'Academic/Technical', '₱350/year'],
            ['DSU Sports Club', 4, '2021', 'Coach Mario Bautista', 'Sports and Recreation', '₱300/year'],
            ['Environmental Advocates Group', 2, '2023', 'Prof. Rina Valdez', 'Environmental Advocacy', '₱200/year'],
        ] : [
            ['Supreme Student Government', 9, '2017', 'Prof. Lina Reyes', 'Student Governance and Civic Engagement', '₱550/year'],
            ['Science and Technology Society', 6, '2020', 'Engr. Mark Dela Cruz', 'Academic/Technical', '₱300/year'],
            ['University Chorale', 13, '2013', 'Dr. Elena Magsino', 'Arts and Culture', '₱450/year'],
            ['Red Cross Youth Chapter', 7, '2019', 'Nurse Carla Santos', 'Civic / Humanitarian', '₱250/year'],
            ['Engineering Students Society', 4, '2022', 'Engr. Ryan Flores', 'Academic/Technical', '₱350/year'],
            ['DSU Sports Club', 5, '2021', 'Coach Mario Bautista', 'Sports and Recreation', '₱300/year'],
            ['Environmental Advocates Group', 3, '2023', 'Prof. Rina Valdez', 'Environmental Advocacy', '₱200/year'],
            ['Nursing Students Association', 2, '2025', 'Dr. Grace Tan', 'Academic/Health', '₱300/year'],
            ['Business and Entrepreneurship Society', 1, '2026', 'Prof. Allan Chua', 'Academic/Business', '₱250/year'],
        ];

        foreach ($orgs as [$name, $years, $since, $adviser, $spec, $fee]) {
            DB::table('annex_e_organizations')->insert(array_merge([
                'batch_id'                     => $batchId,
                'name_of_accredited'           => $name,
                'years_of_existence'           => $years,
                'accredited_since'             => $since,
                'faculty_adviser'              => $adviser,
                'president_and_officers'       => 'President: ' . $this->faker->name()
                    . '; VP Internal: ' . $this->faker->name()
                    . '; VP External: ' . $this->faker->name()
                    . '; Secretary: ' . $this->faker->name()
                    . '; Treasurer: ' . $this->faker->name(),
                'specialization'               => $spec,
                'fee_collected'                => $fee,
                'programs_projects_activities' => 'General assemblies, outreach programs, inter-school competitions, leadership training, annual congress, fundraising events.',
            ], $this->ts()));
        }
    }

    // =========================================================================
    // ANNEX F — Student Discipline
    // =========================================================================

    private function seedAnnexF(HEI $hei, string $ay): void
    {
        $isFirst = $ay === '2025-2026';
        $batchId = $this->uuid();
        DB::table('annex_f_batches')->insert(array_merge([
            'batch_id'                     => $batchId,
            'hei_id'                       => $hei->id,
            'academic_year'                => $ay,
            'status'                       => 'submitted',
            'procedure_mechanism'          => 'Written complaint filed at the Student Discipline Office (SDO). SDO conducts preliminary investigation within 5 working days, followed by formal hearing if warranted. Decision rendered within 30 days.',
            'complaint_desk'               => 'Student Discipline Office, Administration Building Room 102, open Monday–Friday 8AM–5PM',
            'student_discipline_committee' => $isFirst
                ? 'Dr. Jose Dela Torre (Chair), Prof. Ana Ramos, Prof. Ben Reyes, Ms. Cris Ocampo (Student Rep), Atty. Ramon Torres (Legal Adviser)'
                : 'Dr. Jose Dela Torre (Chair), Prof. Ana Ramos, Prof. Noel Cruz, Ms. Patricia Lim (Student Rep), Atty. Ramon Torres (Legal Adviser)',
            'request_notes'                => null,
            'cancelled_notes'              => null,
        ], $this->ts()));

        $activities = $isFirst ? [
            ['Anti-Hazing Orientation for New Students', '2025-07-15', 'Conducted'],
            ['Student Discipline Forum – Policies and Procedures', '2025-09-10', 'Conducted'],
            ['Safe Spaces Act (RA 11313) Compliance Audit', '2025-11-20', 'Conducted'],
            ['Year-End Disciplinary Case Review and Documentation', '2026-03-15', 'Conducted'],
            ['Student Rights and Responsibilities Seminar', '2025-08-22', 'Conducted'],
        ] : [
            ['Anti-Hazing Orientation – AY 2026-2027', '2026-07-20', 'Conducted'],
            ['Student Code of Conduct Walkthrough', '2026-09-05', 'Conducted'],
            ['Safe Spaces Act Refresher', '2026-11-18', 'Conducted'],
            ['Year-End Disciplinary Case Review', '2027-03-20', 'Conducted'],
            ['Due Process Rights Seminar for Students', '2026-08-28', 'Conducted'],
            ['Social Media Conduct and Cyber-Bullying Forum', '2026-10-14', 'Conducted'],
        ];

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
        $isFirst  = $ay === '2025-2026';
        $subId    = $this->uuid();

        DB::table('annex_g_submissions')->insert(array_merge([
            'submission_id'                   => $subId,
            'hei_id'                          => $hei->id,
            'academic_year'                   => $ay,
            'status'                          => 'submitted',
            'official_school_name'            => 'Demo State University',
            'student_publication_name'        => 'The Demo Torch',
            'publication_fee_per_student'     => $isFirst ? 75.00 : 80.00,
            'frequency_monthly'               => false,
            'frequency_quarterly'             => true,
            'frequency_annual'                => false,
            'frequency_per_semester'          => false,
            'frequency_others'                => false,
            'frequency_others_specify'        => null,
            'publication_type_newsletter'     => false,
            'publication_type_gazette'        => false,
            'publication_type_magazine'       => true,
            'publication_type_others'         => $isFirst ? false : true,
            'publication_type_others_specify' => $isFirst ? null : 'Digital Blog / Online Edition',
            'adviser_name'                    => 'Prof. Josephine Reyes',
            'adviser_position_designation'    => 'Faculty Adviser, Department of Communication',
            'request_notes'                   => null,
            'cancelled_notes'                 => null,
        ], $this->ts()));

        $boardPositions = [
            ['Editor-in-Chief',       'BS Communication, 4th Year'],
            ['Managing Editor',       'BS Journalism, 3rd Year'],
            ['News Editor',           'BS Communication, 3rd Year'],
            ['Features Editor',       'BS Journalism, 2nd Year'],
            ['Opinion Editor',        'BA Political Science, 3rd Year'],
            ['Sports Editor',         'BS Physical Education, 2nd Year'],
            ['Layout Artist / Designer', 'BS Multimedia Arts, 2nd Year'],
            ['Photojournalist',       'BS Communication, 2nd Year'],
        ];

        foreach ($boardPositions as [$position, $program]) {
            DB::table('annex_g_editorial_boards')->insert(array_merge([
                'submission_id'               => $subId,
                'name'                        => $this->faker->name(),
                'position_in_editorial_board' => $position,
                'degree_program_year_level'   => $program,
            ], $this->ts()));
        }

        $otherPubs = $isFirst ? [
            ['Engineering Tribune', 'College of Engineering', 'Newsletter'],
            ['Nursing Pulse', 'College of Nursing', 'Newsletter'],
        ] : [
            ['Engineering Tribune', 'College of Engineering', 'Newsletter'],
            ['Nursing Pulse', 'College of Nursing', 'Newsletter'],
            ['Business Review', 'College of Business Administration', 'Academic Journal'],
        ];

        foreach ($otherPubs as [$pubName, $dept, $type]) {
            DB::table('annex_g_other_publications')->insert(array_merge([
                'submission_id'            => $subId,
                'name_of_publication'      => $pubName,
                'department_unit_in_charge'=> $dept,
                'type_of_publication'      => $type,
            ], $this->ts()));
        }

        $programs = $isFirst ? [
            ['Campus Journalism Training Workshop', '2025-09-20', 'Media Center, Communication Building', 'Student Journalists'],
            ['Press Conference Simulation', '2026-01-15', 'Journalism Lab', 'Student Publication Staff'],
        ] : [
            ['Investigative Journalism Bootcamp', '2026-10-10', 'Media Center, Communication Building', 'Student Journalists'],
            ['Digital Media and Content Creation Workshop', '2027-01-22', 'IT Building Computer Lab', 'Publication Staff and Members'],
            ['Press Freedom and Ethics Seminar', '2026-11-25', 'Function Hall B', 'All Student Media'],
        ];

        foreach ($programs as [$title, $date, $venue, $group]) {
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

        $services = [
            ['Application Assistance and Enrollment Guidance', true, 'Online application portal, guide sheets, walk-in assistance'],
            ['Entrance Examination Administration (DSU-EAT)', true, 'Test permits, exam rooms, answer sheets'],
            ['Scholarship and Financial Aid Information Desk', true, 'Scholarship brochures, eligibility FAQs, application forms'],
            ['PWD and Special Needs Accommodation Services', true, 'Accessible testing rooms, priority lanes, readers if needed'],
            ['Foreign Student / International Admission Assistance', $ay !== '2025-2026', $ay !== '2025-2026' ? 'CHED Form 19, CGFNS evaluation forms' : null],
            ['Student Transfer and Cross-Enrollment Processing', true, 'Permit to Transfer, grades evaluation form'],
            ['Late Enrollment Processing', true, 'Approved exceptions documented, Dean endorsement required'],
        ];

        foreach ($services as [$type, $with, $docs]) {
            DB::table('annex_h_admission_services')->insert(array_merge([
                'batch_id'             => $batchId,
                'service_type'         => $type,
                'with'                 => $with,
                'supporting_documents' => $docs,
                'remarks'              => null,
            ], $this->ts()));
        }

        $programs = [
            ['BS Computer Science', 520, 0.72, 0.88],
            ['BS Nursing', 480, 0.65, 0.90],
            ['BS Education (BEEd)', 310, 0.78, 0.85],
            ['BS Business Administration', 560, 0.70, 0.87],
            ['BS Civil Engineering', 390, 0.60, 0.82],
            ['BS Information Technology', 420, 0.75, 0.90],
            ['BS Psychology', 290, 0.80, 0.92],
            ['BS Accountancy', 340, 0.55, 0.80],
        ];

        foreach ($programs as [$prog, $baseApplicants, $admitRate, $enrollRate]) {
            $applicants = (int) ($baseApplicants * $this->faker->randomFloat(2, 0.90, 1.15));
            $admitted   = (int) ($applicants * $admitRate   * $this->faker->randomFloat(2, 0.95, 1.05));
            $enrolled   = (int) ($admitted   * $enrollRate  * $this->faker->randomFloat(2, 0.95, 1.05));
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

        $scholarships = [
            ['CHED Excellence Scholarship (CHED-ES)', 'Government', 'Academically Excellent Undergraduate Students', 45, null],
            ['Tulong Dunong Program (TDP)', 'Government', 'Economically Disadvantaged Students', 120, 'In coordination with CHED Regional Office'],
            ['Free Higher Education (RA 10931)', 'Government', 'Qualified Filipino Students in SUCs', 2800, 'Covers full tuition and other school fees'],
            ['DSU Institutional Academic Excellence Award', 'Institutional', 'Top 5% GPA per Department per Semester', 85, null],
            ['DSU Athletics Scholarship', 'Institutional', 'Varsity Athletes with Academic Standing', 28, 'Requires maintenance of 2.0 GWA'],
            ['DSU Student Leaders Scholarship', 'Institutional', 'SSG and College Council Officers', 35, null],
            ['DSWD Scholarship (AICS)', 'Government', 'Solo Parents, PWDs, and Disadvantaged Youth', 60, null],
            ['Private Benefactor Endowment – Santos Family', 'Private', 'Engineering Students with Financial Need', 15, 'Cash grant ₱15,000/semester'],
            ['Industry Partnership Scholarship – TechCorp PH', 'Private', 'IT and CS Students, Top 10 per Cohort', 10, 'With OJT placement guarantee'],
        ];

        foreach ($scholarships as [$name, $type, $category, $beneficiaries, $remarks]) {
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

        $services = [
            ['University Main Cafeteria', 'Institutional Cafeteria', 'DSU Food Services Office', 'Main Building, Ground Floor', 1800, 'Full hot meals, à la carte, and packed meals available 6AM–6PM'],
            ['Engineering Building Canteen', 'Institutional Cafeteria', 'DSU Food Services Office', 'Engineering Building, Ground Floor', 550, 'Snacks, rice meals, beverages'],
            ['University Mini-Mart and Grocery', 'Institutional Store', 'DSU Auxiliary Services', 'Beside Gate 1 Guard House', 900, 'Grocery items, school supplies, and frozen goods'],
            ['Mang Juan Carinderia', 'Concessionaire', 'Juan Santos', 'Near Gate 2, Outside Campus', 320, 'Budget meals, bilao rice, ulam express'],
            ['Brew & Go Coffee Shop', 'Concessionaire', 'Brew & Go PH Corp.', 'Library Building Lobby', 210, 'Coffee, tea, baked goods; free Wi-Fi available'],
            ['Health Bar by DSU Health Services', 'Institutional', 'DSU Health Services Unit', 'Student Center Building', 150, 'Healthy food options, fresh juices, no-sugar items'],
        ];

        foreach ($services as [$name, $type, $operator, $location, $served, $remarks]) {
            DB::table('annex_i1_food_services')->insert(array_merge([
                'batch_id'                  => $batchId,
                'service_name'              => $name,
                'service_type'              => $type,
                'operator_name'             => $operator,
                'location'                  => $location,
                'number_of_students_served' => $served,
                'remarks'                   => $remarks,
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

        $programs = $ay === '2025-2026' ? [
            ['Annual Medical, Dental, and Optical Examination', 'University Medical Center', 3600],
            ['Blood Donation Drive in Partnership with Philippine Red Cross', 'Philippine Red Cross', 180],
            ['Basic Life Support and First Aid Training', 'University Health Unit', 95],
            ['Mental Health Screening and Psychosocial Support', 'Guidance Center', 210],
            ['Drug Testing Program (RA 9165)', 'University Medical Center', 1200],
            ['HIV/AIDS Awareness and Free Testing', 'University Health Unit', 140],
            ['Nutrition Month Celebration and BMI Monitoring', 'Gymnasium', 800],
        ] : [
            ['Annual Medical, Dental, and Optical Examination', 'University Medical Center', 3800],
            ['Blood Donation Drive', 'Philippine Red Cross', 200],
            ['Advanced First Aid and Emergency Response Training', 'University Health Unit', 110],
            ['Mental Wellness Screening and Referral System', 'Guidance Center', 250],
            ['Mandatory Drug Testing Program', 'University Medical Center', 1350],
            ['Sexual and Reproductive Health Seminar', 'Lecture Hall C', 320],
            ['Dengue and Water-Borne Disease Prevention Campaign', 'Gymnasium', 600],
            ['Cervical Cancer Awareness and Vaccination Drive', 'University Medical Center', 430],
        ];

        foreach ($programs as [$title, $organizer, $participants]) {
            DB::table('annex_j_programs')->insert(array_merge([
                'batch_id'               => $batchId,
                'title_of_program'       => $title,
                'organizer'              => $organizer,
                'number_of_participants' => $participants,
                'remarks'                => null,
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

        $committees = [
            [
                'Student Welfare and Development Committee (SWDC)',
                'Dr. Maria Angela Santos',
                'Dr. Maria Santos (Chair); Prof. Jose Reyes; Ms. Ana Cruz; Mr. Carlo Mendoza; Ms. Lea Villanueva (Student Rep SSG); Mr. Pedro Garcia (CHED Coordinator)',
                'Monthly student welfare monitoring; scholarship endorsement and processing; student grievance resolution; quarterly SAS budget review; annual student satisfaction survey.'
            ],
            [
                'Student Discipline Board (SDB)',
                'Atty. Ramon Torres',
                'Atty. Ramon Torres (Chair); Prof. Elena Bautista; Mr. Noel Ocampo; Ms. Pia Santos (Student Rep); Dr. Jose Dela Torre (Dean Rep)',
                'Disciplinary hearings and adjudication; student code of conduct review and updating; anti-hazing compliance monitoring; drug-free campus policy enforcement.'
            ],
            [
                'Campus Media and Publication Committee',
                'Prof. Josephine Reyes',
                'Prof. Josephine Reyes (Chair); Prof. Mike Garcia; Mr. Ben Torres; Student Publication Officers (EIC and Managing Editor)',
                'Supervision of campus journalism programs; approval of publication calendar; media equipment procurement; press freedom policy implementation.'
            ],
            [
                'Student Health and Wellness Committee',
                'Dr. Grace Tan',
                'Dr. Grace Tan (Chair, University Physician); Nurse Carla Santos; Ms. Ana Ramos (Guidance); Mr. Carlo Mendoza (PE); Student Health Rep',
                'Health program planning and monitoring; annual medical examination coordination; mental health program implementation; COVID-19 and infectious disease preparedness.'
            ],
            [
                'Scholarship and Financial Aid Committee',
                'Dr. Liza Macaraeg',
                'Dr. Liza Macaraeg (Chair); Finance Officer; Registrar Rep; Student Affairs Rep; SSG Treasurer',
                'Scholarship policy review; beneficiary selection and endorsement; monitoring of compliance requirements; coordination with CHED, DSWD, and private donors.'
            ],
        ];

        foreach ($committees as [$name, $head, $members, $activities]) {
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

        $housings = [
            ['DSU Women\'s Dormitory – Sampaguita Hall', '45 Campus Road, Inside University Compound, Quezon City', 'Ms. Carla Ramos', false, true, false, null, 'Capacity: 120 residents; with common kitchen, study rooms, and laundry area.'],
            ['DSU Men\'s Dormitory – Narra Hall', '47 Campus Road, Inside University Compound, Quezon City', 'Mr. Eduardo Cruz', true, false, false, null, 'Capacity: 90 residents; curfew at 10PM enforced.'],
            ['Graduate Students Residence Hall – Acacia Hall', '50 University Ave., Quezon City', 'Dr. Liza Macaraeg', false, false, true, null, 'Co-ed by floor; capacity 60 residents; graduate and post-grad only.'],
            ['University Guest House', '55 University Ave., Quezon City', 'Ms. Rosario Navarro', false, false, true, null, 'Short-term accommodation for visiting scholars and parents; 10 rooms.'],
        ];

        foreach ($housings as [$name, $address, $manager, $male, $female, $coed, $others, $remarks]) {
            DB::table('annex_l_housings')->insert(array_merge([
                'batch_id'           => $batchId,
                'housing_name'       => $name,
                'complete_address'   => $address,
                'house_manager_name' => $manager,
                'male'               => $male,
                'female'             => $female,
                'coed'               => $coed,
                'others'             => $others,
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

        $services = $ay === '2025-2026' ? [
            ['Student Visa Assistance and Extension Support', 'Administrative Support', 'Korean', 14, 'Dr. Karen Yu, International Affairs Office'],
            ['Cultural Integration and Orientation Program', 'Orientation Program', 'All Nationalities', 38, 'Prof. Jake Dela Rosa'],
            ['International Student Buddy System', 'Peer Support', 'Chinese', 22, 'Ms. Lina Santos, Student Affairs'],
            ['English Language Support Program', 'Academic Support', 'Non-English Speaking Students', 18, 'Prof. Maria Cruz, Language Center'],
        ] : [
            ['Student Visa and Special Study Permit Assistance', 'Administrative Support', 'Korean and Chinese', 20, 'Dr. Karen Yu, International Affairs Office'],
            ['Cultural Integration and Campus Orientation', 'Orientation Program', 'All Nationalities', 45, 'Prof. Jake Dela Rosa'],
            ['International Student Buddy and Mentoring System', 'Peer Support', 'All Nationalities', 30, 'Ms. Lina Santos, Student Affairs'],
            ['English Language Support Program', 'Academic Support', 'Non-English Speaking Students', 24, 'Prof. Maria Cruz, Language Center'],
            ['International Student Welfare and Mental Health Support', 'Counseling Support', 'All International Students', 15, 'Guidance Center – International Counselor'],
        ];

        foreach ($services as [$name, $type, $nationality, $served, $officer]) {
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
        $isFirst = $ay === '2025-2026';
        $batchId = $this->uuid();
        DB::table('annex_m_batches')->insert(array_merge([
            'batch_id'        => $batchId,
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
        ], $this->ts()));

        $stats = $isFirst ? [
            ['Medical Consultation',         null,                  json_encode(['sem1' => 820, 'sem2' => 910]),   false, 1],
            ['Dental Consultation',          null,                  json_encode(['sem1' => 430, 'sem2' => 510]),   false, 2],
            ['Mental Health Referrals',      null,                  json_encode(['sem1' => 95,  'sem2' => 115]),   false, 3],
            ['Drug Testing (RA 9165)',        null,                  json_encode(['sem1' => 600, 'sem2' => 600]),   false, 4],
            ['Emergency Cases Handled',      null,                  json_encode(['sem1' => 42,  'sem2' => 38]),    false, 5],
            ['Health Services Total',        null,                  json_encode(['sem1' => 1987,'sem2' => 2173]),  true,  6],
        ] : [
            ['Medical Consultation',         null,                  json_encode(['sem1' => 890, 'sem2' => 970]),   false, 1],
            ['Dental Consultation',          null,                  json_encode(['sem1' => 470, 'sem2' => 540]),   false, 2],
            ['Mental Health Referrals',      null,                  json_encode(['sem1' => 120, 'sem2' => 135]),   false, 3],
            ['Drug Testing (RA 9165)',        null,                  json_encode(['sem1' => 680, 'sem2' => 680]),   false, 4],
            ['Emergency Cases Handled',      null,                  json_encode(['sem1' => 50,  'sem2' => 44]),    false, 5],
            ['Vaccination (Flu)',             null,                  json_encode(['sem1' => 200, 'sem2' => 0]),     false, 6],
            ['Health Services Total',        null,                  json_encode(['sem1' => 2410,'sem2' => 2369]),  true,  7],
        ];

        foreach ($stats as [$category, $subcategory, $yearData, $isSubtotal, $order]) {
            DB::table('annex_m_statistics')->insert(array_merge([
                'batch_id'      => $batchId,
                'category'      => $category,
                'subcategory'   => $subcategory,
                'year_data'     => $yearData,
                'is_subtotal'   => $isSubtotal,
                'display_order' => $order,
            ], $this->ts()));
        }

        $services = [
            ['Health Services', 'Primary Care',          'Free outpatient medical consultation, basic laboratory, prescription',     $isFirst ? 1500 : 1650, null, 1],
            ['Health Services', 'Dental Care',            'Dental examination, oral prophylaxis (cleaning), tooth extraction',       $isFirst ? 400  : 440,  null, 2],
            ['Health Services', 'Emergency Care',         'First aid, stabilization, ambulance referral to partner hospitals',       $isFirst ? 80   : 94,   null, 3],
            ['Health Services', 'Drug Testing',           'Random and mandatory drug testing per RA 9165',                           $isFirst ? 1200 : 1360, null, 4],
            ['Psychological Services', null,              'Individual counseling, group therapy, psychological assessments',         $isFirst ? 250  : 310,  null, 5],
            ['Health Services', 'Optical',                'Vision screening and referral to partner optical clinics',                $isFirst ? 300  : 340,  null, 6],
            ['Preventive Programs', 'Health Education',   'Health promotion seminars, nutrition month, anti-smoking campaign',       $isFirst ? 2000 : 2200, null, 7],
        ];

        foreach ($services as [$section, $category, $program, $beneficiaries, $remarks, $order]) {
            DB::table('annex_m_services')->insert(array_merge([
                'batch_id'                                   => $batchId,
                'section'                                    => $section,
                'category'                                   => $category,
                'institutional_services_programs_activities' => $program,
                'number_of_beneficiaries_participants'       => $beneficiaries,
                'remarks'                                    => $remarks,
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

        $activities = $ay === '2025-2026' ? [
            ['Intramural Sports Festival 2025', 'University Sports Complex', 'Sports and Recreation Office', 920],
            ['Inter-College Basketball League', 'Covered Gymnasium', 'Athletics Department', 260],
            ['Inter-College Volleyball Tournament', 'Covered Gymnasium', 'Athletics Department', 175],
            ['DSU Fun Run and Health Walk', 'Campus Grounds to Quezon Memorial Circle', 'Health and Wellness Office', 540],
            ['Badminton and Table Tennis Doubles Open', 'Covered Court', 'Athletics Department', 130],
            ['Yoga and Mindfulness Fitness Class (Semester-long)', 'Dance Studio', 'PE Department', 80],
        ] : [
            ['Intramural Sports Festival 2026', 'University Sports Complex', 'Sports and Recreation Office', 1000],
            ['Inter-College Basketball League 2026', 'Covered Gymnasium', 'Athletics Department', 280],
            ['Inter-College Volleyball and Sepak Takraw', 'Covered Gymnasium', 'Athletics Department', 190],
            ['DSU Run for Health 2026', 'Campus Grounds', 'Health and Wellness Office', 600],
            ['Chess, Darts, and Billiards Tournament', 'Student Center', 'Athletics Department', 145],
            ['Zumba and Dance Fitness Open Class', 'Dance Studio', 'PE Department', 95],
            ['Swimming Lessons and Water Safety Program', 'University Pool', 'Athletics Department', 120],
        ];

        foreach ($activities as [$title, $venue, $organizer, $participants]) {
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

        $programs = $ay === '2025-2026' ? [
            ['Basketball Varsity Development Program', 'Basketball', 'Athletics Department', 'DSU Gymnasium', 24],
            ['Swimming Varsity Training Program', 'Swimming', 'Athletics Department', 'University Pool', 20],
            ['SCUAA / PRISAA Sports Participation', 'Multi-Sport', 'Athletics Department', 'Various Venues – Regional', 58],
            ['Badminton Varsity Program', 'Badminton', 'Athletics Department', 'DSU Covered Court', 16],
            ['Volleyball Varsity (Men and Women)', 'Volleyball', 'Athletics Department', 'DSU Gymnasium', 24],
        ] : [
            ['Basketball Varsity Development Program 2026', 'Basketball', 'Athletics Department', 'DSU Gymnasium', 26],
            ['Swimming and Aquatics Varsity Program', 'Swimming', 'Athletics Department', 'University Pool', 22],
            ['SCUAA / PRISAA Multi-Sport Campaign 2026', 'Multi-Sport', 'Athletics Department', 'Various Regional Venues', 65],
            ['Badminton and Tennis Varsity Program', 'Badminton/Tennis', 'Athletics Department', 'DSU Covered Court', 20],
            ['Volleyball Varsity (Men and Women)', 'Volleyball', 'Athletics Department', 'DSU Gymnasium', 24],
            ['Athletics (Track and Field) Program', 'Track and Field', 'Athletics Department', 'DSU Track Oval', 18],
        ];

        foreach ($programs as [$title, $sport, $organizer, $venue, $count]) {
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

        $programs = $ay === '2025-2026' ? [
            ['Brigada Eskwela 2025', '2025-06-02', 350, 'School Maintenance', 'Elementary Students, Parents, and LGU Workers'],
            ['Coastal Clean-Up Drive – Manila Bay', '2025-09-25', 220, 'Environmental Service', 'Coastal Community Residents, Quezon City'],
            ['Free Medical and Dental Mission', '2025-10-15', 480, 'Health Service', 'Urban Poor Residents, Barangay Batasan Hills'],
            ['Tree Planting and Urban Gardening Activity', '2025-11-05', 170, 'Environmental Service', 'Rural Community, San Jose del Monte, Bulacan'],
            ['Livelihood Training for Out-of-School Youth', '2026-02-20', 80, 'Livelihood Training', 'Out-of-School Youth, Payatas, Quezon City'],
            ['Disaster Preparedness Simulation (Earthquake)', '2025-08-10', 300, 'Disaster Risk Reduction', 'Barangay Officials and Residents, Quezon City'],
            ['Technology Literacy for Senior Citizens', '2025-10-28', 90, 'Technology Education', 'Senior Citizens, Barangay Commonwealth'],
        ] : [
            ['Brigada Eskwela 2026', '2026-06-01', 380, 'School Maintenance', 'Elementary Students and Parents'],
            ['River and Watershed Cleanup Campaign', '2026-09-22', 250, 'Environmental Service', 'Marikina River Community Residents'],
            ['Free Medical Mission and Wellness Fair', '2026-10-20', 520, 'Health Service', 'Urban Poor Residents, Barangay Holy Spirit'],
            ['Mangrove Reforestation Project', '2026-11-08', 190, 'Environmental Service', 'Coastal Community, Cavite City'],
            ['Skills Training for Women Returnees', '2027-02-10', 95, 'Livelihood Training', 'Women Returnees from Overseas Work'],
            ['Food Security and Organic Farming Seminar', '2026-08-15', 120, 'Agricultural Extension', 'Urban Farmers, Quezon City'],
            ['Financial Literacy for Marginalized Families', '2026-10-05', 110, 'Community Education', 'Low-Income Families, Barangay Batasan Hills'],
            ['Scholarship Awareness Campaign in High Schools', '2027-01-20', 450, 'Educational Outreach', 'High School Students and Parents, QC Public Schools'],
        ];

        foreach ($programs as [$title, $date, $beneficiaries, $type, $community]) {
            DB::table('annex_o_programs')->insert(array_merge([
                'batch_id'                   => $batchId,
                'title_of_program'           => $title,
                'date_conducted'             => $date,
                'number_of_beneficiaries'    => $beneficiaries,
                'type_of_community_service'  => $type,
                'community_population_served'=> $community,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // MER1 — SAS Head Profile
    // =========================================================================

    private function seedMer1(HEI $hei, string $ay): void
    {
        $isFirst = $ay === '2025-2026';
        $mer1 = DB::table('mer1_submissions')->insertGetId(array_merge([
            'hei_id'             => $hei->id,
            'academic_year'      => $ay,
            'status'             => 'submitted',
            'sas_head_name'      => 'Dr. Maria Angela Santos',
            'sas_head_position'  => 'Vice President for Student Affairs and Services',
            'permanent_status'   => 'Permanent',
            'other_achievements' => $isFirst
                ? 'Best SAS Head Award, CHED Region IV-A (2023); Certified Student Affairs Professional (CSAP); Published: "Student Affairs Governance in Philippine SUCs" (2022)'
                : 'National Outstanding SAS Head Award (CHED, 2025); Doctor of Education (EdD) conferred 2024, PNU; Guest Speaker, CHED National SAS Summit 2026',
            'request_notes'      => null,
            'cancelled_notes'    => null,
            'admin_notes'        => null,
        ], $this->ts()));

        $attainments = $isFirst ? [
            ['Doctor of Philosophy in Educational Management', 'University of the Philippines Diliman', '2015'],
            ['Master of Arts in Student Personnel Administration', 'De La Salle University', '2008'],
            ['Bachelor of Science in Psychology', 'Ateneo de Manila University', '2003'],
        ] : [
            ['Doctor of Education in Educational Leadership and Management', 'Philippine Normal University', '2024'],
            ['Doctor of Philosophy in Educational Management', 'University of the Philippines Diliman', '2015'],
            ['Master of Arts in Student Personnel Administration', 'De La Salle University', '2008'],
            ['Bachelor of Science in Psychology', 'Ateneo de Manila University', '2003'],
        ];

        foreach ($attainments as [$degree, $school, $year]) {
            DB::table('mer1_educational_attainments')->insert(array_merge([
                'mer1_submission_id' => $mer1,
                'degree_program'     => $degree,
                'school'             => $school,
                'year'               => $year,
            ], $this->ts()));
        }

        $trainings = $isFirst ? [
            ['Strategic Leadership in Higher Education', 'March 12-14, 2025'],
            ['Student Affairs Management in the New Normal', 'July 8-10, 2025'],
            ['CHED SAS Compliance and Best Practices Workshop', 'November 5-6, 2025'],
            ['Mental Health in Higher Education: Institutional Response', 'September 20, 2025'],
        ] : [
            ['ASEAN Student Affairs Summit – Singapore', 'April 5-7, 2026'],
            ['Advanced SAS Leadership Program (CHED)', 'August 14-16, 2026'],
            ['Inclusive Education and Universal Design for Learning', 'October 20-21, 2026'],
            ['Research Methods in Student Affairs Practice', 'January 12-13, 2027'],
            ['Campus Crisis Management and Response', 'March 3-4, 2027'],
        ];

        foreach ($trainings as [$title, $period]) {
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
        $isFirst = $ay === '2025-2026';
        $mer2 = DB::table('mer2_submissions')->insertGetId(array_merge([
            'hei_id'                                  => $hei->id,
            'academic_year'                           => $ay,
            'status'                                  => 'submitted',
            'office_student_affairs_students_handled' => $isFirst ? 7312 : 7645,
            'guidance_office_students_handled'        => $isFirst ? 3500 : 3750,
            'career_dev_center_students_handled'      => $isFirst ? 2800 : 3100,
            'student_dev_welfare_students_handled'    => $isFirst ? 4200 : 4400,
            'request_notes'                           => null,
            'cancelled_notes'                         => null,
            'admin_notes'                             => null,
        ], $this->ts()));

        $personnel = [
            // [office_type, position, tenure, years, qualification, license_no, license_expiry]
            ['office_student_affairs', 'Vice President for Student Affairs and Services', 'Permanent', $isFirst ? 10 : 11, 'PhD Educational Management', null, null],
            ['office_student_affairs', 'SAS Director / Head', 'Permanent', $isFirst ? 7 : 8, 'MA Student Personnel Administration', null, null],
            ['office_student_affairs', 'SAS Administrative Officer III', 'Permanent', $isFirst ? 5 : 6, 'BSBA', null, null],
            ['office_student_affairs', 'SAS Administrative Assistant', 'Permanent', 3, 'AB Communications', null, null],
            ['guidance_office', 'Guidance Services Coordinator', 'Permanent', $isFirst ? 6 : 7, 'MS Counseling Psychology', 'RPsy-00234', $isFirst ? '2026-06-30' : '2028-06-30'],
            ['guidance_office', 'Registered Guidance Counselor I', 'Permanent', $isFirst ? 3 : 4, 'MS Counseling', 'RGC-00567', $isFirst ? '2026-06-30' : '2028-06-30'],
            ['guidance_office', 'Registered Guidance Counselor II', 'Contractual', 2, 'MA Counseling', 'RGC-00891', '2027-06-30'],
            ['career_dev_center', 'Career Development Center Head', 'Permanent', $isFirst ? 4 : 5, 'MBA Human Resources', null, null],
            ['career_dev_center', 'Career Development Specialist', 'Permanent', 2, 'BS Psychology', null, null],
            ['career_dev_center', 'Job Placement Coordinator', 'Contractual', 1, 'BS Business Administration', null, null],
            ['student_dev_welfare', 'Student Development and Welfare Officer', 'Permanent', $isFirst ? 5 : 6, 'MA Sociology', null, null],
            ['student_dev_welfare', 'Student Organization Adviser', 'Permanent', 3, 'MA Public Administration', null, null],
            ['student_dev_welfare', 'Student Welfare Assistant', 'Job Order', 1, 'AB Political Science', null, null],
        ];

        foreach ($personnel as [$officeType, $position, $tenure, $years, $qualification, $licenseNo, $licenseExpiry]) {
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
        $isFirst = $ay === '2025-2026';
        $mer3 = DB::table('mer3_submissions')->insertGetId(array_merge([
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        $fees = [
            ['Student Development Fee',           'Covers co-curricular and extra-curricular program costs',               $isFirst ? 350.00 : 380.00, 'Per semester, per enrolled student'],
            ['Medical and Dental Fee',            'Annual medical, dental, and optical examination costs',                 $isFirst ? 200.00 : 220.00, 'Per academic year, per student; drug testing included'],
            ['Student Publication Fee',           'Supports printing, distribution, and operations of The Demo Torch',    $isFirst ? 75.00  : 80.00,  'Per academic year, per student'],
            ['Athletics and Sports Fee',          'Intramurals, varsity programs, use of sports facilities',               $isFirst ? 150.00 : 165.00, 'Per academic year, per student'],
            ['Guidance and Counseling Fee',       'Individual and group counseling, psychological testing materials',      $isFirst ? 100.00 : 110.00, 'Per semester, per student'],
            ['Student Organization Fee',          'Distributed among CHED-recognized student organizations',              $isFirst ? 200.00 : 220.00, 'Per academic year, per student; disbursed via SSG'],
            ['Cultural and Arts Fee',             'University cultural night, chorale, dance troupes, competitions',      $isFirst ? 80.00  : 85.00,  'Per semester, per student'],
            ['Community Extension Fee',           'Community service programs and materials costs',                        $isFirst ? 50.00  : 55.00,  'Per academic year, per student'],
            ['Disaster Preparedness Fee',         'Campus emergency drills, first aid kits, evacuation materials',        $isFirst ? 30.00  : 30.00,  'Per academic year, per student; approved by BOR'],
        ];

        foreach ($fees as [$name, $description, $amount, $remarks]) {
            DB::table('mer3_school_fees')->insert(array_merge([
                'mer3_submission_id'  => $mer3,
                'name_of_school_fees' => $name,
                'description'         => $description,
                'amount'              => $amount,
                'remarks'             => $remarks,
            ], $this->ts()));
        }
    }

    // =========================================================================
    // MER4A — Checklist of Compliance Requirements
    // =========================================================================

    private function seedMer4a(HEI $hei, string $ay): void
    {
        $isFirst = $ay === '2025-2026';
        $mer4a = DB::table('mer4a_submissions')->insertGetId(array_merge([
            'hei_id'          => $hei->id,
            'academic_year'   => $ay,
            'status'          => 'submitted',
            'request_notes'   => null,
            'cancelled_notes' => null,
            'admin_notes'     => null,
        ], $this->ts()));

        $sasItems = [
            ['sas_001', 'Approved SAS organizational structure and staffing pattern', true,  $isFirst ? 'BOR-approved June 2024; org chart posted in SAS office and website' : 'Updated BOR Resolution No. 12, Series of 2026'],
            ['sas_002', 'Updated SAS operational manual / policies and procedures',   true,  $isFirst ? 'Reviewed and re-approved June 2025' : 'Revised edition approved June 2026; digital copy in LMS'],
            ['sas_003', 'Annual SAS accomplishment report submitted to CHED',         true,  $isFirst ? 'Submitted via eSAS portal, July 2025' : 'Submitted via eSAS portal, July 2026; CHED acknowledged receipt'],
            ['sas_004', 'SAS budget allocation and utilization report',               true,  $isFirst ? 'Audited by COA, FY 2025' : 'COA audit completed; utilization rate 94.7%'],
            ['sas_005', 'Functional student grievance mechanism and complaint desk',  true,  'SDO Room 102; complaint log updated weekly; average resolution: 12 working days'],
            ['sas_006', 'SAS program and activity calendar published and followed',   true,  $isFirst ? 'Published on university website June 2025; 92% activities conducted as scheduled' : 'Published June 2026; 95% on-schedule implementation'],
            ['sas_007', 'Functional and duly recognized student government',          true,  $isFirst ? 'SSG elections conducted July 2025; COMELEC-supervised' : 'SSG elections July 2026; 68% voter turnout'],
            ['sas_008', 'SAS personnel meet minimum qualifications per CHED standards', true, $isFirst ? 'All permanent SAS staff with relevant graduate degrees' : 'All permanent SAS staff qualified; 2 enrolled in MA programs'],
            ['sas_009', 'Memoranda of Agreement (MOAs) with external service providers', true, $isFirst ? 'MOAs with PRC, NCMH, Philippine Red Cross, and TechCorp PH' : 'MOAs renewed; added LGU Quezon City for community extension'],
            ['sas_010', 'SAS services accessible to PWD students per Magna Carta',   true,  'Ramps, accessible restrooms, priority lanes, and assistive tools available across all SAS units'],
        ];

        foreach ($sasItems as [$rowId, $requirement, $compiled, $remarks]) {
            DB::table('mer4a_sas_management_items')->insert(array_merge([
                'mer4a_submission_id' => $mer4a,
                'row_id'              => $rowId,
                'requirement'         => $requirement,
                'evidence_file'       => null,
                'status_compiled'     => $compiled,
                'hei_remarks'         => $remarks,
            ], $this->ts()));
        }

        $gcItems = [
            ['gc_001', 'Licensed guidance counselor/s employed per student-counselor ratio',              true,  $isFirst ? 'Three (3) RGCs on staff; 1:1,500 ratio (PRC standard)' : 'Four (4) RGCs on staff; 1:1,200 ratio achieved'],
            ['gc_002', 'Functional guidance and counseling office with adequate facilities',              true,  'Guidance Center – Student Services Building, Room 201; individual and group counseling rooms available'],
            ['gc_003', 'Guidance program aligned with RA 9258 (Guidance and Counseling Act of 2004)',    true,  $isFirst ? 'Annual review conducted June 2025' : 'Updated per 2026 CHED Memorandum Order; approved by PRC'],
            ['gc_004', 'Psychological testing instruments available, valid, and properly administered',   true,  'MBTI, SDS Career Interest Inventory, Beck Depression Inventory, and VARK Learning Styles available; administered by RGC only'],
            ['gc_005', 'Individual and group counseling services conducted regularly',                    true,  $isFirst ? '1,240 individual sessions; 38 group sessions – AY 2025-2026' : '1,480 individual sessions; 45 group sessions – AY 2026-2027'],
            ['gc_006', 'Student cumulative records maintained, secured, and updated',                    true,  'Electronic records in Guidance MIS; physical folders in locked cabinets; data privacy compliant per RA 10173'],
            ['gc_007', 'Referral system and MOA with external mental health facilities',                  true,  'MOA with National Center for Mental Health (NCMH) and Quezon City General Hospital Psychiatry Department'],
            ['gc_008', 'Trained peer counselors / peer facilitators deployed in colleges',               true,  $isFirst ? '24 trained peer facilitators across 6 colleges (June 2025 training)' : '32 trained peer facilitators across 8 colleges (August 2026 training)'],
            ['gc_009', 'Guidance programs address mental health per RA 11036 (Mental Health Act)',        true,  $isFirst ? 'Mental Health Policy adopted by BOR June 2025; posted in all buildings' : 'Annual mental health report submitted to DOH and CHED; compliance verified'],
        ];

        foreach ($gcItems as [$rowId, $requirement, $compiled, $remarks]) {
            DB::table('mer4a_guidance_counseling_items')->insert(array_merge([
                'mer4a_submission_id' => $mer4a,
                'row_id'              => $rowId,
                'requirement'         => $requirement,
                'evidence_file'       => null,
                'status_compiled'     => $compiled,
                'hei_remarks'         => $remarks,
            ], $this->ts()));
        }
    }
}
