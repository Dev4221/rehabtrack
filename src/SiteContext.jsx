import { createContext, useContext, useState } from 'react'

const SiteContext = createContext()

const sites = [
  {
    id: 'roy-hill',
    name: 'Roy Hill',
    label: 'Roy Hill - Pilbara',
    operator: 'Roy Hill Holdings',
    region: 'Pilbara, WA',
    recovered: 61,
    growthRate: 8.2,
    bond: 48000000,
    release: 'Q3 2027',
    area: 2840,
    status: 'on-track',
    alerts: 2,
    center: [-22.6, 119.3],
    zoom: 10,
  },
  {
    id: 'cloudbreak',
    name: 'Cloudbreak',
    label: 'Cloudbreak - Pilbara',
    operator: 'Fortescue Metals',
    region: 'Pilbara, WA',
    recovered: 71,
    growthRate: 6.1,
    bond: 62000000,
    release: 'Q1 2027',
    area: 4100,
    status: 'on-track',
    alerts: 0,
    center: [-22.3, 119.7],
    zoom: 10,
  },
  {
    id: 'brockman',
    name: 'Brockman 4',
    label: 'Brockman 4 - Pilbara',
    operator: 'Rio Tinto',
    region: 'Pilbara, WA',
    recovered: 44,
    growthRate: 4.2,
    bond: 35000000,
    release: 'Q1 2029',
    area: 2100,
    status: 'slow',
    alerts: 1,
    center: [-22.8, 117.2],
    zoom: 10,
  },
  {
    id: 'christmas-creek',
    name: 'Christmas Creek',
    label: 'Christmas Creek - Pilbara',
    operator: 'Fortescue Metals',
    region: 'Pilbara, WA',
    recovered: 29,
    growthRate: 2.8,
    bond: 41000000,
    release: 'Q3 2030+',
    area: 3200,
    status: 'at-risk',
    alerts: 3,
    center: [-22.1, 119.6],
    zoom: 10,
  },
]

export function SiteProvider({ children }) {
  const [selectedSite, setSelectedSite] = useState(sites[0])
  const [reportAlerts, setReportAlerts] = useState([])

  const addAlertToReport = (alert, siteName) => {
    const key = `${siteName}-${alert.id}`
    setReportAlerts(prev => {
      if (prev.find(a => a.key === key)) return prev
      return [...prev, { ...alert, key, siteName }]
    })
  }

  const removeAlertFromReport = (key) => {
    setReportAlerts(prev => prev.filter(a => a.key !== key))
  }

  const clearReportAlerts = () => setReportAlerts([])

  return (
    <SiteContext.Provider value={{
      selectedSite,
      setSelectedSite,
      sites,
      reportAlerts,
      addAlertToReport,
      removeAlertFromReport,
      clearReportAlerts,
    }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  return useContext(SiteContext)
}