import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import React, { useEffect, useRef } from 'react'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

export default function App() {
  const mapRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-89.5, 32.8], // MS/AL center
        zoom: 5,
        pitch: 45,
        bearing: -17.6,
      })
      mapRef.current.addControl(new mapboxgl.NavigationControl())
    }
    return () => {}
  }, [])

  if (!import.meta.env.VITE_MAPBOX_TOKEN) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Mapbox token missing</h3>
        <p>Set VITE_MAPBOX_TOKEN in dashboard-react/.env</p>
      </div>
    )
  }

  return <div id="map" ref={containerRef} />
}
