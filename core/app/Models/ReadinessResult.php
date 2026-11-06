<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['run_id', 'scenario', 'rule_id', 'detected', 'ttd_ms', 'started_at'])]
class ReadinessResult extends Model
{
    protected function casts(): array
    {
        return [
            'detected' => 'boolean',
            'ttd_ms' => 'integer',
            'started_at' => 'datetime:Y-m-d H:i:s.v',
        ];
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(ReadinessRun::class, 'run_id');
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(DetectionRule::class, 'rule_id');
    }
}
