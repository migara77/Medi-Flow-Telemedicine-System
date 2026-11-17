<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'user_id', 'title', 'original_name', 'path', 'mime_type', 'size', 'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
