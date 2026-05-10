let currentPage = 1;
let currentFilters = {};
let currentMovies = {};
let isLoading = false;
let showingFavorites = false;

const ERROR_MESSAGE = 'Ocurrió un error. Por favor, intenta nuevamente &#128560;';
const SEARCH_INPUT = 'searchInput';
const GENRE_FILTER = 'genreFilter';
const YEAR_FILTER = 'yearFilter';
const SORT_FILTER = 'sortFilter';

const escapeHtml = (str) => {
    const div = document.createElement('div');

    div.appendChild(document.createTextNode(String(str)));

    return div.innerHTML;
}

const init = async () => {
    try {
        await loadGenres();
    } catch (e) {
        showError('No se pudo conectar con la API &#128561;');
        return;
    }

    currentFilters = Storage.getFilter();
    restoreFilterUI();
    setupEventListeners();
    await loadMovies();
}

const loadGenres = async () => {
    const data = await API.getGenres();
    const genres = data.genres || [];
    const select = document.getElementById(GENRE_FILTER);

    genres.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        select.appendChild(opt);
    });
}

const restoreFilterUI = () => {
    if (currentFilters.query) {
        document.getElementById(SEARCH_INPUT).value = currentFilters.query;
    }
    if (currentFilters.genreId) {
        document.getElementById(GENRE_FILTER).value = currentFilters.genreId;
    }
    if (currentFilters.year) {
        document.getElementById(YEAR_FILTER).value = currentFilters.year;
    }
    if (currentFilters.sortBy) {
        document.getElementById(SORT_FILTER).value = currentFilters.sortBy;
    }
};

const loadMovies = async (append = false) => {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);

    if (!append) {
        currentPage = 1;
        document.getElementById('moviesGrid').innerHTML = '';
        currentMovies = {};
    }

    try {
        let data;
        if (currentFilters.query) {
            data = await API.searchMovies(currentFilters.query, currentPage, currentFilters);
        } else {
            data = await API.getMovies(currentPage, currentFilters);
        }

        const movies = data.results || [];
        movies.forEach(m => { currentMovies[m.id] = m; });
        renderMovies(movies, !append);

        const btn = document.getElementById('loadMoreBtn');
        btn.classList.toggle('d-none', data.page >= data.total_pages);
    } catch (e) {
        showError('Error al consultar las películas.');
    }

    showLoading(false);
    isLoading = false;
}

const renderMovies = (movies, firstLoad) => {
    const grid = document.getElementById('moviesGrid');
    if (firstLoad && movies.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5 text-muted"><p>No se encontraron películas &#128531;</p></div>';
        return;
    }
    movies.forEach(movie => {
        if (movie.poster_path) {
            grid.appendChild(buildMovieCard(movie));
        }
    });
}

const buildMovieCard = (movie) => {
    const isFav = Storage.isFavorite(movie.id);
    const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const poster = movie.poster_path
        ? IMAGE_BASE + movie.poster_path
        : 'https://via.placeholder.com/300x450?text=Sin+Imagen';

    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 mb-4';
    col.innerHTML = `
        <div class="card h-100 border-light shadow-sm" data-movie-id="${movie.id}" style="cursor:pointer">
            <img src="${escapeHtml(poster)}" class="card-img-top"
                 alt="${escapeHtml(movie.title)}" style="height:300px;object-fit:cover">
            <div class="card-body d-flex flex-column">
                <h6 class="card-title mb-1">${escapeHtml(movie.title)}</h6>
                <p class="text-muted fw-bold small mb-0">${escapeHtml(year)}</p>
                <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
                    <span class="badge bg-warning text-dark">&#9733; ${escapeHtml(rating)}</span>
                    <button class="btn btn-sm ${isFav ? 'btn-danger' : 'btn-outline-danger'} fav-btn"
                            data-movie-id="${movie.id}"
                            title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                        💛
                    </button>
                </div>
            </div>
        </div>`;
    return col;
}

const setupEventListeners = () => {
    document.getElementById('searchForm').addEventListener('submit', e => {
        e.preventDefault();
        applyFilters();
    });

    [GENRE_FILTER, YEAR_FILTER, SORT_FILTER].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });

    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById(SEARCH_INPUT).value = '';
        document.getElementById(GENRE_FILTER).value = '';
        document.getElementById(YEAR_FILTER).value = '';
        document.getElementById(SORT_FILTER).value = 'release_date.desc';
        currentFilters = {};
        Storage.clearFilter();
        showAllMoviesView();
        loadMovies();
    });

    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        loadMovies(true);
    });

    document.getElementById('moviesGrid').addEventListener('click', e => {
        const favBtn = e.target.closest('.fav-btn');
        if (favBtn) {
            e.stopPropagation();
            toggleFavorite(favBtn);
            return;
        }
        const card = e.target.closest('[data-movie-id]');
        if (card) goToDetail(card.dataset.movieId);
    });

    document.getElementById('favoritesBtn').addEventListener('click', showFavoritesView);
    document.getElementById('allMoviesBtn').addEventListener('click', showAllMoviesView);

    document.getElementById('favoritesGrid').addEventListener('click', e => {
        const removeBtn = e.target.closest('.remove-fav-btn');
        if (removeBtn) {
            e.stopPropagation();
            Storage.removeFavorite(parseInt(removeBtn.dataset.movieId));
            renderFavorites();
            return;
        }
        const card = e.target.closest('[data-movie-id]');
        if (card) goToDetail(card.dataset.movieId);
    });
}

function applyFilters() {
    currentFilters = {
        query: document.getElementById(SEARCH_INPUT).value.trim(),
        genreId: document.getElementById(GENRE_FILTER).value,
        year: document.getElementById(YEAR_FILTER).value,
        sortBy: document.getElementById(SORT_FILTER).value,
    };
    Storage.saveFilter(currentFilters);
    showAllMoviesView();
    loadMovies();
}

function toggleFavorite(btn) {
    const movieId = parseInt(btn.dataset.movieId);
    const movie = currentMovies[movieId];
    if (!movie) return;

    if (Storage.isFavorite(movieId)) {
        Storage.removeFavorite(movieId);
        btn.classList.replace('btn-danger', 'btn-outline-danger');
        btn.title = 'Agregar a favoritos';
    } else {
        Storage.addFavorite({
            id: movie.id, title: movie.title, poster_path: movie.poster_path,
            release_date: movie.release_date, vote_average: movie.vote_average,
        });
        btn.classList.replace('btn-outline-danger', 'btn-danger');
        btn.title = 'Quitar de favoritos';
    }
}

function goToDetail(movieId) {
    window.location.href = `detail.html?id=${movieId}`;
}

const showFavoritesView = () => {
    showingFavorites = true;
    document.getElementById('moviesSection').classList.add('d-none');
    document.getElementById('favoritesSection').classList.remove('d-none');
    document.getElementById('favoritesBtn').classList.add('active');
    document.getElementById('allMoviesBtn').classList.remove('active');
    renderFavorites();
}

const showAllMoviesView = () => {
    showingFavorites = false;
    document.getElementById('favoritesSection').classList.add('d-none');
    document.getElementById('moviesSection').classList.remove('d-none');
    document.getElementById('allMoviesBtn').classList.add('active');
    document.getElementById('favoritesBtn').classList.remove('active');
}

function renderFavorites() {
    const favs = Storage.getFavorites();
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';

    if (favs.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5 text-muted"><p>No tienes películas favoritas aún.</p></div>';
        return;
    }

    favs.forEach(movie => {
        const year = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const poster = movie.poster_path
            ? IMAGE_BASE + movie.poster_path
            : 'https://via.placeholder.com/300x450?text=Sin+Imagen';

        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100 border-light shadow-sm" data-movie-id="${movie.id}" style="cursor:pointer">
                <img src="${escapeHtml(poster)}" class="card-img-top"
                     alt="${escapeHtml(movie.title)}" style="height:300px;object-fit:cover">
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title mb-1">${escapeHtml(movie.title)}</h6>
                    <p class="text-muted fw-bold small mb-0">${escapeHtml(year)}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
                        <span class="badge bg-warning text-dark">&#9733; ${escapeHtml(rating)}</span>
                        <button class="btn btn-sm btn-danger remove-fav-btn" data-movie-id="${movie.id}">
                            &#9829; Quitar
                        </button>
                    </div>
                </div>
            </div>`;
        grid.appendChild(col);
    });
}

function showLoading(show) {
    document.getElementById('loadingSpinner').classList.toggle('d-none', !show);
}

function showError(msg) {
    const el = document.getElementById('errorAlert');
    el.textContent = msg;
    el.classList.remove('d-none');
}

init();
