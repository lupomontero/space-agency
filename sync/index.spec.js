import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';
import { run } from './example.mjs';

let consoleLogSpy;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
});

afterEach(() => {
  consoleLogSpy.mockRestore();
});

describe('buildRocket', () => {
  it('should return a rocket in 5 seconds', () => {
    const start = Date.now();
    const rocket = buildRocket();
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
  });
});

describe('fetchCrew', () => {
  it('should return a crew array in 3 seconds', () => {
    const start = Date.now();
    const crew = fetchCrew();
    expect(Array.isArray(crew)).toBe(true);
    expect(crew.length).toBe(2);
    expect(Math.floor((Date.now() - start) / 1000)).toBe(3);
  });
});

describe('getFuel', () => {
  it('should return fuel in 1 second', () => {
    const start = Date.now();
    const fuel = getFuel();
    expect(Math.floor((Date.now() - start) / 1000)).toBe(1);
  });
});

describe('bookLaunchPad', () => {
  it('should return a launchPad object in 5 seconds', () => {
    const start = Date.now();
    const launchPad = bookLaunchPad();
    expect(typeof launchPad.addRocket).toBe('function');
    expect(Math.floor((Date.now() - start) / 1000)).toBe(5);
  });
});

describe('integration', () => {
  it('should run the whole mission in over 20 seconds!', () => {
    const start = Date.now();
    run();
    // Expect total execution time to be at least 20 secs, but no more than
    // 30. We can not be more accurate since blocking the thread causes the
    // whole thing to slow unpredictably when running the tests.
    const totalTime = Math.floor((Date.now() - start) / 1000);
    expect(totalTime >= 20 && totalTime < 30).toBe(true);
    expect(consoleLogSpy.mock.calls).toMatchSnapshot();
  }, 30 * 1000);
});

