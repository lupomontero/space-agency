export const buildRocket = (cb) => {
  console.log('Building rocket...');
  setTimeout(() => {
    console.log('Rocket built!');
    const rocket = {
      altitude: 0,
      speed: 0,
      engines: [{ isFiring: false }, { isFiring: false }],
      addCrew: (crew, addCrewCb) => {
        console.log('Adding crew...');
        setTimeout(() => {
          console.log('Crew ready!');
          addCrewCb();
        }, 0.5 * 1000);
      },
      addFuel: (fuel, addFuelCb) => {
        console.log('Adding fuel...');
        setTimeout(() => {
          console.log('Fuel ready!');
          addFuelCb();
        }, 0.5 * 1000);
      },
      fireEngine: (num, fireEngineCb) => {
        if (!rocket.engines[num].isFiring) {
          console.log(`Firing engine ${num}...`);
          rocket.engines[num].isFiring = true;
        }
        setTimeout(() => {
          rocket.altitude += 10;
          rocket.speed += 700;
          console.log(`Altitude ${rocket.altitude}km | Speed ${rocket.speed}km/h`);
          fireEngineCb();
        }, 0.01 * 1000);
      },
      stopEngine: (num, stopEngineCb) => {
        console.log(`Engine ${num} cut-off...`);
        setTimeout(() => {
          rocket.engines[num].isFiring = false;
          console.log(`Engine ${num} cut-off completed...`);
          stopEngineCb();
        }, 0.5 * 1000);
      },
      engineIsFiring: num => rocket.engines[num].isFiring,
      runStageSeparation: (num, runStageSeparationCb) => {
        console.log(`Running stage ${num} separation...`);
        setTimeout(() => {
          console.log(`Stage ${num} separation completed...`);
          runStageSeparationCb();
        }, 1 * 1000);
      },
    };
    cb(null, rocket);
  }, 5 * 1000);
};

export const fetchCrew = (cb) => {
  console.log('Fetching crew...');
  setTimeout(() => {
    console.log('Crew ready!');
    cb(null, [
      { name: 'Pepito Pérez' },
      { name: 'Manolita Fernández' },
    ]);
  }, 3 * 1000);
};

export const getFuel = (cb) => {
  console.log('Getting fuel...');
  setTimeout(() => {
    console.log('Fuel ready!');
    cb(null, {});
  }, 1 * 1000);
};

export const bookLaunchPad = (cb) => {
  console.log('Booking launch pad...');
  setTimeout(() => {
    console.log('Launch pad booked!');
    cb(null, {
      addRocket: (rocket, addRocketCb) => {
        console.log('Adding rocket to launch pad...');
        setTimeout(() => {
          console.log('Added rocket to launch pad!');
          addRocketCb();
        }, 2 * 1000);
      },
    });
  }, 5 * 1000);
};
