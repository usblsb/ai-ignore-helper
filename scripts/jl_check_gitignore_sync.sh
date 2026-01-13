#!/bin/bash
# jl_check_gitignore_sync.sh
# Detects files that are listed in .gitignore but are still being tracked by Git.
# This prevents accidental exposure of ignored files in the repository.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking for .gitignore inconsistencies..."
echo ""

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

cd "$REPO_ROOT"

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}⚠️ Warning: No .gitignore file found${NC}"
    exit 0
fi

# Array to store problematic files
PROBLEMS=()

# Get all tracked files
TRACKED_FILES=$(git ls-files)

# Check each tracked file against .gitignore
for file in $TRACKED_FILES; do
    # Check if this file WOULD be ignored if it weren't tracked
    if git check-ignore -q "$file" 2>/dev/null; then
        PROBLEMS+=("$file")
    fi
done

# Report results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ ${#PROBLEMS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ No inconsistencies found!${NC}"
    echo "All files in .gitignore are correctly untracked."
else
    echo -e "${RED}❌ Found ${#PROBLEMS[@]} file(s) that are tracked but should be ignored:${NC}"
    echo ""
    for file in "${PROBLEMS[@]}"; do
        echo -e "  ${YELLOW}→ $file${NC}"
    done
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🔧 To fix, run:${NC}"
    echo ""
    for file in "${PROBLEMS[@]}"; do
        echo "  git rm --cached \"$file\""
    done
    echo ""
    echo "  git commit -m \"chore: remove ignored files from tracking\""
    echo "  git push"
    echo ""
    echo -e "${YELLOW}Note: This removes files from Git tracking only.${NC}"
    echo -e "${YELLOW}      Local files will NOT be deleted.${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
