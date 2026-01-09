#!/usr/bin/env node

/**
 * Version Bump Script
 * 
 * Bumps the version number in VERSION file and optionally updates CHANGELOG.md
 * 
 * Usage:
 *   node scripts/version-bump.js [major|minor|patch] [--changelog]
 * 
 * Examples:
 *   node scripts/version-bump.js patch
 *   node scripts/version-bump.js minor --changelog
 *   node scripts/version-bump.js major
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '..', 'VERSION');
const CHANGELOG_FILE = path.join(__dirname, '..', 'CHANGELOG.md');

function getCurrentVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    console.error('VERSION file not found!');
    process.exit(1);
  }
  return fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);
  
  if (parts.length !== 3) {
    console.error('Invalid version format. Expected MAJOR.MINOR.PATCH');
    process.exit(1);
  }
  
  let [major, minor, patch] = parts;
  
  switch (type) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
    default:
      console.error('Invalid bump type. Use: major, minor, or patch');
      process.exit(1);
  }
  
  return `${major}.${minor}.${patch}`;
}

function updateVersionFile(newVersion) {
  fs.writeFileSync(VERSION_FILE, newVersion + '\n', 'utf8');
  console.log(`✓ Updated VERSION file: ${newVersion}`);
}

function updateChangelog(newVersion, oldVersion) {
  if (!fs.existsSync(CHANGELOG_FILE)) {
    console.warn('CHANGELOG.md not found. Skipping changelog update.');
    return;
  }
  
  const changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  const date = new Date().toISOString().split('T')[0];
  
  // Replace [Unreleased] with new version
  const updatedChangelog = changelog.replace(
    '## [Unreleased]',
    `## [Unreleased]\n\n## [${newVersion}] - ${date}`
  );
  
  fs.writeFileSync(CHANGELOG_FILE, updatedChangelog, 'utf8');
  console.log(`✓ Updated CHANGELOG.md with version ${newVersion}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/version-bump.js [major|minor|patch] [--changelog]');
    console.log('\nCurrent version:', getCurrentVersion());
    process.exit(1);
  }
  
  const bumpType = args[0];
  const updateChangelogFlag = args.includes('--changelog');
  
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  console.log(`Bumping version: ${currentVersion} → ${newVersion}`);
  
  updateVersionFile(newVersion);
  
  if (updateChangelogFlag) {
    updateChangelog(newVersion, currentVersion);
  }
  
  console.log(`\n✓ Version bumped to ${newVersion}`);
  console.log('\nNext steps:');
  console.log('  1. Review and update CHANGELOG.md with release notes');
  console.log('  2. Commit the version change:');
  console.log(`     git add VERSION CHANGELOG.md`);
  console.log(`     git commit -m "chore: Bump version to ${newVersion}"`);
}

main();
