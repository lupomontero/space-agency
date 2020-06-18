const promisedTimeout = delay => new Promise((resolve) => {
  setTimeout(resolve, delay);
});

export const buildRocket = () => {
  console.log('Building rocket...');
  return promisedTimeout(5 * 1000)
    .then(() => {
      console.log('Rocket built!');
      const rocket = {
        altitude: 0,
        speed: 0,
        engines: [{ isFiring: false }, { isFiring: false }],
        addCrew: (crew) => {
          console.log('Adding crew...');
          return promisedTimeout(0.5 * 1000)
            .then(() => {
              console.log('Crew ready!');
            });
        },
        addFuel: (fuel) => {
          console.log('Adding fuel...');
          return promisedTimeout(0.5 * 1000)
            .then(() => {
              console.log('Fuel ready!');
            });
        },
        fireEngine: (num) => {
          if (!rocket.engines[num].isFiring) {
            console.log(`Firing engine ${num}...`);
            rocket.engines[num].isFiring = true;
          }
          return promisedTimeout(0.01 * 1000)
            .then(() => {
              rocket.altitude += 10;
              rocket.speed += 700;
              console.log(`Altitude ${rocket.altitude}km | Speed ${rocket.speed}km/h`);
            });
        },
        stopEngine: (num) => {
          console.log(`Engine ${num} cut-off...`);
          return promisedTimeout(0.5 * 1000)
            .then(() => {
              rocket.engines[num].isFiring = false;
              console.log(`Engine ${num} cut-off completed...`);
            });
        },
        engineIsFiring: num => rocket.engines[num].isFiring,
        runStageSeparation: (num) => {
          console.log(`Running stage ${num} separation...`);
          return promisedTimeout(1 * 1000)
            .then(() => {
              console.log(`Stage ${num} separation completed...`);
            });
        },
      };
      return rocket;
    });
};

export const fetchCrew = () => {
  console.log('Fetching crew...');
  return promisedTimeout(3 * 1000)
    .then(() => {
      console.log('Crew ready!');
      return [
        { name: 'Pepito Pérez' },
        { name: 'Manolita Fernández' },
      ];
    });
};

export const getFuel = () => {
  console.log('Getting fuel...');
  return promisedTimeout(1 * 1000)
    .then(() => {
      console.log('Fuel ready!');
      return {};
    });
};

export const bookLaunchPad = () => {
  console.log('Booking launch pad...');
  return promisedTimeout(5 * 1000)
    .then(() => {
      console.log('Launch pad booked!');
      return {
        addRocket: (rocket) => {
          console.log('Adding rocket to launch pad...');
          return promisedTimeout(2 * 1000)
            .then(() => {
              console.log('Added rocket to launch pad!');
            });
        },
      };
    });
};
