<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Mark all doctors as verified
        DB::table('doctors')->update(['verified' => true]);
    }

    public function down(): void
    {
        // Revert if needed
        DB::table('doctors')->update(['verified' => false]);
    }
};
