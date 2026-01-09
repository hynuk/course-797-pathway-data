#!/bin/bash

# Script to push to GitHub after repository is created
# Usage: ./push_to_github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "Usage: ./push_to_github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "First, create the repository at: https://github.com/new"
    echo "Repository name: course-797-pathway-data"
    echo "Make it Public, and DO NOT initialize with any files"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="course-797-pathway-data"

echo "Setting up remote and pushing to GitHub..."
echo ""

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

# Add remote
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Rename branch to main
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Successfully pushed to GitHub!"
    echo ""
    echo "Your file is now available at:"
    echo "https://raw.githubusercontent.com/$GITHUB_USERNAME/$REPO_NAME/main/data/course-797/course_797_extensions.refined.json"
    echo ""
    echo "You can fetch it in your UI with:"
    echo "fetch('https://raw.githubusercontent.com/$GITHUB_USERNAME/$REPO_NAME/main/data/course-797/course_797_extensions.refined.json')"
else
    echo ""
    echo "Error: Could not push to GitHub."
    echo "Make sure:"
    echo "1. The repository exists at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. You have push access to the repository"
    echo "3. You're authenticated with GitHub (git may prompt for credentials)"
fi

