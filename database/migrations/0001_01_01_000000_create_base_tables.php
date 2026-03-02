<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ========================================
        // HEIS
        // ========================================
        Schema::create('heis', function (Blueprint $table) {
            $table->id();
            $table->string('uii', 6)->unique()->nullable()->comment('Unique Institution Identifier');
            $table->string('name');
            $table->enum('type', ['Private', 'SUC', 'LUC']);
            $table->string('code', 50)->unique()->nullable()->comment('Optional unique HEI code');
            $table->string('email')->nullable()->comment('Institutional email');
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('type');
            $table->index('is_active');
            $table->index('uii');
        });

        // ========================================
        // USERS
        // ========================================
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('account_type', ['superadmin', 'admin', 'hei']);
            $table->unsignedBigInteger('hei_id')->nullable()->comment('Only for HEI users');
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->index('account_type');
            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        // ========================================
        // SETTINGS
        // ========================================
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->timestamps();

            $table->index('key');
        });

        // ========================================
        // SUMMARY
        // ========================================
        Schema::create('summary', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->unsignedInteger('population_male')->default(0);
            $table->unsignedInteger('population_female')->default(0);
            $table->unsignedInteger('population_intersex')->default(0);
            $table->unsignedInteger('population_total')->default(0);
            $table->string('submitted_org_chart', 10)->nullable();
            $table->string('hei_website')->nullable();
            $table->string('sas_website')->nullable();
            $table->json('social_media_contacts')->nullable();
            $table->string('student_handbook')->nullable();
            $table->string('student_publication')->nullable();
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->index('academic_year');
            $table->index('status');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        // ========================================
        // ANNEX A
        // ========================================
        Schema::create('annex_a_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique()->comment('UUID for batch identification');
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('pending');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->index('status');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_a_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title');
            $table->string('venue')->nullable();
            $table->date('implementation_date')->nullable();
            $table->string('target_group')->nullable();
            $table->integer('participants_online')->nullable()->default(0);
            $table->integer('participants_face_to_face')->nullable()->default(0);
            $table->string('organizer')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_a_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX B
        // ========================================
        Schema::create('annex_b_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->index('status');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_b_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title');
            $table->string('venue')->nullable();
            $table->date('implementation_date')->nullable();
            $table->text('target_group')->nullable();
            $table->unsignedInteger('participants_online')->default(0);
            $table->unsignedInteger('participants_face_to_face')->default(0);
            $table->string('organizer')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_b_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX C
        // ========================================
        Schema::create('annex_c_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->index('status');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_c_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title');
            $table->string('venue')->nullable();
            $table->date('implementation_date')->nullable();
            $table->unsignedInteger('participants_online')->default(0);
            $table->unsignedInteger('participants_face_to_face')->default(0);
            $table->string('organizer')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_c_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX D
        // ========================================
        Schema::create('annex_d_submissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->string('version_publication_date')->nullable();
            $table->string('officer_in_charge')->nullable();
            $table->text('handbook_committee')->nullable();
            $table->boolean('dissemination_orientation')->default(false);
            $table->string('orientation_dates')->nullable();
            $table->string('mode_of_delivery')->nullable();
            $table->boolean('dissemination_uploaded')->default(false);
            $table->boolean('dissemination_others')->default(false);
            $table->string('dissemination_others_text')->nullable();
            $table->boolean('type_digital')->default(false);
            $table->boolean('type_printed')->default(false);
            $table->boolean('type_others')->default(false);
            $table->string('type_others_text')->nullable();
            $table->boolean('has_academic_policies')->default(false);
            $table->boolean('has_admission_requirements')->default(false);
            $table->boolean('has_code_of_conduct')->default(false);
            $table->boolean('has_scholarships')->default(false);
            $table->boolean('has_student_publication')->default(false);
            $table->boolean('has_housing_services')->default(false);
            $table->boolean('has_disability_services')->default(false);
            $table->boolean('has_student_council')->default(false);
            $table->boolean('has_refund_policies')->default(false);
            $table->boolean('has_drug_education')->default(false);
            $table->boolean('has_foreign_students')->default(false);
            $table->boolean('has_disaster_management')->default(false);
            $table->boolean('has_safe_spaces')->default(false);
            $table->boolean('has_anti_hazing')->default(false);
            $table->boolean('has_anti_bullying')->default(false);
            $table->boolean('has_violence_against_women')->default(false);
            $table->boolean('has_gender_fair')->default(false);
            $table->boolean('has_others')->default(false);
            $table->string('has_others_text')->nullable();
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        // ========================================
        // ANNEX E
        // ========================================
        Schema::create('annex_e_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_e_organizations', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('name_of_accredited');
            $table->unsignedInteger('years_of_existence')->default(0);
            $table->string('accredited_since');
            $table->string('faculty_adviser')->nullable();
            $table->text('president_and_officers');
            $table->string('specialization');
            $table->string('fee_collected')->nullable();
            $table->text('programs_projects_activities');
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_e_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX F
        // ========================================
        Schema::create('annex_f_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->string('procedure_mechanism')->nullable();
            $table->string('complaint_desk')->nullable();
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_f_activities', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('activity');
            $table->date('date')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_f_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX G
        // ========================================
        Schema::create('annex_g_submissions', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->string('official_school_name')->nullable();
            $table->string('student_publication_name')->nullable();
            $table->decimal('publication_fee_per_student', 10, 2)->nullable();
            $table->boolean('frequency_monthly')->default(false);
            $table->boolean('frequency_quarterly')->default(false);
            $table->boolean('frequency_annual')->default(false);
            $table->boolean('frequency_per_semester')->default(false);
            $table->boolean('frequency_others')->default(false);
            $table->string('frequency_others_specify')->nullable();
            $table->boolean('publication_type_newsletter')->default(false);
            $table->boolean('publication_type_gazette')->default(false);
            $table->boolean('publication_type_magazine')->default(false);
            $table->boolean('publication_type_others')->default(false);
            $table->string('publication_type_others_specify')->nullable();
            $table->string('adviser_name')->nullable();
            $table->string('adviser_position_designation')->nullable();
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_g_editorial_boards', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->string('name');
            $table->string('position_in_editorial_board')->nullable();
            $table->string('degree_program_year_level')->nullable();
            $table->timestamps();

            $table->index('submission_id');
            $table->foreign('submission_id')->references('submission_id')->on('annex_g_submissions')->onDelete('cascade');
        });

        Schema::create('annex_g_other_publications', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->string('name_of_publication');
            $table->string('department_unit_in_charge')->nullable();
            $table->string('type_of_publication', 100)->nullable();
            $table->timestamps();

            $table->index('submission_id');
            $table->foreign('submission_id')->references('submission_id')->on('annex_g_submissions')->onDelete('cascade');
        });

        Schema::create('annex_g_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('submission_id');
            $table->string('title_of_program');
            $table->date('implementation_date')->nullable();
            $table->string('implementation_venue')->nullable();
            $table->string('target_group_of_participants')->nullable();
            $table->timestamps();

            $table->index('submission_id');
            $table->foreign('submission_id')->references('submission_id')->on('annex_g_submissions')->onDelete('cascade');
        });

        // ========================================
        // ANNEX H
        // ========================================
        Schema::create('annex_h_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_h_admission_services', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('service_type');
            $table->boolean('with')->default(false);
            $table->text('supporting_documents')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_h_batches')->onDelete('cascade');
        });

        Schema::create('annex_h_admission_statistics', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('program');
            $table->integer('applicants')->default(0);
            $table->integer('admitted')->default(0);
            $table->integer('enrolled')->default(0);
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_h_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX I
        // ========================================
        Schema::create('annex_i_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_i_scholarships', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('scholarship_name');
            $table->string('type');
            $table->string('category_intended_beneficiaries');
            $table->integer('number_of_beneficiaries');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_i_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX J
        // ========================================
        Schema::create('annex_j_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_j_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title_of_program');
            $table->string('organizer');
            $table->integer('number_of_participants')->nullable()->default(0);
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_j_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX K
        // ========================================
        Schema::create('annex_k_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_k_committees', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('committee_name');
            $table->string('committee_head_name');
            $table->text('members_composition');
            $table->text('programs_projects_activities_trainings');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_k_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX L
        // ========================================
        Schema::create('annex_l_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_l_housings', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('housing_name');
            $table->string('complete_address');
            $table->string('house_manager_name');
            $table->boolean('male')->default(false);
            $table->boolean('female')->default(false);
            $table->boolean('coed')->default(false);
            $table->string('others')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_l_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX M
        // ========================================
        Schema::create('annex_m_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_m_statistics', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->json('year_data')->nullable();
            $table->boolean('is_subtotal')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_m_batches')->onDelete('cascade');
        });

        Schema::create('annex_m_services', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('section');
            $table->string('category')->nullable();
            $table->text('institutional_services_programs_activities');
            $table->integer('number_of_beneficiaries_participants')->default(0);
            $table->text('remarks')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_m_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX N
        // ========================================
        Schema::create('annex_n_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_n_activities', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title_of_activity');
            $table->date('implementation_date');
            $table->string('implementation_venue');
            $table->integer('number_of_participants')->nullable()->default(0);
            $table->string('organizer');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_n_batches')->onDelete('cascade');
        });

        // ========================================
        // ANNEX O
        // ========================================
        Schema::create('annex_o_batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id')->unique();
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);
            $table->string('status', 50)->default('submitted');
            $table->text('request_notes')->nullable();
            $table->text('cancelled_notes')->nullable();
            $table->timestamps();

            $table->index('hei_id');
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
        });

        Schema::create('annex_o_programs', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_id');
            $table->string('title_of_program');
            $table->date('date_conducted');
            $table->integer('number_of_beneficiaries');
            $table->string('type_of_community_service');
            $table->string('community_population_served');
            $table->timestamps();

            $table->index('batch_id');
            $table->foreign('batch_id')->references('batch_id')->on('annex_o_batches')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // Drop in reverse dependency order
        Schema::dropIfExists('annex_o_programs');
        Schema::dropIfExists('annex_o_batches');
        Schema::dropIfExists('annex_n_activities');
        Schema::dropIfExists('annex_n_batches');
        Schema::dropIfExists('annex_m_services');
        Schema::dropIfExists('annex_m_statistics');
        Schema::dropIfExists('annex_m_batches');
        Schema::dropIfExists('annex_l_housings');
        Schema::dropIfExists('annex_l_batches');
        Schema::dropIfExists('annex_k_committees');
        Schema::dropIfExists('annex_k_batches');
        Schema::dropIfExists('annex_j_programs');
        Schema::dropIfExists('annex_j_batches');
        Schema::dropIfExists('annex_i_scholarships');
        Schema::dropIfExists('annex_i_batches');
        Schema::dropIfExists('annex_h_admission_statistics');
        Schema::dropIfExists('annex_h_admission_services');
        Schema::dropIfExists('annex_h_batches');
        Schema::dropIfExists('annex_g_programs');
        Schema::dropIfExists('annex_g_other_publications');
        Schema::dropIfExists('annex_g_editorial_boards');
        Schema::dropIfExists('annex_g_submissions');
        Schema::dropIfExists('annex_f_activities');
        Schema::dropIfExists('annex_f_batches');
        Schema::dropIfExists('annex_e_organizations');
        Schema::dropIfExists('annex_e_batches');
        Schema::dropIfExists('annex_d_submissions');
        Schema::dropIfExists('annex_c_programs');
        Schema::dropIfExists('annex_c_batches');
        Schema::dropIfExists('annex_b_programs');
        Schema::dropIfExists('annex_b_batches');
        Schema::dropIfExists('annex_a_programs');
        Schema::dropIfExists('annex_a_batches');
        Schema::dropIfExists('summary');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('users');
        Schema::dropIfExists('heis');
    }
};
