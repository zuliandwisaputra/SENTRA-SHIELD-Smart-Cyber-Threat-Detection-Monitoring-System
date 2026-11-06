<?php

namespace App\Models;

use App\Enums\SiteVariant;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['site_id', 'check_uuid', 'variant', 'hash', 'similarity', 'gambling_hits', 'flagged', 'checked_at'])]
class SiteCheck extends Model
{
    /** Simpan pecahan detik (kolom DATETIME(3)/(6)). */
    protected $dateFormat = 'Y-m-d H:i:s.v';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'variant' => SiteVariant::class,
            'similarity' => 'float',
            'gambling_hits' => 'integer',
            'flagged' => 'boolean',
            'checked_at' => 'datetime',
        ];
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(MonitoredSite::class, 'site_id');
    }
}
