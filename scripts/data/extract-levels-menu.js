/**
 * Extract levels menu data from course_797_extensions.refined.json
 * 
 * This script transforms the levels array into a simplified format
 * suitable for a levels menu component in Create With Play.
 * 
 * Usage in Create With Play:
 * 1. After your Fetch block, add a Transform block
 * 2. Use this transformation logic to extract levels menu data
 */

function extractLevelsMenu(data) {
  if (!data || !data.levels || !Array.isArray(data.levels)) {
    return [];
  }

  return data.levels.map((level, index) => {
    // Extract level number from levelId (e.g., "L1" -> 1)
    const levelNumber = parseInt(level.levelId.replace('L', '')) || index + 1;
    
    return {
      levelId: level.levelId,
      levelNumber: levelNumber,
      unitId: level.unitId,
      name: level.scene?.name?.source || `Level ${levelNumber}`,
      nameTarget: level.scene?.name?.target || '',
      nameRomanization: level.scene?.name?.romanization || '',
      description: level.scene?.description?.source || '',
      descriptionTarget: level.scene?.description?.target || '',
      sceneId: level.scene?.sceneId || '',
      sprintCount: level.sprints?.length || 0,
      imageId: level.scene?.imageId || null,
      // Optional: include first sprint info for preview
      firstSprint: level.sprints && level.sprints.length > 0 ? {
        sprintId: level.sprints[0].sprintId,
        name: level.sprints[0].name?.target || level.sprints[0].name?.source || ''
      } : null
    };
  });
}

// For Create With Play Transform block, use this:
// Input: The JSON response from Fetch
// Output: The transformed levels menu array

// Example usage in Create With Play:
// In your Transform block, set the output to:
// extractLevelsMenu(input)

// Or if you prefer a simpler inline version for Create With Play:
const levelsMenu = (data) => {
  return data?.levels?.map((level, i) => ({
    levelId: level.levelId,
    levelNumber: parseInt(level.levelId.replace('L', '')) || i + 1,
    name: level.scene?.name?.source || `Level ${i + 1}`,
    description: level.scene?.description?.source || '',
    sceneId: level.scene?.sceneId || '',
    sprintCount: level.sprints?.length || 0
  })) || [];
};

// Export for use in Create With Play
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractLevelsMenu, levelsMenu };
}

