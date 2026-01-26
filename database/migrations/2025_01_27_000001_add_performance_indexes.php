<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Annex A Batches
        Schema::table('annex_a_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_a_hei_year_status');
            $table->index('status', 'idx_a_status');
            $table->index('created_at', 'idx_a_created');
        });

        // Annex B Batches
        Schema::table('annex_b_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_b_hei_year_status');
            $table->index('status', 'idx_b_status');
            $table->index('created_at', 'idx_b_created');
        });

        // Annex C Batches
        Schema::table('annex_c_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_c_hei_year_status');
            $table->index('status', 'idx_c_status');
            $table->index('created_at', 'idx_c_created');
        });

        // Annex D Batches
        Schema::table('annex_d_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_d_hei_year_status');
            $table->index('status', 'idx_d_status');
            $table->index('created_at', 'idx_d_created');
        });

        // Annex E Batches
        Schema::table('annex_e_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_e_hei_year_status');
            $table->index('status', 'idx_e_status');
            $table->index('created_at', 'idx_e_created');
        });

        // Annex F Batches
        Schema::table('annex_f_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_f_hei_year_status');
            $table->index('status', 'idx_f_status');
            $table->index('created_at', 'idx_f_created');
        });

        // Annex G Batches
        Schema::table('annex_g_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_g_hei_year_status');
            $table->index('status', 'idx_g_status');
            $table->index('created_at', 'idx_g_created');
        });

        // Annex H Batches
        Schema::table('annex_h_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_h_hei_year_status');
            $table->index('status', 'idx_h_status');
            $table->index('created_at', 'idx_h_created');
        });

        // Annex I Batches
        Schema::table('annex_i_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_i_hei_year_status');
            $table->index('status', 'idx_i_status');
            $table->index('created_at', 'idx_i_created');
        });

        // Annex J Batches
        Schema::table('annex_j_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_j_hei_year_status');
            $table->index('status', 'idx_j_status');
            $table->index('created_at', 'idx_j_created');
        });

        // Annex K Batches
        Schema::table('annex_k_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_k_hei_year_status');
            $table->index('status', 'idx_k_status');
            $table->index('created_at', 'idx_k_created');
        });

        // Annex L Batches
        Schema::table('annex_l_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_l_hei_year_status');
            $table->index('status', 'idx_l_status');
            $table->index('created_at', 'idx_l_created');
        });

        // Annex M Batches
        Schema::table('annex_m_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_m_hei_year_status');
            $table->index('status', 'idx_m_status');
            $table->index('created_at', 'idx_m_created');
        });

        // Annex N Batches
        Schema::table('annex_n_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_n_hei_year_status');
            $table->index('status', 'idx_n_status');
            $table->index('created_at', 'idx_n_created');
        });

        // Annex O Batches
        Schema::table('annex_o_batches', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_o_hei_year_status');
            $table->index('status', 'idx_o_status');
            $table->index('created_at', 'idx_o_created');
        });

        // Summaries
        Schema::table('summaries', function (Blueprint $table) {
            $table->index(['hei_id', 'academic_year', 'status'], 'idx_sum_hei_year_status');
            $table->index('status', 'idx_sum_status');
            $table->index('created_at', 'idx_sum_created');
        });

        // Users
        Schema::table('users', function (Blueprint $table) {
            $table->index('hei_id', 'idx_users_hei');
        });

        // HEIs
        Schema::table('heis', function (Blueprint $table) {
            $table->index('email', 'idx_heis_email');
        });
    }

    public function down()
    {
        Schema::table('annex_a_batches', function (Blueprint $table) {
            $table->dropIndex('idx_a_hei_year_status');
            $table->dropIndex('idx_a_status');
            $table->dropIndex('idx_a_created');
        });

        Schema::table('annex_b_batches', function (Blueprint $table) {
            $table->dropIndex('idx_b_hei_year_status');
            $table->dropIndex('idx_b_status');
            $table->dropIndex('idx_b_created');
        });

        Schema::table('annex_c_batches', function (Blueprint $table) {
            $table->dropIndex('idx_c_hei_year_status');
            $table->dropIndex('idx_c_status');
            $table->dropIndex('idx_c_created');
        });

        Schema::table('annex_d_batches', function (Blueprint $table) {
            $table->dropIndex('idx_d_hei_year_status');
            $table->dropIndex('idx_d_status');
            $table->dropIndex('idx_d_created');
        });

        Schema::table('annex_e_batches', function (Blueprint $table) {
            $table->dropIndex('idx_e_hei_year_status');
            $table->dropIndex('idx_e_status');
            $table->dropIndex('idx_e_created');
        });

        Schema::table('annex_f_batches', function (Blueprint $table) {
            $table->dropIndex('idx_f_hei_year_status');
            $table->dropIndex('idx_f_status');
            $table->dropIndex('idx_f_created');
        });

        Schema::table('annex_g_batches', function (Blueprint $table) {
            $table->dropIndex('idx_g_hei_year_status');
            $table->dropIndex('idx_g_status');
            $table->dropIndex('idx_g_created');
        });

        Schema::table('annex_h_batches', function (Blueprint $table) {
            $table->dropIndex('idx_h_hei_year_status');
            $table->dropIndex('idx_h_status');
            $table->dropIndex('idx_h_created');
        });

        Schema::table('annex_i_batches', function (Blueprint $table) {
            $table->dropIndex('idx_i_hei_year_status');
            $table->dropIndex('idx_i_status');
            $table->dropIndex('idx_i_created');
        });

        Schema::table('annex_j_batches', function (Blueprint $table) {
            $table->dropIndex('idx_j_hei_year_status');
            $table->dropIndex('idx_j_status');
            $table->dropIndex('idx_j_created');
        });

        Schema::table('annex_k_batches', function (Blueprint $table) {
            $table->dropIndex('idx_k_hei_year_status');
            $table->dropIndex('idx_k_status');
            $table->dropIndex('idx_k_created');
        });

        Schema::table('annex_l_batches', function (Blueprint $table) {
            $table->dropIndex('idx_l_hei_year_status');
            $table->dropIndex('idx_l_status');
            $table->dropIndex('idx_l_created');
        });

        Schema::table('annex_m_batches', function (Blueprint $table) {
            $table->dropIndex('idx_m_hei_year_status');
            $table->dropIndex('idx_m_status');
            $table->dropIndex('idx_m_created');
        });

        Schema::table('annex_n_batches', function (Blueprint $table) {
            $table->dropIndex('idx_n_hei_year_status');
            $table->dropIndex('idx_n_status');
            $table->dropIndex('idx_n_created');
        });

        Schema::table('annex_o_batches', function (Blueprint $table) {
            $table->dropIndex('idx_o_hei_year_status');
            $table->dropIndex('idx_o_status');
            $table->dropIndex('idx_o_created');
        });

        Schema::table('summaries', function (Blueprint $table) {
            $table->dropIndex('idx_sum_hei_year_status');
            $table->dropIndex('idx_sum_status');
            $table->dropIndex('idx_sum_created');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_hei');
        });

        Schema::table('heis', function (Blueprint $table) {
            $table->dropIndex('idx_heis_email');
        });
    }
};
