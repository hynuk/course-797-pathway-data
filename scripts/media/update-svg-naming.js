#!/usr/bin/env node

/**
 * Update SVG Title Illustrations to Match Naming Convention
 * 
 * Renames existing SVG files to follow the sprint ID naming convention
 */

const fs = require('fs');
const path = require('path');

const TITLES_DIR = path.join(__dirname, 'assets', 'course-797', 'sprints', 'titles');

// Mapping of existing filenames to sprint IDs
const SVG_MAPPING = {
  'salutations-and-small-talk.svg': 'S1.1',
  'languages-and-origins.svg': 'S1.2',
  'introductions-and-professions.svg': 'S1.3',
  'personal-info-and-preferences.svg': 'S1.4'
};

/**
 * Generate new filename from sprint ID
 */
function generateSvgFilename(sprintId) {
  return `sprint-${sprintId.toLowerCase()}-title.svg`;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const dryRun = !execute;

  try {
    if (!fs.existsSync(TITLES_DIR)) {
      console.error(`Titles directory not found: ${TITLES_DIR}`);
      process.exit(1);
    }

    const files = fs.readdirSync(TITLES_DIR);
    const svgFiles = files.filter(f => f.endsWith('.svg'));

    console.log('\n' + '='.repeat(80));
    console.log('SVG TITLE ILLUSTRATION RENAMING PLAN');
    console.log('='.repeat(80) + '\n');

    const renamePlan = [];

    svgFiles.forEach(oldFilename => {
      const sprintId = SVG_MAPPING[oldFilename];
      if (sprintId) {
        const newFilename = generateSvgFilename(sprintId);
        const oldPath = path.join(TITLES_DIR, oldFilename);
        const newPath = path.join(TITLES_DIR, newFilename);

        renamePlan.push({
          oldFilename,
          newFilename,
          sprintId,
          oldPath,
          newPath
        });

        console.log(`Sprint ${sprintId}:`);
        console.log(`  ${oldFilename}`);
        console.log(`  → ${newFilename}`);
        console.log('');
      } else {
        console.log(`⚠️  Unmapped file: ${oldFilename}`);
        console.log('');
      }
    });

    if (renamePlan.length === 0) {
      console.log('No files to rename.\n');
      return;
    }

    console.log(`Total files to rename: ${renamePlan.length}\n`);

    if (dryRun) {
      console.log('DRY RUN MODE - No files will be renamed');
      console.log('Run with --execute to actually rename files\n');
    } else {
      let renamed = 0;
      let errors = 0;

      renamePlan.forEach(plan => {
        try {
          if (fs.existsSync(plan.newPath)) {
            console.log(`⚠️  Skipping ${plan.oldFilename}: ${plan.newFilename} already exists`);
            return;
          }

          fs.renameSync(plan.oldPath, plan.newPath);
          console.log(`✓ Renamed: ${plan.oldFilename} → ${plan.newFilename}`);
          renamed++;
        } catch (error) {
          console.error(`✗ Error renaming ${plan.oldFilename}:`, error.message);
          errors++;
        }
      });

      console.log(`\nCompleted: ${renamed} renamed, ${errors} errors\n`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSvgFilename,
  SVG_MAPPING
};

