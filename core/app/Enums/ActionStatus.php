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
}
