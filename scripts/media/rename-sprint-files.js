#!/usr/bin/env node

/**
 * Rename Sprint Files to Include Level Number Explicitly
 * 
 * Changes from: sprint-s1.1-fg.png
 * To: sprint-l1-s1-fg.png (more explicit level-sprint format)
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets', 'course-797', 'sprints');
const IMAGES_DIR = path.join(ASSETS_DIR, 'images');
const TITLES_DIR = path.join(ASSETS_DIR, 'titles');

/**
 * Parse sprint ID to extract level and sprint number
 * S1.1 -> { level: 1, sprint: 1 }
 * S2.10 -> { level: 2, sprint: 10 }
 */
function parseSprintId(sprintId) {
  const match = sprintId.match(/^S(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    level: parseInt(match[1], 10),
    sprint: parseInt(match[2], 10)
  };
}

/**
 * Generate new filename with explicit level
 * sprint-s1.1-fg.png -> sprint-l1-s1-fg.png
 */
function generateNewFilename(oldFilename, sprintId) {
  const parsed = parseSprintId(sprintId);
  if (!parsed) return null;

  // Extract the variant and extension
  const match = oldFilename.match(/^sprint-s\d+\.\d+-(.+)$/);
  if (!match) return null;

  const variant = match[1]; // e.g., "fg.png", "bg.png", "title.svg"
  
  return `sprint-l${parsed.level}-s${parsed.sprint}-${variant}`;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const dryRun = !execute;

  try {
    // Get all files
    const imageFiles = fs.existsSync(IMAGES_DIR) 
      ? fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png'))
      : [];
    
    const titleFiles = fs.existsSync(TITLES_DIR)
      ? fs.readdirSync(TITLES_DIR).filter(f => f.endsWith('.svg'))
      : [];

    console.log('\n' + '='.repeat(80));
    console.log('SPRINT FILE RENAMING PLAN (Explicit Level Format)');
    console.log('='.repeat(80) + '\n');

    const renamePlan = [];

    // Process image files
    imageFiles.forEach(filename => {
      const match = filename.match(/^sprint-s(\d+)\.(\d+)-(fg|bg)\.png$/);
      if (match) {
        const level = match[1];
        const sprint = match[2];
        const variant = match[3];
        const sprintId = `S${level}.${sprint}`;
        
        const newFilename = `sprint-l${level}-s${sprint}-${variant}.png`;
        const oldPath = path.join(IMAGES_DIR, filename);
        const newPath = path.join(IMAGES_DIR, newFilename);

        renamePlan.push({
          sprintId,
          oldFilename: filename,
          newFilename,
          oldPath,
          newPath,
          type: 'image'
        });
      }
    });

    // Process title files
    titleFiles.forEach(filename => {
      const match = filename.match(/^sprint-s(\d+)\.(\d+)-title\.svg$/);
      if (match) {
        const level = match[1];
        const sprint = match[2];
        const sprintId = `S${level}.${sprint}`;
        
        const newFilename = `sprint-l${level}-s${sprint}-title.svg`;
        const oldPath = path.join(TITLES_DIR, filename);
        const newPath = path.join(TITLES_DIR, newFilename);

        renamePlan.push({
          sprintId,
          oldFilename: filename,
          newFilename,
          oldPath,
          newPath,
          type: 'title'
        });
      }
    });

    if (renamePlan.length === 0) {
      console.log('No files found to rename.\n');
      return;
    }

    // Group by sprint
    const bySprint = {};
    renamePlan.forEach(plan => {
      if (!bySprint[plan.sprintId]) {
        bySprint[plan.sprintId] = [];
      }
      bySprint[plan.sprintId].push(plan);
    });

    // Print plan
    Object.keys(bySprint).sort().forEach(sprintId => {
      console.log(`Sprint ${sprintId}:`);
      bySprint[sprintId].forEach(plan => {
        console.log(`  ${plan.oldFilename}`);
        console.log(`    → ${plan.newFilename}`);
      });
      console.log('');
    });

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
  parseSprintId,
  generateNewFilename
};

