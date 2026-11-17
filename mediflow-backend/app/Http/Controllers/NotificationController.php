<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $list = AppNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $unread = AppNotification::where('user_id', $user->id)
            ->whereNull('read_at')->count();

        return response()->json([
            'unread' => $unread,
            'items' => $list,
        ]);
    }

    public function markRead($id)
    {
        $user = auth('api')->user();
        $n = AppNotification::where('user_id', $user->id)->where('id', $id)->first();
        if (!$n) return response()->json(['message' => 'Not found'], 404);
        if (!$n->read_at) { $n->read_at = now(); $n->save(); }
        return response()->json(['message' => 'ok']);
    }

    public function markAllRead()
    {
        $user = auth('api')->user();
        AppNotification::where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['message' => 'ok']);
    }
}
