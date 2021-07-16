import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';

const initMission = () => {
  const rocket = buildRocket();
  const crew = fetchCrew();
  const fuel = getFuel();
  const launchPad = bookLaunchPad();
  return { rocket, crew, fuel, launchPad };
};

export const run = () => {
  const start = Date.now();
  const { rocket, crew, fuel, launchPad } = initMission();

  launchPad.addRocket(rocket);

  rocket.addCrew(crew);
  rocket.addFuel(fuel);

  while (rocket.altitude < 100) {
    rocket.fireEngine(0);
  }

  while (rocket.altitude < 400) {
    if (rocket.engineIsFiring(0)) {
      rocket.stopEngine(0);
      rocket.runStageSeparation(0);
    }
    rocket.fireEngine(1);
  }

  rocket.stopEngine(1);
  rocket.runStageSeparation(1);

  console.log(`Total time: ${Math.floor((Date.now() - start) / 1000)} secs`);
};


if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  run();
}
