<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Doctor;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function requireAdmin()
    {
        $authUser = auth('api')->user();
        if (!$authUser) return [null, response()->json(['message' => 'Unauthorized'], 401)];
        if ($authUser->role !== 'admin') return [null, response()->json(['message' => 'Forbidden'], 403)];
        return [$authUser, null];
    }

    private function shapeUser(User $user): array
    {
        $user->loadMissing('doctor.specialization');
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth?->toDateString(),
            'gender' => $user->gender,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'is_suspended' => (bool) $user->is_suspended,
            'created_at' => $user->created_at,
        ];
        if ($user->role === 'doctor' && $user->doctor) {
            $data['doctor_id'] = $user->doctor->id;
            $data['specialization'] = $user->doctor->specialization?->name;
            $data['specialization_id'] = $user->doctor->specialization_id;
            $data['experience_years'] = $user->doctor->experience_years;
            $data['verified'] = (bool) $user->doctor->verified;
        }
        return $data;
    }

    public function getAllUsers(Request $request)
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;

        $q = User::query();
        if ($request->filled('role')) $q->where('role', $request->input('role'));
        if ($request->filled('search')) {
            $s = $request->input('search');
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', "%$s%")
                   ->orWhere('email', 'like', "%$s%")
                   ->orWhere('phone', 'like', "%$s%");
            });
        }
        $q->with('doctor.specialization')->orderByDesc('created_at');
        return response()->json($q->get()->map(fn($u) => $this->shapeUser($u)));
    }

    public function showUser($id)
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;
        $u = User::with('doctor.specialization')->find($id);
        if (!$u) return response()->json(['message' => 'User not found'], 404);
        return response()->json($this->shapeUser($u));
    }

    public function updateUser(Request $request, $id)
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;

        $u = User::with('doctor')->find($id);
        if (!$u) return response()->json(['message' => 'User not found'], 404);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $u->id,
            'phone' => 'sometimes|nullable|string|max:30',
            'address' => 'sometimes|nullable|string|max:500',
            'date_of_birth' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|string|in:male,female,other',
            'bio' => 'sometimes|nullable|string|max:2000',
            'password' => 'sometimes|nullable|string|min:6',
            'specialization' => 'sometimes|nullable|string|max:255',
            'experience_years' => 'sometimes|nullable|integer|min:0',
        ]);

        foreach (['name','email','phone','address','date_of_birth','gender','bio'] as $f) {
            if (array_key_exists($f, $validated)) $u->{$f} = $validated[$f];
        }
        if (!empty($validated['password'])) $u->password = Hash::make($validated['password']);
        $u->save();

        if ($u->role === 'doctor' && $u->doctor) {
            if (array_key_exists('specialization', $validated) && $validated['specialization']) {
                $spec = Specialization::firstOrCreate(['name' => $validated['specialization']]);
                $u->doctor->specialization_id = $spec->id;
            }
            if (array_key_exists('experience_years', $validated) && $validated['experience_years'] !== null) {
                $u->doctor->experience_years = $validated['experience_years'];
            }
            if (array_key_exists('bio', $validated)) {
                $u->doctor->bio = $validated['bio'];
            }
            $u->doctor->save();
        }

        return response()->json(['message' => 'User updated', 'user' => $this->shapeUser($u->fresh(['doctor.specialization']))]);
    }

    public function deleteUser($id)
    {
        [$authUser, $err] = $this->requireAdmin();
        if ($err) return $err;
        if ($authUser->id == $id) return response()->json(['message' => 'Cannot delete your own account'], 400);
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function suspendUser($id)
    {
        [$authUser, $err] = $this->requireAdmin();
        if ($err) return $err;
        if ($authUser->id == $id) return response()->json(['message' => 'Cannot suspend yourself'], 400);
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        $user->update(['is_suspended' => true]);
        return response()->json(['message' => 'User suspended', 'user' => $this->shapeUser($user)]);
    }

    public function unsuspendUser($id)
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'User not found'], 404);
        $user->update(['is_suspended' => false]);
        return response()->json(['message' => 'User unsuspended', 'user' => $this->shapeUser($user)]);
    }

    public function getAppointmentCount()
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;
        return response()->json(['count' => Appointment::count()]);
    }

    public function getStatistics()
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;

        $since = now()->subDays(13)->startOfDay();
        $daily = Appointment::where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
            ->groupBy('day')->orderBy('day')->get();

        $byStatus = Appointment::selectRaw('status, COUNT(*) as count')->groupBy('status')->get();

        $statistics = [
            'total_users' => User::count(),
            'total_doctors' => User::where('role', 'doctor')->count(),
            'total_patients' => User::where('role', 'patient')->count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_appointments' => Appointment::count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'confirmed_appointments' => Appointment::where('status', 'confirmed')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'cancelled_appointments' => Appointment::where('status', 'cancelled')->count(),
            'total_payments' => Payment::count(),
            'total_revenue' => (float) (Payment::where('status', 'completed')->sum('amount') ?? 0),
            'suspended_users' => User::where('is_suspended', true)->count(),
            'daily_appointments' => $daily,
            'status_breakdown' => $byStatus,
        ];

        return response()->json($statistics);
    }

    public function getAllAppointments()
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;

        $appointments = Appointment::with('patient', 'doctor.user', 'doctor.specialization')
            ->orderByDesc('appointment_date')
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'patient_id' => $a->patient_id,
                    'patient_name' => $a->patient->name ?? 'Unknown',
                    'patient_email' => $a->patient->email ?? null,
                    'doctor_id' => $a->doctor_id,
                    'doctor_name' => $a->doctor->user->name ?? 'Unknown',
                    'specialization' => $a->doctor->specialization->name ?? 'General',
                    'appointment_date' => $a->appointment_date,
                    'reason' => $a->reason,
                    'status' => $a->status,
                    'created_at' => $a->created_at,
                ];
            });

        return response()->json($appointments);
    }

    public function createDoctor(Request $request)
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|max:30',
            'specialization' => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0',
            'bio' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'role' => 'doctor',
        ]);

        $spec = Specialization::firstOrCreate(['name' => $validated['specialization']], ['description' => $validated['specialization']]);

        Doctor::create([
            'user_id' => $user->id,
            'specialization_id' => $spec->id,
            'verified' => true,
            'bio' => $validated['bio'] ?? null,
            'experience_years' => $validated['experience_years'],
        ]);

        $user->load('doctor.specialization');
        return response()->json(['message' => 'Doctor created', 'user' => $this->shapeUser($user)], 201);
    }

    public function createPatient(Request $request)
    {
        [$_, $err] = $this->requireAdmin();
        if ($err) return $err;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|max:30',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
        ]);

        $user = User::create(array_merge($validated, [
            'password' => Hash::make($validated['password']),
            'role' => 'patient',
        ]));

        return response()->json(['message' => 'Patient created', 'user' => $this->shapeUser($user)], 201);
    }

    // Doctor lists patients they've had appointments with
    public function doctorPatients()
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== 'doctor') return response()->json(['message' => 'Forbidden'], 403);
        $doctor = $user->doctor;
        if (!$doctor) return response()->json([]);

        $patientIds = Appointment::where('doctor_id', $doctor->id)->pluck('patient_id')->unique()->values();
        $patients = User::whereIn('id', $patientIds)->orderBy('name')->get(['id','name','email','phone']);
        return response()->json($patients);
    }
}
