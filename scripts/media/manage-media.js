#!/usr/bin/env node

/**
 * Media Management Tool for Course 797 Pathway
 * 
 * This script helps manage media assets referenced in course_797_extensions.refined.json
 * - Analyzes all media references in the JSON
 * - Validates which files exist locally
 * - Generates reports on missing files
 * - Provides utilities for organizing media assets
 */

const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, '..', '..', 'data', 'course-797', 'course_797_extensions.refined.json');
const MEDIA_DIR = path.join(__dirname, '..', '..', 'assets', 'course-797');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

// Media naming convention configuration
const MEDIA_CONFIG = {
  // GitHub repository configuration for URL generation
  github: {
    owner: 'hynuk',
    repo: 'course-pathway-data',  // Generic repository for all language pairs
    branch: 'main',
    basePath: 'assets'  // Base path in repository
  },
  // Folder structure (organized vs flat)
  structure: 'organized', // 'organized' or 'flat'
  // Organized structure paths
  paths: {
    scenes: 'scenes',
    sprints: 'sprints'
  },
  // Course-aware: if true, includes course-{id} in paths
  courseAware: true
};

/**
 * Extract all media references from the JSON file
 */
function extractMediaReferences(data) {
  const courseId = data.courseId || null;
  
  const references = {
    courseId: courseId,
    sceneImages: [],
    sprintForegrounds: [],
    sprintBackgrounds: [],
    sprintTitleIllustrations: [],
    sceneAssets: [],
    allReferences: new Set()
  };

  // Extract scene images
  if (data.sceneStack?.sceneImages) {
    data.sceneStack.sceneImages.forEach(img => {
      if (img.imageId) {
        references.sceneImages.push({
          imageId: img.imageId,
          sceneId: img.sceneId,
          assets: img.assets || []
        });
        references.allReferences.add(img.imageId);
      }
    });
  }

  // Extract sprint images from levels
  if (data.levels) {
    data.levels.forEach(level => {
      if (level.sprints) {
        level.sprints.forEach(sprint => {
          if (sprint.foregroundImageId) {
            references.sprintForegrounds.push({
              sprintId: sprint.sprintId,
              levelId: level.levelId,
              imageId: sprint.foregroundImageId,
              isUrl: sprint.foregroundImageId.startsWith('http'),
              isLocalId: !sprint.foregroundImageId.startsWith('http') && sprint.foregroundImageId !== null,
              courseId: courseId
            });
            references.allReferences.add(sprint.foregroundImageId);
          }
          
          if (sprint.backgroundImageId) {
            references.sprintBackgrounds.push({
              sprintId: sprint.sprintId,
              levelId: level.levelId,
              imageId: sprint.backgroundImageId,
              isUrl: sprint.backgroundImageId.startsWith('http'),
              isLocalId: !sprint.backgroundImageId.startsWith('http') && sprint.backgroundImageId !== null,
              courseId: courseId
            });
            references.allReferences.add(sprint.backgroundImageId);
          }
          
          if (sprint.titleIllustrationId) {
            references.sprintTitleIllustrations.push({
              sprintId: sprint.sprintId,
              levelId: level.levelId,
              imageId: sprint.titleIllustrationId,
              isUrl: sprint.titleIllustrationId.startsWith('http'),
              isLocalId: !sprint.titleIllustrationId.startsWith('http') && sprint.titleIllustrationId !== null,
              courseId: courseId
            });
            references.allReferences.add(sprint.titleIllustrationId);
          }
        });
      }
    });
  }

  return references;
}

/**
 * Get all files in the media directory (supports organized structure)
 */
function getLocalMediaFiles() {
  if (!fs.existsSync(MEDIA_DIR)) {
    return [];
  }

  const files = [];
  
  function scanDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          files.push({
            filename: entry.name,
            relativePath: relPath,
            path: fullPath,
            basename: path.basename(entry.name, ext),
            directory: relativePath ? path.dirname(relPath) : ''
          });
        }
      }
    });
  }
  
  scanDirectory(MEDIA_DIR);
  return files;
}

/**
 * Resolve image ID to expected filename (without folder structure)
 * Uses the standardized naming convention: {type}-{identifier}-{variant}.{ext}
 */
function resolveImageIdToFilename(imageId, type = 'foreground') {
  if (!imageId || imageId.startsWith('http')) {
    return null;
  }

  // Handle sprint foreground images: "IMG-S2.1-FG" -> "sprint-l2-s1-fg.png"
  // Format: sprint-l{level}-s{sprint}-{variant}.{ext}
  if (imageId.includes('-FG')) {
    const sprintId = imageId.replace('IMG-', '').replace('-FG', '');
    const match = sprintId.match(/^S(\d+)\.(\d+)$/);
    if (match) {
      const level = match[1];
      const sprint = match[2];
      return `sprint-l${level}-s${sprint}-fg.png`;
    }
    // Fallback to old format for compatibility
    return `sprint-${sprintId.toLowerCase()}-fg.png`;
  }
  
  // Handle sprint background images: "IMG-S2.1-BG" -> "sprint-l2-s1-bg.png"
  if (imageId.includes('-BG')) {
    const sprintId = imageId.replace('IMG-', '').replace('-BG', '');
    const match = sprintId.match(/^S(\d+)\.(\d+)$/);
    if (match) {
      const level = match[1];
      const sprint = match[2];
      return `sprint-l${level}-s${sprint}-bg.png`;
    }
    // Fallback to old format for compatibility
    return `sprint-${sprintId.toLowerCase()}-bg.png`;
  }

  // Handle scene images: "IMG-SCN-L1" -> "scene-l1.png"
  if (imageId.startsWith('IMG-SCN-')) {
    const levelId = imageId.replace('IMG-SCN-', '').toLowerCase();
    return `scene-${levelId}.png`;
  }

  // Handle sprint title illustrations: "IMG-S1.1-TITLE" -> "sprint-l1-s1-title.png"
  if (imageId.includes('-TITLE')) {
    const sprintId = imageId.replace('IMG-', '').replace('-TITLE', '');
    const match = sprintId.match(/^S(\d+)\.(\d+)$/);
    if (match) {
      const level = match[1];
      const sprint = match[2];
      return `sprint-l${level}-s${sprint}-title.png`;
    }
    // Fallback to old format for compatibility
    return `sprint-${sprintId.toLowerCase()}-title.png`;
  }

  // Generic fallback (shouldn't happen with proper Image IDs)
  const cleanId = imageId.replace('IMG-', '').toLowerCase();
  return `${cleanId}.png`;
}

/**
 * Get the full file path based on naming convention and folder structure
 * @param {string} imageId - The image ID (e.g., "IMG-S2.1-FG")
 * @param {string} type - Image type ('foreground' or 'background')
 * @param {number|string} courseId - Optional course ID (e.g., 797)
 */
function getMediaFilePath(imageId, type = 'foreground', courseId = null) {
  const filename = resolveImageIdToFilename(imageId, type);
  if (!filename) return null;

  const parts = [];
  
  // Add course prefix if course-aware and courseId provided
  if (MEDIA_CONFIG.courseAware && courseId) {
    parts.push(`course-${courseId}`);
  }

  if (MEDIA_CONFIG.structure === 'organized') {
    if (filename.startsWith('scene-')) {
      parts.push(MEDIA_CONFIG.paths.scenes);
      parts.push(filename);
    } else if (filename.startsWith('sprint-')) {
      // Check if it's a title illustration (SVG) or image (PNG)
      if (filename.endsWith('.svg')) {
        // Title illustrations go in sprints/titles/
        parts.push(MEDIA_CONFIG.paths.sprints);
        parts.push('titles');
        parts.push(filename);
      } else {
        // PNG images go in sprints/images/
        parts.push(MEDIA_CONFIG.paths.sprints);
        parts.push('images');
        parts.push(filename);
      }
    } else {
      parts.push(filename);
    }
  } else {
    // Flat structure - just return filename (with course prefix if needed)
    if (parts.length > 0) {
      parts.push(filename);
    } else {
      return filename;
    }
  }

  return path.join(...parts);
}

/**
 * Generate GitHub raw URL for an image
 * @param {string} imageId - The image ID (e.g., "IMG-S2.1-FG", "IMG-S1.1-TITLE")
 * @param {string} type - Image type ('foreground', 'background', 'title', or 'scene')
 * @param {number|string} courseId - Optional course ID (e.g., 797)
 */
function generateGitHubUrl(imageId, type = 'foreground', courseId = null) {
  const filePath = getMediaFilePath(imageId, type, courseId);
  if (!filePath) return null;

  const { owner, repo, branch, basePath } = MEDIA_CONFIG.github;
  const fullPath = path.join(basePath, filePath).replace(/\\/g, '/'); // Normalize for URLs
  
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fullPath}`;
}

/**
 * Parse GitHub URL to extract file information
 */
function parseGitHubUrl(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'raw.githubusercontent.com') {
      return null;
    }

    const parts = urlObj.pathname.split('/').filter(p => p);
    // Format: /owner/repo/branch/path/to/file
    if (parts.length < 4) return null;

    const owner = parts[0];
    const repo = parts[1];
    const branch = parts[2];
    const filePath = parts.slice(3).join('/');
    const filename = path.basename(filePath);
    const dir = path.dirname(filePath);

    return {
      owner,
      repo,
      branch,
      filePath,
      filename,
      dir,
      baseUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`
    };
  } catch (e) {
    return null;
  }
}

/**
 * Validate media references against local files
 */
function validateMediaReferences(references, localFiles) {
  const validation = {
    valid: [],
    missing: [],
    urls: [],
    localFiles: localFiles.map(f => f.filename),
    orphanedFiles: []
  };

  // Create a map of local files by basename and by expected filename
  const localFileMap = new Map();
  const localFileByExpectedName = new Map();
  
  localFiles.forEach(file => {
    // Map by basename (for legacy matching)
    localFileMap.set(file.basename.toLowerCase(), file);
    // Map by expected filename pattern (for new convention)
    const expectedName = file.relativePath || file.filename;
    localFileByExpectedName.set(expectedName.toLowerCase(), file);
    // Also map by just filename for flat structure
    localFileByExpectedName.set(file.filename.toLowerCase(), file);
  });

  // Check sprint foreground images
  references.sprintForegrounds.forEach(ref => {
    if (ref.isUrl) {
      validation.urls.push({
        type: 'foreground',
        sprintId: ref.sprintId,
        url: ref.imageId
      });
    } else if (ref.isLocalId) {
      const expectedFilename = resolveImageIdToFilename(ref.imageId, 'foreground');
      const courseId = ref.courseId || references.courseId;
      const expectedPath = getMediaFilePath(ref.imageId, 'foreground', courseId);
      
      if (expectedFilename) {
        // Try to find by expected path (new convention)
        let localFile = expectedPath ? localFileByExpectedName.get(expectedPath.toLowerCase()) : null;
        
        // Fallback: try by basename (legacy support)
        if (!localFile) {
          const basename = path.basename(expectedFilename, path.extname(expectedFilename));
          localFile = localFileMap.get(basename.toLowerCase());
        }
        
        if (localFile) {
          validation.valid.push({
            type: 'foreground',
            sprintId: ref.sprintId,
            imageId: ref.imageId,
            filename: localFile.filename,
            path: localFile.path,
            expectedPath: expectedPath,
            courseId: courseId,
            githubUrl: generateGitHubUrl(ref.imageId, 'foreground', courseId)
          });
        } else {
          validation.missing.push({
            type: 'foreground',
            sprintId: ref.sprintId,
            imageId: ref.imageId,
            expectedFilename: expectedFilename,
            expectedPath: expectedPath,
            courseId: courseId,
            githubUrl: generateGitHubUrl(ref.imageId, 'foreground', courseId)
          });
        }
      }
    }
  });

  // Check sprint background images
  references.sprintBackgrounds.forEach(ref => {
    if (ref.isUrl) {
      validation.urls.push({
        type: 'background',
        sprintId: ref.sprintId,
        url: ref.imageId
      });
    } else if (ref.isLocalId) {
      const expectedFilename = resolveImageIdToFilename(ref.imageId, 'background');
      const courseId = ref.courseId || references.courseId;
      const expectedPath = getMediaFilePath(ref.imageId, 'background', courseId);
      
      if (expectedFilename) {
        // Try to find by expected path (new convention)
        let localFile = expectedPath ? localFileByExpectedName.get(expectedPath.toLowerCase()) : null;
        
        // Fallback: try by basename (legacy support)
        if (!localFile) {
          const basename = path.basename(expectedFilename, path.extname(expectedFilename));
          localFile = localFileMap.get(basename.toLowerCase());
        }
        
        if (localFile) {
          validation.valid.push({
            type: 'background',
            sprintId: ref.sprintId,
            imageId: ref.imageId,
            filename: localFile.filename,
            path: localFile.path,
            expectedPath: expectedPath,
            courseId: courseId,
            githubUrl: generateGitHubUrl(ref.imageId, 'background', courseId)
          });
        } else {
          validation.missing.push({
            type: 'background',
            sprintId: ref.sprintId,
            imageId: ref.imageId,
            expectedFilename: expectedFilename,
            expectedPath: expectedPath,
            courseId: courseId,
            githubUrl: generateGitHubUrl(ref.imageId, 'background', courseId)
          });
        }
      }
    }
  });

  // Find orphaned files (files that aren't referenced)
  const referencedFilenames = new Set();
  validation.valid.forEach(v => referencedFilenames.add(v.filename.toLowerCase()));
  
  // Also check URLs for filename matches
  references.sprintForegrounds.forEach(ref => {
    if (ref.isUrl) {
      try {
        const urlFilename = path.basename(new URL(ref.imageId).pathname);
        referencedFilenames.add(urlFilename.toLowerCase());
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });
  references.sprintBackgrounds.forEach(ref => {
    if (ref.isUrl) {
      try {
        const urlFilename = path.basename(new URL(ref.imageId).pathname);
        referencedFilenames.add(urlFilename.toLowerCase());
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });

  localFiles.forEach(file => {
    if (!referencedFilenames.has(file.filename.toLowerCase())) {
      validation.orphanedFiles.push(file);
    }
  });

  return validation;
}

/**
 * Generate a detailed report
 */
function generateReport(validation, references) {
  const report = {
    summary: {
      totalSprints: references.sprintForegrounds.length,
      validFiles: validation.valid.length,
      missingFiles: validation.missing.length,
      urlReferences: validation.urls.length,
      orphanedFiles: validation.orphanedFiles.length,
      totalLocalFiles: validation.localFiles.length
    },
    details: {
      valid: validation.valid,
      missing: validation.missing,
      urls: validation.urls,
      orphaned: validation.orphanedFiles
    }
  };

  return report;
}

/**
 * Print formatted report to console
 */
function printReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('MEDIA MANAGEMENT REPORT');
  console.log('='.repeat(80) + '\n');

  // Extract course ID from first item if available
  const courseId = report.details.missing[0]?.courseId || 
                   report.details.valid[0]?.courseId || 
                   report.details.urls[0]?.courseId || null;
  
  console.log('SUMMARY:');
  if (courseId) {
    console.log(`  Course ID: ${courseId}`);
  }
  console.log(`  Total Sprints: ${report.summary.totalSprints}`);
  console.log(`  Valid Local Files: ${report.summary.validFiles}`);
  console.log(`  Missing Files: ${report.summary.missingFiles}`);
  console.log(`  URL References: ${report.summary.urlReferences}`);
  console.log(`  Orphaned Files: ${report.summary.orphanedFiles}`);
  console.log(`  Total Local Files: ${report.summary.totalLocalFiles}\n`);

  if (report.details.missing.length > 0) {
    console.log('MISSING FILES:');
    report.details.missing.forEach(item => {
      console.log(`  [${item.type.toUpperCase()}] ${item.sprintId}:`);
      console.log(`    Image ID: ${item.imageId}`);
      console.log(`    Expected: ${item.expectedPath || item.expectedFilename}`);
      if (item.githubUrl) {
        console.log(`    GitHub URL: ${item.githubUrl}`);
      }
    });
    console.log('');
  }

  if (report.details.urls.length > 0) {
    console.log('URL REFERENCES (external):');
    const urlCounts = {};
    report.details.urls.forEach(item => {
      const domain = new URL(item.url).hostname;
      urlCounts[domain] = (urlCounts[domain] || 0) + 1;
    });
    Object.entries(urlCounts).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} references`);
    });
    console.log('');
  }

  if (report.details.orphaned.length > 0) {
    console.log('ORPHANED FILES (not referenced in JSON):');
    report.details.orphaned.forEach(file => {
      console.log(`  ${file.filename}`);
    });
    console.log('');
  }

  if (report.details.valid.length > 0) {
    console.log('VALID LOCAL FILES:');
    const byType = { foreground: [], background: [] };
    report.details.valid.forEach(item => {
      byType[item.type].push(item);
    });
    
    console.log(`  Foreground: ${byType.foreground.length} files`);
    console.log(`  Background: ${byType.background.length} files`);
    console.log('');
  }

  console.log('='.repeat(80) + '\n');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  try {
    // Load JSON file
    if (!fs.existsSync(JSON_FILE)) {
      console.error(`Error: JSON file not found: ${JSON_FILE}`);
      process.exit(1);
    }

    const jsonData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
    
    // Extract media references
    const references = extractMediaReferences(jsonData);
    
    // Get local files
    const localFiles = getLocalMediaFiles();
    
    // Validate
    const validation = validateMediaReferences(references, localFiles);
    
    // Generate report
    const report = generateReport(validation, references);

    switch (command) {
      case 'report':
        printReport(report);
        break;
      
      case 'json':
        console.log(JSON.stringify(report, null, 2));
        break;
      
      case 'missing':
        if (report.details.missing.length === 0) {
          console.log('No missing files!');
        } else {
          console.log('Missing files:');
          report.details.missing.forEach(item => {
            console.log(`  ${item.expectedFilename} (for ${item.sprintId})`);
          });
        }
        break;
      
      case 'orphaned':
        if (report.details.orphaned.length === 0) {
          console.log('No orphaned files!');
        } else {
          console.log('Orphaned files:');
          report.details.orphaned.forEach(file => {
            console.log(`  ${file.filename}`);
          });
        }
        break;
      
      case 'manifest':
        // Generate a manifest of all needed files
        console.log('Media File Manifest\n');
        console.log('Files needed for Image ID references:\n');
        const manifest = {};
        report.details.missing.forEach(item => {
          if (!manifest[item.sprintId]) {
            manifest[item.sprintId] = {};
          }
          manifest[item.sprintId][item.type] = {
            filename: item.expectedFilename,
            path: item.expectedPath || item.expectedFilename,
            githubUrl: item.githubUrl
          };
        });
        
        Object.entries(manifest).forEach(([sprintId, files]) => {
          console.log(`${sprintId}:`);
          if (files.foreground) {
            console.log(`  Foreground: ${files.foreground.path}`);
            if (files.foreground.githubUrl) {
              console.log(`    URL: ${files.foreground.githubUrl}`);
            }
          }
          if (files.background) {
            console.log(`  Background: ${files.background.path}`);
            if (files.background.githubUrl) {
              console.log(`    URL: ${files.background.githubUrl}`);
            }
          }
        });
        break;
      
      case 'urls':
        // Generate GitHub URLs for all Image ID references
        console.log('GitHub URLs for Image ID References\n');
        const urlMap = {};
        
        // Collect all Image IDs
        references.sprintForegrounds.forEach(ref => {
          if (ref.isLocalId) {
            const courseId = ref.courseId || references.courseId;
            const url = generateGitHubUrl(ref.imageId, 'foreground', courseId);
            if (url) {
              if (!urlMap[ref.sprintId]) urlMap[ref.sprintId] = {};
              urlMap[ref.sprintId].foreground = {
                imageId: ref.imageId,
                url: url,
                path: getMediaFilePath(ref.imageId, 'foreground', courseId),
                courseId: courseId
              };
            }
          }
        });
        
        references.sprintBackgrounds.forEach(ref => {
          if (ref.isLocalId) {
            const courseId = ref.courseId || references.courseId;
            const url = generateGitHubUrl(ref.imageId, 'background', courseId);
            if (url) {
              if (!urlMap[ref.sprintId]) urlMap[ref.sprintId] = {};
              urlMap[ref.sprintId].background = {
                imageId: ref.imageId,
                url: url,
                path: getMediaFilePath(ref.imageId, 'background', courseId),
                courseId: courseId
              };
            }
          }
        });
        
        Object.entries(urlMap).sort().forEach(([sprintId, data]) => {
          console.log(`${sprintId}:`);
          if (data.foreground) {
            console.log(`  FG: ${data.foreground.url}`);
            console.log(`     Path: ${data.foreground.path}`);
          }
          if (data.background) {
            console.log(`  BG: ${data.background.url}`);
            console.log(`     Path: ${data.background.path}`);
          }
        });
        break;
      
      default:
        console.log('Usage: node manage-media.js [command]');
        console.log('Commands:');
        console.log('  report   - Print detailed report (default)');
        console.log('  json     - Output report as JSON');
        console.log('  missing  - List only missing files');
        console.log('  orphaned - List only orphaned files');
        console.log('  manifest - Generate file manifest for missing files');
        console.log('  urls     - Generate GitHub URLs for all Image ID references');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  extractMediaReferences,
  getLocalMediaFiles,
  validateMediaReferences,
  generateReport,
  resolveImageIdToFilename,
  getMediaFilePath,
  generateGitHubUrl,
  parseGitHubUrl,
  MEDIA_CONFIG
};

