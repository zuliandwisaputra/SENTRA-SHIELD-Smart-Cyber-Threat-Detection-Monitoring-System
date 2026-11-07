<button {{ $attributes->merge(['type' => 'submit', 'class' => 'inline-flex h-10 items-center justify-center gap-2 rounded-control bg-accent px-4 text-sm font-semibold tracking-wide text-accent-ink transition-colors duration-150 ease-sentra hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50']) }}>
    {{ $slot }}
</button>
