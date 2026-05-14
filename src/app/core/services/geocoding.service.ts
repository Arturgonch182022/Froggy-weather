import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
    private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

    constructor(private http: HttpClient) {}

    searchCities(query: string): Observable<GeocodingResult[]> {
        const params = `?name=${encodeURIComponent(query)}&count=5&language=ru&format=json`;
        return this.http.get<any>(`${this.geocodingUrl}${params}`).pipe(
            map(response => {
                if (!response.results) return [];
                return response.results.map((r: any) => ({
                    name: r.name,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    country: r.country,
                    admin1: r.admin1
                }));
            })
        );
    }
}
