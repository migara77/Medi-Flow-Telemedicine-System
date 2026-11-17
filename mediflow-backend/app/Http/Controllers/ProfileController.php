<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function me()
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $data = $user->only(['id','name','email','phone','role','address','date_of_birth','gender','avatar_url','bio','is_suspended','created_at']);
        if ($user->role === 'doctor') {
            $user->load('doctor.specialization');
            $data['doctor'] = $user->doctor ? [
                'id' => $user->doctor->id,
                'specialization' => $user->doctor->specialization?->name,
                'experience_years' => $user->doctor->experience_years,
                'bio' => $user->doctor->bio,
                'verified' => $user->doctor->verified,
            ] : null;
        }
        return response()->json($data);
    }

    public function update(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:30',
            'address' => 'sometimes|nullable|string|max:500',
            'date_of_birth' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|string|in:male,female,other',
            'bio' => 'sometimes|nullable|string|max:2000',
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        $u = User::find($user->id);
        foreach (['name','phone','address','date_of_birth','gender','bio'] as $field) {
            if (array_key_exists($field, $validated)) $u->{$field} = $validated[$field];
        }
        if (!empty($validated['password'])) $u->password = Hash::make($validated['password']);
        $u->save();

        return response()->json([
            'message' => 'Profile updated',
            'user' => $u->only(['id','name','email','phone','role','address','date_of_birth','gender','bio']),
        ]);
    }
}
