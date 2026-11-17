<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicalRecordController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        $records = MedicalRecord::where('user_id', $user->id)->orderByDesc('created_at')->get();
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'file' => 'required|file|max:20480|mimes:pdf,png,jpg,jpeg,doc,docx,txt',
        ]);

        $file = $request->file('file');
        $path = $file->store('medical-records/' . $user->id, 'local');

        $record = MedicalRecord::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return response()->json($record, 201);
    }

    public function download($id)
    {
        $user = auth('api')->user();
        $record = MedicalRecord::where('user_id', $user->id)->where('id', $id)->first();
        if (!$record) return response()->json(['message' => 'Not found'], 404);
        if (!Storage::disk('local')->exists($record->path)) {
            return response()->json(['message' => 'File missing'], 404);
        }
        return Storage::disk('local')->download($record->path, $record->original_name);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        $record = MedicalRecord::where('user_id', $user->id)->where('id', $id)->first();
        if (!$record) return response()->json(['message' => 'Not found'], 404);
        Storage::disk('local')->delete($record->path);
        $record->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
