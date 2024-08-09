// Learn more https://docs.expo.io/guides/customizing-metro
import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(__dirname);
config.resolver?.sourceExts?.push("cjs");

module.exports = config;
