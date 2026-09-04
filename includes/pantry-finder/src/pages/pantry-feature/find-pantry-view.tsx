
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PantryType } from '../home/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { countries } from './countries-data';
import { cn } from '@/lib/utils';

export type Category = PantryType | 'candidates' | 'politicians';

const categoryTypes: { id: Category; label: string, className?: string }[] = [
    { id: 'food', label: 'Food Pantry?' },
    { id: 'clothing', label: 'Clothing Pantry?' },
    { id: 'resource', label: 'Resource' },
    { id: 'library', label: 'Mini-Library/Billboard?' },
    { id: 'candidates', label: 'Candidates Running for Office', className: 'text-yellow-400 font-bold' },
    { id: 'politicians', label: 'Politicians who let the WH Fall still in office.' },
];

const topCountries = ['Canada', 'Mexico', 'USA'];
const sortedCountryList = [
  ...topCountries,
  ...Object.keys(countries).filter(c => !topCountries.includes(c)).sort()
];

interface FindPantryViewProps {
  selectedCategories: Category[];
  onCategoryChange: (categories: Category[]) => void;
  selectedCountry: string | null;
  selectedState: string | null;
  onCountryChange: (country: string | null) => void;
  onStateChange: (state: string | null) => void;
  filterOptions: any;
  setFilterOptions: React.Dispatch<React.SetStateAction<any>>;
}

export function FindPantryView({ selectedCategories, onCategoryChange, selectedCountry, selectedState, onCountryChange, onStateChange, filterOptions, setFilterOptions }: FindPantryViewProps) {
  const showPoliticianTypes = selectedCategories.includes('politicians');
  const showCandidateTypes = selectedCategories.includes('candidates');

  const handleCategoryChange = (categoryId: Category, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories.filter(c => c !== categoryId);
    onCategoryChange(newCategories);
  };

  const handleFilterOptionChange = (option: string, checked: boolean) => {
    setFilterOptions(prev => ({ ...prev, [option]: checked }));
  };

  const handleCountryChange = (country: string) => {
    onCountryChange(country);
    onStateChange(null);
  };

  const handleStateChange = (state: string) => {
    onStateChange(state);
  };

  const states = selectedCountry ? countries[selectedCountry] : [];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1.35fr_0.9fr_0.9fr]">
        <div>
          <h4 className="pantry-finder-section-title font-medium mb-2">Find a:</h4>
          <div className="grid grid-cols-2 gap-3">
            {categoryTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`filter-type-${type.id}`} 
                  checked={selectedCategories.includes(type.id)}
                  onCheckedChange={(checked) => handleCategoryChange(type.id, !!checked)}
                />
                <Label htmlFor={`filter-type-${type.id}`} className={cn('pantry-finder-list-label', type.className)}>{type.label}</Label>
              </div>
            ))}
          </div>
          {showPoliticianTypes && (
            <div className="pl-6 mt-2 flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-politician-senate" onCheckedChange={(checked) => handleFilterOptionChange('showPoliticianSenate', !!checked)} />
                <Label htmlFor="filter-politician-senate" className="pantry-finder-list-label">Senator?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-politician-house" onCheckedChange={(checked) => handleFilterOptionChange('showPoliticianHouse', !!checked)} />
                <Label htmlFor="filter-politician-house" className="pantry-finder-list-label">House of Representative?</Label>
              </div>
            </div>
          )}
          {showCandidateTypes && (
            <div className="pl-6 mt-2 flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-candidate-senate" onCheckedChange={(checked) => handleFilterOptionChange('showCandidateSenate', !!checked)} />
                <Label htmlFor="filter-candidate-senate" className="pantry-finder-list-label text-yellow-400 font-bold">Senator?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="filter-candidate-house" onCheckedChange={(checked) => handleFilterOptionChange('showCandidateHouse', !!checked)} />
                <Label htmlFor="filter-candidate-house" className="pantry-finder-list-label text-yellow-400 font-bold">House of Representative?</Label>
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="pantry-finder-section-title font-medium mb-2">Country</h4>
          <div className="max-h-[170px] overflow-y-auto space-y-2 border rounded-md p-2">
            <RadioGroup value={selectedCountry || ''} onValueChange={handleCountryChange}>
              {sortedCountryList.map(country => (
                <div key={country} className="flex items-center space-x-2">
                  <RadioGroupItem value={country} id={`country-${country}`} />
                  <Label htmlFor={`country-${country}`} className="pantry-finder-list-label">{country}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {(states && states.length > 0) ? (
          <div>
            <h4 className="pantry-finder-section-title font-medium mb-2">{selectedCountry} States/Provinces</h4>
            <div className="max-h-[170px] overflow-y-auto space-y-2 border rounded-md p-2">
              <RadioGroup value={selectedState || ''} onValueChange={handleStateChange}>
                {states.map(state => (
                  <div key={state} className="flex items-center space-x-2">
                    <RadioGroupItem value={state} id={`state-${state}`} />
                    <Label htmlFor={`state-${state}`} className="pantry-finder-list-label">{state}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ) : (
          <div className="flex items-start">
            <div className="w-full rounded-md border border-dashed p-2 text-xs text-muted-foreground">
              Select a country to load states/provinces.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
