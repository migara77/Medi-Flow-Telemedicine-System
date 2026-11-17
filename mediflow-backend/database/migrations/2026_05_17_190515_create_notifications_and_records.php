<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('app_notifications')) {
            Schema::create('app_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('type', 64);
                $table->string('title');
                $table->text('body')->nullable();
                $table->json('data')->nullable();
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'read_at']);
            });
        }

        if (!Schema::hasTable('medical_records')) {
            Schema::create('medical_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->string('original_name');
                $table->string('path');
                $table->string('mime_type', 128)->nullable();
                $table->unsignedBigInteger('size')->default(0);
                $table->text('description')->nullable();
                $table->timestamps();
                $table->index('user_id');
            });
        }

        if (Schema::hasTable('prescriptions') && !Schema::hasColumn('prescriptions', 'medications')) {
            Schema::table('prescriptions', function (Blueprint $table) {
                $table->json('medications')->nullable()->after('patient_id');
            });
        }

        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'avatar_url')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('avatar_url')->nullable();
                $table->text('address')->nullable();
                $table->date('date_of_birth')->nullable();
                $table->string('gender', 16)->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('medical_records');
        if (Schema::hasColumn('prescriptions', 'medications')) {
            Schema::table('prescriptions', function (Blueprint $table) { $table->dropColumn('medications'); });
        }
        if (Schema::hasColumn('users', 'avatar_url')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['avatar_url','address','date_of_birth','gender']);
            });
        }
    }
};
