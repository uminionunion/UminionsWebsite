
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

   // Politicians and candidates are not requested while their checkboxes and the Running for Office button are
   // disabled (10/15/26 by StorytellingSalem). Un-comment this effect when they come back.
   // React.useEffect(() => {
   //  fetch(pantryApiUrl('/api/politicians')).then(res => res.json()).then(data => setPoliticians(data)).catch(console.error);
   //  fetch(pantryApiUrl('/api/candidates')).then(res => res.json()).then(data => setCandidates(data)).catch(console.error);
   // }, []);

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

  // Leaky bucket: show 50 matching pantries, then 50 more every 3 seconds until all are on the map.
  // Changing a filter restarts the flow with only the matching pantries.
  const FLOW_BATCH = 50;
  const FLOW_INTERVAL_MS = 3000;
  const [visibleCount, setVisibleCount] = React.useState(0);
  const filterKey = `${selectedCountry}|${selectedState}|${selectedCategories.join(',')}`;

  React.useEffect(() => {
    setVisibleCount(pantries.length ? FLOW_BATCH : 0);
  }, [filterKey, pantries.length]);

  React.useEffect(() => {
    if (visibleCount === 0 || visibleCount >= filteredPantries.length) return;
    const timer = window.setTimeout(() => setVisibleCount(count => count + FLOW_BATCH), FLOW_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [visibleCount, filteredPantries.length]);
  
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
    // DEBUG NOTE: re-enable only when debugging politician filtering.
    // const senators = filteredPoliticians.filter(p => p.office === 'Senate');
    // const stateCount: { [key: string]: number } = {};
    // senators.forEach(s => {
    //   stateCount[s.state] = (stateCount[s.state] || 0) + 1;
    // });
    // console.log('Senators per state:', stateCount);
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
    <div className="grid h-full min-h-[520px] w-full grid-rows-[auto_1fr] bg-background">
      <div className="grid grid-cols-[26%_74%] gap-3 border-b p-3">
      <div className="flex flex-col gap-3">
        <Button className="w-full justify-center text-center" onClick={() => setActiveView('find')} variant={'default'}>
          Find a Pantry
        </Button>
        <Button className="w-full justify-center text-center whitespace-normal h-auto" onClick={() => setActiveView('host')} variant="secondary">
          Know-of a Pantry? Host a Pantry?
        </Button>
        {/* Running for Office? disabled 10/15/26 by StorytellingSalem; remove disabled and restore onClick to bring it back */}
        <Button 
          className={cn(
            "w-full justify-center text-center",
            "bg-yellow-400 hover:bg-yellow-500 text-black"
          )}
          disabled
          // onClick={() => setActiveView('running')}
        >
          Running for Office?
        </Button>
      </div>
      <div className="relative min-h-0">
      <div className="absolute inset-0 overflow-y-auto">
        <PantryControls
          addPantry={addPantry}
          activeView="find"
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
      </div>
      <div className={cn('grid min-h-0', activeView === 'find' ? 'grid-cols-1' : 'grid-cols-[66%_34%]')}>
      <div className="h-full min-h-[360px] overflow-hidden">
        <PantryMap
          pantries={filteredPantries.slice(0, visibleCount)}
          politicians={filteredPoliticians}
          candidates={filteredCandidates}
          onViewDetails={handleViewDetails}
        />
      </div>
      {activeView !== 'find' && <div className="h-full border-l overflow-y-auto">
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
      </div>}
      </div>
    </div>
  );
}
