import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';

const initMission = () => Promise.all([
  buildRocket(),
  fetchCrew(),
  getFuel(),
  bookLaunchPad(),
]);

const getReadyForLaunch = ([rocket, crew, fuel, launchPad]) => (
  launchPad.addRocket(rocket)
    .then(() => rocket.addCrew(crew))
    .then(() => rocket.addFuel(fuel))
    .then(() => rocket)
);

const launch = rocket => new Promise((resolve, reject) => {
  const fire = () => {
    if (rocket.altitude < 100) {
      return rocket.fireEngine(0).then(fire, reject);
    }
    if (rocket.altitude < 400 && rocket.engineIsFiring(0)) {
      return rocket.stopEngine(0)
        .then(() => rocket.runStageSeparation(0))
        .then(fire, reject);
    }
    if (rocket.altitude < 400) {
      return rocket.fireEngine(1).then(fire, reject);
    }
    return rocket.stopEngine(1)
      .then(() => rocket.runStageSeparation(1))
      .then(resolve, reject);
  };
  fire();
});

export const run = () => {
  const start = Date.now();
  return initMission()
    .then(getReadyForLaunch)
    .then(launch)
    .then(() => {
      console.log(`Total time: ${Math.floor((Date.now() - start) / 1000)} secs`);
    });
};


if (process.env.NODE_ENV !== 'test') {
  run()
    .catch((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
}
