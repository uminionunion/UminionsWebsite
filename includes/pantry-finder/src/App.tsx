
import * as React from 'react';
import { LandingPage } from './pages/landing/landing-page';
import { Pantry } from './pages/home/types';
import { pantryApiUrl } from './lib/api';

function App() {
  const [pantries, setPantries] = React.useState<Pantry[]>([]);

  React.useEffect(() => {
    fetch(pantryApiUrl('/api/pantries'))
      .then(res => res.json())
      .then(data => setPantries(data.filter(p => p.deleted === 0)))
      .catch(console.error);
  }, []);

  const addPantry = async (pantryData: Omit<Pantry, 'id' | 'deleted'>) => {
    try {
      const response = await fetch(pantryApiUrl('/api/pantries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pantryData),
      });
      if (!response.ok) {
        throw new Error('Failed to add pantry');
      }
      const newPantry = await response.json();
      setPantries(prev => [...prev, newPantry]);
      return newPantry;
    } catch (error) {
      console.error(error);
      // Optionally, handle the error in the UI
      return null;
    }
  };

  // The router is removed as there is only one page now.
  // If you need to add more pages, you can re-introduce react-router-dom
  return (
    <LandingPage pantries={pantries} addPantry={addPantry} />
  );
}

export default App;
