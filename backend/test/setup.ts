import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env.test.local');

dotenv.config({ path: envPath, override: true });
