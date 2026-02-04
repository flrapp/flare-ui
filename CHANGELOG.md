# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.2.0] - 2026-02-04

### Added
- Ability to delete a project from the Settings menu. The option appears only after the project has been archived, and requires typing the project name to confirm.
- Project alias can now be edited on the Settings page.

### Fixed
- Clicking on permission labels in the Scope Permissions section on the Team Management screen was incorrectly changing unrelated project-level permissions.
- Delete Project confirmation window was not appearing when opened from the Settings menu.

---

## [0.1.0] - 2026-01-15

### Added
- Login and authentication with protected pages.
- Projects: create, view, edit, archive, and manage API keys.
- Scopes: create, view, edit, and delete environments within a project.
- Feature flags: create, view, edit, and toggle flags on and off per scope.
- User management: add and remove users globally, invite users to projects, and assign permissions per project and scope.
- Notifications for successful and failed actions throughout the app.