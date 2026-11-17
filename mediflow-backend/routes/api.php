<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MedicalRecordController;

// PUBLIC
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/specializations', [AppointmentController::class, 'getSpecializations']);
Route::get('/doctors', [AppointmentController::class, 'getDoctors']);
Route::get('/doctors/{id}', [AppointmentController::class, 'showDoctor']);
Route::get('/doctors/specialization/{specialization_id}', [AppointmentController::class, 'getDoctorsBySpecialization']);
Route::get('/doctors/{id}/availability', [AppointmentController::class, 'getDoctorAvailability']);
Route::get('/doctors/{id}/slots', [AppointmentController::class, 'getAvailableSlots']);

// AUTH-PROTECTED
Route::middleware('auth:api')->group(function () {
    // me / auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // profile
    Route::get('/profile', [ProfileController::class, 'me']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // medical records
    Route::get('/medical-records', [MedicalRecordController::class, 'index']);
    Route::post('/medical-records', [MedicalRecordController::class, 'store']);
    Route::get('/medical-records/{id}/download', [MedicalRecordController::class, 'download']);
    Route::delete('/medical-records/{id}', [MedicalRecordController::class, 'destroy']);

    // patient
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/my-appointments', [AppointmentController::class, 'myAppointments']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'cancel']);
    Route::put('/appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);

    Route::get('/my-prescriptions', [PrescriptionController::class, 'myPrescriptions']);
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);

    Route::get('/payments/appointment/{appointmentId}', [PaymentController::class, 'getPayment']);
    Route::post('/payments/process', [PaymentController::class, 'processPayment']);
    Route::get('/payments/my-payments', [PaymentController::class, 'myPayments']);
    Route::post('/payments/verify-qr', [PaymentController::class, 'verifyQRCode']);

    // doctor
    Route::get('/doctor-appointments', [AppointmentController::class, 'getDoctorAppointments']);
    Route::put('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::delete('/appointments/{id}/cancel', [AppointmentController::class, 'doctorCancel']);
    Route::get('/doctor/patients', [UserController::class, 'doctorPatients']);

    Route::get('/doctor/availability', [AppointmentController::class, 'getMyAvailability']);
    Route::post('/doctor/availability', [AppointmentController::class, 'setAvailability']);
    Route::put('/doctor/availability/{id}', [AppointmentController::class, 'updateAvailability']);
    Route::delete('/doctor/availability/{id}', [AppointmentController::class, 'deleteAvailability']);

    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::get('/doctor-prescriptions', [PrescriptionController::class, 'doctorPrescriptions']);

    // admin
    Route::get('/admin/users', [UserController::class, 'getAllUsers']);
    Route::get('/admin/users/{id}', [UserController::class, 'showUser']);
    Route::put('/admin/users/{id}', [UserController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [UserController::class, 'deleteUser']);
    Route::put('/admin/users/{id}/suspend', [UserController::class, 'suspendUser']);
    Route::put('/admin/users/{id}/unsuspend', [UserController::class, 'unsuspendUser']);
    Route::get('/admin/statistics', [UserController::class, 'getStatistics']);
    Route::get('/admin/appointments-count', [UserController::class, 'getAppointmentCount']);
    Route::get('/admin/payments', [PaymentController::class, 'getAllPayments']);
    Route::get('/admin/appointments', [UserController::class, 'getAllAppointments']);
    Route::post('/admin/create-doctor', [UserController::class, 'createDoctor']);
    Route::post('/admin/create-patient', [UserController::class, 'createPatient']);
});
