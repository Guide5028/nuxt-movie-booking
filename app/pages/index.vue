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
        <div class="movie-info">
          <h2>{{ movie.TITLE }}</h2>
          <div class="movie-meta">
            <span class="badge">{{ movie.GENRE }}</span>
            <span class="duration">{{ movie.DURATION_MINUTES }} min</span>
          </div>
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
  padding: 20px;
}

.movie-info h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6em;
  letter-spacing: 0.02em;
  margin: 0 0 8px;
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
