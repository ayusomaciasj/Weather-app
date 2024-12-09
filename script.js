const apiKey = 'c4d197dc63cabdd71f3d1938f867b0ad'
const baseCurrentUrl = 'https://api.openweathermap.org/data/2.5/weather';
const baseForecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const getWeatherData = async (city) => {
    const currentWeatherResponse = await fetch(`${baseCurrentUrl}?q=${city}&units=metric&appid=${apiKey}`);
    const forecastResponse = await fetch(`${baseForecastUrl}?q=${city}&units=metric&appid=${apiKey}`);

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
        throw new Error('City not found');
    }

    return {
        current: await currentWeatherResponse.json(),
        forecast: await forecastResponse.json(),
    };
};

const getWeatherByCoordinates = async (latitude, longitude) => {
    const currentWeatherResponse = await fetch(`${baseCurrentUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
    const forecastResponse = await fetch(`${baseForecastUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Unable to retrieve location-based weather');
    }

    return {
        current: await currentWeatherResponse.json(),
        forecast: await forecastResponse.json(),
    };
};

const displayCurrentWeather = (data) => {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById('condition').textContent = `Condition: ${data.weather[0].description}`;

    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    const iconElement = document.getElementById('current-icon');
    iconElement.src = iconUrl;
    iconElement.alt = data.weather[0].description;
};

const displayForecast = (forecast) => {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear previous forecast
    const dailyData = forecast.list.filter(item => item.dt_txt.includes('12:00:00')); // Daily data at noon

    dailyData.forEach(day => {
        const forecastElement = document.createElement('div');
        forecastElement.classList.add('forecast-day');
        const date = new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' });
        forecastElement.innerHTML = `
            <p>${date}</p>
            <p>${day.main.temp}°C</p>
            <p>${day.weather[0].description}</p>
        `;
        forecastContainer.appendChild(forecastElement);
    });
};

document.getElementById('search-button').addEventListener('click', async () => {
    const city = document.getElementById('city-input').value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        const data = await getWeatherData(city);
        displayCurrentWeather(data.current);
        displayForecast(data.forecast);
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('geo-button').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const data = await getWeatherByCoordinates(latitude, longitude);
            displayCurrentWeather(data.current);
            displayForecast(data.forecast);
        } catch (error) {
            alert(error.message);
        }
    }, () => {
        alert('Unable to retrieve your location.');
    });
});
