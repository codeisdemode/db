# Theme Automation Scripts

## theme-cron.js

This script can be used as a cronjob to automatically switch themes based on time of day.

### Setup

1. Make the script executable:
   ```bash
   chmod +x scripts/theme-cron.js
   ```

2. Add to crontab (run every hour):
   ```bash
   # Edit crontab
   crontab -e
   
   # Add this line to run every hour
   0 * * * * /path/to/your/db/scripts/theme-cron.js
   ```

3. The script will update `theme-config.json` which can be read by the frontend

### How it works

- 6 AM to 6 PM: Light theme
- 6 PM to 6 AM: Dark theme
- Updates a config file that can be monitored by the application

### Frontend Integration

The frontend can periodically check the config file or use server-sent events to detect theme changes.