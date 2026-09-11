'use client';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { X } from 'lucide-react';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// MoSPI Mandated Heavy Traffic Routes for the APIx Basket
const APIX_ROUTES = [
  { startLat: 28.5562, startLng: 77.1000, endLat: 19.0896, endLng: 72.8656, name: 'DEL ✈ BOM' },
  { startLat: 28.5562, startLng: 77.1000, endLat: 13.1989, endLng: 77.7068, name: 'DEL ✈ BLR' },
  { startLat: 19.0896, startLng: 72.8656, endLat: 13.1989, endLng: 77.7068, name: 'BOM ✈ BLR' },
  { startLat: 12.9941, startLng: 80.1709, endLat: 28.5562, endLng: 77.1000, name: 'MAA ✈ DEL' },
];

export default function LiveAviationGlobe({ onClose, isDark }: { onClose: () => void, isDark: boolean }) {
  const globeRef = useRef<any>();
  const [flights, setFlights] = useState([]);
  const [airplaneMesh, setAirplaneMesh] = useState<THREE.Group | null>(null);

  // 1. Load the actual 3D Airplane Model once
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load('/airplane.glb', (gltf) => {
      const mesh = gltf.scene;
      // Scale down the massive default GLTF sizes to fit the globe
      mesh.scale.set(0.1, 0.1, 0.1); 
      
      // Apply a premium matte-blue finish to the model
      mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({ 
            color: 0x0284C7, 
            roughness: 0.4,
            metalness: 0.8
          });
        }
      });
      setAirplaneMesh(mesh);
    });
  }, []);

  // 2. Fetch Live Telemetry
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch('/api/flights');
        const data = await res.json();
        
        const liveTraffic = data.states?.map((f: any) => ({
          callsign: f[1]?.trim() || 'UNKNOWN',
          lng: f[5],
          lat: f[6],
          alt: (f[7] || 10000) / 6371000 + 0.01, // Scale altitude
          heading: f[10] || 0,
          velocity: f[9] ? Math.round(f[9] * 3.6) : 0 // Convert m/s to km/h
        })).filter((f: any) => f.lat && f.lng) || [];
        
        setFlights(liveTraffic);
      } catch (err) {
        console.error("Telemetry fetch failed", err);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 15000);
    return () => clearInterval(interval);
  }, []);

  // 3. Initialize Camera & Rotation
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 22.0, lng: 79.0, altitude: 1.5 }, 2000);
      const controls = globeRef.current.controls();
      controls.autoRotate = false; // Turned off as requested
      controls.autoRotateSpeed = 0.8;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }
  }, [flights]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md p-6">
      <div className="relative w-full max-w-6xl h-[85vh] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#020617] rounded-xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* HUD Header */}
        <div className="flex justify-between items-center p-4 z-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-4">
            <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 tracking-wider">
              APIx SURVEILLANCE MESH | {flights.length} LIVE VECTORS
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 w-full h-full cursor-move">
          <Globe
            ref={globeRef}
            globeImageUrl={isDark ? "//unpkg.com/three-globe/example/img/earth-dark.jpg" : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"}
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor={isDark ? "rgba(2, 6, 23, 1)" : "rgba(255, 255, 255, 1)"}
            
            // Render High-Density MoSPI Routes
            arcsData={APIX_ROUTES}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor={() => '#38BDF8'}
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={2000}
            arcStroke={0.5}

            // Render 3D Airplanes
            objectsData={flights}
            objectLat="lat"
            objectLng="lng"
            objectAltitude="alt"
            objectThreeObject={(d: any) => {
              if (!airplaneMesh) {
                // Fallback geometry while GLTF loads
                return new THREE.Mesh(
                  new THREE.ConeGeometry(0.2, 0.8, 3),
                  new THREE.MeshBasicMaterial({ color: '#38BDF8' })
                );
              }
              // Clone the loaded GLTF for performance
              const clone = airplaneMesh.clone();
              // Orient the nose of the plane to the heading
              clone.rotation.y = (d.heading * Math.PI) / 180; 
              // Level the pitch
              clone.rotation.x = Math.PI / 2;
              return clone;
            }}

            // Advanced Insights: ATC Radar Tooltips
            objectLabel={(d: any) => `
              <div class="bg-slate-900/95 border border-slate-700 p-3 rounded shadow-xl font-mono text-[11px] min-w-[140px]">
                <div class="text-sky-400 font-bold mb-1 border-b border-slate-800 pb-1">FLIGHT: ${d.callsign}</div>
                <div class="flex justify-between text-slate-300 mt-1"><span>ALT:</span> <span class="text-white">${Math.round(d.alt * 6371000)}m</span></div>
                <div class="flex justify-between text-slate-300 mt-0.5"><span>SPD:</span> <span class="text-white">${d.velocity} km/h</span></div>
                <div class="flex justify-between text-slate-300 mt-0.5"><span>HDG:</span> <span class="text-white">${Math.round(d.heading)}°</span></div>
              </div>
            `}
          />
        </div>
      </div>
    </div>
  );
}
