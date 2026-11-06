<?php

namespace App\Providers;

use App\Models\User;
use App\Support\AccessMatrix;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach (array_keys(AccessMatrix::ABILITIES) as $ability) {
            Gate::define($ability, fn (User $user) => AccessMatrix::allows($user->role, $ability));
        }
    }
}
