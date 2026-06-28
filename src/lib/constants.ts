// Material Design 3 Theme Tokens & App Constants

export const APP_THEME = {
  colors: {
    primary: '#ea580c', // Orange 600
    primaryHover: '#c2410c', // Orange 700
    surface: '#0a0a0a', // Neutral 950
    surfaceContainer: '#171717', // Neutral 900
    surfaceVariant: '#262626', // Neutral 800
    onSurface: '#f5f5f5',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }
};

export const VEHICLE_TYPES = [
  { id: 'camion', label: 'Camión 🚛', icon: 'Truck' },
  { id: 'auto', label: 'Auto 🚗', icon: 'Car' },
  { id: 'minivan', label: 'Minivan 🚐', icon: 'Bus' },
  { id: 'moto', label: 'Moto 🏍️', icon: 'Bike' },
];
