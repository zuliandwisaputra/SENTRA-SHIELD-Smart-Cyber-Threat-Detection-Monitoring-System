import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    // Mode gelap permanen lewat class="dark" pada <html>.
    darkMode: 'class',

    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        // Kelas warna Tingkat Siaga/severity didefinisikan di enum PHP.
        './app/Enums/**/*.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                // Font sistem saja: tidak ada unduhan font dari internet.
                sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
        },
    },

    plugins: [forms],
};
