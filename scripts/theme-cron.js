#!/usr/bin/env node

// This script can be run as a cronjob to trigger theme changes
// It sets a cookie that the frontend can read to determine theme preference

const fs = require('fs');
const path = require('path');

const DAYTIME_HOURS = { start: 6, end: 18 }; // 6 AM to 6 PM

function getThemeBasedOnTime() {
  const now = new Date();
  const currentHour = now.getHours();
  
  return currentHour >= DAYTIME_HOURS.start && currentHour < DAYTIME_HOURS.end 
    ? 'light' 
    : 'dark';
}

function updateThemeConfig(theme) {
  const configPath = path.join(__dirname, '..', 'theme-config.json');
  const config = { 
    theme,
    lastUpdated: new Date().toISOString(),
    autoTheme: true
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`Theme updated to: ${theme} at ${config.lastUpdated}`);
}

// Main execution
const currentTheme = getThemeBasedOnTime();
updateThemeConfig(currentTheme);