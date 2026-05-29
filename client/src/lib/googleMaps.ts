// Loads the Google Maps JS API on demand, exactly once, and resolves with the
// `google.maps` namespace. Subsequent calls reuse the same in-flight/loaded
// promise. The `places` library is requested for the autocomplete search box.

let loader: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      reject(
        new Error(
          'Google Maps API ključ nije konfiguriran (VITE_GOOGLE_MAPS_API_KEY).'
        )
      );
      return;
    }

    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const callbackName = '__okStrojeviInitGoogleMaps';
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key,
      libraries: 'places',
      callback: callbackName,
      language: 'hr',
      region: 'HR',
      loading: 'async',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => {
      loader = null; // allow a retry on transient network failures
      reject(new Error('Učitavanje Google Mapa nije uspjelo.'));
    };
    document.head.appendChild(script);
  });

  return loader;
}
