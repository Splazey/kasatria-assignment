// Read from .env (see .env.example) so real keys never get committed to git
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;

// Sheet columns: Name, Photo, Net Worth, Age, Country, Interest
export const RANGE = 'Data Template!A2:F';
