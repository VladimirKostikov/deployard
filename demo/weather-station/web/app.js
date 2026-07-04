const listNode = document.getElementById('weather-list');

async function loadWeather() {
  const response = await fetch('/api/weather');
  const payload = await response.json();

  listNode.innerHTML = payload.items
    .map(
      (item) => `
        <article class="card">
          <h2>${item.city}</h2>
          <p class="temp">${item.tempC}°C</p>
          <p class="muted">${item.condition}</p>
        </article>
      `,
    )
    .join('');
}

loadWeather().catch(() => {
  listNode.innerHTML = '<p class="muted">Unable to load weather data</p>';
});
