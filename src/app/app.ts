import {Component, OnInit, signal, computed} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Search} from './features/search/search';
import {WeatherService} from './core/services/weather';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Search],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {
    currentCity = signal<string>("Загрузка...");
    weatherData = signal<any>(null);

    constructor(private weatherService: WeatherService) {
    }

    ngOnInit() {
        this.initLocation();
    }

    initLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const {latitude, longitude} = pos.coords;
                    this.weatherService.getCityName(latitude, longitude).subscribe(cityName => {
                        this.getWeather(latitude, longitude, cityName);
                    });
                },
                () => this.getWeather(53.9, 27.5, 'Минск')
            );
        } else {
            this.getWeather(53.9, 27.5, 'Минск');
        }
    }

    getWeather(lat: number, lon: number, label: string) {
        this.currentCity.set(label);

        this.weatherService.getWeatherByCoords(lat, lon).subscribe({
            next: (data) => {
                this.weatherData.set(data);
                console.log('Данные получены:', data);
            }
        });
    }

    froggyUrl = computed(() => {
        const code = this.weatherData()?.current.weather_code ?? 0;
        return "images/froggy/" + code + ".png";
    });

    formatDay(dateStr: string): string {
        const date = new Date(dateStr);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) return 'Сегодня';

        return date.toLocaleDateString('ru-RU', {weekday: 'short', day: 'numeric'});
    }

    protected readonly Math = Math;


    getWindDirection(degrees: number): string {
        const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }

    getNextHours(hourlyData: any, hoursCount: number): any[] {
        const now = new Date();
        const currentHour = now.getHours();
        const times = hourlyData.time;
        let startIndex = times.findIndex((time: string) => {
            const d = new Date(time);
            return d.getHours() >= currentHour && d >= now;
        });
        if (startIndex === -1) startIndex = 0;
        return times.slice(startIndex, startIndex + hoursCount).map((time: string, idx: number) => ({
            time: time,
            temperature_2m: hourlyData.temperature_2m[startIndex + idx],
            weather_code: hourlyData.weather_code[startIndex + idx]
        }));
    }

    formatTime(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    }

    formatHour(isoString: string): string {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    }

    getDayLength(sunrise: string, sunset: string): string {
        const rise = new Date(sunrise);
        const set = new Date(sunset);
        const diff = (set.getTime() - rise.getTime()) / 1000 / 60; // в минутах
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours} ч ${minutes} мин`;
    }

    getWeatherDescription(code: number): string {
        const weatherMap: Record<number, string> = {
            0: 'Ясно',
            1: 'В основном ясно',
            2: 'Переменная облачность',
            3: 'Пасмурно',
            45: 'Туман',
            48: 'Туман',
            51: 'Легкая морось',
            53: 'Морось',
            55: 'Сильная морось',
            56: 'Ледяная морось',
            57: 'Сильная ледяная морось',
            61: 'Небольшой дождь',
            63: 'Дождь',
            65: 'Сильный дождь',
            66: 'Ледяной дождь',
            67: 'Сильный ледяной дождь',
            71: 'Небольшой снег',
            73: 'Снег',
            75: 'Сильный снег',
            77: 'Снежная крупа',
            80: 'Небольшой ливень',
            81: 'Ливень',
            82: 'Сильный ливень',
            85: 'Небольшой снегопад',
            86: 'Сильный снегопад',
            95: 'Гроза',
            96: 'Гроза с градом',
            99: 'Сильная гроза с градом'
        };
        return weatherMap[code] || 'Неизвестно';
    }
}
