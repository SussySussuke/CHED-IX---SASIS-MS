<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Annex A Batches
        if (Schema::hasTable('annex_a_batches')) {
            Schema::table('annex_a_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_a_batches', 'idx_a_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_a_hei_year_status');
                }
                if (!$this->indexExists('annex_a_batches', 'idx_a_status')) {
                    $table->index('status', 'idx_a_status');
                }
                if (!$this->indexExists('annex_a_batches', 'idx_a_created')) {
                    $table->index('created_at', 'idx_a_created');
                }
            });
        }

        // Annex B Batches
        if (Schema::hasTable('annex_b_batches')) {
            Schema::table('annex_b_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_b_batches', 'idx_b_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_b_hei_year_status');
                }
                if (!$this->indexExists('annex_b_batches', 'idx_b_status')) {
                    $table->index('status', 'idx_b_status');
                }
                if (!$this->indexExists('annex_b_batches', 'idx_b_created')) {
                    $table->index('created_at', 'idx_b_created');
                }
            });
        }

        // Annex C Batches
        if (Schema::hasTable('annex_c_batches')) {
            Schema::table('annex_c_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_c_batches', 'idx_c_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_c_hei_year_status');
                }
                if (!$this->indexExists('annex_c_batches', 'idx_c_status')) {
                    $table->index('status', 'idx_c_status');
                }
                if (!$this->indexExists('annex_c_batches', 'idx_c_created')) {
                    $table->index('created_at', 'idx_c_created');
                }
            });
        }

        // Annex D Batches
        if (Schema::hasTable('annex_d_batches')) {
            Schema::table('annex_d_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_d_batches', 'idx_d_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_d_hei_year_status');
                }
                if (!$this->indexExists('annex_d_batches', 'idx_d_status')) {
                    $table->index('status', 'idx_d_status');
                }
                if (!$this->indexExists('annex_d_batches', 'idx_d_created')) {
                    $table->index('created_at', 'idx_d_created');
                }
            });
        }

        // Annex E Batches
        if (Schema::hasTable('annex_e_batches')) {
            Schema::table('annex_e_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_e_batches', 'idx_e_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_e_hei_year_status');
                }
                if (!$this->indexExists('annex_e_batches', 'idx_e_status')) {
                    $table->index('status', 'idx_e_status');
                }
                if (!$this->indexExists('annex_e_batches', 'idx_e_created')) {
                    $table->index('created_at', 'idx_e_created');
                }
            });
        }

        // Annex F Batches
        if (Schema::hasTable('annex_f_batches')) {
            Schema::table('annex_f_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_f_batches', 'idx_f_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_f_hei_year_status');
                }
                if (!$this->indexExists('annex_f_batches', 'idx_f_status')) {
                    $table->index('status', 'idx_f_status');
                }
                if (!$this->indexExists('annex_f_batches', 'idx_f_created')) {
                    $table->index('created_at', 'idx_f_created');
                }
            });
        }

        // Annex G Batches
        if (Schema::hasTable('annex_g_batches')) {
            Schema::table('annex_g_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_g_batches', 'idx_g_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_g_hei_year_status');
                }
                if (!$this->indexExists('annex_g_batches', 'idx_g_status')) {
                    $table->index('status', 'idx_g_status');
                }
                if (!$this->indexExists('annex_g_batches', 'idx_g_created')) {
                    $table->index('created_at', 'idx_g_created');
                }
            });
        }

        // Annex H Batches
        if (Schema::hasTable('annex_h_batches')) {
            Schema::table('annex_h_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_h_batches', 'idx_h_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_h_hei_year_status');
                }
                if (!$this->indexExists('annex_h_batches', 'idx_h_status')) {
                    $table->index('status', 'idx_h_status');
                }
                if (!$this->indexExists('annex_h_batches', 'idx_h_created')) {
                    $table->index('created_at', 'idx_h_created');
                }
            });
        }

        // Annex I Batches
        if (Schema::hasTable('annex_i_batches')) {
            Schema::table('annex_i_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_i_batches', 'idx_i_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_i_hei_year_status');
                }
                if (!$this->indexExists('annex_i_batches', 'idx_i_status')) {
                    $table->index('status', 'idx_i_status');
                }
                if (!$this->indexExists('annex_i_batches', 'idx_i_created')) {
                    $table->index('created_at', 'idx_i_created');
                }
            });
        }

        // Annex J Batches
        if (Schema::hasTable('annex_j_batches')) {
            Schema::table('annex_j_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_j_batches', 'idx_j_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_j_hei_year_status');
                }
                if (!$this->indexExists('annex_j_batches', 'idx_j_status')) {
                    $table->index('status', 'idx_j_status');
                }
                if (!$this->indexExists('annex_j_batches', 'idx_j_created')) {
                    $table->index('created_at', 'idx_j_created');
                }
            });
        }

        // Annex K Batches
        if (Schema::hasTable('annex_k_batches')) {
            Schema::table('annex_k_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_k_batches', 'idx_k_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_k_hei_year_status');
                }
                if (!$this->indexExists('annex_k_batches', 'idx_k_status')) {
                    $table->index('status', 'idx_k_status');
                }
                if (!$this->indexExists('annex_k_batches', 'idx_k_created')) {
                    $table->index('created_at', 'idx_k_created');
                }
            });
        }

        // Annex L Batches
        if (Schema::hasTable('annex_l_batches')) {
            Schema::table('annex_l_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_l_batches', 'idx_l_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_l_hei_year_status');
                }
                if (!$this->indexExists('annex_l_batches', 'idx_l_status')) {
                    $table->index('status', 'idx_l_status');
                }
                if (!$this->indexExists('annex_l_batches', 'idx_l_created')) {
                    $table->index('created_at', 'idx_l_created');
                }
            });
        }

        // Annex M Batches
        if (Schema::hasTable('annex_m_batches')) {
            Schema::table('annex_m_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_m_batches', 'idx_m_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_m_hei_year_status');
                }
                if (!$this->indexExists('annex_m_batches', 'idx_m_status')) {
                    $table->index('status', 'idx_m_status');
                }
                if (!$this->indexExists('annex_m_batches', 'idx_m_created')) {
                    $table->index('created_at', 'idx_m_created');
                }
            });
        }

        // Annex N Batches
        if (Schema::hasTable('annex_n_batches')) {
            Schema::table('annex_n_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_n_batches', 'idx_n_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_n_hei_year_status');
                }
                if (!$this->indexExists('annex_n_batches', 'idx_n_status')) {
                    $table->index('status', 'idx_n_status');
                }
                if (!$this->indexExists('annex_n_batches', 'idx_n_created')) {
                    $table->index('created_at', 'idx_n_created');
                }
            });
        }

        // Annex O Batches
        if (Schema::hasTable('annex_o_batches')) {
            Schema::table('annex_o_batches', function (Blueprint $table) {
                if (!$this->indexExists('annex_o_batches', 'idx_o_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_o_hei_year_status');
                }
                if (!$this->indexExists('annex_o_batches', 'idx_o_status')) {
                    $table->index('status', 'idx_o_status');
                }
                if (!$this->indexExists('annex_o_batches', 'idx_o_created')) {
                    $table->index('created_at', 'idx_o_created');
                }
            });
        }

        // Summaries
        if (Schema::hasTable('summaries')) {
            Schema::table('summaries', function (Blueprint $table) {
                if (!$this->indexExists('summaries', 'idx_sum_hei_year_status')) {
                    $table->index(['hei_id', 'academic_year', 'status'], 'idx_sum_hei_year_status');
                }
                if (!$this->indexExists('summaries', 'idx_sum_status')) {
                    $table->index('status', 'idx_sum_status');
                }
                if (!$this->indexExists('summaries', 'idx_sum_created')) {
                    $table->index('created_at', 'idx_sum_created');
                }
            });
        }

        // Users
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!$this->indexExists('users', 'idx_users_hei')) {
                    $table->index('hei_id', 'idx_users_hei');
                }
            });
        }

        // HEIs
        if (Schema::hasTable('heis')) {
            Schema::table('heis', function (Blueprint $table) {
                if (!$this->indexExists('heis', 'idx_heis_email')) {
                    $table->index('email', 'idx_heis_email');
                }
            });
        }
    }

    private function indexExists($table, $indexName)
    {
        $database = DB::connection()->getDatabaseName();
        
        $result = DB::select(
            "SELECT COUNT(*) as count 
             FROM information_schema.statistics 
             WHERE table_schema = ? 
             AND table_name = ? 
             AND index_name = ?",
            [$database, $table, $indexName]
        );
        
        return $result[0]->count > 0;
    }

    public function down()
    {
        if (Schema::hasTable('annex_a_batches')) {
            Schema::table('annex_a_batches', function (Blueprint $table) {
                $table->dropIndex('idx_a_hei_year_status');
                $table->dropIndex('idx_a_status');
                $table->dropIndex('idx_a_created');
            });
        }

        if (Schema::hasTable('annex_b_batches')) {
            Schema::table('annex_b_batches', function (Blueprint $table) {
                $table->dropIndex('idx_b_hei_year_status');
                $table->dropIndex('idx_b_status');
                $table->dropIndex('idx_b_created');
            });
        }

        if (Schema::hasTable('annex_c_batches')) {
            Schema::table('annex_c_batches', function (Blueprint $table) {
                $table->dropIndex('idx_c_hei_year_status');
                $table->dropIndex('idx_c_status');
                $table->dropIndex('idx_c_created');
            });
        }

        if (Schema::hasTable('annex_d_batches')) {
            Schema::table('annex_d_batches', function (Blueprint $table) {
                $table->dropIndex('idx_d_hei_year_status');
                $table->dropIndex('idx_d_status');
                $table->dropIndex('idx_d_created');
            });
        }

        if (Schema::hasTable('annex_e_batches')) {
            Schema::table('annex_e_batches', function (Blueprint $table) {
                $table->dropIndex('idx_e_hei_year_status');
                $table->dropIndex('idx_e_status');
                $table->dropIndex('idx_e_created');
            });
        }

        if (Schema::hasTable('annex_f_batches')) {
            Schema::table('annex_f_batches', function (Blueprint $table) {
                $table->dropIndex('idx_f_hei_year_status');
                $table->dropIndex('idx_f_status');
                $table->dropIndex('idx_f_created');
            });
        }

        if (Schema::hasTable('annex_g_batches')) {
            Schema::table('annex_g_batches', function (Blueprint $table) {
                $table->dropIndex('idx_g_hei_year_status');
                $table->dropIndex('idx_g_status');
                $table->dropIndex('idx_g_created');
            });
        }

        if (Schema::hasTable('annex_h_batches')) {
            Schema::table('annex_h_batches', function (Blueprint $table) {
                $table->dropIndex('idx_h_hei_year_status');
                $table->dropIndex('idx_h_status');
                $table->dropIndex('idx_h_created');
            });
        }

        if (Schema::hasTable('annex_i_batches')) {
            Schema::table('annex_i_batches', function (Blueprint $table) {
                $table->dropIndex('idx_i_hei_year_status');
                $table->dropIndex('idx_i_status');
                $table->dropIndex('idx_i_created');
            });
        }

        if (Schema::hasTable('annex_j_batches')) {
            Schema::table('annex_j_batches', function (Blueprint $table) {
                $table->dropIndex('idx_j_hei_year_status');
                $table->dropIndex('idx_j_status');
                $table->dropIndex('idx_j_created');
            });
        }

        if (Schema::hasTable('annex_k_batches')) {
            Schema::table('annex_k_batches', function (Blueprint $table) {
                $table->dropIndex('idx_k_hei_year_status');
                $table->dropIndex('idx_k_status');
                $table->dropIndex('idx_k_created');
            });
        }

        if (Schema::hasTable('annex_l_batches')) {
            Schema::table('annex_l_batches', function (Blueprint $table) {
                $table->dropIndex('idx_l_hei_year_status');
                $table->dropIndex('idx_l_status');
                $table->dropIndex('idx_l_created');
            });
        }

        if (Schema::hasTable('annex_m_batches')) {
            Schema::table('annex_m_batches', function (Blueprint $table) {
                $table->dropIndex('idx_m_hei_year_status');
                $table->dropIndex('idx_m_status');
                $table->dropIndex('idx_m_created');
            });
        }

        if (Schema::hasTable('annex_n_batches')) {
            Schema::table('annex_n_batches', function (Blueprint $table) {
                $table->dropIndex('idx_n_hei_year_status');
                $table->dropIndex('idx_n_status');
                $table->dropIndex('idx_n_created');
            });
        }

        if (Schema::hasTable('annex_o_batches')) {
            Schema::table('annex_o_batches', function (Blueprint $table) {
                $table->dropIndex('idx_o_hei_year_status');
                $table->dropIndex('idx_o_status');
                $table->dropIndex('idx_o_created');
            });
        }

        if (Schema::hasTable('summaries')) {
            Schema::table('summaries', function (Blueprint $table) {
                $table->dropIndex('idx_sum_hei_year_status');
                $table->dropIndex('idx_sum_status');
                $table->dropIndex('idx_sum_created');
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('idx_users_hei');
            });
        }

        if (Schema::hasTable('heis')) {
            Schema::table('heis', function (Blueprint $table) {
                $table->dropIndex('idx_heis_email');
            });
        }
    }
};
