<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppNotification;
use App\Models\Doctor;
use App\Models\DoctorAvailability;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /* ---------- helpers ---------- */

    private function shapeAppointment(Appointment $a): array
    {
        $a->loadMissing('doctor.user', 'doctor.specialization', 'patient');
        return [
            'id' => $a->id,
            'doctor_id' => $a->doctor_id,
            'patient_id' => $a->patient_id,
            'doctor' => $a->doctor ? [
                'id' => $a->doctor->id,
                'name' => $a->doctor->user->name ?? 'Unknown',
                'email' => $a->doctor->user->email ?? null,
                'phone' => $a->doctor->user->phone ?? null,
                'specialization' => $a->doctor->specialization?->name,
            ] : null,
            'patient' => $a->patient ? [
                'id' => $a->patient->id,
                'name' => $a->patient->name,
                'email' => $a->patient->email,
                'phone' => $a->patient->phone,
            ] : null,
            'appointment_date' => optional($a->appointment_date)->format('Y-m-d H:i:s'),
            'date' => optional($a->appointment_date)->format('Y-m-d'),
            'time' => optional($a->appointment_date)->format('H:i'),
            'status' => $a->status,
            'reason' => $a->reason,
            'notes' => $a->notes,
            'created_at' => $a->created_at,
        ];
    }

    /* ---------- catalog ---------- */

    public function getSpecializations()
    {
        return response()->json(Specialization::orderBy('name')->get());
    }

    public function getDoctors()
    {
        $doctors = Doctor::where('verified', true)
            ->with('user', 'specialization')
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'name' => $d->user->name ?? 'Unknown',
                'email' => $d->user->email ?? null,
                'phone' => $d->user->phone ?? null,
                'specialization' => $d->specialization?->name ?? 'General',
                'specialization_id' => $d->specialization_id,
                'verified' => (bool) $d->verified,
                'bio' => $d->bio,
                'experience_years' => $d->experience_years,
            ]);
        return response()->json($doctors);
    }

    public function getDoctorsBySpecialization($specialization_id)
    {
        $doctors = Doctor::where('specialization_id', $specialization_id)
            ->where('verified', true)->with('user', 'specialization')->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'name' => $d->user->name ?? 'Unknown',
                'email' => $d->user->email ?? null,
                'specialization' => $d->specialization?->name ?? 'General',
                'experience_years' => $d->experience_years,
                'verified' => (bool) $d->verified,
                'bio' => $d->bio,
            ]);
        return response()->json($doctors);
    }

    public function showDoctor($id)
    {
        $d = Doctor::with('user', 'specialization')->find($id);
        if (!$d) return response()->json(['message' => 'Doctor not found'], 404);
        return response()->json([
            'id' => $d->id,
            'name' => $d->user->name ?? 'Unknown',
            'email' => $d->user->email,
            'phone' => $d->user->phone,
            'specialization' => $d->specialization?->name,
            'specialization_id' => $d->specialization_id,
            'experience_years' => $d->experience_years,
            'bio' => $d->bio,
            'verified' => (bool) $d->verified,
        ]);
    }

    public function getDoctorAvailability($doctorId)
    {
        $availability = DoctorAvailability::where('doctor_id', $doctorId)->get();
        return response()->json($availability);
    }

    public function getAvailableSlots($doctorId, Request $request)
    {
        $date = $request->query('date');
        if (!$date) return response()->json(['slots' => []]);

        $dayOfWeek = Carbon::parse($date)->format('l');
        $availability = DoctorAvailability::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)->where('is_available', true)->first();

        if (!$availability) return response()->json(['date' => $date, 'slots' => []]);

        $slots = [];
        $start = Carbon::parse($availability->start_time);
        $end = Carbon::parse($availability->end_time);
        $step = (int) ($availability->slot_duration ?: 30);
        while ($start < $end) {
            $slots[] = $start->format('H:i');
            $start->addMinutes($step);
        }

        // exclude taken slots
        $taken = Appointment::where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get()->map(fn($a) => Carbon::parse($a->appointment_date)->format('H:i'))->toArray();

        $slots = array_values(array_diff($slots, $taken));
        return response()->json(['date' => $date, 'slots' => $slots]);
    }

    /* ---------- patient actions ---------- */

    public function store(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        // Accept either combined datetime or separate date+time
        if ($request->filled('appointment_time') && $request->filled('appointment_date') && strlen($request->input('appointment_date')) <= 10) {
            $request->merge([
                'appointment_date' => $request->input('appointment_date') . ' ' . substr($request->input('appointment_time'), 0, 5),
            ]);
        }

        $validated = $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date_format:Y-m-d H:i',
            'reason' => 'required|string',
        ]);

        // prevent double-booking
        $conflict = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->whereIn('status', ['pending', 'confirmed'])->exists();
        if ($conflict) return response()->json(['message' => 'That slot is no longer available.'], 409);

        $appointment = Appointment::create([
            'doctor_id' => $validated['doctor_id'],
            'patient_id' => $user->id,
            'appointment_date' => $validated['appointment_date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        // notify the doctor's user
        $doctor = Doctor::with('user')->find($validated['doctor_id']);
        if ($doctor && $doctor->user) {
            AppNotification::push(
                $doctor->user->id,
                'appointment.created',
                'New appointment request',
                $user->name . ' booked ' . Carbon::parse($validated['appointment_date'])->format('M d, H:i'),
                ['appointment_id' => $appointment->id]
            );
        }

        return response()->json($this->shapeAppointment($appointment), 201);
    }

    public function show($id)
    {
        $a = Appointment::with('doctor.user', 'doctor.specialization', 'patient')->find($id);
        if (!$a) return response()->json(['message' => 'Not found'], 404);
        return response()->json($this->shapeAppointment($a));
    }

    public function myAppointments()
    {
        $user = auth('api')->user();
        $apps = Appointment::where('patient_id', $user->id)
            ->with('doctor.user', 'doctor.specialization')
            ->orderByDesc('appointment_date')->get()
            ->map(fn($a) => $this->shapeAppointment($a));
        return response()->json($apps);
    }

    public function cancel($id)
    {
        $user = auth('api')->user();
        $a = Appointment::with('doctor.user')->where('id', $id)->where('patient_id', $user->id)->first();
        if (!$a) return response()->json(['message' => 'Not found'], 404);
        $a->update(['status' => 'cancelled']);

        if ($a->doctor && $a->doctor->user) {
            AppNotification::push($a->doctor->user->id, 'appointment.cancelled',
                'Appointment cancelled', $user->name . ' cancelled an appointment.', ['appointment_id' => $a->id]);
        }
        return response()->json(['message' => 'Cancelled']);
    }

    public function reschedule(Request $request, $id)
    {
        $user = auth('api')->user();
        $a = Appointment::where('id', $id)->where('patient_id', $user->id)->first();
        if (!$a) return response()->json(['message' => 'Not found'], 404);

        if ($request->filled('appointment_time') && $request->filled('appointment_date') && strlen($request->input('appointment_date')) <= 10) {
            $request->merge([
                'appointment_date' => $request->input('appointment_date') . ' ' . substr($request->input('appointment_time'), 0, 5),
            ]);
        }
        $validated = $request->validate([
            'appointment_date' => 'required|date_format:Y-m-d H:i',
        ]);

        $a->appointment_date = $validated['appointment_date'];
        $a->status = 'pending';
        $a->save();

        $doctor = Doctor::with('user')->find($a->doctor_id);
        if ($doctor && $doctor->user) {
            AppNotification::push($doctor->user->id, 'appointment.rescheduled',
                'Appointment rescheduled', $user->name . ' moved an appointment.', ['appointment_id' => $a->id]);
        }
        return response()->json($this->shapeAppointment($a->fresh(['doctor.user','doctor.specialization','patient'])));
    }

    /* ---------- doctor actions ---------- */

    public function getDoctorAppointments()
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor) return response()->json(['message' => 'Not a doctor'], 403);

        $apps = Appointment::where('doctor_id', $doctor->id)
            ->with('patient', 'doctor.user', 'doctor.specialization')
            ->orderByDesc('appointment_date')->get()
            ->map(fn($a) => $this->shapeAppointment($a));
        return response()->json($apps);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = auth('api')->user();
        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor && $user->role !== 'admin') return response()->json(['message' => 'Forbidden'], 403);

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'sometimes|nullable|string',
        ]);

        $a = Appointment::with('patient')->find($id);
        if (!$a) return response()->json(['message' => 'Not found'], 404);
        if ($doctor && $a->doctor_id !== $doctor->id && $user->role !== 'admin') return response()->json(['message' => 'Forbidden'], 403);

        $a->status = $validated['status'];
        if (array_key_exists('notes', $validated)) $a->notes = $validated['notes'];
        $a->save();

        if ($a->patient) {
            $label = ['confirmed' => 'approved', 'cancelled' => 'rejected', 'completed' => 'marked complete'][$validated['status']] ?? 'updated';
            AppNotification::push($a->patient->id, 'appointment.' . $validated['status'],
                'Appointment ' . $label,
                'Your appointment on ' . Carbon::parse($a->appointment_date)->format('M d, H:i') . ' was ' . $label . '.',
                ['appointment_id' => $a->id]);
        }
        return response()->json($this->shapeAppointment($a->fresh(['doctor.user','doctor.specialization','patient'])));
    }

    public function doctorCancel($id)
    {
        return $this->updateStatus(new Request(['status' => 'cancelled']), $id);
    }

    /* ---------- availability (working hours) ---------- */

    public function setAvailability(Request $request)
    {
        $user = auth('api')->user();
        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor) return response()->json(['message' => 'Forbidden'], 403);

        // Accept either a single row OR a full week schedule
        if ($request->has('schedule')) {
            $request->validate([
                'schedule' => 'required|array',
                'schedule.*.day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
                'schedule.*.start_time' => 'required|date_format:H:i',
                'schedule.*.end_time' => 'required|date_format:H:i|after:schedule.*.start_time',
                'schedule.*.is_available' => 'required|boolean',
                'schedule.*.slot_duration' => 'nullable|integer|min:15|max:120',
            ]);
            DoctorAvailability::where('doctor_id', $doctor->id)->delete();
            foreach ($request->input('schedule') as $row) {
                DoctorAvailability::create([
                    'doctor_id' => $doctor->id,
                    'day_of_week' => $row['day_of_week'],
                    'start_time' => $row['start_time'],
                    'end_time' => $row['end_time'],
                    'slot_duration' => $row['slot_duration'] ?? 30,
                    'is_available' => $row['is_available'],
                ]);
            }
            return response()->json(['message' => 'Schedule saved', 'schedule' => DoctorAvailability::where('doctor_id', $doctor->id)->get()]);
        }

        $validated = $request->validate([
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_duration' => 'integer|min:15|max:120',
        ]);

        $av = DoctorAvailability::create([
            'doctor_id' => $doctor->id,
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'slot_duration' => $validated['slot_duration'] ?? 30,
            'is_available' => true,
        ]);
        return response()->json(['availability' => $av], 201);
    }

    public function getMyAvailability()
    {
        $user = auth('api')->user();
        $doctor = Doctor::where('user_id', $user->id)->first();
        if (!$doctor) return response()->json(['message' => 'Forbidden'], 403);
        return response()->json(DoctorAvailability::where('doctor_id', $doctor->id)->get());
    }

    public function updateAvailability(Request $request, $id)
    {
        $validated = $request->validate([
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'is_available' => 'nullable|boolean',
            'slot_duration' => 'nullable|integer|min:15|max:120',
        ]);
        $av = DoctorAvailability::findOrFail($id);
        $av->update(array_filter($validated, fn($v) => $v !== null));
        return response()->json($av);
    }

    public function deleteAvailability($id)
    {
        DoctorAvailability::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
