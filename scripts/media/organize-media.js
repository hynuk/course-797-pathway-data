#!/usr/bin/env node

/**
 * Media Organization Utility
 * 
 * Helps organize media files according to the naming convention:
 * - Creates proper folder structure
 * - Renames files to match convention
 * - Generates organization report
 */

const fs = require('fs');
const path = require('path');
const { resolveImageIdToFilename, getMediaFilePath, generateGitHubUrl, MEDIA_CONFIG } = require('./manage-media');

const MEDIA_DIR = path.join(__dirname, 'course-797-thumbnails');
const TARGET_DIR = path.join(__dirname, 'assets');

/**
 * Get course ID from JSON file or parameter
 */
function getCourseId(courseId = null) {
  if (courseId) return courseId;
  
  // Try to read from JSON file
  const jsonFile = path.join(__dirname, '..', '..', 'data', 'course-797', 'course_797_extensions.refined.json');
  if (fs.existsSync(jsonFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
      return data.courseId || null;
    } catch (e) {
      // Ignore errors
    }
  }
  
  return null;
}

/**
 * Create the organized folder structure
 * @param {number|string} courseId - Optional course ID
 */
function createFolderStructure(courseId = null) {
  const folders = [];
  const courseIdValue = courseId || getCourseId();
  
  // Base assets directory
  let baseDir = TARGET_DIR;
  
  // Add course-specific directory if course-aware
  if (MEDIA_CONFIG.courseAware && courseIdValue) {
    baseDir = path.join(TARGET_DIR, `course-${courseIdValue}`);
  }
  
  if (MEDIA_CONFIG.structure === 'organized') {
    folders.push(path.join(baseDir, MEDIA_CONFIG.paths.scenes));
    folders.push(path.join(baseDir, MEDIA_CONFIG.paths.sprints));
  } else {
    folders.push(baseDir);
  }
  
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created directory: ${folder}`);
    }
  });
  
  return folders;
}

/**
 * Generate organization plan (dry run)
 */
function generateOrganizationPlan() {
  if (!fs.existsSync(MEDIA_DIR)) {
    console.log(`Media directory not found: ${MEDIA_DIR}`);
    return null;
  }
  
  const files = fs.readdirSync(MEDIA_DIR);
  const plan = {
    organized: [],
    needsRename: [],
    unknown: []
  };
  
  files.forEach(file => {
    const filePath = path.join(MEDIA_DIR, file);
    const stat = fs.statSync(filePath);
    
    if (!stat.isFile()) return;
    
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)) return;
    
    const basename = path.basename(file, ext);
    
    // Check if file already follows convention
    if (file.startsWith('scene-') || file.startsWith('sprint-')) {
      const targetPath = getTargetPath(file);
      plan.organized.push({
        current: file,
        target: targetPath,
        action: 'move'
      });
    } else {
      // Try to infer from filename
      const inferred = inferImageIdFromFilename(basename);
      if (inferred) {
        const newName = resolveImageIdToFilename(inferred.imageId, inferred.type);
        const targetPath = getTargetPath(newName);
        plan.needsRename.push({
          current: file,
          newName: newName,
          target: targetPath,
          imageId: inferred.imageId,
          action: 'rename_and_move'
        });
      } else {
        plan.unknown.push({
          file: file,
          action: 'manual_review'
        });
      }
    }
  });
  
  return plan;
}

/**
 * Infer Image ID from filename (heuristic matching)
 */
function inferImageIdFromFilename(basename) {
  const lower = basename.toLowerCase();
  
  // Try to match common patterns
  // Legacy patterns like "small-talk-foreground" -> S1.1
  // This is a best-guess heuristic - may need manual mapping
  
  // Check for scene patterns
  if (lower.includes('scene') || lower.includes('scn')) {
    const levelMatch = lower.match(/l(\d+)/);
    if (levelMatch) {
      return {
        imageId: `IMG-SCN-L${levelMatch[1]}`,
        type: 'scene'
      };
    }
  }
  
  // Check for sprint patterns
  const sprintMatch = lower.match(/s(\d+)\.(\d+)/);
  if (sprintMatch) {
    const level = sprintMatch[1];
    const sprint = sprintMatch[2];
    const isForeground = lower.includes('foreground') || lower.includes('fg');
    const isBackground = lower.includes('background') || lower.includes('bg');
    
    if (isForeground) {
      return {
        imageId: `IMG-S${level}.${sprint}-FG`,
        type: 'foreground'
      };
    } else if (isBackground) {
      return {
        imageId: `IMG-S${level}.${sprint}-BG`,
        type: 'background'
      };
    }
  }
  
  return null;
}

/**
 * Get target path for a file
 * @param {string} filename - The filename
 * @param {number|string} courseId - Optional course ID
 */
function getTargetPath(filename, courseId = null) {
  const courseIdValue = courseId || getCourseId();
  let baseDir = TARGET_DIR;
  
  // Add course-specific directory if course-aware
  if (MEDIA_CONFIG.courseAware && courseIdValue) {
    baseDir = path.join(TARGET_DIR, `course-${courseIdValue}`);
  }
  
  if (MEDIA_CONFIG.structure === 'organized') {
    if (filename.startsWith('scene-')) {
      return path.join(baseDir, MEDIA_CONFIG.paths.scenes, filename);
    } else if (filename.startsWith('sprint-')) {
      return path.join(baseDir, MEDIA_CONFIG.paths.sprints, filename);
    }
  }
  return path.join(baseDir, filename);
}

/**
 * Print organization plan
 */
function printPlan(plan) {
  if (!plan) return;
  
  console.log('\n' + '='.repeat(80));
  console.log('MEDIA ORGANIZATION PLAN');
  console.log('='.repeat(80) + '\n');
  
  if (plan.organized.length > 0) {
    console.log(`FILES READY TO ORGANIZE (${plan.organized.length}):`);
    plan.organized.forEach(item => {
      console.log(`  ${item.current}`);
      console.log(`    → ${item.target}`);
    });
    console.log('');
  }
  
  if (plan.needsRename.length > 0) {
    console.log(`FILES NEEDING RENAME (${plan.needsRename.length}):`);
    plan.needsRename.forEach(item => {
      console.log(`  ${item.current}`);
      console.log(`    → ${item.newName}`);
      console.log(`    → ${item.target}`);
      console.log(`    Image ID: ${item.imageId}`);
    });
    console.log('');
  }
  
  if (plan.unknown.length > 0) {
    console.log(`FILES NEEDING MANUAL REVIEW (${plan.unknown.length}):`);
    plan.unknown.forEach(item => {
      console.log(`  ${item.file}`);
    });
    console.log('');
  }
  
  console.log('='.repeat(80) + '\n');
}

/**
 * Execute organization (with confirmation)
 */
function executeOrganization(plan, dryRun = true) {
  if (!plan) return;
  
  if (dryRun) {
    console.log('DRY RUN MODE - No files will be moved or renamed\n');
    printPlan(plan);
    console.log('Run with --execute to actually organize files');
    return;
  }
  
  // Create folder structure
  createFolderStructure();
  
  let moved = 0;
  let renamed = 0;
  let errors = 0;
  
  // Move organized files
  plan.organized.forEach(item => {
    try {
      const source = path.join(MEDIA_DIR, item.current);
      const targetDir = path.dirname(item.target);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(source, item.target);
      console.log(`✓ Moved: ${item.current} → ${item.target}`);
      moved++;
    } catch (error) {
      console.error(`✗ Error moving ${item.current}:`, error.message);
      errors++;
    }
  });
  
  // Rename and move files
  plan.needsRename.forEach(item => {
    try {
      const source = path.join(MEDIA_DIR, item.current);
      const targetDir = path.dirname(item.target);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(source, item.target);
      console.log(`✓ Renamed & moved: ${item.current} → ${item.newName}`);
      renamed++;
    } catch (error) {
      console.error(`✗ Error renaming ${item.current}:`, error.message);
      errors++;
    }
  });
  
  console.log(`\nCompleted: ${moved} moved, ${renamed} renamed, ${errors} errors`);
}

/**
 * Generate folder structure template
 * @param {number|string} courseId - Optional course ID
 */
function generateStructureTemplate(courseId = null) {
  const courseIdValue = courseId || getCourseId();
  console.log('Generating folder structure template...\n');
  
  if (courseIdValue) {
    console.log(`Course ID: ${courseIdValue}\n`);
  }
  
  createFolderStructure(courseIdValue);
  
  // Determine base directory
  let baseDir = TARGET_DIR;
  if (MEDIA_CONFIG.courseAware && courseIdValue) {
    baseDir = path.join(TARGET_DIR, `course-${courseIdValue}`);
  }
  
  // Create README in assets folder
  const readmePath = path.join(baseDir, 'README.md');
  const courseLabel = courseIdValue ? `Course ${courseIdValue} ` : '';
  const readmeContent = `# ${courseLabel}Pathway Assets

This directory contains all media assets for the ${courseLabel}Pathway prototype.

## Structure

\`\`\`
${MEDIA_CONFIG.courseAware && courseIdValue ? `course-${courseIdValue}/` : ''}assets/
├── scenes/              # Level scene backgrounds
│   ├── scene-l1.png
│   ├── scene-l2.png
│   └── ...
└── sprints/             # Sprint thumbnails
    ├── sprint-s1.1-fg.png
    ├── sprint-s1.1-bg.png
    └── ...
\`\`\`

## Naming Convention

See \`MEDIA_NAMING_CONVENTION.md\` for details.

## GitHub URLs

Assets are accessed via GitHub raw URLs:
\`https://raw.githubusercontent.com/${MEDIA_CONFIG.github.owner}/${MEDIA_CONFIG.github.repo}/${MEDIA_CONFIG.github.branch}/assets/${courseIdValue ? `course-${courseIdValue}/` : ''}{path}\`
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`Created: ${readmePath}`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'plan';
  const execute = args.includes('--execute');
  
  try {
    switch (command) {
      case 'plan':
        const plan = generateOrganizationPlan();
        printPlan(plan);
        if (!execute) {
          console.log('Run with --execute to organize files');
        } else {
          executeOrganization(plan, false);
        }
        break;
      
      case 'structure':
        generateStructureTemplate();
        break;
      
      case 'help':
      default:
        console.log('Usage: node organize-media.js [command] [--execute]');
        console.log('\nCommands:');
        console.log('  plan      - Generate organization plan (default, dry run)');
        console.log('  structure - Create folder structure template');
        console.log('\nOptions:');
        console.log('  --execute - Actually execute the organization (use with caution!)');
        console.log('\nExamples:');
        console.log('  node organize-media.js plan              # Preview plan');
        console.log('  node organize-media.js plan --execute      # Execute plan');
        console.log('  node organize-media.js structure           # Create folders');
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
  createFolderStructure,
  generateOrganizationPlan,
  inferImageIdFromFilename
};

