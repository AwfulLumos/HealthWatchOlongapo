@echo off
if exist ".git\index.lock" (
    del ".git\index.lock"
    echo Lock file removed
) else (
    echo No lock file found
)
git status