import { useEffect, useState, useRef } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Maximize2, Minimize2, RefreshCw, Layers, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationData {
  name: string;
  aqi: number;
  lat: number;
  lng: number;
  pm25?: number;
  pm10?: number;
  lastUpdated?: string;
}

// Delhi-NCR monitoring stations with real coordinates
const locations: LocationData[] = [
  { name: "Connaught Place", aqi: 185, lat: 28.6315, lng: 77.2167, pm25: 98, pm10: 187, lastUpdated: "2 min ago" },
  { name: "Dwarka", aqi: 172, lat: 28.5921, lng: 77.0460, pm25: 89, pm10: 165, lastUpdated: "3 min ago" },
  { name: "Rohini", aqi: 195, lat: 28.7495, lng: 77.0565, pm25: 108, pm10: 198, lastUpdated: "1 min ago" },
  { name: "Noida", aqi: 168, lat: 28.5355, lng: 77.3910, pm25: 85, pm10: 158, lastUpdated: "2 min ago" },
  { name: "Gurugram", aqi: 178, lat: 28.4595, lng: 77.0266, pm25: 95, pm10: 175, lastUpdated: "4 min ago" },
  { name: "Faridabad", aqi: 188, lat: 28.4089, lng: 77.3178, pm25: 102, pm10: 185, lastUpdated: "2 min ago" },
  { name: "Ghaziabad", aqi: 192, lat: 28.6692, lng: 77.4538, pm25: 105, pm10: 190, lastUpdated: "1 min ago" },
  { name: "Greater Noida", aqi: 175, lat: 28.4744, lng: 77.5040, pm25: 92, pm10: 168, lastUpdated: "3 min ago" },
  { name: "Anand Vihar", aqi: 210, lat: 28.6469, lng: 77.3164, pm25: 125, pm10: 215, lastUpdated: "1 min ago" },
  { name: "ITO", aqi: 182, lat: 28.6280, lng: 77.2410, pm25: 96, pm10: 178, lastUpdated: "2 min ago" },
  { name: "Punjabi Bagh", aqi: 176, lat: 28.6683, lng: 77.1167, pm25: 93, pm10: 170, lastUpdated: "3 min ago" },
  { name: "RK Puram", aqi: 169, lat: 28.5643, lng: 77.1757, pm25: 88, pm10: 162, lastUpdated: "2 min ago" },
];

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#be123c";
}

function getAQICategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getMarkerSize(aqi: number): number {
  if (aqi <= 50) return 12;
  if (aqi <= 100) return 14;
  if (aqi <= 150) return 16;
  if (aqi <= 200) return 18;
  return 20;
}

// Component to recenter map
function RecenterControl({ center }: { center: [number, number] }) {
  const map = useMap();
  
  const handleRecenter = () => {
    map.flyTo(center, 11, { duration: 1.5 });
  };
  
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
      <div className="leaflet-control">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/95 backdrop-blur shadow-lg border"
          onClick={handleRecenter}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface DelhiMapProps {
  onStationSelect?: (station: LocationData) => void;
}

export function DelhiMap({ onStationSelect }: DelhiMapProps) {
  const [selectedStation, setSelectedStation] = useState<LocationData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const delhiCenter: [number, number] = [28.6139, 77.2090];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleStationClick = (station: LocationData) => {
    setSelectedStation(station);
    onStationSelect?.(station);
  };

  const tileUrls = {
    streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  };

  const avgAQI = Math.round(locations.reduce((sum, loc) => sum + loc.aqi, 0) / locations.length);
  const maxAQI = Math.max(...locations.map(loc => loc.aqi));
  const minAQI = Math.min(...locations.map(loc => loc.aqi));

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-950/30 dark:to-cyan-950/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10">
            <MapPin className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className="font-semibold">Delhi-NCR Air Quality Map</h3>
            <p className="text-xs text-muted-foreground">{locations.length} monitoring stations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative ${isExpanded ? 'h-[calc(100%-180px)]' : 'h-[400px]'}`}>
        <MapContainer
          center={delhiCenter}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrls[mapStyle]}
          />
          <ZoomControl position="bottomright" />
          <RecenterControl center={delhiCenter} />
          
          {locations.map((location, idx) => (
            <CircleMarker
              key={idx}
              center={[location.lat, location.lng]}
              radius={getMarkerSize(location.aqi)}
              pathOptions={{
                fillColor: getAQIColor(location.aqi),
                color: getAQIColor(location.aqi),
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.6,
              }}
              eventHandlers={{
                click: () => handleStationClick(location),
              }}
            >
              <Popup className="custom-popup">
                <div className="min-w-[200px] p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{location.name}</h4>
                    <Badge 
                      style={{ backgroundColor: getAQIColor(location.aqi), color: 'white' }}
                      className="text-xs"
                    >
                      AQI {location.aqi}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{getAQICategory(location.aqi)}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">PM2.5</p>
                      <p className="font-semibold">{location.pm25} ug/m3</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground">PM10</p>
                      <p className="font-semibold">{location.pm10} ug/m3</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Updated {location.lastUpdated}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Map Style Toggle */}
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="flex bg-background/95 backdrop-blur rounded-lg border shadow-lg overflow-hidden">
            {(['streets', 'satellite', 'dark'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  mapStyle === style 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-muted/30 border-t">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: getAQIColor(avgAQI) }}>{avgAQI}</p>
            <p className="text-xs text-muted-foreground">Average AQI</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{maxAQI}</p>
            <p className="text-xs text-muted-foreground">Highest AQI</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{minAQI}</p>
            <p className="text-xs text-muted-foreground">Lowest AQI</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{locations.length}</p>
            <p className="text-xs text-muted-foreground">Active Stations</p>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium mb-2 text-muted-foreground">AQI Scale</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Good (0-50)", color: "#22c55e" },
              { label: "Moderate (51-100)", color: "#eab308" },
              { label: "Unhealthy (101-150)", color: "#f97316" },
              { label: "Very Unhealthy (151-200)", color: "#ef4444" },
              { label: "Hazardous (200+)", color: "#a855f7" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
