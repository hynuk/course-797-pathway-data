/**
 * Component-Specific Data Extractors
 * 
 * Use these functions in Create With Play Transform blocks
 * to extract data for specific UI components.
 * 
 * All functions take the full JSON response as input.
 */

// ============================================
// 1. LEVELS MENU COMPONENT
// ============================================
function extractLevelsMenu(data) {
  return data?.levels?.map((level, i) => ({
    levelId: level.levelId,
    levelNumber: parseInt(level.levelId.replace('L', '')) || i + 1,
    name: level.scene?.name?.source || `Level ${i + 1}`,
    nameTarget: level.scene?.name?.target || '',
    description: level.scene?.description?.source || '',
    sceneId: level.scene?.sceneId || '',
    sprintCount: level.sprints?.length || 0
  })) || [];
}

// ============================================
// 2. SCENE VIEW COMPONENT
// ============================================
function extractSceneData(data, sceneId) {
  if (!data?.sceneStack) return null;
  
  const scene = data.sceneStack.scenes?.find(s => s.sceneId === sceneId);
  if (!scene) return null;
  
  const waypoints = data.sceneStack.sceneWaypoints?.find(
    w => w.sceneId === sceneId
  )?.waypoints || [];
  
  const artifacts = data.sceneStack.sceneArtifacts?.find(
    a => a.sceneId === sceneId
  )?.artifacts || [];
  
  const placements = data.sceneStack.sceneSprintPlacements?.find(
    p => p.sceneId === sceneId
  )?.placements || [];
  
  const image = data.sceneStack.sceneImages?.find(
    img => img.sceneId === sceneId
  );
  
  return {
    sceneId: scene.sceneId,
    levelId: scene.levelId,
    name: scene.name,
    image: image || null,
    waypoints: waypoints,
    artifacts: artifacts,
    placements: placements
  };
}

// ============================================
// 3. SPRINT LIST COMPONENT
// ============================================
function extractSprintsForLevel(data, levelId) {
  const level = data?.levels?.find(l => l.levelId === levelId);
  if (!level) return [];
  
  return level.sprints?.map(sprint => ({
    sprintId: sprint.sprintId,
    chapterId: sprint.chapterId,
    name: sprint.name,
    description: sprint.description,
    type: sprint.type,
    status: sprint.status,
    foregroundImageId: sprint.foregroundImageId,
    backgroundImageId: sprint.backgroundImageId
  })) || [];
}

// ============================================
// 4. ARTIFACT DETAILS COMPONENT
// ============================================
function extractArtifactsForScene(data, sceneId) {
  const artifactSet = data?.sceneStack?.sceneArtifacts?.find(
    a => a.sceneId === sceneId
  );
  
  return artifactSet?.artifacts?.map(artifact => ({
    artifactId: artifact.artifactId,
    type: artifact.type,
    name: artifact.name,
    description: artifact.description,
    position: artifact.position,
    size: artifact.size,
    layer: artifact.layer,
    defaultState: artifact.defaultState,
    unlockRules: artifact.unlockRules,
    triggers: artifact.triggers,
    interaction: artifact.interaction
  })) || [];
}

// ============================================
// 5. WAYPOINT MAP COMPONENT
// ============================================
function extractWaypointsForScene(data, sceneId) {
  const waypointSet = data?.sceneStack?.sceneWaypoints?.find(
    w => w.sceneId === sceneId
  );
  
  return {
    coordSystem: waypointSet?.coordSystem || 'percent',
    waypoints: waypointSet?.waypoints?.map(wp => ({
      waypointId: wp.waypointId,
      x: wp.x,
      y: wp.y
    })) || []
  };
}

// ============================================
// 6. LEVEL DETAILS COMPONENT
// ============================================
function extractLevelDetails(data, levelId) {
  const level = data?.levels?.find(l => l.levelId === levelId);
  if (!level) return null;
  
  return {
    levelId: level.levelId,
    unitId: level.unitId,
    name: level.name,
    scene: {
      sceneId: level.scene?.sceneId,
      name: level.scene?.name,
      description: level.scene?.description,
      image: level.scene?.image
    },
    sprints: level.sprints || [],
    sprintCount: level.sprints?.length || 0
  };
}

// ============================================
// 7. COURSE METADATA
// ============================================
function extractCourseMetadata(data) {
  return {
    courseId: data?.courseId,
    releaseId: data?.releaseId,
    variant: data?.variant,
    metadata: data?.metadata,
    statistics: data?.metadata?.validation?.statistics
  };
}

// ============================================
// USAGE IN CREATE WITH PLAY
// ============================================

/*
Example Transform Block Configurations:

1. Levels Menu:
   Input: Full JSON from Fetch
   Transform: extractLevelsMenu(input)
   Output: Array of level menu items

2. Scene View (for sceneId "SCN-L1"):
   Input: Full JSON from Fetch
   Transform: extractSceneData(input, "SCN-L1")
   Output: Complete scene data with waypoints and artifacts

3. Sprint List (for levelId "L1"):
   Input: Full JSON from Fetch
   Transform: extractSprintsForLevel(input, "L1")
   Output: Array of sprints for that level

4. Artifact Details (for sceneId "SCN-L1"):
   Input: Full JSON from Fetch
   Transform: extractArtifactsForScene(input, "SCN-L1")
   Output: Array of artifacts for that scene

5. Waypoint Map (for sceneId "SCN-L1"):
   Input: Full JSON from Fetch
   Transform: extractWaypointsForScene(input, "SCN-L1")
   Output: Waypoint data with coordinates

6. Level Details (for levelId "L1"):
   Input: Full JSON from Fetch
   Transform: extractLevelDetails(input, "L1")
   Output: Complete level information

7. Course Metadata:
   Input: Full JSON from Fetch
   Transform: extractCourseMetadata(input)
   Output: Course metadata and statistics
*/

// Export for use in Create With Play
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractLevelsMenu,
    extractSceneData,
    extractSprintsForLevel,
    extractArtifactsForScene,
    extractWaypointsForScene,
    extractLevelDetails,
    extractCourseMetadata
  };
}

