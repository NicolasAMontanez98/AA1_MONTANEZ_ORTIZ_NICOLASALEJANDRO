const Storage = {
    FILTERS_KEY: 'movieactivity_filters',
    FAVORITES_KEY: 'movieactivity_favorites',

    saveFilter(filters) {
        localStorage.setItem(this.FILTERS_KEY, JSON.stringify(filters));
    },

    getFilter() {
        try {
            const filter = localStorage.getItem(this.FILTERS_KEY);
            return filter ? JSON.parse(filter) : {};
        } catch { return {}; }
    },

    clearFilter() {
        localStorage.removeItem(this.FILTERS_KEY);
    },

    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.FAVORITES_KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch { return []; }
    },

    addFavorite(movie) {
        const favs = this.getFavorites();
        if (!favs.some(movieItem => movieItem.id === movie.id)) {
            favs.push(movie);
            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favs));
        }
    },

    removeFavorite(movieId) {
        const favs = this.getFavorites().filter(movieItem => movieItem.id !== movieId);
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favs));
    },

    isFavorite(movieId) {
        return this.getFavorites().some(movieItem => movieItem.id === movieId);
    },

    getComments(movieId) {
        try {
            const comments = localStorage.getItem(`movieactivity_comments_${movieId}`);
            return comments ? JSON.parse(comments) : [];
        } catch { return []; }
    },

    addComment(movieId, comment) {
        const comments = this.getComments(movieId);
        comments.push({ ...comment, id: Date.now(), date: new Date().toISOString() });
        localStorage.setItem(`movieactivity_comments_${movieId}`, JSON.stringify(comments));
        return comments;
    },

    deleteComment(movieId, commentId) {
        const comments = this.getComments(movieId).filter(commentItem => commentItem.id !== commentId);
        localStorage.setItem(`movieactivity_comments_${movieId}`, JSON.stringify(comments));
    },

    getReview(movieId) {
        try {
            const review = localStorage.getItem(`movieactivity_review_${movieId}`);
            return review ? JSON.parse(review) : null;
        } catch { return null; }
    },

    saveReview(movieId, review) {
        localStorage.setItem(`movieactivity_review_${movieId}`, JSON.stringify(review));
    },
};
