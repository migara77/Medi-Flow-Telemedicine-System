<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\AppNotification;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    private function shape(Prescription $p): array
    {
        $p->loadMissing('doctor.user', 'doctor.specialization', 'patient');
        return [
            'id' => $p->id,
            'doctor_id' => $p->doctor_id,
            'patient_id' => $p->patient_id,
            'medications' => $p->medicationsArray(),
            'instructions' => $p->instructions,
            'notes' => $p->notes,
            'doctor' => $p->doctor ? [
                'id' => $p->doctor->id,
                'name' => $p->doctor->user->name ?? 'Unknown',
                'email' => $p->doctor->user->email ?? null,
                'specialization' => $p->doctor->specialization?->name ?? 'General',
            ] : null,
            'patient' => $p->patient ? [
                'id' => $p->patient->id,
                'name' => $p->patient->name,
                'email' => $p->patient->email,
                'phone' => $p->patient->phone,
            ] : null,
            'created_at' => $p->created_at,
        ];
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'doctor') return response()->json(['message' => 'Forbidden'], 403);
        $doctor = $user->doctor;
        if (!$doctor) return response()->json(['message' => 'Not a doctor'], 403);

        // Accept either {medications: [{name,dosage,frequency,duration}]} or legacy single med
        $rules = [
            'patient_id' => 'required|exists:users,id',
            'instructions' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
        if ($request->has('medications')) {
            $rules['medications'] = 'required|array|min:1';
            $rules['medications.*.name'] = 'required|string|max:255';
            $rules['medications.*.dosage'] = 'required|string|max:255';
            $rules['medications.*.duration'] = 'required|string|max:255';
            $rules['medications.*.frequency'] = 'nullable|string|max:255';
        } else {
            $rules['medication_name'] = 'required|string';
            $rules['dosage'] = 'required|string';
            $rules['frequency'] = 'required|string';
            $rules['duration'] = 'required|string';
        }
        $validated = $request->validate($rules);

        $payload = [
            'doctor_id' => $doctor->id,
            'patient_id' => $validated['patient_id'],
            'instructions' => $validated['instructions'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ];

        if ($request->has('medications')) {
            $payload['medications'] = $validated['medications'];
            // also fill legacy first-med fields so old reports still render
            $first = $validated['medications'][0];
            $payload['medication_name'] = $first['name'];
            $payload['dosage'] = $first['dosage'];
            $payload['frequency'] = $first['frequency'] ?? '';
            $payload['duration'] = $first['duration'];
        } else {
            $payload['medication_name'] = $validated['medication_name'];
            $payload['dosage'] = $validated['dosage'];
            $payload['frequency'] = $validated['frequency'];
            $payload['duration'] = $validated['duration'];
            $payload['medications'] = [[
                'name' => $validated['medication_name'],
                'dosage' => $validated['dosage'],
                'frequency' => $validated['frequency'],
                'duration' => $validated['duration'],
            ]];
        }

        $p = Prescription::create($payload);

        AppNotification::push($p->patient_id, 'prescription.created',
            'New prescription', 'Dr. ' . ($user->name) . ' issued a new prescription.', ['prescription_id' => $p->id]);

        return response()->json($this->shape($p), 201);
    }

    public function show($id)
    {
        $user = auth('api')->user();
        $p = Prescription::find($id);
        if (!$p) return response()->json(['message' => 'Not found'], 404);
        if ($user->role === 'patient' && $p->patient_id !== $user->id) return response()->json(['message' => 'Forbidden'], 403);
        if ($user->role === 'doctor' && $p->doctor_id !== ($user->doctor->id ?? -1)) return response()->json(['message' => 'Forbidden'], 403);
        return response()->json($this->shape($p));
    }

    public function myPrescriptions()
    {
        $user = auth('api')->user();
        $list = Prescription::where('patient_id', $user->id)
            ->with('doctor.user', 'doctor.specialization')
            ->orderByDesc('created_at')->get()
            ->map(fn($p) => $this->shape($p));
        return response()->json($list);
    }

    public function doctorPrescriptions()
    {
        $user = auth('api')->user();
        $doctor = $user->doctor;
        if (!$doctor) return response()->json(['message' => 'Not a doctor'], 403);
        $list = Prescription::where('doctor_id', $doctor->id)->with('patient')
            ->orderByDesc('created_at')->get()->map(fn($p) => $this->shape($p));
        return response()->json($list);
    }
}
