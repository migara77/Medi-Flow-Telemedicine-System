<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Specialization;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:patient,doctor,admin',
            'specialization' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer',
            'bio' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // If doctor, create doctor record
        if ($validated['role'] === 'doctor') {
            $specializationName = $validated['specialization'] ?? 'General';
            $specialization = Specialization::firstOrCreate(
                ['name' => $specializationName],
                ['description' => $specializationName]
            );

            Doctor::create([
                'user_id' => $user->id,
                'specialization_id' => $specialization->id,
                'verified' => true,
                'bio' => $validated['bio'] ?? null,
                'experience_years' => $validated['experience_years'] ?? 0,
            ]);
        }

        $token = auth('api')->login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $this->getUserData($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = auth('api')->attempt($validated)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $this->getUserData(auth('api')->user()),
        ]);
    }

    public function logout()
    {
        auth('api')->logout();
        return response()->json(['message' => 'Logged out successfully']);
    }

    private function getUserData($user)
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
        ];
    }
}
