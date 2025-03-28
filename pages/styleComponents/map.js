import { globalState } from "../../reactive/state.js";

let markers = [];
let countyCords = "";
let latitude = "";
let longitude = "";
let centcord = "";
let alertStatus = "off";
let warnings = [];
let warningData = [];
let watch = [];
let weatherData = "";

const user = JSON.parse(localStorage.getItem("user"));
const clientKey = user ? user.key : null;

const defaultMapStyles = {
  mapHeight: 800,
  mapboxStyle: "mapbox://styles/mapbox/streets-v12"
};

async function loadMapStyles(clientKey) {
  try {
    const response = await fetch(`https://matrix.911-ens-services.com/client/${clientKey}/map_styles`);
    if (response.ok) {
      const savedStyles = await response.json();
      return (savedStyles && Object.keys(savedStyles).length > 0)
        ? savedStyles
        : defaultMapStyles;
    } else {
      console.warn("GET map_styles returned non-OK; using defaults.");
      return defaultMapStyles;
    }
  } catch (error) {
    console.error("Error fetching map styles:", error);
    return defaultMapStyles;
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

async function loadDependencies() {
  if (typeof mapboxgl === "undefined") {
    await loadScript("https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js");
    if (!document.querySelector('link[href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css";
      document.head.appendChild(link);
    }
  }
}

function waitForGlobalData(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      console.log("Waiting for global data:", window.clientData, window.mainData);
      if (window.clientData && window.mainData) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error("Global data not available within timeout"));
      } else {
        setTimeout(check, 100);
      }
    })();
  });
}

export async function mapRun(options) {
  try {
    await waitForGlobalData();
  } catch (err) {
    console.error(err);
    return;
  }

  let map;
  // Use destructuring with defaults (falling back to state for styles)
  const { countyCode = window.clientData?.nws, activeData = window.mainData, height } = options;
  const container = options.container || options.rootDiv;
  if (!container) {
    console.error("No container provided for mapRun");
    return;
  }

  await loadDependencies();

  let state = globalState.getState();
  if (!state.mapBoxLoaded) {
    const loadedStyles = await loadMapStyles(clientKey);
    globalState.setState({ mapBox: loadedStyles, mapBoxLoaded: true });
  }
  state = globalState.getState();
  const currentMapStyles = state.mapBox || defaultMapStyles;

  container.innerHTML = ""
  

  if (!map) {
    const mapArea = document.createElement("div");
    mapArea.id = "map";
    mapArea.style.width = "100%";
    mapArea.style.height = height ? height : currentMapStyles.mapHeight + "px";
    container.appendChild(mapArea);

    mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0MTk3MiIsImEiOiJjbDdycmxjNXIwaTJ1M3BudXB2ZTZoZm1tIn0.v-NAvl8Ba0yPtAtxOt9iTg';
    
    try {
      await countyCordsGrab(countyCode);
      await countyWeatherGrab(countyCode);
      if (longitude && latitude && !isNaN(longitude) && !isNaN(latitude)) {
        mapDraw();
      } else {
        console.error("Invalid coordinates for map center:", { latitude, longitude });
      }
    } catch (error) {
      console.error("Error during map initialization:", error);
    }
  } else {
    updateMarkers(activeData);
  }

  async function countyCordsGrab(countyCode) {
    try {
      const response = await fetch(`https://api.weather.gov/zones/county/${countyCode}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const countyData = await response.json();
      countyCords = countyData.geometry.coordinates;
      if (!countyCords || countyCords.length === 0) throw new Error("Invalid county coordinates.");
      centcord = findCentroid(countyCords);
      let [lon, lat] = centcord;
      longitude = parseFloat(lon);
      latitude = parseFloat(lat);
      console.log(`Coordinates for map center: Latitude (${latitude}), Longitude (${longitude})`);
    } catch (error) {
      console.error("Error fetching county coordinates:", error.message);
    }
  }

  async function countyWeatherGrab(countyCode) {
    try {
      const response = await fetch(`https://api.weather.gov/alerts/active?zone=${countyCode}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const countyWeatherData = await response.json();
      weatherData = countyWeatherData;
      processWeatherData(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
    }
  }

  function processWeatherData(weatherData) {
    if (weatherData.features?.length) {
      weatherData.features.forEach(item => {
        if (item.properties.event.includes("Warning")) {
          alertStatus = "Warning";
          warningData.push(item);
          warnings.push(item.properties.headline);
        } else if (item.properties.event.includes("Watch")) {
          if (alertStatus === "off") {
            alertStatus = "Watch";
          }
          watch.push(item);
        }
      });
    } else {
      alertStatus = "off";
      console.log("No warnings.");
    }
  }

  function mapDraw() {
    map = new mapboxgl.Map({
      container: "map",
      style: currentMapStyles.mapboxStyle,
      center: [longitude, latitude],
      zoom: 10
    });
    map.addControl(new mapboxgl.FullscreenControl());
    addMarkers(activeData);
    if (alertStatus !== "off") {
      addWeatherLayer();
    }
    addCountyBoundaryLayer();
    // Optionally store the map instance in state.
    globalState.setState({ mapInstance: map });
  }

  function addMarkers(data) {
    updateMarkers(data);
  }

  function updateMarkers(data) {
    markers.forEach(marker => marker.remove());
    markers = [];
    const icons = {
      "Fire": "https://ensloadout.911emergensee.com/ens-packages/icopacks/0/fire.png",
      "Law": "https://ensloadout.911emergensee.com/ens-packages/icopacks/0/police.png",
      "EMS": "https://ensloadout.911emergensee.com/ens-packages/icopacks/0/ems.png",
      "Road Closure": "https://ensloadout.911emergensee.com/ens-packages/icopacks/0/roadclosure.png"
    };
    data.forEach(point => {
      const iconUrl = icons[point.agency_type] || icons["Road Closure"];
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.backgroundImage = `url(${iconUrl})`;
      el.style.width = "29px";
      el.style.height = "37px";
      el.style.backgroundSize = "cover";
      const marker = new mapboxgl.Marker(el)
        .setLngLat([point.longitude, point.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.battalion}</h3><p>${point.type}</p>`))
        .addTo(map);
      markers.push(marker);
    });
  }

  function addCountyBoundaryLayer() {
    map.on("load", function () {
      if (countyCords && countyCords.length > 0) {
        countyCords.forEach((coords, i) => {
          const geojsonData = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [coords]
            }
          };
          map.addLayer({
            id: `county-boundary-${i}`,
            type: "line",
            source: {
              type: "geojson",
              data: geojsonData
            },
            layout: {},
            paint: {
              "line-color": "#FF0000",
              "line-width": 2
            }
          });
        });
      }
    });
  }

  function addWeatherLayer() {
    map.on("load", function () {
      map.addLayer({
        id: "weather-layer",
        type: "raster",
        source: {
          type: "raster",
          tiles: ["https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=your-openweathermap-api-key"],
          tileSize: 256
        },
        layout: {
          visibility: "visible"
        }
      });
    });
  }

  function findCentroid(coordsArray) {
    let latSum = 0;
    let lonSum = 0;
    let count = 0;
    if (coordsArray[0]) {
      coordsArray[0].forEach(coord => {
        if (coord.length === 2) {
          lonSum += coord[0];
          latSum += coord[1];
          count++;
        }
      });
    }
    if (count === 0) return [NaN, NaN];
    return [lonSum / count, latSum / count];
  }

  // Expose updateMarkers via state or return map if needed.
  // (You can also export an update function here.)
  return map;
}
