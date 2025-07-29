#!/bin/bash

# Old and new emails
OLD_EMAIL="cireneuguilhermeteixeira"
CORRECT_NAME="Cireneu Araujo"
CORRECT_EMAIL="cireneuguilhermeteixeira@gmail.com"



# Loop through all local branches
for BRANCH in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  echo "Rewriting history on branch: $BRANCH"

  git checkout --quiet "$BRANCH"

  git filter-branch --env-filter "
    if [ \"\$GIT_COMMITTER_EMAIL\" = \"$OLD_EMAIL\" ]; then
        export GIT_COMMITTER_NAME=\"$CORRECT_NAME\"
        export GIT_COMMITTER_EMAIL=\"$CORRECT_EMAIL\"
    fi
    if [ \"\$GIT_AUTHOR_EMAIL\" = \"$OLD_EMAIL\" ]; then
        export GIT_AUTHOR_NAME=\"$CORRECT_NAME\"
        export GIT_AUTHOR_EMAIL=\"$CORRECT_EMAIL\"
    fi
  " --tag-name-filter cat -- --all
done

echo "Email rewrite complete. You can now force push the branches to GitHub."
