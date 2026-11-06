<?php

namespace App\Enums;

/**
 * Severity insiden ditentukan dari skor (PRD bagian 10):
 * 0–39 Rendah, 40–79 Sedang, 80–149 Tinggi, 150+ Kritis.
 */
enum Severity: string
{
    case Rendah = 'rendah';
    case Sedang = 'sedang';
    case Tinggi = 'tinggi';
    case Kritis = 'kritis';

    public static function fromScore(int|float $score): self
    {
        return match (true) {
            $score >= 150 => self::Kritis,
            $score >= 80 => self::Tinggi,
            $score >= 40 => self::Sedang,
            default => self::Rendah,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Rendah => 'Rendah',
            self::Sedang => 'Sedang',
            self::Tinggi => 'Tinggi',
            self::Kritis => 'Kritis',
        };
    }

    public function rank(): int
    {
        return match ($this) {
            self::Rendah => 0,
            self::Sedang => 1,
            self::Tinggi => 2,
            self::Kritis => 3,
        };
    }

    public function badgeClass(): string
    {
        return AlertLevel::fromSeverity($this)->badgeClass();
    }
}
