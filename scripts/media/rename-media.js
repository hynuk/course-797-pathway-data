#!/usr/bin/env node

/**
 * Rename Media Files to Match Naming Convention
 * 
 * Infers correct filenames from JSON and renames files accordingly
 */

const fs = require('fs');
const path = require('path');
const { resolveImageIdToFilename, getMediaFilePath, MEDIA_CONFIG } = require('./manage-media');

const JSON_FILE = path.join(__dirname, '..', '..', 'data', 'course-797', 'course_797_extensions.refined.json');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'course-797');

/**
 * Extract filename from GitHub URL
 */
function extractFilenameFromUrl(url) {
  if (!url || !url.startsWith('http')) return null;
  try {
    const urlObj = new URL(url);
    return path.basename(urlObj.pathname);
  } catch (e) {
    return null;
  }
}

/**
 * Build mapping from JSON
 */
function buildFileMapping() {
  const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const courseId = jsonData.courseId;
  const mapping = {
    scenes: {},
    sprints: {}
  };

  // Map scene images
  if (jsonData.sceneStack && jsonData.sceneStack.scenes) {
    jsonData.sceneStack.scenes.forEach(scene => {
      const imageId = scene.imageId;
      const levelId = scene.levelId;
      const sceneName = scene.name?.source || '';
      
      const correctFilename = resolveImageIdToFilename(imageId, 'scene');
      const correctPath = getMediaFilePath(imageId, 'scene', courseId);
      
      mapping.scenes[levelId] = {
        imageId,
        sceneName,
        correctFilename,
        correctPath
      };
    });
  }

  // Map sprint images from URLs in JSON
  if (jsonData.levels) {
    jsonData.levels.forEach(level => {
      if (level.sprints) {
        level.sprints.forEach(sprint => {
          const sprintId = sprint.sprintId;
          
          // Check foreground
          if (sprint.foregroundImageId) {
            const urlFilename = extractFilenameFromUrl(sprint.foregroundImageId);
            if (urlFilename) {
              const correctFilename = resolveImageIdToFilename(`IMG-${sprintId.replace('.', '.')}-FG`, 'foreground');
              const correctPath = getMediaFilePath(`IMG-${sprintId}-FG`, 'foreground', courseId);
              
              if (!mapping.sprints[urlFilename]) {
                mapping.sprints[urlFilename] = {
                  sprintId,
                  type: 'foreground',
                  correctFilename,
                  correctPath
                };
              }
            } else if (!sprint.foregroundImageId.startsWith('http')) {
              // It's an Image ID, not a URL
              const correctFilename = resolveImageIdToFilename(sprint.foregroundImageId, 'foreground');
              const correctPath = getMediaFilePath(sprint.foregroundImageId, 'foreground', courseId);
              
              mapping.sprints[sprint.foregroundImageId] = {
                sprintId,
                type: 'foreground',
                correctFilename,
                correctPath,
                isImageId: true
              };
            }
          }
          
          // Check background
          if (sprint.backgroundImageId) {
            const urlFilename = extractFilenameFromUrl(sprint.backgroundImageId);
            if (urlFilename) {
              const correctFilename = resolveImageIdToFilename(`IMG-${sprintId}-BG`, 'background');
              const correctPath = getMediaFilePath(`IMG-${sprintId}-BG`, 'background', courseId);
              
              if (!mapping.sprints[urlFilename]) {
                mapping.sprints[urlFilename] = {
                  sprintId,
                  type: 'background',
                  correctFilename,
                  correctPath
                };
              }
            } else if (sprint.backgroundImageId && !sprint.backgroundImageId.startsWith('http')) {
              // It's an Image ID, not a URL
              const correctFilename = resolveImageIdToFilename(sprint.backgroundImageId, 'background');
              const correctPath = getMediaFilePath(sprint.backgroundImageId, 'background', courseId);
              
              mapping.sprints[sprint.backgroundImageId] = {
                sprintId,
                type: 'background',
                correctFilename,
                correctPath,
                isImageId: true
              };
            }
          }
        });
      }
    });
  }

  return { mapping, courseId };
}

/**
 * Infer scene filename mapping
 */
function inferSceneMapping(existingFiles, mapping) {
  const sceneMapping = {};
  const sceneNames = {
    'tokyo': 'L1',
    'kyoto': 'L2',
    'osaka': 'L3',
    'sapporo': 'L4',
    'okinawa': 'L5'
  };

  existingFiles.forEach(file => {
    const basename = path.basename(file, path.extname(file)).toLowerCase();
    const levelId = sceneNames[basename];
    
    if (levelId && mapping.scenes[levelId]) {
      const correctInfo = mapping.scenes[levelId];
      sceneMapping[file] = {
        levelId,
        sceneName: correctInfo.sceneName,
        correctFilename: correctInfo.correctFilename,
        correctPath: correctInfo.correctPath
      };
    }
  });

  return sceneMapping;
}

/**
 * Infer sprint filename mapping
 */
function inferSprintMapping(existingFiles, mapping) {
  const sprintMapping = {};

  existingFiles.forEach(file => {
    const filename = path.basename(file);
    const basename = path.basename(file, path.extname(file)).toLowerCase();
    
    // Check if this filename is in our mapping
    if (mapping.sprints[filename]) {
      const info = mapping.sprints[filename];
      sprintMapping[file] = {
        sprintId: info.sprintId,
        type: info.type,
        correctFilename: info.correctFilename,
        correctPath: info.correctPath
      };
    } else {
      // Try to infer from filename patterns
      // Patterns like "small-talk-foreground" -> S1.1
      const isForeground = basename.includes('foreground') || basename.includes('-fg');
      const isBackground = basename.includes('background') || basename.includes('-bg');
      
      if (isForeground || isBackground) {
        // Try to match known patterns
        const type = isForeground ? 'foreground' : 'background';
        
        // Known mappings from JSON URLs
        const knownMappings = {
          'small-talk': { sprintId: 'S1.1', type: 'foreground' },
          'directions': { sprintId: 'S1.2', type: 'foreground' },
          'introductions-professions': { sprintId: 'S1.3', type: 'foreground' },
          'info-personal-preferences': { sprintId: 'S1.4', type: 'foreground' }
        };
        
        for (const [key, value] of Object.entries(knownMappings)) {
          if (basename.includes(key)) {
            const sprintId = value.sprintId;
            const imageId = `IMG-${sprintId}-${type === 'foreground' ? 'FG' : 'BG'}`;
            const correctFilename = resolveImageIdToFilename(imageId, type);
            const correctPath = getMediaFilePath(imageId, type, mapping.courseId);
            
            sprintMapping[file] = {
              sprintId,
              type,
              correctFilename,
              correctPath
            };
            break;
          }
        }
      }
    }
  });

  return sprintMapping;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const dryRun = !execute;

  try {
    // Build mapping from JSON
    const { mapping, courseId } = buildFileMapping();
    
    // Get existing files
    const scenesDir = path.join(ASSETS_DIR, 'scenes');
    const sprintsDir = path.join(ASSETS_DIR, 'sprints');
    
    const sceneFiles = fs.existsSync(scenesDir) 
      ? fs.readdirSync(scenesDir)
          .filter(f => /\.(png|jpg|jpeg|svg|webp)$/i.test(f))
          .map(f => path.join(scenesDir, f))
      : [];
    
    const sprintFiles = fs.existsSync(sprintsDir)
      ? fs.readdirSync(sprintsDir)
          .filter(f => /\.(png|jpg|jpeg|svg|webp)$/i.test(f))
          .map(f => path.join(sprintsDir, f))
      : [];

    // Infer mappings
    const sceneMapping = inferSceneMapping(sceneFiles, mapping);
    const sprintMapping = inferSprintMapping(sprintFiles, mapping);

    // Print plan
    console.log('\n' + '='.repeat(80));
    console.log('MEDIA FILE RENAMING PLAN');
    console.log('='.repeat(80) + '\n');

    if (Object.keys(sceneMapping).length > 0) {
      console.log('SCENE FILES:');
      Object.entries(sceneMapping).forEach(([oldPath, info]) => {
        const oldName = path.basename(oldPath);
        const newPath = path.join(ASSETS_DIR, info.correctPath);
        const newName = path.basename(newPath);
        
        console.log(`  ${oldName}`);
        console.log(`    → ${newName}`);
        console.log(`    Level: ${info.levelId} (${info.sceneName})`);
        console.log(`    Path: ${info.correctPath}`);
        console.log('');
      });
    }

    if (Object.keys(sprintMapping).length > 0) {
      console.log('SPRINT FILES:');
      Object.entries(sprintMapping).forEach(([oldPath, info]) => {
        const oldName = path.basename(oldPath);
        const newPath = path.join(ASSETS_DIR, info.correctPath);
        const newName = path.basename(newPath);
        
        console.log(`  ${oldName}`);
        console.log(`    → ${newName}`);
        console.log(`    Sprint: ${info.sprintId} (${info.type})`);
        console.log(`    Path: ${info.correctPath}`);
        console.log('');
      });
    }

    const totalFiles = Object.keys(sceneMapping).length + Object.keys(sprintMapping).length;
    
    if (totalFiles === 0) {
      console.log('No files found to rename.\n');
      return;
    }

    console.log(`Total files to rename: ${totalFiles}\n`);

    if (dryRun) {
      console.log('DRY RUN MODE - No files will be renamed');
      console.log('Run with --execute to actually rename files\n');
    } else {
      // Execute renaming
      let renamed = 0;
      let errors = 0;

      // Rename scene files
      Object.entries(sceneMapping).forEach(([oldPath, info]) => {
        try {
          // correctPath already includes course-797/, so join with assets base
          const newPath = path.join(__dirname, 'assets', info.correctPath);
          const newDir = path.dirname(newPath);
          
          // Ensure directory exists
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }
          
          // Rename file
          fs.renameSync(oldPath, newPath);
          console.log(`✓ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
          renamed++;
        } catch (error) {
          console.error(`✗ Error renaming ${path.basename(oldPath)}:`, error.message);
          errors++;
        }
      });

      // Rename sprint files
      Object.entries(sprintMapping).forEach(([oldPath, info]) => {
        try {
          // correctPath already includes course-797/, so join with assets base
          const newPath = path.join(__dirname, 'assets', info.correctPath);
          const newDir = path.dirname(newPath);
          
          // Ensure directory exists
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }
          
          // Rename file
          fs.renameSync(oldPath, newPath);
          console.log(`✓ Renamed: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
          renamed++;
        } catch (error) {
          console.error(`✗ Error renaming ${path.basename(oldPath)}:`, error.message);
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
  buildFileMapping,
  inferSceneMapping,
  inferSprintMapping
};

