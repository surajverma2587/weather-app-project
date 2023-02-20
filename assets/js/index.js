const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_WEATHER_URL = "https://api.openweathermap.org/data/2.5/onecall";

const API_KEY = "8109f605d79877f7488a194794a29013";

const ICON_URL = "http://openweathermap.org/img/w/03n.png";

const searchForm = document.getElementById("search-form");

const handleOnSubmit = (event) => {
  event.preventDefault();

  const searchInputElement = document.getElementById("search-input");

  const cityName = searchInputElement.value;

  if (!cityName) {
    handleError();
  } else {
    renderWeatherInformation(cityName);
  }
};

const renderWeatherInformation = async (cityName) => {
  // get current weather info
  const currentWeatherInformation = await getCurrentWeatherInfo(cityName);

  // get lat lon from current weather data
  const { lat, lon } = currentWeatherInformation.coord;

  // get forecast weather info
  const forecastWeatherInformation = await getForecastWeatherInfo(lat, lon);

  // add city name to local storage
  addCityToLocalStorage(cityName);

  // render current weather info
  renderCurrentWeather(currentWeatherInformation);

  // render forecast weather info
  renderForecastWeather(forecastWeatherInformation);
};

const getCurrentWeatherInfo = async (cityName) => {
  try {
    const url = `${CURRENT_WEATHER_URL}?q=${cityName}&appid=${API_KEY}`;

    const response = await fetch(url);

    if (response.status !== 200) {
      handleApiError();
    } else {
      const data = await response.json();
      return data;
    }
  } catch {
    handleApiError();
  }
};

const getForecastWeatherInfo = async (lat, lon) => {
  try {
    const url = `${FORECAST_WEATHER_URL}?lat=${lat}&lon=${lon}&exclude=[current,minutely,hourly,alerts]&appid=${API_KEY}`;

    const response = await fetch(url);

    if (response.status !== 200) {
      handleApiError();
    } else {
      const data = await response.json();
      return data;
    }
  } catch {
    handleApiError();
  }
};

const addCityToLocalStorage = (cityName) => {
  // get cities from LS
  const cities = JSON.parse(localStorage.getItem("cities")) || [];

  if (!cities.includes(cityName.toLowerCase())) {
    // add city to cities
    cities.push(cityName.toLowerCase());
  }

  // set cities to LS
  localStorage.setItem("cities", JSON.stringify(cities));

  // re-render search history
  renderSearchHistory();
};

const renderCurrentWeather = (data) => {
  // target parent element
  const currentWeatherElement = document.getElementById("current-weather");

  currentWeatherElement.innerHTML = `<div class="card p-2">
    <div class="d-flex justify-content-between">
      <div>
        <h4>${data?.name}</h4>
        <h6>${moment.unix(data.dt).format("ddd, Do MMM, YYYY")}</h6>
      </div>

      <div>
        <img
          src="http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png"
          alt="${data?.weather?.[0]?.description}"
        />
      </div>
    </div>

    <ul class="list-group">
      <li class="list-group-item">Min Temp: ${data?.main?.temp_min}</li>
      <li class="list-group-item">Max Temp: ${data?.main?.temp_max}</li>
      <li class="list-group-item">Wind Speed: ${data?.wind?.speed}</li>
      <li class="list-group-item">Humidity: ${data?.main?.humidity}</li>
      <li class="list-group-item">Pressure: ${data?.main?.pressure}</li>
    </ul>
  </div>`;
};

const renderForecastWeather = (data) => {
  // target parent
  const forecastWeatherElement = document.getElementById("forecast-weather");

  const { daily } = data;

  // construct forecast cards
  const forecastCards = daily
    .slice(1, -1)
    .map((each) => {
      return `<div class="card p-2 m-1">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="m-0">${moment.unix(each.dt).format("ddd, Do MMM, YYYY")}</h6>
        <img
          src="http://openweathermap.org/img/w/${each?.weather?.[0]?.icon}.png"
          alt="${each?.weather?.[0]?.description}"
        />
      </div>

      <ul class="list-group">
        <li class="list-group-item">Min Temp: ${each.temp.min}</li>
        <li class="list-group-item">Max Temp: ${each.temp.max}</li>
        <li class="list-group-item">Wind Speed: ${each.wind_speed}</li>
        <li class="list-group-item">Humidity: ${each.humidity}</li>
        <li class="list-group-item">Pressure: ${each.pressure}</li>
      </ul>
    </div>`;
    })
    .join("");

  // append cards to parent
  forecastWeatherElement.innerHTML = forecastCards;
};

const renderSearchHistory = () => {
  // get cities from local storage
  const cities = JSON.parse(localStorage.getItem("cities")) || [];

  // target search history div
  const searchHistory = document.getElementById("search-history");

  searchHistory.innerHTML = "";

  // check if it exists
  if (cities.length === 0) {
    // render alert
    searchHistory.innerHTML = `<div class="alert alert-primary" role="alert">
      Your search history is empty.
    </div>`;
  } else {
    // construct list group
    const listGroup = document.createElement("div");
    listGroup.classList.add("list-group");

    cities.forEach((city) => {
      const handleCityClick = () => {
        renderWeatherInformation(city);
      };

      // construct the button
      const button = document.createElement("button");
      button.classList.add(
        "list-group-item",
        "list-group-item-action",
        "search-history-btn"
      );
      button.textContent = city.toUpperCase();

      // add event listener to button
      button.addEventListener("click", handleCityClick);

      // append button to list group
      listGroup.append(button);
    });

    searchHistory.append(listGroup);
  }
};

const handleError = () => {};

const handleApiError = () => {};

searchForm.addEventListener("submit", handleOnSubmit);
window.addEventListener("load", renderSearchHistory);
