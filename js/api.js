const API_KEY = ''; // insertar API KEY para que funcione la app
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
const DEFAULT_LANGUAGE = 'es-ES';

const API = {
    async getGenres() {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}`);

        if (!res.ok) {
            throw new Error('Error al obtener géneros');
        }

        return res.json();
    },

    async getMovies(page = 1, filters = {}) {
        const params = new URLSearchParams({ api_key: API_KEY, language: DEFAULT_LANGUAGE, page });
        params.set('sort_by', filters.sortBy || 'release_date.desc');

        if (filters.genreId) {
            params.set('with_genres', filters.genreId);
        }

        if (filters.year) {
            params.set('primary_release_year', filters.year);
        }

        const res = await fetch(`${BASE_URL}/discover/movie?${params}`);

        if (!res.ok) {
            throw new Error('Error al obtener películas');
        }

        return res.json();
    },

    async searchMovies(query, page = 1, filters = {}) {
        const params = new URLSearchParams({ api_key: API_KEY, language: DEFAULT_LANGUAGE, query, page });

        if (filters.year) {
            params.set('year', filters.year);
        }

        const res = await fetch(`${BASE_URL}/search/movie?${params}`);

        if (!res.ok) {
            throw new Error('Error en la búsqueda');
        }

        return res.json();
    },

    async getMovieDetail(id) {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}`);

        if (!res.ok) {
            throw new Error('Error al obtener detalle');
        }

        return res.json();
    },

    async getMovieCredits(id) {
        const res = await fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}`);

        if (!res.ok) {
            throw new Error('Error al obtener créditos');
        }

        return res.json();
    },

    async getMovieImages(id) {
        const res = await fetch(`${BASE_URL}/movie/${id}/images?api_key=${API_KEY}&language=${DEFAULT_LANGUAGE}`);

        if (!res.ok) {
            throw new Error('Error al obtener imágenes');
        }

        return res.json();
    },
};
