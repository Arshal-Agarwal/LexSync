# 🌿 LexSync Git Workflow (Gitflow) Guidelines

## 1. Overview

This document defines the Git workflow for the LexSync project.

Simplified Gitflow model for small teams or solo dev.

## 2. Core Branches

### master

-   Production-ready
-   Always stable
-   Only release/ and hotfix/ merge here

### develop

-   Main dev branch
-   Features merge here
-   Base for releases

## 3. Supporting Branches

### feature/\*

-   From develop → merge to develop Example: feature/auth-service

### bugfix/\*

-   From develop → merge to develop Example: bugfix/login-error

### release/\*

-   From develop
-   Only fixes + polish
-   Merge into master + develop Example: release/v1.0

### hotfix/\*

-   From master
-   Merge into master + develop Example: hotfix/auth-token

## 4. Development Workflow

1.  Create feature from develop
2.  Build feature
3.  PR → develop
4.  Create release from develop
5.  Test
6.  Merge to master
7.  Merge back to develop

## 5. Hotfix Workflow

1.  Create hotfix from master
2.  Fix issue
3.  Merge to master
4.  Merge to develop

## 6. Naming

feature/`<name>`{=html} bugfix/`<name>`{=html}
release/`<version>`{=html} hotfix/`<name>`{=html}

## 7. Commits

feat(auth): add JWT fix(case): bug fix docs(api): update docs
refactor(user): improve logic

## 8. Rules

-   No direct commits to master
-   Use PRs
-   master always deployable
-   CI must pass
