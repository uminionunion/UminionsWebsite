
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TheFoodPantryFeature } from '../pantry-feature/the-food-pantry-feature';
import { Pantry } from '../home/types';

interface LandingPageProps {
  pantries: Pantry[];
  addPantry: (pantryData: Omit<Pantry, 'id'>) => Promise<Pantry | null>;
}

export function LandingPage({ pantries, addPantry }: LandingPageProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground flex flex-col items-center justify-center p-4">
      <Button size="lg" onClick={() => setIsModalOpen(true)}>Find a Pantry:</Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-none w-[90vw] h-[90vh] p-0 !rounded-lg overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Pantry Finder Feature</DialogTitle>
          </DialogHeader>
          <TheFoodPantryFeature pantries={pantries} addPantry={addPantry} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
