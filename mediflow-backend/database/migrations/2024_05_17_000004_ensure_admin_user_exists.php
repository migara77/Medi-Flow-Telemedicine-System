<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure admin user exists with correct role
        $admin = User::where('email', 'admin@example.com')->first();
        
        if ($admin) {
            // Update existing admin to ensure role is set
            $admin->update([
                'role' => 'admin',
                'password' => Hash::make('admin123')
            ]);
        } else {
            // Create admin user if doesn't exist
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin123'),
                'phone' => '0000000000',
                'role' => 'admin',
            ]);
        }
    }

    public function down(): void
    {
        // Don't delete admin user on rollback
    }
};
