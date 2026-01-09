#!/usr/bin/env python3
"""
Waypoint Coordinate Converter
Converts pixel coordinates to percentage coordinates for scene waypoints.

Usage:
    python3 waypoint-coord-converter.py <pixel_x> <pixel_y> <image_width> <image_height>
    
Example:
    python3 waypoint-coord-converter.py 250 410 1000 576
    # Output: (25.0%, 71.18%)

Or use as a module:
    from waypoint_coord_converter import pixel_to_percent
    x, y = pixel_to_percent(250, 410, 1000, 576)
"""

import sys


def pixel_to_percent(pixel_x, pixel_y, image_width, image_height):
    """
    Convert pixel coordinates to percentage coordinates.
    
    Args:
        pixel_x: X coordinate in pixels
        pixel_y: Y coordinate in pixels
        image_width: Image width in pixels
        image_height: Image height in pixels
    
    Returns:
        Tuple of (x_percent, y_percent) rounded to 2 decimal places
    """
    x_percent = round((pixel_x / image_width) * 100, 2)
    y_percent = round((pixel_y / image_height) * 100, 2)
    return x_percent, y_percent


def convert_batch(coordinates, image_width, image_height):
    """
    Convert multiple pixel coordinates to percentages.
    
    Args:
        coordinates: Dictionary mapping identifiers to (pixel_x, pixel_y) tuples
        image_width: Image width in pixels
        image_height: Image height in pixels
    
    Returns:
        Dictionary mapping identifiers to (x_percent, y_percent) tuples
    
    Example:
        coords = {
            "S1.1": (250, 410),
            "S1.2": (403, 372)
        }
        result = convert_batch(coords, 1000, 576)
    """
    result = {}
    for identifier, (px_x, px_y) in coordinates.items():
        result[identifier] = pixel_to_percent(px_x, px_y, image_width, image_height)
    return result


if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python3 waypoint-coord-converter.py <pixel_x> <pixel_y> <image_width> <image_height>")
        print("\nExample:")
        print("  python3 waypoint-coord-converter.py 250 410 1000 576")
        print("  # Output: (25.0%, 71.18%)")
        sys.exit(1)
    
    try:
        pixel_x = float(sys.argv[1])
        pixel_y = float(sys.argv[2])
        image_width = float(sys.argv[3])
        image_height = float(sys.argv[4])
        
        x_percent, y_percent = pixel_to_percent(pixel_x, pixel_y, image_width, image_height)
        
        print(f"Pixel coordinates: ({int(pixel_x)}, {int(pixel_y)})px")
        print(f"Image dimensions: {int(image_width)}px × {int(image_height)}px")
        print(f"Percentage coordinates: ({x_percent}%, {y_percent}%)")
        
    except ValueError as e:
        print(f"Error: Invalid number format - {e}")
        sys.exit(1)
