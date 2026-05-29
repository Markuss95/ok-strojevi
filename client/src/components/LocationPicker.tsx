import { useEffect, useRef, useState } from 'react';
import { SiteLocation } from '../api/types';
import { loadGoogleMaps } from '../lib/googleMaps';

// Osijek — sensible default center for Osijek-Koteks gradilišta.
const DEFAULT_CENTER = { lat: 45.555, lng: 18.6955 };

interface Props {
  /** Initial location, used only to place the marker when the picker mounts. */
  initial: SiteLocation | null;
  /** Called whenever the user picks or moves the point. */
  onChange: (location: SiteLocation) => void;
}

/**
 * Interactive Google Map for choosing a gradilište's location. Supports
 * address search (Places autocomplete), clicking the map, and dragging the
 * marker. The street address is filled in by reverse geocoding but the
 * coordinates are always authoritative.
 */
export function LocationPicker({ initial, onChange }: Props) {
  const mapElRef = useRef<HTMLDivElement>(null);
  const searchElRef = useRef<HTMLInputElement>(null);

  const mapsRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const selectionRef = useRef<SiteLocation | null>(initial);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [error, setError] = useState<string | null>(null);
  const [display, setDisplay] = useState<SiteLocation | null>(initial);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapElRef.current) return;
        mapsRef.current = maps;
        geocoderRef.current = new maps.Geocoder();

        const hasInitial = !!initial;
        const center = initial ?? DEFAULT_CENTER;
        const map = new maps.Map(mapElRef.current, {
          center,
          zoom: hasInitial ? 16 : 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const marker = new maps.Marker({
          map,
          draggable: true,
          position: center,
          visible: hasInitial,
        });
        markerRef.current = marker;

        // Commit a coordinate, then reverse-geocode to fill the address.
        const commit = (lat: number, lng: number, knownAddress?: string) => {
          marker.setPosition({ lat, lng });
          marker.setVisible(true);
          const next: SiteLocation = { lat, lng };
          if (knownAddress) next.address = knownAddress;
          selectionRef.current = next;
          setDisplay(next);
          onChangeRef.current(next);

          if (!knownAddress && geocoderRef.current) {
            geocoderRef.current.geocode(
              { location: { lat, lng } },
              (results: any[], status: string) => {
                if (status === 'OK' && results?.[0]) {
                  const merged: SiteLocation = {
                    lat,
                    lng,
                    address: results[0].formatted_address,
                  };
                  // Ignore if the user moved the marker again meanwhile.
                  if (
                    selectionRef.current?.lat === lat &&
                    selectionRef.current?.lng === lng
                  ) {
                    selectionRef.current = merged;
                    setDisplay(merged);
                    onChangeRef.current(merged);
                  }
                }
              }
            );
          }
        };

        map.addListener('click', (e: any) => {
          commit(e.latLng.lat(), e.latLng.lng());
        });
        marker.addListener('dragend', (e: any) => {
          commit(e.latLng.lat(), e.latLng.lng());
        });

        // Places autocomplete search box.
        if (searchElRef.current && maps.places) {
          const autocomplete = new maps.places.Autocomplete(
            searchElRef.current,
            { fields: ['geometry', 'formatted_address', 'name'] }
          );
          autocomplete.bindTo('bounds', map);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location) return;
            const loc = place.geometry.location;
            map.panTo(loc);
            map.setZoom(16);
            commit(
              loc.lat(),
              loc.lng(),
              place.formatted_address || place.name
            );
          });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
    // Mount-once: the picker is remounted whenever the modal reopens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={searchElRef}
        type="text"
        placeholder="Pretraži adresu…"
        className="field"
        // Prevent the Enter key from submitting the surrounding form while
        // the user is choosing an autocomplete suggestion.
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
      />
      <div
        ref={mapElRef}
        className="w-full h-72 rounded-md border border-slate-200 bg-slate-100"
      />
      {display ? (
        <p className="text-xs text-slate-600">
          {display.address ? <span>{display.address} · </span> : null}
          {display.lat.toFixed(6)}, {display.lng.toFixed(6)}
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Pretražite adresu ili kliknite na kartu za odabir lokacije.
        </p>
      )}
    </div>
  );
}
