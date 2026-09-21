<script setup>
const store = useBookingStore()
const { movies, showtimesByMovie, loading, error } = storeToRefs(store)

const expandedMovieId = ref(null)

onMounted(() => {
  store.fetchMovies()
})

async function toggleShowtimes(movieId) {
  if (expandedMovieId.value === movieId) {
    expandedMovieId.value = null
    return
  }
  expandedMovieId.value = movieId
  if (!showtimesByMovie.value[movieId]) {
    await store.fetchShowtimes(movieId)
  }
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const genreColors = {
  'Sci-Fi': '#3B7DD8',
  'Comedy': '#F2C14E',
  'Action': '#D8473B',
  'Drama': '#8B5CF6',
  'Horror': '#7A1F2B'
}

function genreColor(genre) {
  return genreColors[genre] || '#4A4A58'
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1>Now Showing</h1>
      <p class="subtitle">Pick a movie, pick a showtime, pick your seat.</p>
    </div>

    <p v-if="loading" class="muted">Loading movies...</p>
    <p v-else-if="error" class="muted">{{ error }}</p>

    <div class="movie-grid">
      <div v-for="movie in movies" :key="movie.ID" class="movie-card">
        <div class="poster" :style="!movie.POSTER_URL ? { background: genreColor(movie.GENRE) } : null">
          <img v-if="movie.POSTER_URL" :src="movie.POSTER_URL" :alt="`${movie.TITLE} poster`" />
          <svg v-else class="poster-icon" width="56" height="56" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M2 8h20M7 4v4M17 4v4" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <div class="poster-overlay">
            <h2>{{ movie.TITLE }}</h2>
          </div>
        </div>

        <div class="movie-body">
          <div class="movie-meta">
            <span class="badge">{{ movie.GENRE }}</span>
            <span class="duration">{{ movie.DURATION_MINUTES }} min</span>
          </div>

          <button type="button" class="toggle-btn" @click="toggleShowtimes(movie.ID)">
            {{ expandedMovieId === movie.ID ? 'Hide showtimes' : 'View showtimes' }}
          </button>

          <div v-if="expandedMovieId === movie.ID" class="showtimes">
            <p v-if="!showtimesByMovie[movie.ID]" class="muted">Loading showtimes...</p>
            <p v-else-if="!showtimesByMovie[movie.ID].length" class="muted">No showtimes scheduled.</p>
            <NuxtLink
              v-for="s in showtimesByMovie[movie.ID]"
              :key="s.ID"
              :to="`/showtime/${s.ID}`"
              class="showtime-chip"
            >
              <span class="showtime-time">{{ formatTime(s.STARTS_AT) }}</span>
              <span class="showtime-hall">{{ s.HALL_NAME }}</span>
              <span class="showtime-price">${{ s.PRICE.toFixed(2) }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  background: #0F0F14;
}

.page {
  max-width: 960px;
  margin: 40px auto;
  padding: 24px;
  font-family: 'Manrope', sans-serif;
  color: #F2F0EA;
}

.header {
  margin-bottom: 28px;
}

h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3em;
  letter-spacing: 0.03em;
  margin: 0;
  color: #F2C14E;
}

.subtitle {
  color: #8B8894;
  margin-top: 4px;
}

.muted {
  color: #8B8894;
  font-size: 0.9em;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.movie-card {
  background: #1A1A22;
  border: 1px solid #2C2C38;
  border-radius: 12px;
  overflow: hidden;
}

.poster {
  position: relative;
  aspect-ratio: 2 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-icon {
  color: rgba(255, 255, 255, 0.35);
}

.poster-overlay {
  position: absolute;
  inset: auto 0 0 0;
  padding: 24px 16px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
}

.poster-overlay h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5em;
  letter-spacing: 0.02em;
  margin: 0;
  color: #F2F0EA;
}

.movie-body {
  padding: 16px 20px 20px;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.badge {
  padding: 3px 10px;
  border-radius: 999px;
  background: #2C2C38;
  color: #F2C14E;
  font-size: 0.75em;
  font-weight: 600;
}

.duration {
  color: #8B8894;
  font-size: 0.85em;
}

.toggle-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #2C2C38;
  border-radius: 8px;
  background: transparent;
  color: #F2F0EA;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 0.85em;
  cursor: pointer;
}

.toggle-btn:hover {
  border-color: #F2C14E;
}

.showtimes {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.showtime-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  background: #0F0F14;
  border: 1px solid #2C2C38;
  color: #F2F0EA;
  text-decoration: none;
  font-size: 0.85em;
}

.showtime-chip:hover {
  border-color: #F2C14E;
}

.showtime-time {
  font-weight: 600;
}

.showtime-hall {
  color: #8B8894;
}

.showtime-price {
  color: #F2C14E;
  font-weight: 600;
}
</style>
