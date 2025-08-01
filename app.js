const apiKey = '5927d55cfce42e032c14c108b600c903';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');

const outputDiv = document.getElementById('output');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecast');
const forecastCards = document.getElementById('forecastCards');

//  City-based weather
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayWeather(data);
  } catch (error) {
    outputDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
  }
}

//  Forecast fetch
async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Forecast not available");
    const data = await res.json();
    displayForecast(data);
  } catch (error) {
    console.error(error);
  }
}

// Location-based weather
async function fetchWeatherCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Location weather not available");
    const data = await res.json();
    displayWeather(data);
    fetchForecast(data.name);
  } catch (error) {
    outputDiv.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
  }
}

// Render current weather
function displayWeather(data) {
  const { name, weather, main, wind } = data;

  document.getElementById('locationHeader').textContent = `${name} (${new Date().toLocaleDateString()})`;
  document.getElementById('temperature').textContent = `Temperature: ${main.temp}°C`;
  document.getElementById('condition').textContent = weather[0].description;
  document.getElementById('wind').textContent = `Wind: ${wind.speed} m/s`;
  document.getElementById('humidity').textContent = `Humidity: ${main.humidity}%`;

  currentWeatherDiv.classList.remove('hidden');
}

//  Render 5-Day Forecast
function displayForecast(data) {
  const dailyMap = new Map();

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date: new Date(item.dt_txt).toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        }),
        temp: item.main.temp,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      });
    }
  });

  forecastCards.innerHTML = "";

  dailyMap.forEach(({ date, temp, description, icon }) => {
    // Create wrapper div
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";

    // Create inner card
    const card = document.createElement("div");
    card.className = "card text-center";

    card.innerHTML = `
      <h4 class="text-lg font-semibold mb-1">${date}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="w-16 mx-auto mb-2" />
      <p class="text-gray-700 capitalize">${description}</p>
      <p class="text-blue-700 font-bold">${Math.round(temp)}°C</p>
    `;

    wrapper.appendChild(card);
    forecastCards.appendChild(wrapper);
  });

  forecastSection.classList.remove("hidden");
}

//  Event listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
    cityInput.value = ""; // Clear input after use

  if (city) {
    fetchWeather(city);
    fetchForecast(city);
  } else {
    outputDiv.innerHTML = `<p class="text-yellow-700">Please enter a city name</p>`;
  }
});

locationBtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeatherCoords(pos.coords.latitude, pos.coords.longitude),
    () => outputDiv.innerHTML = `<p class="text-red-700">Location access denied</p>`
  );
});