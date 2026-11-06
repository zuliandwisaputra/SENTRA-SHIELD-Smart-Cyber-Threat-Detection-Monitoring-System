<?php

namespace App\Models;

use App\Enums\ReportGenerator;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * LAPSIT. sha256 adalah hash file PDF final; contentHash() adalah hash isi
 * LAPSIT yang dicetak di kaki halaman (keputusan B10).
 */
#[Fillable(['incident_id', 'generator', 'content', 'pdf_path', 'sha256', 'created_by'])]
class Report extends Model
{
    protected function casts(): array
    {
        return [
            'generator' => ReportGenerator::class,
        ];
    }

    public function contentHash(): string
    {
        return hash('sha256', $this->content);
    }

    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
