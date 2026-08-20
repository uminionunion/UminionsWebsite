
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { countries } from './countries-data';

const officeTypes = [
  { id: 'House', label: 'House' },
  { id: 'Senate', label: 'Senate' },
  { id: 'Head of State/Gov', label: 'Head of State/Gov' },
  { id: 'State House', label: 'State House' },
  { id: 'State Senate', label: 'State Senate' },
  { id: 'Other', label: 'Other' },
];

const sortedCountryList = Object.keys(countries).sort();

export function RunningForOfficeForm() {
  const [submissionResult, setSubmissionResult] = React.useState<{ message: string; link: string } | null>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<string>('USA');
  const [selectedState, setSelectedState] = React.useState<string>('');

  const states = countries[selectedCountry] || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Here you would normally send the data to your backend
    console.log('Form submitted:', data);

    // Mocking backend response
    // In a real app, you'd fetch this link from your backend based on country/state
    const ballotpediaState = selectedState.replace(/\s/g, '_');
    const ballotAccessLink = `https://ballotpedia.org/Ballot_access_for_major_and_minor_party_candidates_in_${ballotpediaState}`;

    setSubmissionResult({
      message: "Here's the unionCandidate to unionCandidate whatsapp channel to meet other unionCandidates who have tossed their name into the ring: uminion.com \" & Ask any questions and/or discuss strategies there! -Salem",
      link: ballotAccessLink,
    });
  };

  if (submissionResult) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Thank you for submitting!</h3>
        <p>{submissionResult.message}</p>
        <p>Here are the ballot requirements for your selected area:</p>
        <a href={submissionResult.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
          {submissionResult.link}
        </a>
        <Button onClick={() => setSubmissionResult(null)}>Back to form</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <h3 className="text-lg font-semibold text-yellow-400">Running for Office?</h3>
      <div className="space-y-2">
        <Label htmlFor="name">Name?</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country?</Label>
        <select
          id="country"
          name="country"
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedState('');
          }}
          className="w-full p-2 bg-background border rounded-md"
          required
        >
          {sortedCountryList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {states.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="state">State?</Label>
          <select
            id="state"
            name="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full p-2 bg-background border rounded-md"
            required
          >
            <option value="">Select a state</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <Label>Office Type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {officeTypes.map(type => (
            <div key={type.id} className="flex items-center gap-2">
              <Checkbox id={`office-${type.id}`} name="office_type" value={type.id} />
              <Label htmlFor={`office-${type.id}`}>{type.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Optional: Website</Label>
        <Input id="website" name="website" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Optional: Want Union Resources? Type in your Number:</Label>
        <Input id="phone" name="phone" type="tel" />
        <p className="text-xs text-muted-foreground">
          The 12,000+ person uminion union Helps with: "Building a website/fundraising/advertising/and Helping you get on the Ballot" if you choose to provide a number for us to send you instructions on how to access these optional resources.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Optional: Want a marker of you running; placed on the map?</Label>
        <RadioGroup name="show_on_map" defaultValue="yes">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="show-yes" />
            <Label htmlFor="show-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="show-no" />
            <Label htmlFor="show-no">No</Label>
          </div>
        </RadioGroup>
      </div>
      <Button type="submit" className="w-full">Submit</Button>
    </form>
  );
}
