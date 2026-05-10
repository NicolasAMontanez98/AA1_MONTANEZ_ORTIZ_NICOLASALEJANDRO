const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
}

async function init() {
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const [movie, credits, images] = await Promise.all([
            API.getMovieDetail(movieId),
            API.getMovieCredits(movieId),
            API.getMovieImages(movieId),
        ]);

        renderDetail(movie);
        renderCast(credits.cast || []);
        renderImages(images.backdrops || []);
        loadReview();
        renderComments();
        setupForms(movie);

        document.getElementById('loadingSpinner').classList.add('d-none');
        document.getElementById('movieContent').classList.remove('d-none');
    } catch (e) {
        document.getElementById('loadingSpinner').innerHTML =
            '<div class="alert alert-danger m-4">Error al cargar la película &#128561;</div>';
    }
}

function renderDetail(movie) {
    document.title = `${movie.title} - MovieActivity`;

    const backdrop = document.getElementById('backdropContainer');
    if (movie.backdrop_path) {
        document.getElementById('backdropImg').src = BACKDROP_BASE + movie.backdrop_path;
    } else {
        backdrop.classList.add('d-none');
    }

    document.getElementById('moviePoster').src = movie.poster_path
        ? IMAGE_BASE + movie.poster_path
        : 'https://via.placeholder.com/300x450?text=Sin+Imagen';

    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('movieTagline').textContent = movie.tagline || '';
    document.getElementById('movieYear').textContent = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    document.getElementById('movieRating').textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    document.getElementById('movieRuntime').textContent = movie.runtime ? `${movie.runtime} min` : '';
    document.getElementById('movieOverview').textContent = movie.overview || 'Sin sinopsis disponible.';

    document.getElementById('movieGenres').innerHTML = (movie.genres || [])
        .map(g => `<span class="badge bg-secondary me-1">${escapeHtml(g.name)}</span>`)
        .join('');
}

function renderCast(cast) {
    document.getElementById('castContainer').innerHTML = cast.slice(0, 8).map(actor => `
        <div class="col-6 col-sm-3 col-md-2 mb-3 text-center">
            <img src="${actor.profile_path ? IMAGE_BASE + actor.profile_path : 'https://via.placeholder.com/100x150?text=N/A'}"
                 class="img-fluid rounded mb-1" style="height:100px;object-fit:cover" alt="${escapeHtml(actor.name)}">
            <p class="small mb-0 fw-bold">${escapeHtml(actor.name)}</p>
            <p class="small text-muted mb-0">${escapeHtml(actor.character || '')}</p>
        </div>`).join('');
}

function renderImages(backdrops) {
    const top = backdrops.slice(0, 6);
    if (top.length === 0) {
        document.getElementById('imagesSection').classList.add('d-none');
        return;
    }
    document.getElementById('imagesContainer').innerHTML = top.map(img => `
        <div class="col-12 col-sm-6 col-md-4 mb-3">
            <img src="${BACKDROP_BASE}${img.file_path}" class="img-fluid rounded w-100"
                 style="height:180px;object-fit:cover" alt="Foto de la película">
        </div>`).join('');
}

function loadReview() {
    const review = Storage.getReview(movieId);
    if (review) {
        document.getElementById('userRating').value = review.rating || '';
        document.getElementById('userReview').value = review.text || '';
    }
}

function renderComments() {
    const comments = Storage.getComments(movieId);
    const container = document.getElementById('commentsContainer');

    if (comments.length === 0) {
        container.innerHTML = '<p class="text-muted small">Aún no hay comentarios. ¡Sé el primero!</p>';
        return;
    }

    container.innerHTML = comments.map(c => `
        <div class="card mb-2">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${escapeHtml(c.author)}</strong>
                    <small class="text-muted">${new Date(c.date).toLocaleDateString('es-ES')}</small>
                </div>
                <p class="mb-2 mt-1">${escapeHtml(c.text)}</p>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${c.id})">Eliminar</button>
            </div>
        </div>`).join('');
}

function deleteComment(commentId) {
    Storage.deleteComment(movieId, commentId);
    renderComments();
}

function setupForms(movie) {
    document.getElementById('reviewForm').addEventListener('submit', e => {
        e.preventDefault();
        Storage.saveReview(movieId, {
            rating: document.getElementById('userRating').value,
            text: document.getElementById('userReview').value.trim(),
            date: new Date().toISOString(),
        });
        const alert = document.getElementById('reviewSuccess');
        alert.classList.remove('d-none');
        setTimeout(() => alert.classList.add('d-none'), 3000);
    });

    document.getElementById('commentForm').addEventListener('submit', e => {
        e.preventDefault();
        const author = document.getElementById('commentAuthor').value.trim();
        const text = document.getElementById('commentText').value.trim();
        if (!author || !text) return;
        Storage.addComment(movieId, { author, text });
        document.getElementById('commentAuthor').value = '';
        document.getElementById('commentText').value = '';
        renderComments();
    });

    updateFavButton(movie);
    document.getElementById('favBtn').addEventListener('click', () => {
        if (Storage.isFavorite(movie.id)) {
            Storage.removeFavorite(movie.id);
        } else {
            Storage.addFavorite({
                id: movie.id, title: movie.title, poster_path: movie.poster_path,
                release_date: movie.release_date, vote_average: movie.vote_average,
            });
        }
        updateFavButton(movie);
    });
}

function updateFavButton(movie) {
    const btn = document.getElementById('favBtn');
    const isFav = Storage.isFavorite(movie.id);
    btn.innerHTML = isFav ? '&#9829; En favoritos' : '♥️ Agregar a favoritos';
    btn.className = isFav ? 'btn btn-danger w-100' : 'btn btn-outline-danger w-100';
}

init();
