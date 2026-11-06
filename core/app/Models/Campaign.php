<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['src_ip', 'unit_count', 'first_seen_at', 'last_seen_at', 'status'])]
class Campaign extends Model
{
    protected function casts(): array
    {
        return [
            'unit_count' => 'integer',
            'status' => CampaignStatus::class,
            'first_seen_at' => 'datetime:Y-m-d H:i:s.v',
            'last_seen_at' => 'datetime:Y-m-d H:i:s.v',
        ];
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(ResponseAction::class);
    }
}
