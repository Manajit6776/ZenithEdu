import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useNotifications } from '../src/contexts/NotificationContext';
import {
  Bus, MapPin, Clock, Phone, Navigation, Plus, X, Save,
  Edit2, Trash2, Loader2, Star, AlertCircle, User, ChevronRight,
  Users, Battery, Wifi, Zap, Calendar, Filter, Search, Bell,
  RefreshCw, Download, MoreVertical, CheckCircle, Shield,
  Settings, Maximize2, Minimize2, Play, Pause, Radio,
  Thermometer, Wind, Droplets, Volume2, MapIcon, Route, Layers,
  Target, Compass, Eye, EyeOff, Headphones, PhoneOff,
  TrendingUp, BarChart3, Database, Lock, Unlock, QrCode,
  ShieldCheck, AlertTriangle, ChevronDown, ChevronUp,
  VolumeX, WifiOff, ZapOff, BatteryCharging, MapPin as MapPinIcon,
  Zap as ZapIcon, TrendingDown, Activity
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/transport.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents, LayersControl } from 'react-leaflet';
import { BusRoute } from '../src/types';
import { transportService } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

// Fix Leaflet icon issues with SSR safety
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// ============== CRITICAL FIXES ==============

// Fix 1: Proper icon caching with performance
const useIconCache = () => {
  const iconCache = useRef<Record<string, L.DivIcon> | null>(null);

  const getBusIconKey = (routeNumber: string, status: string, isSelected: boolean) =>
    `${routeNumber}-${status}-${isSelected}`;

  const createBusIcon = useCallback((routeNumber: string, status: string, isSelected = false) => {
    // Initialize cache if it doesn't exist (works on both SSR and client)
    if (!iconCache.current) {
      iconCache.current = {};
    }

    const key = getBusIconKey(routeNumber, status, isSelected);

    if (iconCache.current[key]) {
      return iconCache.current[key];
    }

    const size = isSelected ? [40, 40] : [32, 32];
    const className = `bus-icon ${isSelected ? 'bus-icon-selected' : ''} ${status === 'Delayed' ? 'bus-icon-delayed' : ''}`;

    const icon = L.divIcon({
      className,
      html: `
        <div class="bus-marker-container">
          <div class="bus-marker-inner">
            <div class="bus-icon-main">
              <div class="bus-icon-svg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 17H5V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V17Z" 
                        class="bus-icon-top"/>
                  <path d="M19 8V17H5V8C5 6.89543 5.89543 6 7 6H17C18.1046 6 19 6.89543 19 8Z" 
                        class="bus-icon-body"/>
                  <circle cx="8" cy="15" r="1.5" fill="white"/>
                  <circle cx="16" cy="15" r="1.5" fill="white"/>
                </svg>
              </div>
              <div class="bus-route-badge">${routeNumber}</div>
              <div class="bus-speed-badge">${status === 'Delayed' ? '⚠️' : '⚡'}</div>
            </div>
          </div>
        </div>
      `,
      iconSize: size as L.PointTuple,
      iconAnchor: [size[0] / 2, size[1] / 2] as L.PointTuple,
      popupAnchor: [0, -size[1] / 2] as L.PointTuple,
    });

    iconCache.current[key] = icon;
    return icon;
  }, []);

  return { createBusIcon };
};

// ============== ENHANCED MAP COMPONENTS ==============

// State management types
type EnhancedBusRoute = BusRoute & {
  path?: number[][];
  capacity?: number;
  occupied?: number;
  rating?: string;
  driverAvatar?: string;
  nextStop?: string;
  eta?: string;
  temperature?: number;
  wifiStrength?: number;
  fuelLevel?: number;
};

interface EnhancedBusMarkerProps {
  key?: string;
  route: EnhancedBusRoute;
  position: [number, number];
  isSelected: boolean;
  speed: number;
  onSelect: (route: EnhancedBusRoute) => void;
}

const EnhancedBusMarker = memo(({
  route,
  position,
  isSelected,
  speed,
  onSelect
}: EnhancedBusMarkerProps) => {
  const { createBusIcon } = useIconCache();

  // Prevent SSR rendering
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={createBusIcon(route.routeNumber, route.status, isSelected)}
      eventHandlers={{
        click: () => onSelect(route),
      }}
    >
      <Popup className="bus-popup">
        <div className="p-3 min-w-[260px]">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${route.status === 'OnTime' ? 'bg-emerald-100' :
              route.status === 'Delayed' ? 'bg-amber-100' : 'bg-slate-100'
              }`}>
              <span className={`text-xl font-bold ${route.status === 'OnTime' ? 'text-emerald-700' :
                route.status === 'Delayed' ? 'text-amber-700' : 'text-slate-700'
                }`}>
                {route.routeNumber}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{route.destination}</h3>
              <p className="text-sm text-slate-600">{route.driver}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Status</span>
              <span className={`font-medium px-2 py-1 rounded ${route.status === 'OnTime' ? 'bg-emerald-100 text-emerald-700' :
                route.status === 'Delayed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                {route.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Next Stop</span>
              <span className="font-medium text-slate-900">{route.nextStop || 'Unknown'}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">ETA</span>
              <span className="font-medium text-emerald-600">{route.eta || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Speed</span>
              <span className="font-medium text-blue-600">{speed.toFixed(0)} km/h</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Capacity</span>
              <span className="font-medium text-slate-900">
                {route.occupied || 0}/{route.capacity || 40}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelect(route)}
            className="w-full mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Track This Bus
          </button>
        </div>
      </Popup>
    </Marker>
  );
});

interface EnhancedRoutePolylineProps {
  key?: string;
  route: EnhancedBusRoute;
  isSelected: boolean;
}

const EnhancedRoutePolyline = memo(({ route, isSelected }: EnhancedRoutePolylineProps) => {
  const defaultPath: [number, number][] = [
    [37.7849, -122.4094],
    [37.7820, -122.4115],
    [37.7799, -122.4144],
    [37.7770, -122.4165],
    [37.7749, -122.4194],
  ];

  const routePath = route.path?.map(p => [p[0], p[1]] as [number, number]) || defaultPath;

  return (
    <Polyline
      pathOptions={{
        color: isSelected ? '#4f46e5' : '#94a3b8',
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 0.8 : 0.4,
        dashArray: isSelected ? '' : '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      }}
      positions={routePath}
    />
  );
});

// ============== MAP CONTROLLER WITH SMOOTH ANIMATIONS ==============

interface MapControllerProps {
  center: [number, number];
  zoom: number;
  onCenterChange?: (center: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
  onViewModeChange?: (viewMode: string) => void;
  flyToPosition?: [number, number] | null;
  flyToZoom?: number;
}

const MapController: React.FC<MapControllerProps> = memo(({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  onViewModeChange,
  flyToPosition,
  flyToZoom
}) => {
  const map = useMap();
  const prevCenterRef = useRef(center);
  const prevZoomRef = useRef(zoom);
  const isFirstRender = useRef(true);

  // Smooth flyTo animation for selected bus
  useEffect(() => {
    if (flyToPosition && map) {
      map.flyTo(flyToPosition, flyToZoom || 17, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [flyToPosition, flyToZoom, map]);

  // Listen for base layer changes
  useMapEvents({
    baselayerchange(e) {
      onViewModeChange?.(e.name.toLowerCase());
    },
    zoomend(e) {
      const newZoom = e.target.getZoom();
      if (newZoom !== prevZoomRef.current) {
        prevZoomRef.current = newZoom;
        onZoomChange?.(newZoom);
      }
    },
    moveend(e) {
      const newCenter = e.target.getCenter();
      const newCenterArray: [number, number] = [newCenter.lat, newCenter.lng];

      if (newCenter.lat !== prevCenterRef.current[0] || newCenter.lng !== prevCenterRef.current[1]) {
        prevCenterRef.current = newCenterArray;
        onCenterChange?.(newCenterArray);
      }
    },
  });

  // Only set view on first render or when center/zoom changes externally
  useEffect(() => {
    if (isFirstRender.current) {
      map.setView(center, zoom);
      isFirstRender.current = false;
    } else if (!flyToPosition) {
      // Only update if not flying to a position
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      if (center[0] !== currentCenter.lat || center[1] !== currentCenter.lng || zoom !== currentZoom) {
        map.setView(center, zoom);
      }
    }
  }, [center, zoom, map, flyToPosition]);

  return null;
});

// ============== REAL INTERACTIVE MAP WITH FIXES ==============

interface RealInteractiveMapProps {
  routes: (BusRoute & { path?: number[][] })[];
  selectedRoute: BusRoute | null;
  onRouteSelect: (route: BusRoute) => void;
  livePositions: Record<string, { lat: number; lng: number; speed: number }>;
  center?: [number, number];
  zoom?: number;
  onCenterChange?: (center: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
}

const RealInteractiveMap: React.FC<RealInteractiveMapProps> = memo(({
  routes,
  selectedRoute,
  onRouteSelect,
  livePositions,
  center = [37.7749, -122.4194],
  zoom = 14,
  onCenterChange,
  onZoomChange
}) => {
  // SSR safety
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // State for map controls
  const [viewMode, setViewMode] = useState<'standard' | 'satellite' | 'dark'>('standard');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [liveTracking, setLiveTracking] = useState(true);
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);

  // Map ref for controls
  const mapRef = useRef<L.Map | null>(null);

  // Bus stop data
  const busStops = useMemo(() => [
    { id: 1, name: 'North Gate', position: [37.7849, -122.4094] as [number, number] },
    { id: 2, name: 'Science Block', position: [37.7799, -122.4144] as [number, number] },
    { id: 3, name: 'Main Library', position: [37.7749, -122.4194] as [number, number] },
    { id: 4, name: 'Campus Center', position: [37.7699, -122.4244] as [number, number] },
    { id: 5, name: 'South Dorm', position: [37.7649, -122.4294] as [number, number] },
  ], []);

  // Map bounds with reasonable viscosity
  const campusBounds: L.LatLngBoundsExpression = [
    [37.7649, -122.4344], // SW corner
    [37.7899, -122.4044], // NE corner
  ];

  // Control handlers
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      setFlyToPosition(null);
      mapRef.current.setView([center[0], center[1]] as [number, number], zoom);
    }
  }, [center, zoom]);

  const handleTrackSelectedBus = useCallback(() => {
    if (selectedRoute && livePositions[selectedRoute.routeNumber]) {
      const pos = livePositions[selectedRoute.routeNumber];
      setFlyToPosition([pos.lat, pos.lng]);
    }
  }, [selectedRoute, livePositions]);

  // Track selected bus when it changes
  useEffect(() => {
    if (selectedRoute && livePositions[selectedRoute.routeNumber]) {
      const pos = livePositions[selectedRoute.routeNumber];
      setFlyToPosition([pos.lat, pos.lng]);
    }
  }, [selectedRoute, livePositions]);

  if (!isMounted) {
    return (
      <div className="relative h-full w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden">
      {/* Map Container */}
      <MapContainer
        center={[center[0], center[1]] as L.LatLngTuple}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        ref={mapRef}
        zoomControl={false}
        maxBounds={campusBounds}
        maxBoundsViscosity={0.3} // Reduced from 1.0 for better UX
        preferCanvas={true} // Better performance for many markers
      >
        {/* Base Layers */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={viewMode === 'standard'} name="Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright ">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked={viewMode === 'satellite'} name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={21}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked={viewMode === 'dark'} name="Dark">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright ">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Traffic Layer (optional) */}
        {showTraffic && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap France'
            opacity={0.3}
          />
        )}

        {/* Route Lines */}
        {showRoutes && routes.map(route => (
          <EnhancedRoutePolyline
            key={route.id}
            route={route}
            isSelected={selectedRoute?.id === route.id}
          />
        ))}

        {/* Bus Stops */}
        {busStops.map(stop => (
          <Marker
            key={stop.id}
            position={stop.position}
            icon={L.divIcon({
              className: 'bus-stop-marker',
              html: `
                <div class="bus-stop-container">
                  <div class="bus-stop-circle">
                    <div class="bus-stop-pulse"></div>
                    <div class="bus-stop-center"></div>
                  </div>
                  <div class="bus-stop-label">${stop.name}</div>
                </div>
              `,
              iconSize: [32, 32] as L.PointTuple,
              iconAnchor: [16, 16] as L.PointTuple,
            })}
          >
            <Popup>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-semibold text-slate-900">{stop.name}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-2">Bus Stop</p>
                <div className="text-xs text-slate-500">
                  Next arrival: ~5 min
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Bus Markers */}
        {routes.map(route => {
          const position = livePositions[route.routeNumber] || { lat: center[0], lng: center[1], speed: 0 };
          const isSelected = selectedRoute?.id === route.id;

          return (
            <EnhancedBusMarker
              key={route.id}
              route={route}
              position={[position.lat, position.lng]}
              isSelected={isSelected}
              speed={position.speed}
              onSelect={onRouteSelect}
            />
          );
        })}

        {/* Selected Route Highlight */}
        {selectedRoute && livePositions[selectedRoute.routeNumber] && (
          <Circle
            center={[livePositions[selectedRoute.routeNumber].lat, livePositions[selectedRoute.routeNumber].lng]}
            radius={30}
            pathOptions={{
              color: '#4f46e5',
              fillColor: '#4f46e5',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }}
          />
        )}

        {/* Map Controller */}
        <MapController
          center={[center[0], center[1]] as [number, number]}
          zoom={zoom}
          onCenterChange={onCenterChange}
          onZoomChange={onZoomChange}
          onViewModeChange={(mode) => setViewMode(mode as any)}
          flyToPosition={flyToPosition}
          flyToZoom={17}
        />
      </MapContainer>

      {/* Custom Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* View Controls */}
        <div className="flex flex-col gap-2">
          {[
            { id: 'standard', label: 'Standard', icon: '🗺️' },
            { id: 'satellite', label: 'Satellite', icon: '🛰️' },
            { id: 'dark', label: 'Dark', icon: '🌙' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`p-3 rounded-xl backdrop-blur-sm border transition-all ${viewMode === mode.id
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-black/60 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              title={mode.label}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        {/* Layer Controls */}
        <div className="mt-2 flex flex-col gap-2">
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`p-3 rounded-xl backdrop-blur-sm border transition-all ${showTraffic
              ? 'bg-red-500/20 border-red-500/30 text-red-400'
              : 'bg-black/60 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            title={showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          >
            🚦
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`p-3 rounded-xl backdrop-blur-sm border transition-all ${showRoutes
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : 'bg-black/60 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            title={showRoutes ? 'Hide Routes' : 'Show Routes'}
          >
            <Route className="w-4 h-4" />
          </button>
        </div>

        {/* Tracking Controls */}
        <div className="mt-4">
          <button
            onClick={() => setLiveTracking(!liveTracking)}
            className={`w-full p-3 rounded-xl backdrop-blur-sm border flex items-center justify-center transition-all ${liveTracking
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : 'bg-black/60 border-white/10 text-slate-300'
              }`}
            title={liveTracking ? 'Pause Tracking' : 'Resume Tracking'}
          >
            {liveTracking ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Live</span>
              </div>
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
          title="Reset View"
        >
          <Target className="w-5 h-5" />
        </button>
        {selectedRoute && livePositions[selectedRoute.routeNumber] && (
          <button
            onClick={handleTrackSelectedBus}
            className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 hover:bg-indigo-500/30 transition-colors"
            title="Track Selected Bus"
          >
            <Navigation className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selected Route Banner */}
      {selectedRoute && livePositions[selectedRoute.routeNumber] && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-sm border border-indigo-500/30 rounded-xl px-4 py-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{selectedRoute.routeNumber}</span>
              </div>
              <div className="text-white">
                <div className="font-semibold">{selectedRoute.destination}</div>
                <div className="text-sm opacity-90">
                  ETA: {(selectedRoute as any).eta || 'N/A'} • {selectedRoute.driver}
                </div>
              </div>
              <div className="ml-4 px-3 py-1 bg-white/20 rounded-lg text-sm font-medium text-white">
                {livePositions[selectedRoute.routeNumber]?.speed.toFixed(0) || 0} km/h
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Coordinates */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-xs">
          <div className="text-slate-300">
            Lat: {center[0].toFixed(4)}, Lng: {center[1].toFixed(4)}
          </div>
          <div className="text-slate-400">Zoom: {zoom}</div>
        </div>
      </div>
    </div>
  );
});

// ============== ENHANCED TRANSPORT COMPONENT ==============

export const Transport: React.FC = () => {
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  // State management

  const [routes, setRoutes] = useState<EnhancedBusRoute[]>([]);

  const [loading, setLoading] = useState(true);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<EnhancedBusRoute | null>(null);
  const [formData, setFormData] = useState({
    routeNumber: '',
    destination: '',
    driver: '',
    departureTime: '',
    status: 'OnTime' as 'OnTime' | 'Delayed' | 'Departed',
    capacity: 40,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<EnhancedBusRoute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveTracking, setLiveTracking] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(14);

  // Analytics
  const [analytics, setAnalytics] = useState({
    peakHours: ['8:00 AM', '5:00 PM'] as [string, string],
    averageDelay: 7,
    totalPassengersToday: 324,
    onTimeRate: 87,
    popularRoute: 'R1',
    avgSpeed: 42,
    totalDistance: 0,
  });

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'delay', message: 'Route R2 delayed by 15 minutes due to traffic', time: '5 min ago', read: false },
    { id: 2, type: 'arrival', message: 'Route R1 arriving at North Gate in 2 minutes', time: '10 min ago', read: true },
    { id: 3, type: 'maintenance', message: 'Route R3 undergoing scheduled maintenance', time: '1 hour ago', read: false },
  ]);

  // Live positions with per-route step tracking
  const [livePositions, setLivePositions] = useState<Record<string, {
    lat: number;
    lng: number;
    speed: number;
    lastUpdated: number;
    accuracy: number;
    direction?: number;
  }>>({});

  const routeStepsRef = useRef<Record<string, number>>({});
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Route paths for realistic movement
  const routePaths = useMemo(() => ({
    'R1': [
      [37.7849, -122.4094],
      [37.7820, -122.4115],
      [37.7799, -122.4144],
      [37.7770, -122.4165],
      [37.7749, -122.4194],
    ],
    'R2': [
      [37.7799, -122.4144],
      [37.7775, -122.4160],
      [37.7749, -122.4194],
      [37.7720, -122.4220],
      [37.7699, -122.4244],
    ],
    'R3': [
      [37.7749, -122.4194],
      [37.7725, -122.4215],
      [37.7699, -122.4244],
      [37.7670, -122.4265],
      [37.7649, -122.4294],
    ],
  }), []);

  // ============== CRITICAL FIX: Load routes on mount ==============
  useEffect(() => {
    loadRoutes();
    requestNotificationPermission();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []); // Empty dependency array - run once on mount

  // ============== FIX: Setup live updates when routes are loaded ==============
  useEffect(() => {
    if (routes.length > 0) {
      initializeLivePositions();
      setupLiveUpdates();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [routes]); // Run when routes change

  const initializeLivePositions = () => {
    const initialPositions: typeof livePositions = {};
    routes.forEach(route => {
      const path = routePaths[route.routeNumber as keyof typeof routePaths] || routePaths.R1;
      if (!routeStepsRef.current[route.routeNumber]) {
        routeStepsRef.current[route.routeNumber] = Math.random() * (path.length - 1);
      }

      const step = routeStepsRef.current[route.routeNumber];
      const currentStep = Math.floor(step) % (path.length - 1);
      const progress = step - currentStep;
      const [lat1, lng1] = path[currentStep];
      const [lat2, lng2] = path[currentStep + 1] || path[0];

      initialPositions[route.routeNumber] = {
        lat: lat1 + (lat2 - lat1) * progress,
        lng: lng1 + (lng2 - lng1) * progress,
        speed: Math.random() * 30 + 20, // 20-50 km/h
        lastUpdated: Date.now(),
        accuracy: 5 + Math.random() * 10,
        direction: Math.random() * 360,
      };
    });

    setLivePositions(initialPositions);
  };

  const setupLiveUpdates = () => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval with per-route movement
    const interval = setInterval(() => {
      if (!liveTracking || routes.length === 0) return;

      setLivePositions(prev => {
        const updated = { ...prev };
        const now = Date.now();

        routes.forEach(route => {
          const routeKey = route.routeNumber;
          if (!updated[routeKey]) return;

          const currentPos = updated[routeKey];
          const path = routePaths[routeKey as keyof typeof routePaths] || routePaths.R1;

          // Initialize step for this route if not exists
          if (!routeStepsRef.current[routeKey]) {
            routeStepsRef.current[routeKey] = Math.random() * (path.length - 1);
          }

          // Calculate movement based on status
          const speedMultiplier = route.status === 'Delayed' ? 0.5 : 1;
          const stepIncrement = 0.1 * speedMultiplier;

          // Update step
          routeStepsRef.current[routeKey] =
            (routeStepsRef.current[routeKey] + stepIncrement) % (path.length - 1);

          const step = routeStepsRef.current[routeKey];
          const currentStep = Math.floor(step) % (path.length - 1);
          const progress = step - currentStep;

          if (currentStep < path.length - 1) {
            const [lat1, lng1] = path[currentStep];
            const [lat2, lng2] = path[currentStep + 1];

            // Calculate new position
            const newLat = lat1 + (lat2 - lat1) * progress;
            const newLng = lng1 + (lng2 - lng1) * progress;

            // Calculate speed with some variation
            const baseSpeed = route.status === 'Delayed' ? 25 : 40;
            const speedVariation = (Math.random() - 0.5) * 10;
            const newSpeed = Math.max(10, Math.min(70, baseSpeed + speedVariation));

            // Calculate direction (in degrees)
            const latDiff = newLat - currentPos.lat;
            const lngDiff = newLng - currentPos.lng;
            const direction = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);

            updated[routeKey] = {
              lat: newLat,
              lng: newLng,
              speed: newSpeed,
              lastUpdated: now,
              accuracy: 3 + Math.random() * 7,
              direction: (direction + 360) % 360,
            };
          }
        });

        // Update analytics with the new positions
        const positionsArray = Object.values(updated) as Array<{
          lat: number;
          lng: number;
          speed: number;
          lastUpdated: number;
          accuracy: number;
          direction?: number;
        }>;
        if (positionsArray.length > 0) {
          const totalSpeed = positionsArray.reduce((sum, pos) => sum + pos.speed, 0);
          const avgSpeed = totalSpeed / positionsArray.length;

          // Update analytics in next render cycle to avoid state update in render
          requestAnimationFrame(() => {
            setAnalytics(prev => ({
              ...prev,
              avgSpeed: Math.round(avgSpeed),
              totalPassengersToday: routes.reduce((sum, r) => sum + ((r as any).occupied || 0), 0),
              onTimeRate: Math.round((routes.filter(r => r.status === 'OnTime').length / routes.length) * 100),
            }));
          });
        }

        return updated;
      });
    }, 2000); // Update every 2 seconds

    refreshIntervalRef.current = interval;
  };

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await transportService.getAllRoutes();

      // Enhance routes with additional data
      const enhancedData = data.map((route, index) => {
        const path = routePaths[`R${(index % 3) + 1}` as keyof typeof routePaths] || routePaths.R1;

        return {
          ...route,
          path,
          capacity: 40,
          occupied: Math.floor(Math.random() * 30) + 10,
          rating: (Math.random() * 1 + 4).toFixed(1),
          driverAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${route.driver}`,
          nextStop: ['North Gate', 'Science Block', 'Main Library', 'Campus Center'][index % 4],
          eta: `${Math.floor(Math.random() * 15) + 5} min`,
          temperature: Math.floor(Math.random() * 10) + 20,
          wifiStrength: Math.floor(Math.random() * 5) + 1,
          fuelLevel: Math.floor(Math.random() * 100),
        };
      });

      setRoutes(enhancedData);

      // Select first route if none selected
      if (enhancedData.length > 0 && !selectedRoute) {
        setSelectedRoute(enhancedData[0]);
      }
    } catch (error) {
      console.error('Failed to load routes:', error);
      // Fallback to mock data
      setRoutes([
        {
          id: '1',
          routeNumber: 'R1',
          destination: 'City Center',
          driver: 'Robert Fox',
          departureTime: '08:00 AM',
          status: 'OnTime',
          capacity: 40,
          occupied: 24,
          rating: '4.9',
          driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
          nextStop: 'Science Block',
          eta: '12 min',
          temperature: 22,
          wifiStrength: 4,
          fuelLevel: 85,
          path: routePaths.R1,
        },
        {
          id: '2',
          routeNumber: 'R2',
          destination: 'North Campus',
          driver: 'Jane Smith',
          departureTime: '08:30 AM',
          status: 'Delayed',
          capacity: 40,
          occupied: 32,
          rating: '4.7',
          driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          nextStop: 'Main Library',
          eta: '18 min',
          temperature: 24,
          wifiStrength: 3,
          fuelLevel: 65,
          path: routePaths.R2,
        },
        {
          id: '3',
          routeNumber: 'R3',
          destination: 'South Gate',
          driver: 'Mike Johnson',
          departureTime: '09:00 AM',
          status: 'OnTime',
          capacity: 40,
          occupied: 18,
          rating: '4.8',
          driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
          nextStop: 'North Gate',
          eta: '7 min',
          temperature: 21,
          wifiStrength: 5,
          fuelLevel: 90,
          path: routePaths.R3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          addNotification({ 
            type: 'success', 
            message: 'Browser notifications enabled!', 
            time: 'Just now' 
          });
        }
      }
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch =
      route.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.driver.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      statusFilter === 'all' ||
      route.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-rose-600 dark:text-indigo-500" />
        <p className="text-rose-900/60 dark:text-slate-400 font-medium">Loading Transport System...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-rose-900 dark:text-white tracking-tight">Transport Management</h1>
          <p className="text-xs text-rose-700/60 dark:text-slate-500 mt-1 uppercase tracking-widest">Live bus tracking & route management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingRoute(null); setFormData({ routeNumber: '', destination: '', driver: '', departureTime: '', status: 'OnTime', capacity: 40 }); setShowRouteForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-700 dark:hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-200 dark:shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Route
          </button>
          <button 
             onClick={loadRoutes}
             className="p-2.5 rounded-xl border border-rose-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-rose-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Routes', value: routes.length, icon: <Route className="w-5 h-5" />, color: 'indigo' },
          { label: 'Buses On Time', value: routes.filter(r => r.status === 'OnTime').length, icon: <CheckCircle className="w-5 h-5" />, color: 'emerald' },
          { label: 'Delayed', value: routes.filter(r => r.status === 'Delayed').length, icon: <AlertCircle className="w-5 h-5" />, color: 'amber' },
          { label: 'Total Capacity', value: routes.reduce((s, r) => s + (r.capacity || 40), 0), icon: <Users className="w-5 h-5" />, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl group hover:border-rose-400 dark:hover:border-indigo-500/50 transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
              stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
              stat.color === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
              'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-rose-900 dark:text-white leading-none">{stat.value}</p>
            <p className="text-[10px] font-bold text-rose-700/50 dark:text-slate-500 uppercase tracking-widest mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Map & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Route List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-rose-50 dark:bg-slate-900/50 border border-rose-100 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 text-rose-900 dark:text-white placeholder-rose-300 dark:placeholder-slate-600"
              />
            </div>
            <div className="flex bg-rose-50 dark:bg-slate-900/50 rounded-xl p-1">
              {['all', 'OnTime', 'Delayed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    statusFilter === filter 
                      ? 'bg-white dark:bg-indigo-600 text-rose-600 dark:text-white shadow-sm' 
                      : 'text-rose-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-slate-300'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter === 'OnTime' ? 'On Time' : 'Delayed'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredRoutes.map((route) => (
              <div 
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  selectedRoute?.id === route.id
                    ? 'bg-rose-600 dark:bg-indigo-600 border-rose-400 dark:border-indigo-400 shadow-lg shadow-rose-200 dark:shadow-indigo-500/20'
                    : 'bg-white/60 dark:bg-white/[0.03] border-rose-200/50 dark:border-white/8 hover:border-rose-400 dark:hover:border-indigo-500/50 backdrop-blur-xl'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2 py-1 rounded-lg text-xs font-black ${
                    selectedRoute?.id === route.id
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-100 dark:bg-indigo-500/20 text-rose-600 dark:text-indigo-400'
                  }`}>
                    {route.routeNumber}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    selectedRoute?.id === route.id
                      ? 'text-white/80'
                      : route.status === 'OnTime' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      selectedRoute?.id === route.id
                        ? 'bg-white'
                        : route.status === 'OnTime' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    {route.status}
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingRoute(route); setFormData({ routeNumber: route.routeNumber, destination: route.destination, driver: route.driver, departureTime: route.departureTime, status: route.status, capacity: route.capacity || 40 }); setShowRouteForm(true); }}
                      className={`p-1.5 rounded-lg transition-all ${selectedRoute?.id === route.id ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-100 dark:hover:bg-white/5 text-rose-400'}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={async (e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this route?')) { setRoutes(prev => prev.filter(r => r.id !== route.id)); addNotification({ type: 'success', message: `Route ${route.routeNumber} deleted!`, time: 'Just now' }); } }}
                      className={`p-1.5 rounded-lg transition-all ${selectedRoute?.id === route.id ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-100 dark:hover:bg-red-500/20 text-red-400'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className={`font-bold text-sm mb-1 ${selectedRoute?.id === route.id ? 'text-white' : 'text-rose-900 dark:text-white'}`}>
                  {route.destination}
                </h3>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${selectedRoute?.id === route.id ? 'text-white/70' : 'text-rose-700/60 dark:text-slate-500'}`}>
                    {route.driver}
                  </p>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${selectedRoute?.id === route.id ? 'text-white/90' : 'text-rose-600 dark:text-indigo-400'}`}>
                    <Clock className="w-3 h-3" /> {route.departureTime}
                  </div>
                </div>
              </div>
            ))}
            {filteredRoutes.length === 0 && (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-rose-200 dark:border-white/10">
                <p className="text-rose-900/40 dark:text-slate-600 text-sm">No routes matching your search</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3 h-[700px] rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden relative shadow-2xl">
          <RealInteractiveMap 
            routes={routes}
            selectedRoute={selectedRoute}
            onRouteSelect={setSelectedRoute}
            livePositions={livePositions as any}
            center={mapCenter}
            zoom={mapZoom}
            onCenterChange={setMapCenter}
            onZoomChange={setMapZoom}
          />
        </div>

      </div>

      {/* Analytics Summary */}
      <div className="p-6 rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl">
        <h3 className="text-lg font-black text-rose-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-600 dark:text-indigo-500" /> Performance Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Avg Speed', value: `${analytics.avgSpeed} km/h`, trend: '+2.4%', color: 'emerald' },
            { label: 'On-Time Rate', value: `${analytics.onTimeRate}%`, trend: '+5.1%', color: 'indigo' },
            { label: 'Peak Hour', value: analytics.peakHours[0], sub: '8:00 AM', color: 'amber' },
            { label: 'Daily Riders', value: analytics.totalPassengersToday, trend: '+12%', color: 'rose' },
          ].map((item, i) => (
            <div key={i} className="relative pl-6 border-l border-rose-100 dark:border-white/5">
              <p className="text-[10px] font-bold text-rose-700/50 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-rose-900 dark:text-white leading-none">{item.value}</span>
                {item.trend && <span className="text-[10px] font-bold text-emerald-500 leading-none mb-1">{item.trend}</span>}
              </div>
              {item.sub && <p className="text-[10px] text-rose-600 dark:text-indigo-400 font-bold mt-1 uppercase tracking-widest">{item.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Route Management Modal */}
      {showRouteForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRouteForm(false)} />
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-rose-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-rose-900 dark:text-white tracking-tight">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h2>
              <button onClick={() => setShowRouteForm(false)} className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-white/10 text-rose-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                const newRoute = {
                  id: editingRoute?.id || Math.random().toString(36).substr(2, 9),
                  ...formData,
                  status: formData.status as 'OnTime' | 'Delayed' | 'Departed'
                };
                
                if (editingRoute) {
                  setRoutes(prev => prev.map(r => r.id === editingRoute.id ? { ...r, ...newRoute } : r));
                  addNotification({ type: 'success', message: `Route ${formData.routeNumber} updated!`, time: 'Just now' });
                } else {
                  setRoutes(prev => [...prev, { 
                    ...newRoute, 
                    path: routePaths.R1,
                    capacity: 40,
                    occupied: 0,
                    rating: '5.0',
                    driverAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.driver}`,
                    nextStop: 'Pending',
                    eta: 'N/A',
                    temperature: 22,
                    wifiStrength: 5,
                    fuelLevel: 100
                  } as any]);
                  addNotification({ type: 'success', message: `Route ${formData.routeNumber} added!`, time: 'Just now' });
                }
                setShowRouteForm(false);
              } catch (err) {
                console.error(err);
                addNotification({ type: 'error', message: 'Failed to save route', time: 'Just now' });
              } finally {
                setIsSubmitting(false);
              }
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-rose-900/40 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Route No.</label>
                  <input 
                    type="text" required value={formData.routeNumber}
                    onChange={(e) => setFormData({...formData, routeNumber: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-rose-50 dark:bg-slate-950 border border-rose-100 dark:border-white/5 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 text-rose-900 dark:text-white placeholder-rose-300 dark:placeholder-slate-600 outline-none"
                    placeholder="e.g., R4"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-900/40 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Departure</label>
                  <input 
                    type="text" required value={formData.departureTime}
                    onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-rose-50 dark:bg-slate-950 border border-rose-100 dark:border-white/5 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 text-rose-900 dark:text-white placeholder-rose-300 dark:placeholder-slate-600 outline-none"
                    placeholder="09:15 AM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-rose-900/40 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Destination</label>
                <input 
                  type="text" required value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50 dark:bg-slate-950 border border-rose-100 dark:border-white/5 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 text-rose-900 dark:text-white placeholder-rose-300 dark:placeholder-slate-600 outline-none"
                  placeholder="Street / Landmark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-rose-900/40 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Driver Name</label>
                <input 
                  type="text" required value={formData.driver}
                  onChange={(e) => setFormData({...formData, driver: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50 dark:bg-slate-950 border border-rose-100 dark:border-white/5 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 text-rose-900 dark:text-white placeholder-rose-300 dark:placeholder-slate-600 outline-none"
                  placeholder="Driver Full Name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-rose-900/40 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Current Status</label>
                <div className="relative">
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl bg-rose-50 dark:bg-slate-950 border border-rose-100 dark:border-white/5 focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 text-rose-900 dark:text-white outline-none appearance-none"
                  >
                    <option value="OnTime">On Time</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Departed">Departed</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                </div>
              </div>
              
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full mt-6 py-4 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-700 dark:hover:bg-indigo-700 text-white rounded-2xl font-black tracking-tight shadow-xl shadow-rose-200 dark:shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingRoute ? 'Apply Changes' : 'Confirm New Route')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

