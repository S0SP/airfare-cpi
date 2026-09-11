"use client"

import { useEffect, useRef, useCallback } from "react"
import createGlobe from "cobe"

export interface FlightArc {
  id: string
  from: [number, number]
  to: [number, number]
}

export interface FlightMarker {
  id: string
  location: [number, number]
}

export interface GlobeFlightsProps {
  arcs?: FlightArc[]
  markers?: FlightMarker[]
  className?: string
  speed?: number
}

const defaultArcs: FlightArc[] = [
  { id: "flight-del-bom", from: [28.5562, 77.1000], to: [19.0896, 72.8656] },
  { id: "flight-del-blr", from: [28.5562, 77.1000], to: [13.1986, 77.7066] },
  { id: "flight-bom-blr", from: [19.0896, 72.8656], to: [13.1986, 77.7066] },
  { id: "flight-del-ccu", from: [28.5562, 77.1000], to: [22.6520, 88.4463] },
  { id: "flight-blr-hyd", from: [13.1986, 77.7066], to: [17.2403, 78.4294] },
  { id: "flight-maa-del", from: [12.9941, 80.1709], to: [28.5562, 77.1000] },
]

const defaultMarkers: FlightMarker[] = [
  { id: "apt-del", location: [28.5562, 77.1000] },
  { id: "apt-bom", location: [19.0896, 72.8656] },
  { id: "apt-blr", location: [13.1986, 77.7066] },
  { id: "apt-ccu", location: [22.6520, 88.4463] },
  { id: "apt-hyd", location: [17.2403, 78.4294] },
  { id: "apt-maa", location: [12.9941, 80.1709] },
]

export function GlobeFlights({
  arcs = defaultArcs,
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeFlightsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 2.5,
        baseColor: [0.95, 0.96, 0.98],
        markerColor: [0.01, 0.52, 0.78],
        glowColor: [0.9, 0.93, 0.96],
        markers: markers.map((m) => ({ location: m.location, size: 0.03 })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to })),
        arcColor: [0.01, 0.52, 0.78],
        arcWidth: 0.7,
        arcHeight: 0.25,
        opacity: 0.85,
        onRender: (state: Record<string, any>) => {
          if (!isPausedRef.current) {
            phi += speed;
          }
          state.phi = phi + phiOffsetRef.current + dragOffset.current.phi;
          state.theta = 0.2 + thetaOffsetRef.current + dragOffset.current.theta;
        },
      } as any)
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (globe) globe.destroy()
    }
  }, [markers, arcs, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
    </div>
  )
}
