import { useEffect, useMemo, useState } from 'react';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
import tzlookup from 'tz-lookup';
import countries from 'world-countries';
import atlas from 'world-atlas/countries-10m.json';
import { Clock3, Compass, Globe2, Languages, MapPin, Pause, Play, Search, Sun, Waves } from 'lucide-react';
import Globe, { type GlobePoint } from '@/components/ui/globe';

type AtlasFeature = { id?: string | number; properties?: { name?: string }; geometry: unknown; type: 'Feature' };
type Country = (typeof countries)[number];
type Place = GlobePoint & { name: string; countryCode?: string };

const places: Place[] = [
  { name: '北京', lat: 39.9042, lng: 116.4074, countryCode: 'CN' },
  { name: '东京', lat: 35.6762, lng: 139.6503, countryCode: 'JP' },
  { name: '伦敦', lat: 51.5072, lng: -0.1276, countryCode: 'GB' },
  { name: '纽约', lat: 40.7128, lng: -74.006, countryCode: 'US' },
  { name: '巴黎', lat: 48.8566, lng: 2.3522, countryCode: 'FR' },
  { name: '悉尼', lat: -33.8688, lng: 151.2093, countryCode: 'AU' },
  { name: '迪拜', lat: 25.2048, lng: 55.2708, countryCode: 'AE' },
  { name: '孟买', lat: 19.076, lng: 72.8777, countryCode: 'IN' },
  { name: '开罗', lat: 30.0444, lng: 31.2357, countryCode: 'EG' },
  { name: '里约热内卢', lat: -22.9068, lng: -43.1729, countryCode: 'BR' },
  { name: '开普敦', lat: -33.9249, lng: 18.4241, countryCode: 'ZA' },
  { name: '新加坡', lat: 1.3521, lng: 103.8198, countryCode: 'SG' },
];

const atlasFeatures = (feature(atlas as never, (atlas as never as { objects: { countries: never } }).objects.countries) as unknown as { features: AtlasFeature[] }).features;
const countryByNumber = new Map(countries.map((country) => [country.ccn3, country]));
const regionNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
const languageNames = new Intl.DisplayNames(['zh-CN'], { type: 'language' });

function countryAt(point: GlobePoint): Country | undefined {
  const match = atlasFeatures.find((item) => geoContains(item as never, [point.lng, point.lat]));
  return match ? countryByNumber.get(String(match.id).padStart(3, '0')) : undefined;
}

function coordinateText(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
}

function offsetText(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(now);
  return parts.find((part) => part.type === 'timeZoneName')?.value.replace('GMT', 'UTC') ?? 'UTC';
}

export default function App() {
  const [selected, setSelected] = useState<Place>(places[0]);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const country = useMemo(() => selected.countryCode
    ? countries.find((item) => item.cca2 === selected.countryCode)
    : countryAt(selected), [selected]);
  const countryName = country ? (regionNames.of(country.cca2) || country.name.common) : '公海 / 海洋';
  const timeZone = useMemo(() => {
    if (!country) return null;
    try { return tzlookup(selected.lat, selected.lng); } catch { return null; }
  }, [selected, country]);
  const solarOffset = Math.round(selected.lng / 15);
  const solarZone = `Etc/GMT${solarOffset <= 0 ? '+' : '-'}${Math.abs(solarOffset)}`;
  const activeZone = timeZone || solarZone;
  const time = new Intl.DateTimeFormat('zh-CN', { timeZone: activeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
  const date = new Intl.DateTimeFormat('zh-CN', { timeZone: activeZone, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(now);
  const languageList = Object.entries(country?.languages ?? {}).map(([code, native]) => ({
    code,
    name: languageNames.of(code) || native,
    native,
  }));
  const filtered = places.filter((place) => place.name.includes(query.trim()) ||
    (place.countryCode && (regionNames.of(place.countryCode) || '').includes(query.trim())));

  const selectPoint = (point: GlobePoint) => {
    setSelected({ ...point, name: '所选位置' });
    setSpinning(false);
  };

  return (
    <div className="site-shell">
      <div className="stars stars-one" aria-hidden="true" />
      <div className="stars stars-two" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="地球时语首页"><span className="brand-icon"><Globe2 size={21} strokeWidth={1.7} /></span><span>地球<span className="brand-accent">时语</span></span></a>
        <div className="topbar-right"><span className="live-dot" aria-hidden="true" /><span>实时探索世界</span></div>
      </header>

      <main id="top" className="main-grid">
        <section className="intro-column" aria-labelledby="page-title">
          <div className="eyebrow"><span className="eyebrow-line" /> DISCOVER THE WORLD</div>
          <h1 id="page-title">同一个地球，<br /><span>不同的此刻。</span></h1>
          <p className="lead">轻点地球上的任意位置，发现那里的时间与语言。每一次探索，都是与世界的一次相遇。</p>

          <div className="place-card" aria-live="polite">
            <div className="card-topline"><span><MapPin size={16} /> 当前探索地点</span><span className="card-live"><span /> LIVE</span></div>
            <div className="place-heading"><div><p className="place-name">{selected.name === '所选位置' ? countryName : selected.name}</p><p className="country-name">{selected.name === '所选位置' ? '所选坐标' : countryName}</p></div><span className="place-icon"><Compass size={23} /></span></div>
            <div className="divider" />
            <div className="time-label"><Clock3 size={17} /> 当地时间 <span>{timeZone ? offsetText(timeZone, now) : `太阳时 UTC${solarOffset >= 0 ? '+' : ''}${solarOffset}`}</span></div>
            <div className="time-value" aria-label={`当地时间 ${time}`}>{time}</div>
            <div className="date-value">{date}</div>
            <div className="divider" />
            <div className="language-label"><Languages size={18} /> {country ? '常用语言' : '语言信息'}</div>
            {languageList.length ? <div className="language-list">{languageList.map((lang, index) => <span className="language-chip" key={`${lang.code}-${index}`}>{lang.name}<small>{lang.native}</small></span>)}</div> : <p className="ocean-note">这里是海洋，没有对应的国家语言；时间按经度估算。</p>}
            <div className="coordinates"><span>{coordinateText(selected.lat, 'N', 'S')}</span><i /> <span>{coordinateText(selected.lng, 'E', 'W')}</span></div>
          </div>

          <div className="city-section">
            <div className="city-heading"><span>快速前往</span><span>POPULAR PLACES</span></div>
            <div className="search-box"><Search size={18} aria-hidden="true" /><input aria-label="搜索快捷城市或国家" placeholder="搜索城市或国家…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <div className="city-list">{filtered.length ? filtered.map((place) => <button key={place.name} type="button" className={selected.name === place.name ? 'city-button active' : 'city-button'} onClick={() => { setSelected(place); setSpinning(false); }}><span>{place.name}</span><small>{regionNames.of(place.countryCode!)}</small></button>) : <p className="no-results">没有找到匹配的快捷城市。仍可直接点击地球选择地点。</p>}</div>
          </div>
        </section>

        <section className="visual-column" aria-label="交互式地球">
          <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
          <div className="globe-overline"><span className="overline-pip" /> INTERACTIVE EARTH <span className="overline-index">01 / 01</span></div>
          <Globe selected={selected} onSelect={selectPoint} spinning={spinning} />
          <div className="globe-footer"><div className="gesture-hint"><Sun size={17} /><span>拖动旋转 · 滚轮缩放 · 点击探索</span></div><button className="rotation-button" type="button" aria-label={spinning ? '暂停地球旋转' : '开始地球旋转'} aria-pressed={spinning} onClick={() => setSpinning(!spinning)}>{spinning ? <Pause size={16} /> : <Play size={16} />}<span>{spinning ? '暂停旋转' : '自动旋转'}</span></button></div>
        </section>
      </main>

      <footer className="footer"><span>地球时语 <span className="footer-separator">/</span> 一颗星球，无数个此刻</span><span><Waves size={15} /> 时间随地点实时更新</span></footer>
    </div>
  );
}
