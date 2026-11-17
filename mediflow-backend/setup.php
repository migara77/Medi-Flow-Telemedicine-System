<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Specialization;
use App\Models\Doctor;
use App\Models\Patient;

// Create test users
User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('password'), 'role' => 'admin']);
User::create(['name' => 'Doctor 1', 'email' => 'doctor1@example.com', 'password' => bcrypt('password'), 'role' => 'doctor']);
User::create(['name' => 'Doctor 2', 'email' => 'doctor2@example.com', 'password' => bcrypt('password'), 'role' => 'doctor']);
User::create(['name' => 'Patient 1', 'email' => 'patient1@example.com', 'password' => bcrypt('password'), 'role' => 'patient']);
User::create(['name' => 'Patient 2', 'email' => 'patient2@example.com', 'password' => bcrypt('password'), 'role' => 'patient']);

// Create specializations
Specialization::create(['name' => 'Cardiology', 'description' => 'Heart and cardiovascular']);
Specialization::create(['name' => 'Neurology', 'description' => 'Brain and nervous system']);
Specialization::create(['name' => 'Orthopedics', 'description' => 'Bones and joints']);

// Create doctors
Doctor::create(['user_id' => 2, 'specialization_id' => 1, 'license_number' => 'LIC000001', 'verified' => true]);
Doctor::create(['user_id' => 3, 'specialization_id' => 2, 'license_number' => 'LIC000002', 'verified' => true]);

// Create patients
Patient::create(['user_id' => 4]);
Patient::create(['user_id' => 5]);

echo "Database seeded successfully!\n";
?>