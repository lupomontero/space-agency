import { buildRocket, fetchCrew, getFuel, bookLaunchPad } from './index.mjs';
import { run } from './example.mjs';

let consoleLogSpy;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
});

afterEach(() => {
  consoleLogSpy.mockRestore();
});

jest.setTimeout(30 * 1000);

describe('buildRocket', () => {
  it('should return a rocket in 5 seconds', async () => {
    const start = Date.now();
    const rocket = await buildRocket();
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
  it('should return a crew array in 3 seconds', async () => {
    const start = Date.now();
    const crew = await fetchCrew();
    expect(Array.isArray(crew)).toBe(true);
    expect(crew.length).toBe(2);
    expect(Math.floor((Date.now() - start) / 1000)).toBe(3);
  });
});

describe('getFuel', () => {
  it('should return fuel in 1 second', async () => {
    const start = Date.now();
    const fuel = await getFuel();
    expect(Math.floor((Date.now() - start) / 1000)).toBe(1);
  });
});

describe('bookLaunchPad', () => {
  it('should return a launchPad object in 5 seconds', async () => {
    const start = Date.now();
    const launchPad = await bookLaunchPad();
    expect(typeof launchPad.addRocket).toBe('function');
    expect(Math.floor((Date.now() - start) / 1000)).toBe(5);
  });
});

describe('integration', () => {
  it('should run the whole mission in 11 seconds!', async () => {
    const start = Date.now();
    await run();
    expect(Math.floor((Date.now() - start) / 1000)).toBe(11);
    expect(consoleLogSpy.mock.calls).toMatchSnapshot();
  }, 30 * 1000);
});

