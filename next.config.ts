import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const getVersion = () => {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'VERSION'), 'utf8').trim();
  } catch (e) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
      return packageJson.version;
    } catch (e) {
      return '0.0.0';
    }
  }
};

const getBuild = () => {
  try {
    // Returns format: YYYY-MM-DD (hash)
    return execSync('git log -1 --format="%cd (%h)" --date=short').toString().trim();
  } catch (e) {
    // Fallback to current date if git fails
    return new Date().toISOString().split('T')[0];
  }
};

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    APP_VERSION: getVersion(),
    APP_BUILD: getBuild(),
  },
};

export default nextConfig;
