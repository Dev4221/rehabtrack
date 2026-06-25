import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const siteData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        zone: 'Zone A1',
        status: 'recovering',
        recovered: 80,
        area: 420,
        desc: 'Bond milestone reached — 80% recovered',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.15, -22.35], [119.30, -22.35], [119.30, -22.45], [119.15, -22.45], [119.15, -22.35]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone A2',
        status: 'recovering',
        recovered: 72,
        area: 380,
        desc: 'On track — 72% recovered',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.35, -22.35], [119.55, -22.35], [119.55, -22.45], [119.35, -22.45], [119.35, -22.35]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone B1',
        status: 'early',
        recovered: 52,
        area: 290,
        desc: 'Early stage recovery — 52%',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.15, -22.50], [119.30, -22.50], [119.30, -22.60], [119.15, -22.60], [119.15, -22.50]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone B2',
        status: 'attention',
        recovered: 44,
        area: 340,
        desc: 'Possible weed growth detected — ground inspection needed',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.00, -22.45], [119.12, -22.45], [119.12, -22.58], [119.00, -22.58], [119.00, -22.45]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone B3',
        status: 'early',
        recovered: 48,
        area: 260,
        desc: 'Early stage recovery — 48%',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.35, -22.50], [119.55, -22.50], [119.55, -22.60], [119.35, -22.60], [119.35, -22.50]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone C1',
        status: 'early',
        recovered: 38,
        area: 220,
        desc: 'Early stage recovery — 38%',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.15, -22.65], [119.30, -22.65], [119.30, -22.75], [119.15, -22.75], [119.15, -22.65]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone C2',
        status: 'attention',
        recovered: 32,
        area: 180,
        desc: 'Needs attention — 32% recovered',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.35, -22.65], [119.55, -22.65], [119.55, -22.75], [119.35, -22.75], [119.35, -22.65]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone C3',
        status: 'critical',
        recovered: 29,
        area: 140,
        desc: 'Vegetation loss detected — rainfall erosion 2 days ago',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.15, -22.78], [119.30, -22.78], [119.30, -22.88], [119.15, -22.88], [119.15, -22.78]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        zone: 'Zone D1',
        status: 'infrastructure',
        recovered: 0,
        area: 300,
        desc: 'Infrastructure — processing facilities',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[119.30, -22.50], [119.35, -22.50], [119.35, -22.60], [119.30, -22.60], [119.30, -22.50]]]
      }
    },
  ]
}

const statusColors = {
  recovering: '#2ea043',
  early: '#d29922',
  attention: '#f0883e',
  critical: '#f85149',
  infrastructure: '#484f58',
}

const statusLabels = {
  recovering: 'Recovering well',
  early: 'Early stage',
  attention: 'Needs attention',
  critical: 'Urgent — vegetation loss',
  infrastructure: 'Infrastructure',
}

function ZoneLayer({ view }) {
  return (
    <GeoJSON
      key={view}
      data={siteData}
      style={(feature) => ({
        fillColor: statusColors[feature.properties.status],
        fillOpacity: 0.6,
        color: statusColors[feature.properties.status],
        weight: 1.5,
        opacity: 0.9,
      })}
      onEachFeature={(feature, layer) => {
        const p = feature.properties
        layer.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <div style="font-size:12px;font-weight:600;color:#e6edf3;margin-bottom:4px">${p.zone}</div>
            <div style="font-size:11px;color:#8b949e;margin-bottom:6px">${p.desc}</div>
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
              <span style="color:#484f58">${view === 'executive' ? 'Land recovered' : 'NDVI threshold met'}</span>
              <span style="color:#e6edf3;font-weight:500">${p.recovered}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:10px">
              <span style="color:#484f58">Area</span>
              <span style="color:#e6edf3;font-weight:500">${p.area} hectares</span>
            </div>
          </div>
        `, {
          className: 'rehabtrack-popup'
        })
      }}
    />
  )
}

export default function SiteMap() {
  const [view, setView] = useState('executive')
  const [layer, setLayer] = useState('status')

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Site map <span className="text-[#e6edf3]">/ Roy Hill, Pilbara WA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'executive' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Plain English</button>
            <button onClick={() => setView('technical')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'technical' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Technical</button>
          </div>
          {['status', 'satellite', 'change'].map(l => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={`px-3 py-1 rounded text-[9px] border transition-colors ${layer === l ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]' : 'bg-[#1c2128] border-[#30363d] text-[#8b949e]'}`}
            >
              {l === 'status' ? 'Recovery status' : l === 'satellite' ? 'Satellite view' : 'Change over time'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">

        {/* Map */}
        <div className="flex-1 relative">
          <style>{`
            .rehabtrack-popup .leaflet-popup-content-wrapper {
              background: #161b22;
              border: 1px solid #30363d;
              border-radius: 8px;
              color: #e6edf3;
            }
            .rehabtrack-popup .leaflet-popup-tip {
              background: #161b22;
            }
            .leaflet-container {
              background: #080e1a;
            }
          `}</style>
          <MapContainer
            center={[-22.6, 119.3]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url={layer === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              }
              attribution='&copy; OpenStreetMap &copy; Carto'
            />
            <ZoneLayer view={view} />
          </MapContainer>
        </div>

        {/* Right panel */}
        <div className="w-52 bg-[#161b22] border-l border-[#30363d] flex flex-col p-3 gap-4 flex-shrink-0">

          <div>
            <div className="text-[10px] font-medium text-[#e6edf3] mb-2">
              {view === 'executive' ? 'What each colour means' : 'Classification legend'}
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(statusColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }}></div>
                  <div>
                    <div className="text-[9px] text-[#e6edf3]">{statusLabels[key]}</div>
                    {view === 'technical' && (
                      <div className="text-[8px] text-[#484f58]">
                        {key === 'recovering' ? 'NDVI > 0.35' : key === 'early' ? 'NDVI 0.15–0.35' : key === 'attention' ? 'NDVI < 0.15' : key === 'critical' ? 'Z-score > 2σ drop' : 'Excluded'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium text-[#e6edf3] mb-2">All zones</div>
            <div className="flex flex-col gap-1.5">
              {siteData.features.map((f, i) => {
                const p = f.properties
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: statusColors[p.status] }}></div>
                      <span className="text-[9px] text-[#8b949e]">{p.zone}</span>
                    </div>
                    <span className="text-[9px] text-[#e6edf3] font-medium">{p.recovered > 0 ? `${p.recovered}%` : '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto text-[8px] text-[#484f58] leading-relaxed">
            Click any zone on the map to see its full details. Satellite data: Sentinel-2 · Jun 18 2026
          </div>
        </div>
      </div>
    </div>
  )
}