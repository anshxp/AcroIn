const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Windows can fail when Metro tries to spawn transformer workers in restricted environments.
config.maxWorkers = 1;

module.exports = config;