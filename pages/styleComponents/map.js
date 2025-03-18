let markers = [];  // Store markers globally
let countyCords = "";
let latitude = "";
let longitude = "";
let centcord = "";
let alertStatus = "off";
let warnings = [];
let warningData = [];
let watch = [];
let weatherData = "";

function loadScript(url) {
    return new Promise((resolve, reject) => {
      // Check if the script is already loaded
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
    // Ensure Mapbox GL JS is loaded before proceeding.
    if (typeof mapboxgl === "undefined") {
      await loadScript("https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js");
      // Optionally, load the Mapbox GL CSS as well.
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
    const { countyCode = window.clientData?.nws, activeData = window.mainData } = options;
    const container = options.container || options.rootDiv;
    if (!container) {
        console.error("No container provided for mapRun");
        return;
    }

    await loadDependencies();
    
    if (!map) {
        const mapArea = document.createElement("div");
        mapArea.id = "map";
        mapArea.style.width = '100%';
        // Set a default height of 800px if no height is provided via options:
        mapArea.style.height = (options && options.height) ? options.height : '800px';
        container.appendChild(mapArea);

        mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0MTk3MiIsImEiOiJjbDdycmxjNXIwaTJ1M3BudXB2ZTZoZm1tIn0.v-NAvl8Ba0yPtAtxOt9iTg';  // Replace with your actual Mapbox access token.

        // Wait for county coordinates and weather data to be fetched before initializing the map
        try {
            await countyCordsGrab();  // Fetch and set county coordinates
            await countyWeatherGrab();  // Fetch weather data

            if (longitude && latitude && !isNaN(longitude) && !isNaN(latitude)) {
                mapDraw();  // Initialize the map now that coordinates are available
            } else {
                console.error('Invalid coordinates for map center:', { latitude, longitude });
            }
        } catch (error) {
            console.error("Error during map initialization:", error);
        }
    } else {
        // Map already exists, just update markers based on filtered data
        updateMarkers(activeData);
    }

    // Fetch county coordinates
    async function countyCordsGrab() {
        try {
            const response = await fetch(`https://api.weather.gov/zones/county/${countyCode}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const countyData = await response.json();
            countyCords = countyData.geometry.coordinates;

            if (!countyCords || countyCords.length === 0) throw new Error("Invalid county coordinates.");

            // Calculate the centroid for centering the map
            centcord = findCentroid(countyCords);
            let [lon, lat] = centcord;
            longitude = parseFloat(lon);
            latitude = parseFloat(lat);
            console.log(`Coordinates for map center: Latitude (${latitude}), Longitude (${longitude})`);
        } catch (error) {
            console.error('Error fetching county coordinates:', error.message);
        }
    }

    // Fetch weather data
    async function countyWeatherGrab() {
        try {
            const response = await fetch(`https://api.weather.gov/alerts/active?zone=${countyCode}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const countyWeatherData = await response.json();
            weatherData = countyWeatherData;
            processWeatherData(weatherData);  // Process the fetched weather data
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
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

    // Initialize and draw the map (only once)
    function mapDraw() {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/standard',
            center: [longitude, latitude],
            zoom: 10
        });

        map.addControl(new mapboxgl.FullscreenControl());

        // Add markers initially based on activeData
        addMarkers(activeData);

        // If there are weather alerts, add the weather layer
        if (alertStatus !== "off") {
            addWeatherLayer();
        }

        // Add county boundary layer
        addCountyBoundaryLayer();
    }

    // Add markers based on activeData (runs only once during initial map creation)
    function addMarkers(data) {
        updateMarkers(data);  // Call updateMarkers for adding markers during initialization
    }

    // Update markers dynamically without reloading the map
    function updateMarkers(data) {
        // Remove existing markers
        markers.forEach(marker => marker.remove());
        markers = [];

        const icons = {
            'Fire': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/fire.png',
            'Law': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/police.png',
            'EMS': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/ems.png',
            'Road Closure': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/roadclosure.png'
        };

        data.forEach(point => {
            const iconUrl = icons[point.agency_type] || icons['Road Closure'];

            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.backgroundImage = `url(${iconUrl})`;
            el.style.width = '29px';
            el.style.height = '37px';
            el.style.backgroundSize = 'cover';

            const marker = new mapboxgl.Marker(el)
                .setLngLat([point.longitude, point.latitude])
                .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.battalion}</h3><p>${point.type}</p>`))
                .addTo(map);

            markers.push(marker);  // Store marker reference for future updates
        });
    }

    // Add county boundary layer
    function addCountyBoundaryLayer() {
        map.on('load', function () {
            if (countyCords.length > 0) {
                countyCords.forEach((coords, i) => {
                    const geojsonData = {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [coords]
                        }
                    };

                    map.addLayer({
                        'id': `county-boundary-${i}`,
                        'type': 'line',
                        'source': {
                            'type': 'geojson',
                            'data': geojsonData
                        },
                        'layout': {},
                        'paint': {
                            'line-color': '#FF0000',
                            'line-width': 2
                        }
                    });
                });
            }
        });
    }

    // Add weather layer if there are alerts
    function addWeatherLayer() {
        map.on('load', function () {
            map.addLayer({
                "id": "weather-layer",
                "type": "raster",
                "source": {
                    "type": "raster",
                    "tiles": ["https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=your-openweathermap-api-key"],
                    "tileSize": 256
                },
                "layout": {
                    "visibility": "visible"
                }
            });
        });
    }

    // Calculate the centroid of coordinates
    function findCentroid(coordsArray) {
        let latSum = 0;
        let lonSum = 0;
        let count = 0;

        coordsArray[0].forEach(coord => {  // Access the first polygon
            if (coord.length === 2) {  // Ensure valid [lon, lat] pair
                lonSum += coord[0];  // Longitude
                latSum += coord[1];  // Latitude
                count++;
            }
        });

        if (count === 0) return [NaN, NaN];  // Avoid division by zero

        return [lonSum / count, latSum / count];  // Return [longitude, latitude]
    }

    window.updateMap = updateMarkers;
    return map;
}