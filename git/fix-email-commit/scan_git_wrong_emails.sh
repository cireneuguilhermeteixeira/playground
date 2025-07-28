#!/bin/bash

# Define valid emails
VALID_EMAILS=(
  "cireneuguilhermeteixeira@gmail.com"
  "32199082+cireneuguilhermeteixeira@users.noreply.github.com"
)

# Define wrong email to look for
WRONG_EMAIL="cireneuguilhermeteixeira"

# Output CSV file
OUTPUT_FILE="wrong_email_commits.csv"

# CSV header
echo "branch,commit_hash,author,email,date,message" > "$OUTPUT_FILE"

# Store current branch to return later
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Loop through all local branches
for BRANCH in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  echo "Scanning branch: $BRANCH"
  git checkout --quiet "$BRANCH"

  git log --pretty=format:'%H|%an|%ae|%ad|%s' |
  while IFS="|" read -r COMMIT_HASH AUTHOR_NAME AUTHOR_EMAIL COMMIT_DATE COMMIT_MSG; do
    IS_VALID=false
    for VALID in "${VALID_EMAILS[@]}"; do
      if [[ "$AUTHOR_EMAIL" == "$VALID" ]]; then
        IS_VALID=true
        break
      fi
    done

    if [[ "$IS_VALID" == false && "$AUTHOR_EMAIL" == *"$WRONG_EMAIL"* ]]; then
      echo "\"$BRANCH\",\"$COMMIT_HASH\",\"$AUTHOR_NAME\",\"$AUTHOR_EMAIL\",\"$COMMIT_DATE\",\"$COMMIT_MSG\"" >> "$OUTPUT_FILE"
    fi
  done
done

# Switch back to original branch
git checkout --quiet "$CURRENT_BRANCH"

echo "Scan complete. Results saved to $OUTPUT_FILE"
