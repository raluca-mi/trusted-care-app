export const currentPosition: {
  coords: { latitude: number; longitude: number };
} | null = {
  coords: {
    latitude: 45.6492665,
    longitude: 25.6015075,
  },
} as const;

export const LOCATION_CONSTANTS = {
  useMyCurrentLocation: 'Use My Current Location',
};
