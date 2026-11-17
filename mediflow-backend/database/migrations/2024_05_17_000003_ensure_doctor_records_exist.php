<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Specialization;

return new class extends Migration
{
    public function up(): void
    {
        // Find all users with role 'doctor' that don't have a doctor record
        $doctorUsers = User::where('role', 'doctor')->get();

        foreach ($doctorUsers as $user) {
            $doctorExists = Doctor::where('user_id', $user->id)->exists();

            if (!$doctorExists) {
                // Create doctor record for this user
                $specialization = Specialization::firstOrCreate(
                    ['name' => $user->specialization ?? 'General'],
                    ['description' => $user->specialization ?? 'General']
                );

                Doctor::create([
                    'user_id' => $user->id,
                    'specialization_id' => $specialization->id,
                    'verified' => true,
                    'bio' => $user->bio ?? null,
                    'experience_years' => $user->experience_years ?? 0,
                ]);
            }
        }
    }

    public function down(): void
    {
        // This migration doesn't need a down - it just ensures records exist
    }
};
