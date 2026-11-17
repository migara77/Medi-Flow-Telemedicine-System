<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\DoctorAvailability;
use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Specializations
        $specializations = [
            ['name' => 'Cardiology', 'description' => 'Heart and blood vessel care'],
            ['name' => 'Neurology', 'description' => 'Nervous system disorders'],
            ['name' => 'Dermatology', 'description' => 'Skin care and treatment'],
            ['name' => 'Orthopedics', 'description' => 'Bone and joint care'],
            ['name' => 'Pediatrics', 'description' => 'Child healthcare'],
            ['name' => 'General Practice', 'description' => 'General medical care'],
            ['name' => 'Ophthalmology', 'description' => 'Eye and vision care'],
            ['name' => 'ENT', 'description' => 'Ear, Nose and Throat care'],
        ];

        foreach ($specializations as $spec) {
            Specialization::create($spec);
        }

        // Get specializations by name for easy lookup
        $cardiology = Specialization::where('name', 'Cardiology')->first();
        $neurology = Specialization::where('name', 'Neurology')->first();
        $dermatology = Specialization::where('name', 'Dermatology')->first();

        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '0701234567',
            'role' => 'admin',
            'password' => Hash::make('admin123'),
        ]);

        // Create Patient Users
        $patient = User::create([
            'name' => 'John Patient',
            'email' => 'patient@example.com',
            'phone' => '0712345678',
            'role' => 'patient',
            'password' => Hash::make('password'),
        ]);

        // Create Doctor Users
        $doctor1User = User::create([
            'name' => 'Dr. Sarah Smith',
            'email' => 'doctor@example.com',
            'phone' => '0723456789',
            'role' => 'doctor',
            'experience_years' => 10,
            'bio' => 'Experienced cardiologist with 10 years of practice',
            'password' => Hash::make('password'),
        ]);

        $doctor2User = User::create([
            'name' => 'Dr. John Brown',
            'email' => 'doctor2@example.com',
            'phone' => '0734567890',
            'role' => 'doctor',
            'experience_years' => 8,
            'bio' => 'Skilled neurologist specializing in migraine treatment',
            'password' => Hash::make('password'),
        ]);

        $doctor3User = User::create([
            'name' => 'Dr. Emily Johnson',
            'email' => 'doctor3@example.com',
            'phone' => '0745678901',
            'role' => 'doctor',
            'experience_years' => 6,
            'bio' => 'Dermatologist with expertise in skin conditions',
            'password' => Hash::make('password'),
        ]);

        // Create Doctor Records with correct specialization_id
        $doctor1 = Doctor::create([
            'user_id' => $doctor1User->id,
            'specialization_id' => $cardiology->id,
            'bio' => 'Experienced cardiologist with 10 years of practice',
            'experience_years' => 10,
            'verified' => true,
        ]);

        $doctor2 = Doctor::create([
            'user_id' => $doctor2User->id,
            'specialization_id' => $neurology->id,
            'bio' => 'Skilled neurologist specializing in migraine treatment',
            'experience_years' => 8,
            'verified' => true,
        ]);

        $doctor3 = Doctor::create([
            'user_id' => $doctor3User->id,
            'specialization_id' => $dermatology->id,
            'bio' => 'Dermatologist with expertise in skin conditions',
            'experience_years' => 6,
            'verified' => true,
        ]);

        // Create Doctor Availability (by day of week)
        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        foreach ($daysOfWeek as $day) {
            DoctorAvailability::create([
                'doctor_id' => $doctor1->id,
                'day_of_week' => $day,
                'start_time' => '09:00',
                'end_time' => '17:00',
                'slot_duration' => 30,
                'is_available' => true,
            ]);

            DoctorAvailability::create([
                'doctor_id' => $doctor2->id,
                'day_of_week' => $day,
                'start_time' => '10:00',
                'end_time' => '18:00',
                'slot_duration' => 30,
                'is_available' => true,
            ]);

            DoctorAvailability::create([
                'doctor_id' => $doctor3->id,
                'day_of_week' => $day,
                'start_time' => '08:00',
                'end_time' => '16:00',
                'slot_duration' => 30,
                'is_available' => true,
            ]);
        }

        // Create Sample Appointments (using datetime, not separate date/time)
        $appointment1 = Appointment::create([
            'doctor_id' => $doctor1->id,
            'patient_id' => $patient->id,
            'appointment_date' => Carbon::now()->addDays(5)->setHour(10)->setMinute(0)->setSecond(0),
            'status' => 'confirmed',
            'reason' => 'Regular heart checkup and consultation',
        ]);

        $appointment2 = Appointment::create([
            'doctor_id' => $doctor2->id,
            'patient_id' => $patient->id,
            'appointment_date' => Carbon::now()->addDays(7)->setHour(14)->setMinute(0)->setSecond(0),
            'status' => 'pending',
            'reason' => 'Migraine consultation',
        ]);

        // Create Sample Prescriptions (without appointment_id)
        Prescription::create([
            'doctor_id' => $doctor1->id,
            'patient_id' => $patient->id,
            'medication_name' => 'Aspirin',
            'dosage' => '100mg',
            'frequency' => 'Once daily',
            'duration' => '30 days',
            'instructions' => 'Take with food',
        ]);

        Prescription::create([
            'doctor_id' => $doctor2->id,
            'patient_id' => $patient->id,
            'medication_name' => 'Sumatriptan',
            'dosage' => '50mg',
            'frequency' => 'As needed',
            'duration' => 'As needed',
            'instructions' => 'Take at first sign of migraine',
        ]);

        // Create Sample Payment
        Payment::create([
            'appointment_id' => $appointment1->id,
            'patient_id' => $patient->id,
            'amount' => 150.00,
            'payment_method' => 'credit_card',
            'status' => 'completed',
            'transaction_id' => 'TXN' . time(),
        ]);
    }
}
