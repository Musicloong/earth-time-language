import { useEffect, useRef, useState } from 'react';
import GlobeGL from 'react-globe.gl';
import type { GlobeMethods } from 'react-globe.gl';

export type GlobePoint = { lat: number; lng: number };

type Props = {
  selected: GlobePoint;
  onSelect: (point: GlobePoint) => void;
  spinning: boolean;
};

export default function Globe({ selected, onSelect, spinning }: Props) {
  const ref = useRef<GlobeMethods | undefined>(undefined);
  const shell = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(650);

  useEffect(() => {
    if (!shell.current) return;
    const observer = new ResizeObserver(([entry]) => setSize(Math.max(280, Math.min(entry.contentRect.width, 750))));
    observer.observe(shell.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controls = ref.current?.controls();
    if (!controls) return;
    controls.autoRotate = spinning;
    controls.autoRotateSpeed = 0.42;
    controls.enableZoom = true;
  }, [spinning, size]);

  useEffect(() => {
    ref.current?.pointOfView({ lat: selected.lat, lng: selected.lng, altitude: 2.25 }, 700);
  }, [selected.lat, selected.lng]);

  return (
    <div ref={shell} className="globe-shell" role="img" aria-label="可拖动并点击的三维地球；也可通过下方城市按钮选择地点">
      <div className="globe-halo" aria-hidden="true" />
      <GlobeGL
        ref={ref}
        width={size}
        height={size}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={`${import.meta.env.BASE_URL}earth-blue-marble.jpg`}
        bumpImageUrl={`${import.meta.env.BASE_URL}earth-topology.png`}
        showAtmosphere
        atmosphereColor="#4da8ff"
        atmosphereAltitude={0.18}
        onGlobeClick={({ lat, lng }) => onSelect({ lat, lng })}
        pointsData={[{ ...selected, color: '#f4c876' }]}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.05}
        pointRadius={0.5}
        ringsData={[selected]}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => (t: number) => `rgba(244,200,118,${1 - t})`}
        ringMaxRadius={5}
        ringPropagationSpeed={1.8}
        ringRepeatPeriod={1300}
      />
    </div>
  );
}
