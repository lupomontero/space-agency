const sleep = (secs) => {
  const start = Date.now();
  while (Date.now() - start < secs * 1000) {}
};

export const buildRocket = () => {
  console.log('Building rocket...');
  sleep(5);
  console.log('Rocket built!');
  const rocket = {
    altitude: 0,
    speed: 0,
    engines: [{ isFiring: false }, { isFiring: false }],
    addCrew: (crew) => {
      console.log('Adding crew...');
      sleep(0.5);
      console.log('Crew ready!');
    },
    addFuel: (fuel) => {
      console.log('Adding fuel...');
      sleep(0.5);
      console.log('Fuel ready!');
    },
    fireEngine: (num) => {
      if (!rocket.engines[num].isFiring) {
        console.log(`Firing engine ${num}...`);
        rocket.engines[num].isFiring = true;
      }
      sleep(0.01);
      rocket.altitude += 10;
      rocket.speed += 700;
      console.log(`Altitude ${rocket.altitude}km | Speed ${rocket.speed}km/h`);
    },
    stopEngine: (num) => {
      console.log(`Engine ${num} cut-off...`);
      sleep(0.5);
      rocket.engines[num].isFiring = false;
      console.log(`Engine ${num} cut-off completed...`);
    },
    engineIsFiring: num => rocket.engines[num].isFiring,
    runStageSeparation: (num) => {
      console.log(`Running stage ${num} separation...`);
      sleep(1);
      console.log(`Stage ${num} separation completed...`);
    },
  };
  return rocket;
};

export const fetchCrew = () => {
  console.log('Fetching crew...');
  sleep(3);
  console.log('Crew ready!');
  return [
    { name: 'Pepito Pérez' },
    { name: 'Manolita Fernández' },
  ];
};

export const getFuel = () => {
  console.log('Getting fuel...');
  sleep(1);
  console.log('Fuel ready!');
  return {};
};

export const bookLaunchPad = () => {
  console.log('Booking launch pad...');
  sleep(5);
  console.log('Launch pad booked!');
  return {
    addRocket: (rocket) => {
      console.log('Adding rocket to launch pad...');
      sleep(2);
      console.log('Added rocket to launch pad!');
    },
  };
};


export default { buildRocket, fetchCrew, getFuel, bookLaunchPad };
