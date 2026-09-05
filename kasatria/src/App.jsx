import { useState, useEffect } from 'react';
import { GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID, RANGE } from './config';
import LoginScreen from './components/LoginScreen';
import Visualization from './components/Visualization';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch data from Google Sheets API
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
          if (data.values) {
            console.log("Found data!");
            // Map rows to structured objects
            const formattedData = data.values.map(row => ({
              name: row[0],
              image: row[1], // Assuming URL
              netWorth: parseFloat(row[2].replace(/[^0-9.-]+/g,"")), // Clean currency string
              age: row[3],
              country: row[4],
              interest: row[5]
            }));
            setSheetData(formattedData);
          } else {
            console.log("Did not find data!");
          }
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <Visualization data={sheetData} />;
}
