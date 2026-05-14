import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map, catchError, throwError} from 'rxjs';

@Injectable({providedIn: 'root'})
export class WeatherService {

    private weatherUrl = 'https://api.open-meteo.com/v1/forecast';
    private geoUrl = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

    constructor(private http: HttpClient) {
    }

    getWeatherByCoords(lat: number, lon: number): Observable<any> {
        const current = [
            'temperature_2m',
            'weather_code',
            'is_day',
            'apparent_temperature',
            'relative_humidity_2m',
            'wind_speed_10m',
            'wind_direction_10m',
            'pressure_msl',
            'uv_index'
        ].join(',');

        const daily = [
            'temperature_2m_max',
            'temperature_2m_min',
            'weather_code',
            'uv_index_max',
            'sunrise',
            'sunset',
            'precipitation_sum',
            'precipitation_hours',
            'wind_speed_10m_max'
        ].join(',');

        const hourly = [
            'temperature_2m',
            'weather_code',
            'is_day',
            'relative_humidity_2m',
            'wind_speed_10m'
        ].join(',');

        const params = `?latitude=${lat}&longitude=${lon}&current=${current}&daily=${daily}&hourly=${hourly}&forecast_days=10&timezone=auto`;

        return this.http.get(`${this.weatherUrl}${params}`).pipe(
            catchError(err => {
                console.error('Ошибка Open-Meteo API:', err);
                return throwError(() => err);
            })
        );
    }

    getCityName(lat: number, lon: number): Observable<string> {
        const params = `?latitude=${lat}&longitude=${lon}&localityLanguage=ru`;
        return this.http.get<any>(`${this.geoUrl}${params}`).pipe(
            map(res => res.city || res.locality || 'Неизвестный город'),
            catchError(err => {
                console.error('Ошибка Геокодинга. Возможно, превышен лимит или нет сети:', err);
                return throwError(() => 'Минск');
            })
        );
    }
}

