<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Specialization;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Get all doctors
     * GET /api/doctors
     */
    public function index()
    {
        try {
            // Get all doctors with their relationships loaded
            // with('user', 'specialization') = eager load the user and specialization data
            $doctors = Doctor::with('user', 'specialization')->get();

            return response()->json([
                'success' => true,
                'data' => $doctors,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get doctors by specialization
     * GET /api/doctors/specialization/{specialization_id}
     */
    public function getBySpecialization($specialization_id)
    {
        try {
            $doctors = Doctor::where('specialization_id', $specialization_id)
                            ->with('user', 'specialization')
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $doctors,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single doctor details
     * GET /api/doctors/{id}
     */
    public function show($id)
    {
        try {
            $doctor = Doctor::with('user', 'specialization')->find($id);

            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'Doctor not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $doctor,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all specializations
     * GET /api/specializations
     */
    public function getSpecializations()
    {
        try {
            $specializations = Specialization::all();

            return response()->json([
                'success' => true,
                'data' => $specializations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}