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
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="p-4 min-w-[280px] bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
              route.status === 'OnTime' ? 'bg-emerald-500/10 text-emerald-600' :
              route.status === 'Delayed' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-500/10 text-slate-600'
            }`}>
              <span className="text-2xl font-black">{route.routeNumber}</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white leading-tight">{route.destination}</h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{route.driver}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-[10px] font-black uppercase tracking-wider ${
                route.status === 'OnTime' ? 'text-emerald-600' : 
                route.status === 'Delayed' ? 'text-amber-600' : 'text-slate-600'
              }`}>{route.status}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">ETA</p>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{route.eta || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Speed</p>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{speed.toFixed(0)} KM/H</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Load</p>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {route.occupied || 0}/{route.capacity || 40}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelect(route)}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 active:scale-95"
          >
            Track Bus Performance
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
    [51.5007, -0.1246], // Westminster
    [51.5033, -0.1195], // Waterloo
    [51.5074, -0.1278], // Trafalgar Square
    [51.5133, -0.1286], // Soho
    [51.5173, -0.1342], // Oxford Circus
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
  center = [51.5074, -0.1278],
  zoom = 13,
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
    { id: 1, name: 'Westminster Hub', position: [51.5007, -0.1246] as [number, number] },
    { id: 2, name: 'Piccadilly Circus', position: [51.5101, -0.1344] as [number, number] },
    { id: 3, name: 'Trafalgar Terminal', position: [51.5074, -0.1278] as [number, number] },
    { id: 4, name: 'Waterloo Station', position: [51.5033, -0.1195] as [number, number] },
    { id: 5, name: 'Oxford Street East', position: [51.5152, -0.1419] as [number, number] },
  ], []);

  // Map bounds with reasonable viscosity
  const campusBounds: L.LatLngBoundsExpression = [
    [51.4500, -0.3000], // SW corner
    [51.5500, 0.0500], // NE corner
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
      <div className="relative h-full w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/20 dark:border-indigo-500"></div>
        <p className="text-slate-400 animate-pulse font-black text-xs tracking-widest uppercase">Initializing Map System</p>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                  <MapPinIcon className="w-4 h-4" />
                  <h3 className="font-semibold">{stop.name}</h3>
                </div>
                <p className="text-sm  mb-2">Bus Stop</p>
                <div className="text-xs">
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
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3">
        {/* View Controls */}
        <div className="flex flex-col gap-2 p-1.5 bg-white/20 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl">
          {[
            { id: 'standard', label: 'Standard', icon: '🗺️' },
            { id: 'satellite', label: 'Satellite', icon: '🛰️' },
            { id: 'dark', label: 'Dark', icon: '🌙' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${viewMode === mode.id
                ? 'bg-white dark:bg-indigo-600 shadow-xl scale-110'
                : 'hover:bg-white/20'
                }`}
              title={mode.label}
            >
              <span className="text-sm">{mode.icon}</span>
            </button>
          ))}
        </div>

        {/* Layer Controls */}
        <div className="flex flex-col gap-2 p-1.5 bg-white/20 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl">
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${showTraffic
              ? 'bg-rose-500 text-white shadow-xl scale-110'
              : 'text-slate-900 dark:text-white hover:bg-white/20'
              }`}
            title={showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          >
            <Activity className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${showRoutes
              ? 'bg-emerald-500 text-white shadow-xl scale-110'
              : 'text-slate-900 dark:text-white hover:bg-white/20'
              }`}
            title={showRoutes ? 'Hide Routes' : 'Show Routes'}
          >
            <Route className="w-5 h-5" />
          </button>
        </div>

        {/* Tracking Controls */}
        <div className="flex flex-col gap-2 p-1.5 bg-white/20 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl">
          <button
            onClick={() => setLiveTracking(!liveTracking)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${liveTracking
              ? 'bg-indigo-600 text-white shadow-xl'
              : 'text-slate-900 dark:text-white hover:bg-white/20'
              }`}
            title={liveTracking ? 'Pause Tracking' : 'Resume Tracking'}
          >
            {liveTracking ? (
              <div className="relative">
                <Radio className="w-5 h-5 animate-pulse" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-indigo-600"></span>
              </div>
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="flex flex-col gap-2 p-1.5 bg-white/20 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl">
          <button
            onClick={handleZoomIn}
            className="w-11 h-11 flex items-center justify-center bg-white/80 dark:bg-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-white transition-colors shadow-lg"
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-11 h-11 flex items-center justify-center bg-white/80 dark:bg-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-white transition-colors shadow-lg"
            title="Zoom Out"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <div className="h-px bg-white/20 mx-2" />
          <button
            onClick={handleResetView}
            className="w-11 h-11 flex items-center justify-center bg-white/80 dark:bg-white/10 rounded-xl text-slate-900 dark:text-white hover:bg-white transition-colors shadow-lg"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          {selectedRoute && livePositions[selectedRoute.routeNumber] && (
            <button
              onClick={handleTrackSelectedBus}
              className="w-11 h-11 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 animate-bounce-subtle"
              title="Track Selected Bus"
            >
              <Navigation className="w-5 h-5" />
            </button>
          )}
        </div>
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
          <div className="flex items-center gap-4 text-xs">
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
          <div className="">
            Lat: {center[0].toFixed(4)}, Lng: {center[1].toFixed(4)}
          </div>
          <div className="">Zoom: {zoom}</div>
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
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]);
  const [mapZoom, setMapZoom] = useState(13);

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
      [51.5007, -0.1246],
      [51.5033, -0.1195],
      [51.5074, -0.1278],
      [51.5133, -0.1286],
      [51.5173, -0.1342],
    ],
    'R2': [
      [51.5101, -0.1344],
      [51.5074, -0.1278],
      [51.5033, -0.1195],
    ],
    'R3': [
      [51.5152, -0.1419],
      [51.5101, -0.1344],
      [51.5007, -0.1246],
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
      <div className="flex flex-col items-center justify-center h-[600px] space-y-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-indigo-500"></div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">System Initialization</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase mt-2">Syncing Fleet Vectors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">Fleet Terminal</h1>
          <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase">Live Command & Logistics Control</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingRoute(null); setFormData({ routeNumber: '', destination: '', driver: '', departureTime: '', status: 'OnTime', capacity: 40 }); setShowRouteForm(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-2xl text-xs font-black tracking-widest uppercase shadow-2xl transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Route
          </button>
          <button 
            onClick={loadRoutes}
            className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Routes', value: routes.length, icon: <Route className="w-6 h-6" />, color: 'indigo' },
          { label: 'Buses On Time', value: routes.filter(r => r.status === 'OnTime').length, icon: <CheckCircle className="w-6 h-6" />, color: 'emerald' },
          { label: 'System Delays', value: routes.filter(r => r.status === 'Delayed').length, icon: <AlertCircle className="w-6 h-6" />, color: 'amber' },
          { label: 'Deployment', value: routes.reduce((s, r) => s + (r.capacity || 40), 0), icon: <Zap className="w-6 h-6" />, color: 'slate' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 border border-white dark:border-white/10 backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none group cursor-pointer overflow-hidden relative"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner ${
              stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-600' :
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
              stat.color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
              'bg-slate-900 dark:bg-white/10 text-white dark:text-white'
            }`}>
              {stat.icon}
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter mb-2">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">{stat.label}</p>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-[40px] opacity-10 ${
              stat.color === 'indigo' ? 'bg-indigo-500' :
              stat.color === 'emerald' ? 'bg-emerald-500' :
              stat.color === 'amber' ? 'bg-amber-500' :
              'bg-slate-900'
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Main Content: Map & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar: Route List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 border border-white dark:border-white/10 backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className="relative mb-5 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find specific route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 text-[10px] font-black tracking-widest uppercase bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl p-1.5 border border-slate-100 dark:border-white/5">
              {['all', 'OnTime', 'Delayed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`flex-1 py-3 text-[9px] font-black tracking-widest uppercase rounded-xl transition-all ${
                    statusFilter === filter 
                      ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xl' 
                      : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
            {filteredRoutes.map((route) => (
              <motion.div 
                key={route.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedRoute(route)}
                className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer group backdrop-blur-3xl ${
                  selectedRoute?.id === route.id
                    ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-200 dark:shadow-none'
                    : 'bg-white/60 dark:bg-slate-900/40 border-white dark:border-white/5 hover:border-indigo-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] ${
                    selectedRoute?.id === route.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}>
                    {route.routeNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingRoute(route); setFormData({ routeNumber: route.routeNumber, destination: route.destination, driver: route.driver, departureTime: route.departureTime, status: route.status, capacity: route.capacity || 40 }); setShowRouteForm(true); }}
                      className={`p-2.5 rounded-xl transition-all ${selectedRoute?.id === route.id ? 'hover:bg-white/20 text-white' : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500'}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={async (e) => { e.stopPropagation(); if (confirm('Purge this route from terminal?')) { setRoutes(prev => prev.filter(r => r.id !== route.id)); addNotification({ type: 'success', message: `Route ${route.routeNumber} purged!`, time: 'Just now' }); } }}
                      className={`p-2.5 rounded-xl transition-all ${selectedRoute?.id === route.id ? 'hover:bg-rose-500 text-white' : 'bg-slate-50 dark:bg-white/5 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className={`font-black text-lg mb-1 leading-tight ${selectedRoute?.id === route.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {route.destination}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      selectedRoute?.id === route.id ? 'bg-white' : 
                      route.status === 'OnTime' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedRoute?.id === route.id ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                      {route.status}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${selectedRoute?.id === route.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    <Clock className="w-3.5 h-3.5" /> {route.departureTime}
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredRoutes.length === 0 && (
              <div className="text-center py-20 px-10 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                <Search className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 tracking-widest uppercase">No Active Vectors Found</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 h-[750px] rounded-[3rem] border border-white dark:border-white/10 bg-white/40 dark:bg-slate-900/30 backdrop-blur-3xl overflow-hidden relative shadow-2xl shadow-slate-200/50 dark:shadow-none">
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
      <div className="p-10 rounded-[3rem] bg-white/60 dark:bg-slate-900/60 border border-white dark:border-white/10 backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" /> Operational Efficiency
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-1 ml-9">Fleet Performance Core Metrics</p>
          </div>
          <button className="px-6 py-3 bg-slate-900 dark:bg-white/5 text-white dark:text-white text-[10px] font-black tracking-widest uppercase rounded-2xl hover:bg-slate-800 transition-all shadow-xl">
            Detailed Report
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {[
            { label: 'Cruise Velocity', value: `${analytics.avgSpeed}`, unit: 'KM/H', trend: '+2.4%', color: 'emerald' },
            { label: 'Punctuality', value: `${analytics.onTimeRate}`, unit: '%', trend: '+5.1%', color: 'indigo' },
            { label: 'Next Wave', value: analytics.peakHours[0], unit: 'DEP', color: 'amber' },
            { label: 'Active Load', value: analytics.totalPassengersToday, unit: 'PAX', trend: '+12%', color: 'rose' },
          ].map((item, i) => (
            <div key={i} className="relative group">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-4 uppercase">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{item.value}</span>
                <span className="text-sm font-black text-slate-400 dark:text-slate-600 tracking-widest uppercase">{item.unit}</span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {item.trend && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black">
                    <TrendingUp className="w-3 h-3" />
                    {item.trend}
                  </div>
                )}
                <div className={`h-1 flex-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className={`h-full rounded-full ${
                      item.color === 'emerald' ? 'bg-emerald-500' :
                      item.color === 'indigo' ? 'bg-indigo-500' :
                      item.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Management Modal */}
      <AnimatePresence>
        {showRouteForm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl p-10 rounded-[3rem] border border-white dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {editingRoute ? 'Reconfigure Route' : 'Deploy New Route'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-2">Fleet Management Protocol v2.4</p>
                </div>
                <button 
                  onClick={() => setShowRouteForm(false)} 
                  className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form className="space-y-6" onSubmit={async (e) => {
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
                    addNotification({ type: 'success', message: `Route ${formData.routeNumber} configuration updated`, time: 'Just now' });
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
                    addNotification({ type: 'success', message: `Route ${formData.routeNumber} successfully deployed`, time: 'Just now' });
                  }
                  setShowRouteForm(false);
                } catch (err) {
                  console.error(err);
                  addNotification({ type: 'error', message: 'Deployment authorization failed', time: 'Just now' });
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Route Identifier</label>
                    <input 
                      type="text" required value={formData.routeNumber}
                      onChange={(e) => setFormData({...formData, routeNumber: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                      placeholder="e.G. R12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Departure Vector</label>
                    <input 
                      type="text" required value={formData.departureTime}
                      onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                      placeholder="00:00 AM"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Primary Destination</label>
                  <input 
                    type="text" required value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    placeholder="ENTER HUB OR STATION NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Lead Driver</label>
                  <input 
                    type="text" required value={formData.driver}
                    onChange={(e) => setFormData({...formData, driver: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                    placeholder="OFFICER FULL NAME"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Operational Status</label>
                  <div className="relative group">
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="OnTime">Operational (On Time)</option>
                      <option value="Delayed">Caution (Delayed)</option>
                      <option value="Departed">Complete (Departed)</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                  </div>
                </div>
                
                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-6 uppercase"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      {editingRoute ? 'Commit Changes' : 'Authorize Deployment'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};