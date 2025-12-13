# Git Workflow - CarrotAcademy v1.1

## Branch Structure

```
main (production)
  ├── develop (integration)
  │   ├── feature/nested-navbar-menu
  │   ├── feature/your-feature-name
  │   └── ...
  └── hotfix/emergency-fix (if needed)
```

## Branch Descriptions

### `main`
- **Purpose**: Production-ready code
- **Deploy to**: Production server
- **Protection**: Always stable, never commit directly
- **Updates from**: Pull requests from `develop` or `hotfix/*`

### `develop`
- **Purpose**: Integration branch for all features
- **Deploy to**: Staging/Testing server
- **Updates from**: Merged feature branches
- **Merge to**: `main` when ready for production

### `feature/*`
- **Purpose**: New feature development
- **Naming**: `feature/feature-name`
- **Created from**: `develop`
- **Merge to**: `develop` via Pull Request
- **Examples**: 
  - `feature/nested-navbar-menu`
  - `feature/dashboard-improvements`
  - `feature/user-profile-page`

### `hotfix/*`
- **Purpose**: Emergency production fixes
- **Naming**: `hotfix/fix-description`
- **Created from**: `main`
- **Merge to**: Both `main` AND `develop`

## Workflow Steps

### 1. Starting New Feature

```bash
# Make sure you're on develop and it's up to date
git checkout develop
git pull origin develop

# Create new feature branch
git checkout -b feature/your-feature-name

# Work on your feature...
# Make commits with descriptive messages
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push -u origin feature/your-feature-name
```

### 2. Merging Feature to Develop

```bash
# Create Pull Request on GitHub
# From: feature/your-feature-name
# To: develop

# After PR is reviewed and approved, merge it
# Delete feature branch after merge
```

### 3. Release to Production

```bash
# When develop is stable and tested, create PR
# From: develop
# To: main

# After review, merge and tag the release
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

### 4. Hotfix (Emergency Fix)

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Fix the issue
git add .
git commit -m "fix: resolve critical bug"

# Push hotfix
git push -u origin hotfix/critical-bug-fix

# Create PR to both main AND develop
# After merge, delete hotfix branch
```

## Commit Message Convention

Use conventional commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples:
```bash
git commit -m "feat: add nested navbar menu with categories"
git commit -m "fix: resolve auto-close issue on menu click"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize data fetching logic"
```

## Current Status

- **main**: Production branch (protected)
- **develop**: Integration branch (created)
- **feature/nested-navbar-menu**: First feature (pushed)

## Best Practices

1. **Never commit directly to `main` or `develop`**
2. **Always create feature branches for new work**
3. **Write clear commit messages**
4. **Create Pull Requests for code review**
5. **Test thoroughly in develop before merging to main**
6. **Keep branches small and focused**
7. **Delete merged feature branches**
8. **Pull latest changes before starting new work**

## Quick Links

- **Create PR**: https://github.com/CarrotAcademy-Dev/webdev-v1.1/pulls
- **Feature Branch**: https://github.com/CarrotAcademy-Dev/webdev-v1.1/pull/new/feature/nested-navbar-menu

## Team Workflow

1. **Developer**: Create feature branch → Code → Commit → Push → Create PR
2. **Reviewer**: Review PR → Request changes / Approve
3. **Developer**: Address feedback → Update PR
4. **Reviewer**: Final approval → Merge to develop
5. **Team Lead**: Test in develop → Merge to main for production

---

**Note**: This workflow ensures code quality, enables collaboration, and maintains a stable production environment.
