import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';

//
// Ejecuta funciones asíncronas basadas en callbacks de forma concurrente.
//
// Espera que el 1er argumento (`obj`) sea un objeto donde cada propiedad
// contiene una función que recibe un callback como único argumento.
//
// Una vez se hayan completado todas las tareas, se invocará `cb` con un objeto
// como 2ndo argumento, y este objeto tendrá las mismas propiedades que el
// objeto que recibimos como input (`obj`) y los valores corresponden al
// _resultado_ de cada una de las funciones asíncronas.
//
const concurrent = (obj, cb) => {
  let hasErrored = false;
  const results = {};
  const keys = Object.keys(obj);
  const handler = name => (err, data) => {
    if (hasErrored) {
      return;
    }
    if (err) {
      hasErrored = true;
      return cb(err);
    }
    Object.assign(results, { [name]: data });
    if (Object.keys(results).length === keys.length) {
      cb(null, results);
    }
  };
  keys.forEach((key) => {
    obj[key](handler(key));
  });
};

//
// Ejecuta funciones asíncronas basadas en callbacks en series (de forma
// secuencial).
//
// Espera un arreglo de funciones como primer argumento. Estas funciones reciben
// un callback como único argumento.
//
// Una vez se hayan completado todas las tareas, se invocará `cb` con un arreglo
// como 2ndo argumento, y este arreglo tendrá el mismo número de elementos que
// el arreglo que recibimos como input (`fns`), y los valores corresponden al
// _resultado_ de cada una de las funciones asíncronas.
//
const series = (fns, cb) => {
  const recurse = (remaining, memo = []) => {
    if (!remaining.length) {
      return cb(null, memo);
    }
    remaining[0]((err, data) => {
      if (err) {
        return cb(err);
      }
      return recurse(remaining.slice(1), memo.concat(data));
    });
  };
  return recurse(fns);
};

const initMission = cb => concurrent({
  rocket: buildRocket,
  crew: fetchCrew,
  fuel: getFuel,
  launchPad: bookLaunchPad,
}, cb);

const getReadyForLaunch = ({ rocket, crew, fuel, launchPad }, cb) => {
  series([
    launchPad.addRocket.bind(null, rocket),
    rocket.addCrew.bind(null, crew),
    rocket.addFuel.bind(null, fuel),
  ], cb);
};

const launch = ({ rocket, crew, fuel, launchPad }, cb) => {
  const fire = (err) => {
    if (err) {
      return cb(err);
    }
    if (rocket.altitude < 100) {
      return rocket.fireEngine(0, fire);
    }
    if (rocket.altitude < 400 && rocket.engineIsFiring(0)) {
      return series([
        rocket.stopEngine.bind(null, 0),
        rocket.runStageSeparation.bind(null, 0),
      ], fire);
    }
    if (rocket.altitude < 400) {
      return rocket.fireEngine(1, fire);
    }
    return series([
      rocket.stopEngine.bind(null, 1),
      rocket.runStageSeparation.bind(null, 1),
    ], cb);
  };
  fire();
};

export const run = (cb) => {
  const start = Date.now();
  return initMission((err, mission) => {
    if (err) {
      return cb(err);
    }
    return series([
      getReadyForLaunch.bind(null, mission),
      launch.bind(null, mission),
    ], (err) => {
      if (err) {
        return cb(err);
      }
      console.log(`Total time: ${Math.floor((Date.now() - start) / 1000)} secs`);
      cb();
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
