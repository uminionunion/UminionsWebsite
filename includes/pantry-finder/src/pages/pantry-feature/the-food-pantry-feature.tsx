
import * as React from 'react';
import { PantryMap } from '../home/map';
import { PantryControls } from './pantry-controls';
import { Candidate, Pantry, Politician } from '../home/types';
import { Category } from './find-pantry-view';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { pantryApiUrl } from '@/lib/api';

interface TheFoodPantryFeatureProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id' | 'deleted'>) => Promise<Pantry | null>;
}

export function TheFoodPantryFeature({ pantries, addPantry }: TheFoodPantryFeatureProps) {
  const [activeView, setActiveView] = React.useState<'find' | 'host' | 'details' | 'running'>('find');
  const [selectedPantry, setSelectedPantry] = React.useState<Pantry | null>(null);
  const [politicians, setPoliticians] = React.useState<Politician[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [selectedCountry, setSelectedCountry] = React.useState<string | null>('USA');
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = React.useState<Category[]>(['food', 'clothing', 'resource', 'library']);
  const [filterOptions, setFilterOptions] = React.useState({
    showPoliticianSenate: false,
    showPoliticianHouse: false,
    showCandidateSenate: false,
    showCandidateHouse: false,
  });

   React.useEffect(() => {
    fetch(pantryApiUrl('/api/politicians'))
       .then(res => res.json())
       .then(data => {
         console.log('Fetched politicians:', data.length, 'total');
         const senatorsCount = data.filter((p: Politician) => p.office === 'Senate').length;
         console.log('Senators count:', senatorsCount);
         setPoliticians(data);
       })
       .catch(console.error);
     
    fetch(pantryApiUrl('/api/candidates'))
       .then(res => res.json())
       .then(data => setCandidates(data))
       .catch(console.error);
   }, []);

  const handleViewDetails = (pantry: Pantry) => {
    setSelectedPantry(pantry);
    setActiveView('details');
  };

  const refreshCandidates = () => {
    fetch(pantryApiUrl('/api/candidates')).then(res => res.ok ? res.json() : []).then(data => setCandidates(Array.isArray(data) ? data : [])).catch(console.error);
  };

  const filteredPantries = pantries.filter(p => {
    if (!selectedCountry) return false;
    if (p.country !== selectedCountry) return false;
    if (selectedState && p.state !== selectedState) return false;
    return selectedCategories.includes(p.type);
  });
  
  const filteredPoliticians = selectedCategories.includes('politicians') 
    ? politicians.filter(p => {
        if (filterOptions.showPoliticianSenate && p.office === 'Senate') return true;
        if (filterOptions.showPoliticianHouse && p.office === 'House') return true;
        // If no sub-filters are checked, show all politicians
        if (!filterOptions.showPoliticianSenate && !filterOptions.showPoliticianHouse) return true;
        return false;
      })
    : [];
  
  React.useEffect(() => {
    const senators = filteredPoliticians.filter(p => p.office === 'Senate');
    console.log('Filtered politicians - total:', filteredPoliticians.length, 'senators:', senators.length);
    const stateCount: { [key: string]: number } = {};
    senators.forEach(s => {
      stateCount[s.state] = (stateCount[s.state] || 0) + 1;
    });
    console.log('Senators per state:', stateCount);
  }, [filteredPoliticians]);

  const filteredCandidates = selectedCategories.includes('candidates') 
    ? candidates.filter(c => {
        if (filterOptions.showCandidateSenate && c.office === 'Senate') return true;
        if (filterOptions.showCandidateHouse && c.office === 'House') return true;
        // If no sub-filters are checked, show all candidates
        if (!filterOptions.showCandidateSenate && !filterOptions.showCandidateHouse) return true;
        return false;
      })
    : [];

  return (
    <div className="grid h-full min-h-[520px] w-full grid-cols-[24%_42%_34%] bg-background">
      <div className="h-full border-r overflow-y-auto p-4 flex flex-col gap-4">
        <Button className="w-full justify-center text-center" onClick={() => setActiveView('find')} variant={'default'}>
          Find a Pantry
        </Button>
        <Button className="w-full justify-center text-center whitespace-normal h-auto" onClick={() => setActiveView('host')} variant="secondary">
          Know-of a Pantry? Host a Pantry?
        </Button>
        <Button 
          className={cn(
            "w-full justify-center text-center",
            "bg-yellow-400 hover:bg-yellow-500 text-black"
          )}
          onClick={() => setActiveView('running')}
        >
          Running for Office?
        </Button>
      </div>
      <div className="h-full min-h-[520px] overflow-hidden">
        <PantryMap
          pantries={filteredPantries}
          politicians={filteredPoliticians}
          candidates={filteredCandidates}
          onViewDetails={handleViewDetails}
        />
      </div>
      <div className="h-full border-l overflow-y-auto">
        <PantryControls 
          addPantry={addPantry} 
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPantry={selectedPantry}
            selectedCountry={selectedCountry}
            selectedState={selectedState}
            onCountryChange={setSelectedCountry}
            onStateChange={setSelectedState}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
          onCandidateCreated={refreshCandidates}
        />
      </div>
    </div>
  );
}
