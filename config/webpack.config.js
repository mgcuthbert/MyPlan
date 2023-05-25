'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
    merge(common, {
        entry: {
            options: PATHS.src + '/options/options.ts',
            myPlan: [
                PATHS.src + '/extension/loadMyPlan.ts', 
                PATHS.src + '/extension/views/calendarView.ts',
                PATHS.src + '/extension/views/activityView.ts',
                PATHS.src + '/extension/views/dashboardView.ts'],
            githubFetcher: PATHS.src + '/githubFetcher.ts'
        },
        devtool: argv.mode === 'production' ? false : 'source-map',
    });

module.exports = config;
