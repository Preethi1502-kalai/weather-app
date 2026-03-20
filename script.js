const apiKey = "0c6a41d032c40d6cd2dece52e4fdbff8";

// Elements
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const saveBtn = document.getElementById("saveBtn");
const cityInput = document.getElementById("cityInput");

const cityName = document.getElementById("cityName");
const temp = document.getElementById("temp");
const feelsLike = document.getElementById("feelsLike");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const errorMsg = document.getElementById("errorMsg");
const forecastBox = document.getElementById("forecast");
const favoritesBox = document.getElementById("favorites");

// Search
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if(city) getWeatherByCity(city);
});

cityInput.addEventListener("keydown", e=>{
  if(e.key==="Enter") searchBtn.click();
});

// Location
locBtn.addEventListener("click", ()=>{
  if(!navigator.geolocation){
    errorMsg.textContent="Geolocation not supported";
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>getWeatherByLocation(pos.coords.latitude,pos.coords.longitude),
    ()=>errorMsg.textContent="❌ Location permission denied"
  );
});

// Save favorite
saveBtn.addEventListener("click", ()=>{
  const city = cityName.textContent;
  if(!city || city==="City Name") return;

  let favs = JSON.parse(localStorage.getItem("favs")) || [];
  if(!favs.includes(city)){
    favs.push(city);
    localStorage.setItem("favs",JSON.stringify(favs));
    showFavorites();
  }
});

// Fetch city weather
async function getWeatherByCity(city){
  try{
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if(!res.ok) throw new Error();
    const data = await res.json();
    updateUI(data);
    getForecast(data.coord.lat,data.coord.lon);
  }catch{
    showError("❌ City not found");
  }
}

// Fetch location weather
async function getWeatherByLocation(lat,lon){
  try{
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if(!res.ok) throw new Error();
    const data = await res.json();
    updateUI(data);
    getForecast(lat,lon);
  }catch{
    showError("❌ Unable to fetch location weather");
  }
}

// Forecast
async function getForecast(lat,lon){
  try{
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    showForecast(data.list);
  }catch{
    forecastBox.innerHTML="";
  }
}

function showForecast(list){
  forecastBox.innerHTML="<h3>📅 5-Day Forecast</h3>";
  const daily=list.filter(i=>i.dt_txt.includes("12:00:00"));

  daily.forEach(day=>{
    const date=new Date(day.dt_txt).toDateString();
    const icon=day.weather[0].icon;
    const t=day.main.temp.toFixed(0);

    forecastBox.innerHTML+=`
      <div class="day">
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png">
        <p>${t}°C</p>
      </div>`;
  });
}

// Update UI
function updateUI(data){
  cityName.textContent=data.name;
  temp.textContent=data.main.temp.toFixed(1)+"°C";
  feelsLike.textContent=data.main.feels_like.toFixed(1)+"°C";
  condition.textContent=data.weather[0].description;
  humidity.textContent=data.main.humidity+"%";
  wind.textContent=(data.wind.speed*3.6).toFixed(1)+" km/h";

  const icon=data.weather[0].icon;
  weatherIcon.src=`https://openweathermap.org/img/wn/${icon}@2x.png`;
  weatherIcon.style.display="block";

  // Background
  const w=data.weather[0].main.toLowerCase();
  document.body.className="";
  if(w.includes("clear")) document.body.classList.add("sunny");
  else if(w.includes("rain")||w.includes("drizzle")) document.body.classList.add("rainy");
  else if(w.includes("cloud")) document.body.classList.add("cloudy");
  else document.body.classList.add("night");

  errorMsg.textContent="";
}

// Favorites UI
function showFavorites(){
  const favs=JSON.parse(localStorage.getItem("favs"))||[];
  favoritesBox.innerHTML="<h3>❤️ Favorites</h3>";

  favs.forEach(city=>{
    favoritesBox.innerHTML+=`<button class="favBtn">${city}</button>`;
  });

  document.querySelectorAll(".favBtn").forEach(btn=>{
    btn.addEventListener("click",()=>getWeatherByCity(btn.textContent));
  });
}
showFavorites();

// Error
function showError(msg){
  errorMsg.textContent=msg;
  weatherIcon.style.display="none";
}