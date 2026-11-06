<?php

namespace App\Enums;

enum AgentStatus: string
{
    /** Dibuat Admin, menunggu agent menukar kode pendaftaran. */
    case Menunggu = 'menunggu';
    case Online = 'online';
    case Buta = 'buta';
    case Dicabut = 'dicabut';

    public function label(): string
    {
        return match ($this) {
            self::Menunggu => 'Menunggu pendaftaran',
            self::Online => 'Online',
            self::Buta => 'BUTA',
            self::Dicabut => 'Dicabut',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::Menunggu => 'bg-slate-800 text-slate-300 ring-slate-600',
            self::Online => 'bg-emerald-900/60 text-emerald-300 ring-emerald-700',
            self::Buta => 'bg-red-900/70 text-red-300 ring-red-600',
            self::Dicabut => 'bg-slate-800 text-slate-400 ring-slate-600',
        };
    }
}
