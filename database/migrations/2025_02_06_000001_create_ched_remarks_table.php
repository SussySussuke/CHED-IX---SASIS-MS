<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * CHEDRemark Migration - Per-row remarks and best practice flags
     * set by CHED admins on any Annex submission row.
     *
     * The table is polymorphic via (annex_type + row_id + batch_id),
     * meaning it can reference any row in any annex table without
     * hard foreign keys.
     */
    public function up(): void
    {
        Schema::create('ched_remarks', function (Blueprint $table) {
            $table->id();

            // Polymorphic reference — no hard FK intentionally
            $table->string('annex_type')->comment('e.g. annex_a, annex_b, mer1, etc.');
            $table->unsignedBigInteger('row_id')->comment('PK of the child row being remarked');
            $table->string('batch_id')->comment('UUID or submission ID of the parent batch');

            // Denormalized for fast filtering without joins
            $table->unsignedBigInteger('hei_id');
            $table->string('academic_year', 20);

            $table->boolean('is_best_practice')->default(false);
            $table->text('admin_notes')->nullable();

            // Who flagged it and when
            $table->unsignedBigInteger('remarked_by')->nullable();
            $table->timestamp('remarked_at')->nullable();

            $table->boolean('is_archived')->default(false);

            $table->timestamps();

            // FK to heis and users (soft — nullOnDelete for remarked_by)
            $table->foreign('hei_id')->references('id')->on('heis')->onDelete('cascade');
            $table->foreign('remarked_by')->references('id')->on('users')->nullOnDelete();

            // Indexes for the lookup patterns used in CHEDRemark scopes
            $table->index(['annex_type', 'row_id'], 'ched_remarks_annex_row_idx');
            $table->index(['batch_id', 'is_archived'], 'ched_remarks_batch_archived_idx');
            $table->index(['hei_id', 'academic_year', 'is_archived'], 'ched_remarks_hei_year_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ched_remarks');
    }
};
