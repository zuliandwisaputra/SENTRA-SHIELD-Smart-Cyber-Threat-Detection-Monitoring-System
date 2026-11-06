<?php

namespace App\Http\Controllers\Api\Agent;

use App\Enums\ActionStatus;
use App\Enums\AgentStatus;
use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * POST /api/v1/agent/heartbeat — lapor hidup, versi, dan status tiap sumber log.
 */
class HeartbeatController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Agent $agent */
        $agent = $request->user();

        $data = $request->validate([
            'version' => ['required', 'string', 'max:32'],
            'ip' => ['nullable', 'ip'],
            'sources' => ['present', 'array', 'max:16'],
            'sources.*.status' => ['required', 'string', 'in:ok,error,missing,disabled'],
            'sources.*.detail' => ['nullable', 'string', 'max:255'],
            'sources.*.last_event_at' => ['nullable', 'date'],
        ]);

        $agent->forceFill([
            'version' => $data['version'],
            'ip' => $data['ip'] ?? $agent->ip,
            'sources' => $data['sources'],
            'status' => AgentStatus::Online,
            'last_heartbeat_at' => now(),
        ])->save();

        return response()->json([
            'server_time' => now()->toIso8601ZuluString('millisecond'),
            'pending_commands' => $agent->actions()->where('status', ActionStatus::Disetujui)->count(),
        ]);
    }
}
