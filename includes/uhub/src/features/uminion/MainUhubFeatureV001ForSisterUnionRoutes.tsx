
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const MainUhubFeatureV001ForSisterUnionPages = [
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

const MainUhubFeatureV001ForSisterUnionPage = ({ pageName }: { pageName: string }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">{pageName}</h1>
    <p>Welcome to the {pageName} page.</p>
  </div>
);

const MainUhubFeatureV001ForSisterUnionRoutes = () => {
  return (
    <Routes>
      {MainUhubFeatureV001ForSisterUnionPages.map((pageName, index) => (
        <Route
          key={index}
          path={`/${pageName}`}
          element={<MainUhubFeatureV001ForSisterUnionPage pageName={pageName} />}
        />
      ))}
    </Routes>
  );
};

export default MainUhubFeatureV001ForSisterUnionRoutes;
