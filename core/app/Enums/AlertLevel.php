<?php

namespace App\Enums;

/**
 * Tingkat Siaga satuan (PRD bagian 10). Urutan rank dipakai untuk mengambil
 * tingkat tertinggi dari insiden terbuka dan dari satuan anak.
 */
enum AlertLevel: string
{
    case Aman = 'aman';
    case Waspada = 'waspada';
    case Siaga = 'siaga';
    case Awas = 'awas';

    public function label(): string
    {
        return match ($this) {
            self::Aman => 'Aman',
            self::Waspada => 'Waspada',
            self::Siaga => 'Siaga',
            self::Awas => 'Awas',
        };
    }

    public function rank(): int
    {
        return match ($this) {
            self::Aman => 0,
            self::Waspada => 1,
            self::Siaga => 2,
            self::Awas => 3,
        };
    }

    public static function fromSeverity(?Severity $severity): self
    {
        return match ($severity) {
            null => self::Aman,
            Severity::Rendah => self::Aman,
            Severity::Sedang => self::Waspada,
            Severity::Tinggi => self::Siaga,
            Severity::Kritis => self::Awas,
        };
    }

    public static function highest(self ...$levels): self
    {
        $top = self::Aman;
        foreach ($levels as $level) {
            if ($level->rank() > $top->rank()) {
                $top = $level;
            }
        }

        return $top;
    }

    /** Kelas warna konsisten dengan Severity padanannya. */
    public function badgeClass(): string
    {
        return match ($this) {
            self::Aman => 'bg-emerald-900/60 text-emerald-300 ring-emerald-700',
            self::Waspada => 'bg-yellow-900/60 text-yellow-300 ring-yellow-700',
            self::Siaga => 'bg-orange-900/60 text-orange-300 ring-orange-700',
            self::Awas => 'bg-red-900/70 text-red-300 ring-red-600',
        };
    }

    public function dotClass(): string
    {
        return match ($this) {
            self::Aman => 'bg-emerald-500',
            self::Waspada => 'bg-yellow-400',
            self::Siaga => 'bg-orange-500',
            self::Awas => 'bg-red-500',
        };
    }
}
