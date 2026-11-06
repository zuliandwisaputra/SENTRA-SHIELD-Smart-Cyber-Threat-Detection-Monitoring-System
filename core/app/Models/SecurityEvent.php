<?php

namespace App\Models;

use App\Enums\EventSource;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

/**
 * Event telemetri (tabel `events`). Append-only: aplikasi tidak pernah
 * mengubah atau menghapus event setelah disimpan (PRD bagian 6, Integritas).
 */
#[Fillable([
    'agent_id', 'unit_id', 'source', 'src_ip', 'dst_port', 'payload', 'raw',
    'is_test', 'occurred_at', 'created_at',
])]
class SecurityEvent extends Model
{
    /** Simpan pecahan detik (kolom DATETIME(3)/(6)). */
    protected $dateFormat = 'Y-m-d H:i:s.v';

    use HasFactory;

    protected $table = 'events';

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'source' => EventSource::class,
            'payload' => 'array',
            'is_test' => 'boolean',
            'dst_port' => 'integer',
            'occurred_at' => 'datetime:Y-m-d H:i:s.v',
            'created_at' => 'datetime:Y-m-d H:i:s.v',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function () {
            throw new LogicException('Event telemetri tidak bisa diubah.');
        });
        static::deleting(function () {
            throw new LogicException('Event telemetri tidak bisa dihapus.');
        });
    }

    /** ID tampilan untuk sitasi bukti, contoh EV-1042. */
    public function reference(): string
    {
        return 'EV-'.$this->id;
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function detections(): HasMany
    {
        return $this->hasMany(Detection::class, 'event_id');
    }
}
