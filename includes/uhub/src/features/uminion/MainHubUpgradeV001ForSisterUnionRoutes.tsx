
// Update: As of this moment, this entire section may potentially be outdated/legacyCodeToMAYBEcompareWith. If this code is not outdated, please update this comment with what got used; or else it is on path to get deleted and/or archived in the future. - 5:27pm on 8/24/26
// Import React for creating components.
import React from 'react';
// Import components for routing from react-router-dom.
import { Routes, Route } from 'react-router-dom';

// An array of page names for the Sister Unions.
const MainHubUpgradeV001ForSisterUnionPages = [
  'SisterUnion001NewEngland',
  'SisterUnion002CentralEastCoast',
  'SisterUnion003SouthEast',
  'SisterUnion004TheGreatLakesAndAppalachia',
  'SisterUnion005CentralSouth',
  'SisterUnion006CentralNorth',
  'SisterUnion007SouthWest',
  'SisterUnion008NorthWest',
  'SisterUnion009International',
  'SisterUnion010TheGreatHall',
  'SisterUnion011WaterFall',
  'SisterUnion012UnionEvent',
  'SisterUnion013UnionSupport',
  'SisterUnion014UnionNews',
  'SisterUnion015UnionRadio',
  'SisterUnion016UnionDrive',
  'SisterUnion017UnionArchiveAndEducation',
  'SisterUnion018UnionTech',
  'SisterUnion019UnionPolitic',
  'SisterUnion020UnionSAM',
  'SisterUnion021UnionUkraineAndTheCrystalPalace',
  'SisterUnion022FestyLove',
  'SisterUnion023UnionLegal',
  'SisterUnion024UnionMarket',
];

// A generic component for a Sister Union page.
const MainHubUpgradeV001ForSisterUnionPage = ({ pageName }: { pageName: string }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">{pageName}</h1>
    <p>Welcome to the {pageName} page.</p>
  </div>
);

// A component that defines all the routes for the Sister Union pages.
const MainHubUpgradeV001ForSisterUnionRoutes = () => {
  return (
    <Routes>
      {/* Map over the page names to create a Route for each one. */}
      {MainHubUpgradeV001ForSisterUnionPages.map((pageName, index) => (
        <Route
          key={index}
          path={`/${pageName}`}
          element={<MainHubUpgradeV001ForSisterUnionPage pageName={pageName} />}
        />
      ))}
    </Routes>
  );
};

// Export the component for use in other parts of the application.
export default MainHubUpgradeV001ForSisterUnionRoutes;
