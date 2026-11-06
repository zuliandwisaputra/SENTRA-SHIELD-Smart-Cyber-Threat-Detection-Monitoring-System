<?php

namespace App\Enums;

/**
 * Status tindakan (FR-06). Kedaluwarsa = blokir yang durasinya habis dan sudah
 * dibuka otomatis. Usulan yang belum diputuskan tetap Diusulkan.
 */
enum ActionStatus: string
{
    case Diusulkan = 'diusulkan';
    case Disetujui = 'disetujui';
    case Ditolak = 'ditolak';
    case Dieksekusi = 'dieksekusi';
    case Gagal = 'gagal';
    case Kedaluwarsa = 'kedaluwarsa';
    case Dibatalkan = 'dibatalkan';

    public function label(): string
    {
        return match ($this) {
            self::Diusulkan => 'Diusulkan',
            self::Disetujui => 'Disetujui',
            self::Ditolak => 'Ditolak',
            self::Dieksekusi => 'Dieksekusi',
            self::Gagal => 'Gagal',
            self::Kedaluwarsa => 'Kedaluwarsa',
            self::Dibatalkan => 'Dibatalkan',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::Diusulkan => 'bg-sky-900/60 text-sky-300 ring-sky-700',
            self::Disetujui => 'bg-indigo-900/60 text-indigo-300 ring-indigo-700',
            self::Dieksekusi => 'bg-emerald-900/60 text-emerald-300 ring-emerald-700',
            self::Gagal => 'bg-red-900/70 text-red-300 ring-red-600',
            self::Ditolak, self::Kedaluwarsa, self::Dibatalkan => 'bg-gray-800 text-gray-300 ring-gray-600',
        };
    }
}
