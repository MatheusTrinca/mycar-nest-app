import { rm } from 'fs/promises';
import { join } from 'path';

global.afterEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {}
});
