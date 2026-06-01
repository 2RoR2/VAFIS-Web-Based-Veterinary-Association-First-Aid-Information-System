// Abstraction over the browser Geolocation API.
// Centralises coordinate retrieval so components remain decoupled from the
// underlying browser API, matching the LocationService class in the system design.
export class LocationService {
  // Returns the user's current GPS coordinates as a plain { lat, lng } object.
  // Rejects if the browser does not support geolocation or if the user denies access.
  static getCurrentCoordinates(
    options?: PositionOptions,
  ): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        options,
      );
    });
  }
}
