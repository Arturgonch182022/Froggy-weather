import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeocodingService, GeocodingResult } from '../../core/services/geocoding.service';
import { FavoritesService, FavoriteLocation } from '../../core/services/favorites.service';
import { WeatherService } from '../../core/services/weather';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './search.html',
    styleUrl: './search.scss'
})
export class Search implements OnInit, OnDestroy {
    @Input() currentCityName: string = 'Определение...';
    @Output() citySelected = new EventEmitter<{ lat: number; lon: number; name: string }>();

    isSearchOpen = false;
    searchQuery = '';
    suggestions: GeocodingResult[] = [];
    currentLocation: { name: string; lat: number; lon: number } | null = null;
    favorites: FavoriteLocation[] = [];

    private searchSubject = new Subject<string>();

    constructor(
        private geocoding: GeocodingService,
        private favoritesService: FavoritesService,
        private weatherService: WeatherService
    ) {}

    ngOnInit() {
        this.loadCurrentLocation();
        this.loadFavorites();

        this.searchSubject.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            switchMap(query => {
                if (query.length < 2) return [];
                return this.geocoding.searchCities(query);
            })
        ).subscribe(results => {
            this.suggestions = results;
        });
    }

    ngOnDestroy() {
        this.searchSubject.complete();
    }

    loadCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    this.weatherService.getCityName(latitude, longitude).subscribe(name => {
                        this.currentLocation = { name, lat: latitude, lon: longitude };
                    });
                },
                () => {
                    this.currentLocation = { name: 'Минск', lat: 53.9, lon: 27.5 };
                }
            );
        } else {
            this.currentLocation = { name: 'Минск', lat: 53.9, lon: 27.5 };
        }
    }

    loadFavorites() {
        this.favorites = this.favoritesService.getFavorites();
    }

    onSearchInput() {
        this.searchSubject.next(this.searchQuery);
    }

    selectSuggestion(suggestion: GeocodingResult) {
        this.searchQuery = '';
        this.suggestions = [];
        this.isSearchOpen = false;
        this.citySelected.emit({
            lat: suggestion.latitude,
            lon: suggestion.longitude,
            name: suggestion.name
        });
    }

    selectCurrentLocation() {
        if (this.currentLocation) {
            this.citySelected.emit({
                lat: this.currentLocation.lat,
                lon: this.currentLocation.lon,
                name: this.currentLocation.name
            });
            this.isSearchOpen = false;
        }
    }

    saveToFavorites(item: GeocodingResult, event: Event) {
        event.stopPropagation();
        this.favoritesService.addFavorite({
            name: `${item.name}, ${item.country}`,
            latitude: item.latitude,
            longitude: item.longitude
        });
        this.loadFavorites();
    }

    selectFavorite(fav: FavoriteLocation) {
        this.citySelected.emit({
            lat: fav.latitude,
            lon: fav.longitude,
            name: fav.name
        });
        this.isSearchOpen = false;
    }

    removeFavorite(event: Event, fav: FavoriteLocation) {
        event.stopPropagation();
        this.favoritesService.removeFavorite(fav.latitude, fav.longitude);
        this.loadFavorites();
    }

    toggleSearch() {
        this.isSearchOpen = !this.isSearchOpen;
        if (this.isSearchOpen) {
            this.searchQuery = '';
            this.suggestions = [];
        }
    }
}
