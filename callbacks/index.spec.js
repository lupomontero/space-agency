import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';
import { run } from './example.mjs';
import { run as runHell } from './example-hell.mjs';

let consoleLogSpy;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
});

afterEach(() => {
  consoleLogSpy.mockRestore();
});

describe('buildRocket', () => {
  it('should return a rocket in 5 seconds', (done) => {
    const start = Date.now();
    buildRocket((err, rocket) => {
      expect(err).toBeFalsy();
      expect(typeof rocket.addCrew).toBe('function');
      expect(typeof rocket.addFuel).toBe('function');
      expect(typeof rocket.fireEngine).toBe('function');
      expect(typeof rocket.stopEngine).toBe('function');
      expect(typeof rocket.engineIsFiring).toBe('function');
      expect(typeof rocket.runStageSeparation).toBe('function');
      expect(Math.floor((Date.now() - start) / 1000)).toBe(5);
      expect(consoleLogSpy.mock.calls).toEqual([
        ['Building rocket...'],
        ['Rocket built!'],
      ]);
      done();
    });
  });
});

describe('fetchCrew', () => {
  it('should return a crew array in 3 seconds', (done) => {
    const start = Date.now();
    fetchCrew((err, crew) => {
      expect(err).toBeFalsy();
      expect(Array.isArray(crew)).toBe(true);
      expect(crew.length).toBe(2);
      expect(Math.floor((Date.now() - start) / 1000)).toBe(3);
      done();
    });
  });
});

describe('getFuel', () => {
  it('should return fuel in 1 second', (done) => {
    const start = Date.now();
    getFuel((err, fuel) => {
      expect(err).toBeFalsy();
      expect(typeof fuel).toBe('object');
      expect(Math.floor((Date.now() - start) / 1000)).toBe(1);
      done();
    });
  });
});

describe('bookLaunchPad', () => {
  it('should return a launchPad object in 5 seconds', (done) => {
    const start = Date.now();
    bookLaunchPad((err, launchPad) => {
      expect(err).toBeFalsy();
      expect(typeof launchPad.addRocket).toBe('function');
      expect(Math.floor((Date.now() - start) / 1000)).toBe(5);
      done();
    });
  });
});

describe('integration', () => {
  it('should run the whole mission in 11 seconds!', (done) => {
    const start = Date.now();
    run((err) => {
      expect(err).toBeFalsy();
      expect(Math.floor((Date.now() - start) / 1000)).toBe(11);
      expect(consoleLogSpy.mock.calls).toMatchSnapshot();
      done();
    });
  }, 30 * 1000);
});

describe('integration (hell)', () => {
  it('should run the whole mission in 11 seconds!', (done) => {
    const start = Date.now();
    run((err) => {
      expect(err).toBeFalsy();
      expect(Math.floor((Date.now() - start) / 1000)).toBe(11);
      expect(consoleLogSpy.mock.calls).toMatchSnapshot();
      done();
    });
  }, 30 * 1000);
});

