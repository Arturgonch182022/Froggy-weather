import { Injectable } from '@angular/core';

export interface FavoriteLocation {
    name: string;
    latitude: number;
    longitude: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
    private key = 'favorite_locations';

    getFavorites(): FavoriteLocation[] {
        const raw = localStorage.getItem(this.key);
        return raw ? JSON.parse(raw) : [];
    }

    addFavorite(loc: FavoriteLocation): void {
        const current = this.getFavorites();
        if (!current.some(f => f.latitude === loc.latitude && f.longitude === loc.longitude)) {
            current.push(loc);
            localStorage.setItem(this.key, JSON.stringify(current));
        }
    }

    removeFavorite(lat: number, lon: number): void {
        const filtered = this.getFavorites().filter(f => !(f.latitude === lat && f.longitude === lon));
        localStorage.setItem(this.key, JSON.stringify(filtered));
    }
}
