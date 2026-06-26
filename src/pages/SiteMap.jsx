import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useSite } from '../SiteContext'

const allSiteData = {
  'roy-hill': {
    features: [
      { zone: 'Zone A1', status: 'recovering', change: 'improving', recovered: 80, prevRecovered: 65, area: 420, desc: 'Bond milestone reached, 80% recovered', coords: [[[119.15,-22.35],[119.30,-22.35],[119.30,-22.45],[119.15,-22.45],[119.15,-22.35]]] },
      { zone: 'Zone A2', status: 'recovering', change: 'improving', recovered: 72, prevRecovered: 58, area: 380, desc: 'On track, 72% recovered', coords: [[[119.35,-22.35],[119.55,-22.35],[119.55,-22.45],[119.35,-22.45],[119.35,-22.35]]] },
      { zone: 'Zone B1', status: 'early', change: 'stable', recovered: 52, prevRecovered: 48, area: 290, desc: 'Early stage recovery, 52%', coords: [[[119.15,-22.50],[119.30,-22.50],[119.30,-22.60],[119.15,-22.60],[119.15,-22.50]]] },
      { zone: 'Zone B2', status: 'attention', change: 'declining', recovered: 44, prevRecovered: 50, area: 340, desc: 'Possible weed growth detected, ground inspection needed', coords: [[[119.00,-22.45],[119.12,-22.45],[119.12,-22.58],[119.00,-22.58],[119.00,-22.45]]] },
      { zone: 'Zone B3', status: 'early', change: 'stable', recovered: 48, prevRecovered: 45, area: 260, desc: 'Early stage recovery, 48%', coords: [[[119.35,-22.50],[119.55,-22.50],[119.55,-22.60],[119.35,-22.60],[119.35,-22.50]]] },
      { zone: 'Zone C1', status: 'early', change: 'improving', recovered: 38, prevRecovered: 30, area: 220, desc: 'Early stage recovery, 38%', coords: [[[119.15,-22.65],[119.30,-22.65],[119.30,-22.75],[119.15,-22.75],[119.15,-22.65]]] },
      { zone: 'Zone C2', status: 'attention', change: 'stable', recovered: 32, prevRecovered: 30, area: 180, desc: 'Needs attention, 32% recovered', coords: [[[119.35,-22.65],[119.55,-22.65],[119.55,-22.75],[119.35,-22.75],[119.35,-22.65]]] },
      { zone: 'Zone C3', status: 'critical', change: 'declining', recovered: 29, prevRecovered: 42, area: 140, desc: 'Vegetation loss detected, rainfall erosion 2 days ago', coords: [[[119.15,-22.78],[119.30,-22.78],[119.30,-22.88],[119.15,-22.88],[119.15,-22.78]]] },
      { zone: 'Zone D1', status: 'infrastructure', change: 'stable', recovered: 0, prevRecovered: 0, area: 300, desc: 'Infrastructure, processing facilities', coords: [[[119.30,-22.50],[119.35,-22.50],[119.35,-22.60],[119.30,-22.60],[119.30,-22.50]]] },
    ]
  },
  'cloudbreak': {
    features: [
      { zone: 'Zone A1', status: 'recovering', change: 'improving', recovered: 82, prevRecovered: 68, area: 520, desc: 'Bond milestone reached, 82% recovered', coords: [[[119.55,-22.15],[119.72,-22.15],[119.72,-22.27],[119.55,-22.27],[119.55,-22.15]]] },
      { zone: 'Zone A2', status: 'recovering', change: 'improving', recovered: 76, prevRecovered: 61, area: 480, desc: 'On track, 76% recovered', coords: [[[119.75,-22.15],[119.90,-22.15],[119.90,-22.27],[119.75,-22.27],[119.75,-22.15]]] },
      { zone: 'Zone B1', status: 'recovering', change: 'improving', recovered: 68, prevRecovered: 55, area: 380, desc: 'Recovering well, 68%', coords: [[[119.55,-22.30],[119.72,-22.30],[119.72,-22.42],[119.55,-22.42],[119.55,-22.30]]] },
      { zone: 'Zone B2', status: 'early', change: 'stable', recovered: 62, prevRecovered: 58, area: 420, desc: 'Early stage recovery, 62%', coords: [[[119.75,-22.30],[119.90,-22.30],[119.90,-22.42],[119.75,-22.42],[119.75,-22.30]]] },
      { zone: 'Zone C1', status: 'early', change: 'stable', recovered: 55, prevRecovered: 51, area: 340, desc: 'Early stage recovery, 55%', coords: [[[119.55,-22.45],[119.72,-22.45],[119.72,-22.57],[119.55,-22.57],[119.55,-22.45]]] },
      { zone: 'Zone D1', status: 'infrastructure', change: 'stable', recovered: 0, prevRecovered: 0, area: 280, desc: 'Infrastructure, processing facilities', coords: [[[119.72,-22.30],[119.75,-22.30],[119.75,-22.42],[119.72,-22.42],[119.72,-22.30]]] },
    ]
  },
  'brockman': {
    features: [
      { zone: 'Zone A1', status: 'recovering', change: 'improving', recovered: 58, prevRecovered: 44, area: 320, desc: 'On track, 58% recovered', coords: [[[117.05,-22.65],[117.20,-22.65],[117.20,-22.78],[117.05,-22.78],[117.05,-22.65]]] },
      { zone: 'Zone B1', status: 'early', change: 'stable', recovered: 48, prevRecovered: 44, area: 280, desc: 'Early stage recovery, 48%', coords: [[[117.22,-22.65],[117.38,-22.65],[117.38,-22.78],[117.22,-22.78],[117.22,-22.65]]] },
      { zone: 'Zone C1', status: 'early', change: 'improving', recovered: 42, prevRecovered: 35, area: 240, desc: 'Early stage recovery, 42%', coords: [[[117.05,-22.80],[117.20,-22.80],[117.20,-22.93],[117.05,-22.93],[117.05,-22.80]]] },
      { zone: 'Zone D2', status: 'attention', change: 'declining', recovered: 24, prevRecovered: 30, area: 180, desc: 'Below target, recovery rate +2.1%/yr vs 6% required', coords: [[[117.22,-22.80],[117.38,-22.80],[117.38,-22.93],[117.22,-22.93],[117.22,-22.80]]] },
      { zone: 'Zone E1', status: 'early', change: 'stable', recovered: 38, prevRecovered: 35, area: 260, desc: 'Early stage recovery, 38%', coords: [[[116.90,-22.65],[117.03,-22.65],[117.03,-22.93],[116.90,-22.93],[116.90,-22.65]]] },
      { zone: 'Zone F1', status: 'infrastructure', change: 'stable', recovered: 0, prevRecovered: 0, area: 180, desc: 'Infrastructure, processing facilities', coords: [[[117.20,-22.65],[117.22,-22.65],[117.22,-22.78],[117.20,-22.78],[117.20,-22.65]]] },
    ]
  },
  'christmas-creek': {
    features: [
      { zone: 'Zone A1', status: 'early', change: 'stable', recovered: 42, prevRecovered: 38, area: 380, desc: 'Below target, 42% recovered', coords: [[[119.50,-21.98],[119.65,-21.98],[119.65,-22.12],[119.50,-22.12],[119.50,-21.98]]] },
      { zone: 'Zone B1', status: 'early', change: 'stable', recovered: 35, prevRecovered: 32, area: 340, desc: 'Early stage recovery, 35%', coords: [[[119.68,-21.98],[119.82,-21.98],[119.82,-22.12],[119.68,-22.12],[119.68,-21.98]]] },
      { zone: 'Zone C1', status: 'attention', change: 'declining', recovered: 28, prevRecovered: 33, area: 280, desc: 'Needs attention, 28% recovered', coords: [[[119.50,-22.15],[119.65,-22.15],[119.65,-22.28],[119.50,-22.28],[119.50,-22.15]]] },
      { zone: 'Zone E1', status: 'critical', change: 'declining', recovered: 12, prevRecovered: 20, area: 240, desc: 'Critical, only 12% recovered. Urgent intervention required.', coords: [[[119.68,-22.15],[119.82,-22.15],[119.82,-22.28],[119.68,-22.28],[119.68,-22.15]]] },
      { zone: 'Zone E3', status: 'critical', change: 'declining', recovered: 18, prevRecovered: 28, area: 220, desc: 'Erosion spreading, 95 hectares now affected', coords: [[[119.50,-22.30],[119.65,-22.30],[119.65,-22.43],[119.50,-22.43],[119.50,-22.30]]] },
      { zone: 'Zone F2', status: 'attention', change: 'declining', recovered: 22, prevRecovered: 28, area: 180, desc: 'Weed encroachment, buffel grass across 62 hectares', coords: [[[119.68,-22.30],[119.82,-22.30],[119.82,-22.43],[119.68,-22.43],[119.68,-22.30]]] },
      { zone: 'Zone G1', status: 'infrastructure', change: 'stable', recovered: 0, prevRecovered: 0, area: 280, desc: 'Infrastructure, processing facilities', coords: [[[119.65,-22.15],[119.68,-22.15],[119.68,-22.28],[119.65,-22.28],[119.65,-22.15]]] },
    ]
  },
}

const statusColors = { recovering: '#2ea043', early: '#d29922', attention: '#f0883e', critical: '#f85149', infrastructure: '#484f58' }
const changeColors = { improving: '#2ea043', stable: '#484f58', declining: '#f85149' }
const statusLabels = { recovering: 'Recovering well', early: 'Early stage', attention: 'Needs attention', critical: 'Urgent, vegetation loss', infrastructure: 'Infrastructure' }
const changeLabels = { improving: 'Improving vs last year', stable: 'Stable, little change', declining: 'Declining, needs action' }

function DynamicLayers({ siteFeatures, layer }) {
  const map = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (!window.L) return
    if (layerRef.current) map.removeLayer(layerRef.current)
    const getColor = (f) => layer === 'change' ? changeColors[f.change] : statusColors[f.status]
    const geoJsonData = { type: 'FeatureCollection', features: siteFeatures.map(f => ({ type: 'Feature', properties: f, geometry: { type: 'Polygon', coordinates: f.coords } })) }
    layerRef.current = window.L.geoJSON(geoJsonData, {
      style: (feature) => ({ fillColor: getColor(feature.properties), fillOpacity: 0.7, color: getColor(feature.properties), weight: 2, opacity: 1 }),
      onEachFeature: (feature, leafletLayer) => {
        const p = feature.properties
        const changeVal = p.recovered - p.prevRecovered
        leafletLayer.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px">
            <div style="font-size:12px;font-weight:600;color:#1f2328;margin-bottom:4px">${p.zone}</div>
            <div style="font-size:10px;color:#656d76;margin-bottom:8px">${p.desc}</div>
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px">
              <span style="color:#9198a1">Land recovered</span>
              <span style="color:#1f2328;font-weight:500">${p.recovered > 0 ? p.recovered + '%' : '-'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px">
              <span style="color:#9198a1">Change vs last year</span>
              <span style="color:${changeVal >= 0 ? '#1a7f37' : '#cf222e'};font-weight:500">${p.recovered > 0 ? (changeVal > 0 ? '+' + changeVal + '%' : changeVal + '%') : '-'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:10px">
              <span style="color:#9198a1">Area</span>
              <span style="color:#1f2328;font-weight:500">${p.area} hectares</span>
            </div>
          </div>
        `, { className: 'rehabtrack-popup' })
      }
    }).addTo(map)
    return () => { if (layerRef.current) map.removeLayer(layerRef.current) }
  }, [siteFeatures, layer, map])
  return null
}

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center, zoom, map])
  return null
}

export default function SiteMap() {
  const { selectedSite } = useSite()
  const [view, setView] = useState('executive')
  const [layer, setLayer] = useState('status')
  const isAnalyst = view === 'analyst'
  const siteFeatures = (allSiteData[selectedSite.id] || allSiteData['roy-hill']).features
  const legend = layer === 'change'
    ? Object.entries(changeColors).map(([key, color]) => ({ color, label: changeLabels[key] }))
    : Object.entries(statusColors).map(([key, color]) => ({ color, label: statusLabels[key] }))

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Site map <span className="text-[var(--text-primary)]">/ {selectedSite.name}, {selectedSite.region}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
            <button onClick={() => setView('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
          </div>
          {['status', 'satellite', 'change'].map(l => (
            <button key={l} onClick={() => setLayer(l)} className={`px-3 py-1 rounded text-[9px] border transition-colors ${layer === l ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]' : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
              {l === 'status' ? 'Recovery status' : l === 'satellite' ? 'Satellite view' : 'Change over time'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <style>{`
            .rehabtrack-popup .leaflet-popup-content-wrapper { background: #ffffff; border: 1px solid #d0d7de; border-radius: 8px; color: #1f2328; }
            .rehabtrack-popup .leaflet-popup-tip { background: #ffffff; }
            .leaflet-container { background: #f6f8fa; }
          `}</style>
          <MapContainer center={[-22.6, 119.3]} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={true}>
            <TileLayer
              url={layer === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
              attribution='&copy; OpenStreetMap &copy; Carto'
            />
            <MapController center={selectedSite.center} zoom={selectedSite.zoom} />
            <DynamicLayers siteFeatures={siteFeatures} layer={layer} />
          </MapContainer>
        </div>

        <div className="w-52 bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col p-3 gap-4 flex-shrink-0">
          <div>
            <div className="text-[10px] font-medium text-[var(--text-primary)] mb-2">
              {layer === 'change' ? 'Change vs last year' : isAnalyst ? 'Classification legend' : 'What each colour means'}
            </div>
            <div className="flex flex-col gap-2">
              {legend.map(({ color, label }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }}></div>
                  <div className="text-[9px] text-[var(--text-primary)]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-[var(--text-primary)] mb-2">All zones</div>
            <div className="flex flex-col gap-1.5">
              {siteFeatures.map((f, i) => {
                const changeVal = f.recovered - f.prevRecovered
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: layer === 'change' ? changeColors[f.change] : statusColors[f.status] }}></div>
                      <span className="text-[9px] text-[var(--text-secondary)]">{f.zone}</span>
                    </div>
                    <span className="text-[9px] font-medium" style={{ color: layer === 'change' ? (changeVal >= 0 ? '#2ea043' : '#f85149') : 'var(--text-primary)' }}>
                      {f.recovered > 0 ? (layer === 'change' ? (changeVal > 0 ? `+${changeVal}%` : `${changeVal}%`) : `${f.recovered}%`) : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto text-[8px] text-[var(--text-muted)] leading-relaxed">
            Click any zone to see details. Sentinel-2 | Jun 18 2026
          </div>
        </div>
      </div>
    </div>
  )
}