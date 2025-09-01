'use client';
declare const google: any;

import { useEffect, useRef } from 'react';
import { usePlanStore } from '../../stores/planStore';
import { trackEvent } from '../../lib/analytics';

const FreehandSearchMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const drawingManager = useRef<any>(null);
  const infoWindow = useRef<any>(null);
  const markers = useRef<any[]>([]);


  useEffect(() => {
    const initialize = () => {
      if (!mapRef.current) return;
      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 35.681236, lng: 139.767125 },
        zoom: 13,
      });

      drawingManager.current = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
      });

      drawingManager.current.setMap(mapInstance.current);
      google.maps.event.addListener(
        drawingManager.current,
        'polygoncomplete',
        handlePolygonComplete
      );
    };

    const loadScript = () => {
      if (typeof window === 'undefined') return;
      if ((window as any).google && (window as any).google.maps) {
        initialize();
      } else {
        const existing = document.getElementById('google-maps');
        if (existing) {
          existing.addEventListener('load', initialize);
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing,places,geometry`;
        script.async = true;
        script.addEventListener('load', initialize);
        document.head.appendChild(script);
      }
    };

    const handlePolygonComplete = (polygon: any) => {
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];
      infoWindow.current?.close();

      const path = polygon.getPath().getArray();
      const bounds = new google.maps.LatLngBounds();
      path.forEach((p: any) => bounds.extend(p));

      const service = new google.maps.places.PlacesService(mapInstance.current!);
      service.nearbySearch(
        { bounds, type: 'tourist_attraction' },
        (results: any, status: any) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            return;
          }
          infoWindow.current = new google.maps.InfoWindow();
          results.forEach((place: any) => {
            if (!place.geometry?.location) return;
            if (
              !google.maps.geometry.poly.containsLocation(
                place.geometry.location,
                polygon
              )
            )
              return;

            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: mapInstance.current,
            });
            marker.addListener('click', () => {
              infoWindow.current!.setContent(
                `<div><strong>${place.name}</strong><br/><button id="add-${place.place_id}">しおりに追加</button></div>`
              );
              infoWindow.current!.open(mapInstance.current, marker);
              google.maps.event.addListenerOnce(infoWindow.current!, 'domready', () => {
                const btn = document.getElementById(`add-${place.place_id}`);
                btn?.addEventListener(
                  'click',
                  () => {
                    const { spots } = usePlanStore.getState();
                    if (!spots.some((s) => s.id === place.place_id)) {
                      const svc = new google.maps.places.PlacesService(
                        mapInstance.current!
                      );
                      svc.getDetails(
                        { placeId: place.place_id, fields: ['opening_hours'] },
                        (detail: any) => {
                          const bh = detail?.opening_hours?.periods?.map((p: any) => ({
                            open: `${p.open.time.slice(0, 2)}:${p.open.time.slice(2)}`,
                            close: `${p.close.time.slice(0, 2)}:${p.close.time.slice(2)}`,
                          }));
                          usePlanStore.getState().setSpots([
                            ...spots,
                            {
                              id: place.place_id!,
                              name: place.name || '',
                              stayTime: 60,
                              businessHours: bh,
                            },
                          ]);
                          trackEvent('spot_added_to_timeline', {
                            place_name: place.name,
                            place_category: 'tourist_attraction',
                          });
                        }
                      );
                    }
                  },
                  { once: true }
                );
              });
            });
            markers.current.push(marker);
          });
        }
      );
    };

    loadScript();

    return () => {
      drawingManager.current?.setMap(null);
      markers.current.forEach((m) => m.setMap(null));
      infoWindow.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default FreehandSearchMap;
