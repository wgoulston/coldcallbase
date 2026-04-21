'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { ColdCall, STATUS_COLORS, CallStatus } from '@/lib/types'
import CallModal from './CallModal'

interface PlacePreset {
  business_name: string
  address: string
  phone?: string
  lat: number
  lng: number
}

export default function MapView() {
  const mapRef        = useRef<HTMLDivElement>(null)
  const mapObj        = useRef<google.maps.Map | null>(null)
  const heatmapRef    = useRef<google.maps.visualization.HeatmapLayer | null>(null)
  const markersRef    = useRef<google.maps.Marker[]>([])

  const [calls, setCalls]           = useState<ColdCall[]>([])
  const [modalOpen, setModalOpen]   = useState(false)
  const [preset, setPreset]         = useState<PlacePreset | null>(null)
  const [existing, setExisting]     = useState<ColdCall | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [filterStatus, setFilterStatus] = useState<CallStatus | 'all'>('all')
  const [mapsLoaded, setMapsLoaded] = useState(false)

  const fetchCalls = useCallback(async () => {
    const res = await fetch('/api/calls')
    if (res.ok) setCalls(await res.json())
  }, [])

  useEffect(() => { fetchCalls() }, [fetchCalls])

  // Load Google Maps
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
      version: 'weekly',
      libraries: ['places', 'visualization'],
    })

    loader.load().then(() => setMapsLoaded(true))
  }, [])

  // Init map once loaded
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapObj.current) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 51.505, lng: -0.09 },
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'on' }] },
      ],
    })

    mapObj.current = map

    // Try geolocation for default center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    }

    // Click on a business POI
    map.addListener('click', (e: google.maps.MapMouseEvent & { placeId?: string }) => {
      if (!e.placeId) return
      e.stop()

      const service = new google.maps.places.PlacesService(map)
      service.getDetails(
        { placeId: e.placeId, fields: ['name', 'formatted_address', 'formatted_phone_number', 'geometry'] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            setPreset({
              business_name: place.name ?? '',
              address: place.formatted_address ?? '',
              phone: place.formatted_phone_number,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            })
            setExisting(null)
            setModalOpen(true)
          }
        }
      )
    })

    // Search box
    const input = document.getElementById('map-search') as HTMLInputElement
    const searchBox = new google.maps.places.SearchBox(input)
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces()
      if (!places?.length) return
      const bounds = new google.maps.LatLngBounds()
      places.forEach(p => {
        if (p.geometry?.viewport) bounds.union(p.geometry.viewport)
        else if (p.geometry?.location) bounds.extend(p.geometry.location)
      })
      map.fitBounds(bounds)
    })

    heatmapRef.current = new google.maps.visualization.HeatmapLayer({
      map,
      radius: 40,
      opacity: 0.6,
    })
  }, [mapsLoaded])

  // Sync markers & heatmap when calls or filter changes
  useEffect(() => {
    if (!mapObj.current || !heatmapRef.current) return

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const filtered = filterStatus === 'all' ? calls : calls.filter(c => c.status === filterStatus)

    const heatPoints: google.maps.LatLng[] = []

    filtered.forEach(call => {
      const pos = { lat: call.lat, lng: call.lng }
      heatPoints.push(new google.maps.LatLng(call.lat, call.lng))

      const hex = STATUS_COLORS[call.status].hex
      const marker = new google.maps.Marker({
        position: pos,
        map: mapObj.current!,
        title: call.business_name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: hex,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      })

      marker.addListener('click', () => {
        setExisting(call)
        setPreset(null)
        setModalOpen(true)
      })

      markersRef.current.push(marker)
    })

    heatmapRef.current.setData(heatPoints)
    heatmapRef.current.setMap(showHeatmap ? mapObj.current : null)
  }, [calls, filterStatus, showHeatmap, mapsLoaded])

  const STATUSES: { value: CallStatus | 'all'; label: string }[] = [
    { value: 'all',            label: 'All' },
    { value: 'pending',        label: 'Pending' },
    { value: 'interested',     label: 'Interested' },
    { value: 'not_interested', label: 'Not Interested' },
    { value: 'callback',       label: 'Call Back' },
    { value: 'closed',         label: 'Closed' },
  ]

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Hidden search input — Google Maps will move it into the map */}
      <input
        id="map-search"
        type="text"
        placeholder="Search businesses…"
        className="hidden-map-search absolute z-10 mt-3 ml-3 px-4 py-2.5 bg-white rounded-lg shadow-md border border-gray-200 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        style={{ display: 'block' }}
      />

      {/* Controls overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* Heatmap toggle */}
        <button
          onClick={() => setShowHeatmap(h => !h)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium shadow-md border transition-colors ${
            showHeatmap
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {showHeatmap ? 'Heatmap ON' : 'Heatmap OFF'}
        </button>

        {/* Status filter */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`block w-full text-left px-3 py-1.5 text-xs font-medium transition-colors border-b last:border-0 border-gray-100 ${
                filterStatus === s.value
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-3 z-10 bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2.5 text-xs space-y-1">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colors.hex }} />
            <span className="text-gray-600 capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-1">
          <span className="text-gray-500">Click any business to log a call</span>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full" />

      <CallModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchCalls}
        existing={existing}
        preset={preset}
      />
    </div>
  )
}
