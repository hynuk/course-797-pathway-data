#!/bin/bash

# Script to create GitHub repo and push code
# This will prompt for your GitHub username and token if needed

REPO_NAME="course-797-pathway-data"

echo "Creating GitHub repository: $REPO_NAME"
echo ""
echo "To create the repository, you have two options:"
echo ""
echo "OPTION A: Create via GitHub website (easiest)"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Make it Public"
echo "4. DO NOT initialize with README, .gitignore, or license"
echo "5. Click 'Create repository'"
echo ""
echo "Then run these commands:"
echo "  git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "OPTION B: Create via GitHub API (requires personal access token)"
echo "If you have a GitHub personal access token, I can create it for you."
echo "Get a token at: https://github.com/settings/tokens"
echo ""

read -p "Do you want to create it via API? (y/n): " use_api

if [ "$use_api" = "y" ] || [ "$use_api" = "Y" ]; then
    read -p "Enter your GitHub username: " github_username
    read -sp "Enter your GitHub personal access token: " github_token
    echo ""
    
    # Create repo via API
    response=$(curl -s -X POST \
        -H "Authorization: token $github_token" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user/repos \
        -d "{\"name\":\"$REPO_NAME\",\"public\":true,\"description\":\"Course 797 pathway extensions data\"}")
    
    if echo "$response" | grep -q "full_name"; then
        echo "✓ Repository created successfully!"
        echo ""
        git remote add origin "https://github.com/$github_username/$REPO_NAME.git"
        git branch -M main
        git push -u origin main
        echo ""
        echo "✓ Code pushed successfully!"
        echo ""
        echo "Your file is now available at:"
        echo "https://raw.githubusercontent.com/$github_username/$REPO_NAME/main/data/course-797/course_797_extensions.refined.json"
    else
        echo "Error creating repository:"
        echo "$response" | grep -o '"message":"[^"]*"' || echo "$response"
        echo ""
        echo "Please create it manually via the GitHub website instead."
    fi
else
    echo "Please create the repository manually and then run:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
fi
