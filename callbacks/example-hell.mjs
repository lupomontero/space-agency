import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';

const initMission = (cb) => {
  buildRocket((err, rocket) => {
    if (err) {
      return cb(err);
    }
    fetchCrew((err, crew) => {
      if (err) {
        return cb(err);
      }
      getFuel((err, fuel) => {
        if (err) {
          return cb(err);
        }
        bookLaunchPad((err, launchPad) => {
          if (err) {
            return cb(err);
          }
          cb(null, { rocket, crew, fuel, launchPad });
        });
      });
    });
  });
};

export const run = (cb) => {
  const start = Date.now();
  initMission((err, { rocket, crew, fuel, launchPad }) => {
    if (err) {
      return cb(err);
    }
    launchPad.addRocket(rocket, (err) => {
      if (err) {
        return cb(err);
      }
      rocket.addCrew(crew, (err) => {
        if (err) {
          return cb(err);
        }
        rocket.addFuel(fuel, (err) => {
          if (err) {
            return cb(err);
          }
          const fire = () => {
            if (rocket.altitude < 100) {
              rocket.fireEngine(0, (err) => {
                if (err) {
                  return cb(err);
                }
                fire();
              });
            } else if (rocket.altitude < 400) {
              if (rocket.engineIsFiring(0)) {
                rocket.stopEngine(0, (err) => {
                  if (err) {
                    return cb(err);
                  }
                  rocket.runStageSeparation(0, (err) => {
                    if (err) {
                      return cb(err);
                    }
                    fire();
                  });
                });
              } else {
                rocket.fireEngine(1, (err) => {
                  if (err) {
                    return cb(err);
                  }
                  fire();
                });
              }
            } else {
              rocket.stopEngine(1, (err) => {
                if (err) {
                  return cb(err);
                }
                rocket.runStageSeparation(1, (err) => {
                  if (err) {
                    return cb(err);
                  }
                  console.log(`Total time: ${Math.floor((Date.now() - start) / 1000)} secs`);
                  cb();
                });
              });
            }
          };
          fire();
        });
      });
    });
  });
};


if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  run((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}
