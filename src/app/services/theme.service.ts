import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    darkMode = signal<boolean>(false);

    constructor() {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        let initialTheme = false;
        
        if (savedTheme) {
            initialTheme = savedTheme === 'dark';
        } else {
            initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // Set initial theme
        this.darkMode.set(initialTheme);
        
        // Apply initial theme immediately
        if (initialTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply theme when signal changes
        effect(() => {
            if (this.darkMode()) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    toggleTheme() {
        this.darkMode.update(current => !current);
    }
}
