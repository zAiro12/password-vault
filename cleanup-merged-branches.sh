#!/bin/bash
# Script to clean up merged branches
# This script deletes branches that have already been merged into main

set -e

echo "========================================"
echo "Branch Cleanup Script"
echo "========================================"
echo ""

# List of branches to delete (all confirmed as merged)
BRANCHES=(
  "copilot/create-database-schema-migrations"
  "copilot/create-pipeline-for-ui-testing"
  "copilot/fix-dependency-cache-path"
  "copilot/refactor-duplicate-code-logs"
  "copilot/verify-github-pages-setup"
)

echo "The following branches will be deleted:"
for branch in "${BRANCHES[@]}"; do
  echo "  - $branch"
done
echo ""

# Ask for confirmation
read -p "Are you sure you want to delete these branches? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
  echo "Aborted. No branches were deleted."
  exit 0
fi

echo ""
echo "Deleting branches..."
echo ""

# Delete each branch
for branch in "${BRANCHES[@]}"; do
  echo "Deleting: $branch"
  if git push origin --delete "$branch" 2>/dev/null; then
    echo "✓ Successfully deleted $branch"
  else
    echo "✗ Failed to delete $branch (may already be deleted)"
  fi
  echo ""
done

echo "========================================"
echo "Cleanup complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "  Total branches: ${#BRANCHES[@]}"
echo ""
echo "You can verify the deletion by running:"
echo "  git fetch --prune"
echo "  git branch -r"
