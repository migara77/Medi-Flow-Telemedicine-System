<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'patient_id',
        'medications',
        'medication_name',
        'dosage',
        'frequency',
        'duration',
        'instructions',
        'notes',
    ];

    protected $casts = [
        'medications' => 'array',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function medicationsArray(): array
    {
        if (is_array($this->medications) && count($this->medications) > 0) {
            return $this->medications;
        }
        if ($this->medication_name) {
            return [[
                'name' => $this->medication_name,
                'dosage' => $this->dosage,
                'frequency' => $this->frequency,
                'duration' => $this->duration,
            ]];
        }
        return [];
    }
}
