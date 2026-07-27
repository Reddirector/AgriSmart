import { AlertBanner,Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { searchLandLocation,type LandSearchResult } from '@/services/agrismartApi';
import type { GeoPoint } from '@/types';
import { Crosshair,LocateFixed,MapPin,MousePointer2,RotateCcw,Search,Undo2,Upload } from 'lucide-react';
import { useEffect,useMemo,useState,type ChangeEvent,type FormEvent } from 'react';
import { CircleMarker,MapContainer,Polygon,TileLayer,useMap,useMapEvents } from 'react-leaflet';

const ACRES_PER_SQUARE_METRE = 1 / 4046.8564224;
const DEFAULT_CENTER: GeoPoint = { lat: 20.5937, lng: 78.9629 };

function calculatePolygonAreaAcres(points: GeoPoint[]) {
  if (points.length < 3) return 0;
  const centroidLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
  const metresPerDegreeLat = 111_320;
  const metresPerDegreeLng = 111_320 * Math.max(0.2, Math.cos((centroidLat * Math.PI) / 180));
  const origin = points[0];
  const projected = points.map((point) => ({
    x: (point.lng - origin.lng) * metresPerDegreeLng,
    y: (point.lat - origin.lat) * metresPerDegreeLat,
  }));
  let area = 0;
  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area / 2) * ACRES_PER_SQUARE_METRE;
}

function rectangleFromArea(center: GeoPoint, areaAcres: number): GeoPoint[] {
  const sideM = Math.sqrt(Math.max(0.1, areaAcres) / ACRES_PER_SQUARE_METRE);
  const halfSideM = sideM / 2;
  const latDelta = halfSideM / 111_320;
  const lngDelta = halfSideM / (111_320 * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)));
  return [
    { lat: center.lat - latDelta, lng: center.lng - lngDelta },
    { lat: center.lat - latDelta, lng: center.lng + lngDelta },
    { lat: center.lat + latDelta, lng: center.lng + lngDelta },
    { lat: center.lat + latDelta, lng: center.lng - lngDelta },
  ];
}

function BoundaryClickCollector({ disabled, onPoint }: { disabled: boolean; onPoint: (point: GeoPoint) => void }) {
  useMapEvents({
    click(event) {
      if (!disabled) onPoint({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function BoundaryViewport({ points, center }: { points: GeoPoint[]; center: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points.map((point): [number, number] => [point.lat, point.lng]), { padding: [28, 28], maxZoom: 19 });
    } else {
      map.setView([center.lat, center.lng], 16);
    }
  }, [center.lat, center.lng, map, points]);
  return null;
}

export function FarmBoundaryMapper({
  value,
  onChange,
  initialCenter,
  declaredAreaAcres,
  readOnly = false,
  className,
}: {
  value: GeoPoint[];
  onChange?: (points: GeoPoint[], calculatedAreaAcres: number, source: 'gps' | 'manual' | 'area_estimate' | 'imported' | 'search') => void;
  initialCenter?: GeoPoint;
  declaredAreaAcres?: number;
  readOnly?: boolean;
  className?: string;
}) {
  const [points, setPoints] = useState<GeoPoint[]>(value);
  const [center, setCenter] = useState<GeoPoint>(initialCenter || value[0] || DEFAULT_CENTER);
  const [coordinateText, setCoordinateText] = useState('');
  const [message, setMessage] = useState('');
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LandSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const calculatedAreaAcres = useMemo(() => calculatePolygonAreaAcres(points), [points]);

  useEffect(() => setPoints(value), [value]);

  const commit = (next: GeoPoint[], source: 'gps' | 'manual' | 'area_estimate' | 'imported' | 'search') => {
    setPoints(next);
    if (next[0]) setCenter(next[0]);
    onChange?.(next, calculatePolygonAreaAcres(next), source);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Location access is not available in this browser. You can paste GPS points or tap the map manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCenter(nextCenter);
        setLocating(false);
        setMessage('Current location found. Tap the map corners in order, or generate a starter boundary from acreage.');
      },
      () => {
        setLocating(false);
        setMessage('Location permission was not granted. Paste GPS points or tap the map manually.');
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 20_000 },
    );
  };

  const generateFromArea = () => {
    const area = Number(declaredAreaAcres);
    if (!Number.isFinite(area) || area <= 0) {
      setMessage('Enter the farm acreage first, then generate a starter boundary.');
      return;
    }
    commit(rectangleFromArea(center, area), 'area_estimate');
    setMessage('A square starter boundary was generated from the declared acreage. Adjust it by resetting and tapping the actual corners when possible.');
  };

  const searchLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim().length < 3) {
      setMessage('Enter at least three characters to search for a village, landmark, or address.');
      return;
    }
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await searchLandLocation(searchQuery);
      setSearchResults(results);
      setMessage(results.length > 0 ? 'Choose a result to centre the map, then trace the exact farm boundary.' : 'No matching location was found. Try a nearby village, road, or landmark.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Location search could not be completed.');
    } finally {
      setSearching(false);
    }
  };

  const chooseSearchResult = (result: LandSearchResult) => {
    const nextCenter = { lat: result.lat, lng: result.lng };
    setCenter(nextCenter);
    setSearchResults([]);
    setSearchQuery(result.displayName);
    setMessage('Map centred on the selected location. Tap the field corners in order, or generate a starter boundary from acreage.');
  };

  const importCoordinates = () => {
    const parsed = coordinateText
      .split(/\n|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((part) => Number(part.trim())))
      .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]))
      .map(([lat, lng]) => ({ lat, lng }));

    if (parsed.length < 3) {
      setMessage('Enter at least three valid points. Use one latitude,longitude pair per line.');
      return;
    }
    commit(parsed, 'imported');
    setCoordinateText('');
    setMessage(`${parsed.length} GPS boundary points were imported.`);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!readOnly && (
        <div className="grid gap-3 rounded-2xl border border-brand-border bg-gradient-to-br from-white to-[#EEF5F0] p-4 md:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-brand-text"><MousePointer2 className="h-4 w-4 text-brand-primary" />Easy boundary mapping</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-muted">Use GPS, tap each corner clockwise, or generate a starter polygon from your acreage. The calculated area updates automatically.</p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button variant="outline" size="sm" loading={locating} onClick={useCurrentLocation} icon={<LocateFixed className="h-4 w-4" />}>Use my GPS</Button>
            <Button variant="secondary" size="sm" onClick={generateFromArea} icon={<Crosshair className="h-4 w-4" />}>Generate from area</Button>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="relative rounded-2xl border border-brand-border bg-white/80 p-4 shadow-card backdrop-blur">
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={searchLocation}>
            <div className="flex-1">
              <label className="label" htmlFor="farm-location-search">Find the farm area</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <input
                  id="farm-location-search"
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                  placeholder="Village, road, landmark, or address"
                  autoComplete="street-address"
                />
              </div>
            </div>
            <Button className="sm:mt-6" type="submit" loading={searching} disabled={searchQuery.trim().length < 3} icon={<Search className="h-4 w-4" />}>Search map</Button>
          </form>
          {searchResults.length > 0 && (
            <div className="absolute inset-x-4 top-[92px] z-[650] max-h-60 overflow-y-auto rounded-xl border border-brand-border bg-white p-1 shadow-lift">
              {searchResults.map((result) => (
                <button key={result.id} type="button" className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-brand-soft" onClick={() => chooseSearchResult(result)}>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                  <span className="leading-relaxed text-brand-text">{result.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {message && <AlertBanner type="info" title="Mapping assistant" message={message} onClose={() => setMessage('')} />}

      <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-[#DFEAE2] shadow-soft">
        <MapContainer center={[center.lat, center.lng]} zoom={16} scrollWheelZoom className="h-[360px] w-full sm:h-[430px]">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundaryClickCollector disabled={readOnly} onPoint={(point) => commit([...points, point], 'manual')} />
          <BoundaryViewport points={points} center={center} />
          {points.map((point, index) => (
            <CircleMarker key={`${point.lat}-${point.lng}-${index}`} center={[point.lat, point.lng]} radius={7} pathOptions={{ color: '#ffffff', fillColor: '#124C35', fillOpacity: 1, weight: 2 }} />
          ))}
          {points.length >= 3 && <Polygon positions={points.map((point): [number, number] => [point.lat, point.lng])} pathOptions={{ color: '#124C35', fillColor: '#54A578', fillOpacity: 0.24, weight: 3 }} />}
        </MapContainer>
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-soft backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">Mapped area</p>
          <p className="text-lg font-bold text-brand-primary">{calculatedAreaAcres.toFixed(2)} acres</p>
          <p className="text-[10px] text-brand-muted">{points.length} boundary points</p>
        </div>
      </div>

      {!readOnly && (
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="farm-coordinate-import" className="label">Paste GPS corners</label>
            <textarea
              id="farm-coordinate-import"
              className="input min-h-24 resize-y font-mono text-xs"
              value={coordinateText}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCoordinateText(event.target.value)}
              placeholder={'18.532410, 73.847120\n18.532420, 73.848020\n18.531700, 73.848030\n18.531690, 73.847110'}
            />
            <p className="mt-1 text-xs text-brand-muted">One latitude,longitude pair per line. Import points in boundary order.</p>
          </div>
          <div className="flex flex-wrap content-end gap-2 lg:max-w-52">
            <Button variant="outline" size="sm" onClick={importCoordinates} disabled={!coordinateText.trim()} icon={<Upload className="h-4 w-4" />}>Import points</Button>
            <Button variant="ghost" size="sm" onClick={() => commit(points.slice(0, -1), 'manual')} disabled={points.length === 0} icon={<Undo2 className="h-4 w-4" />}>Undo</Button>
            <Button variant="ghost" size="sm" onClick={() => commit([], 'manual')} disabled={points.length === 0} icon={<RotateCcw className="h-4 w-4" />}>Reset</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['1', 'Locate', 'Use GPS or search visually'],
          ['2', 'Outline', 'Tap corners in order'],
          ['3', 'Verify', 'Compare mapped and declared area'],
          ['4', 'Save', 'Submit boundary for verification'],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-xl border border-brand-border bg-white/75 p-3">
            <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-primary">{number}</span><p className="text-xs font-bold text-brand-text">{title}</p></div>
            <p className="mt-1 text-[10px] leading-relaxed text-brand-muted">{description}</p>
          </div>
        ))}
      </div>

      {points.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-brand-border bg-brand-cream/70 p-3 text-xs text-brand-muted">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <p>Boundary centre: {center.lat.toFixed(6)}, {center.lng.toFixed(6)}. GPS accuracy and legal ownership must still be verified before autonomous flight.</p>
        </div>
      )}
    </div>
  );
}

export { calculatePolygonAreaAcres };
