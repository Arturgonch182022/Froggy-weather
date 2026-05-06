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

        return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    }

    protected readonly Math = Math;

}
