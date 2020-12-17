# 2.7.8
-Fixed the hex issue but retained multi scene initialisation
-Fixed issue where token markers would not reappear when token or combat turn with no longer hidden
-added ability to call module functions as macros from the game.turnmarker object.

# 2.7.0
- Major Code rewrite to OO classes
- Turnmarker now handles simultanious combat encounters across all scenes (currently only one gm at a time)
- Known issue with rerolling initiatives during combat where markers sometimes dont appear if the current token rolls an initiative that places it in the same position in the new turn order.
- Known issue where turning animation rotation setting on requires clients to refresh to see the animation (server updates immediately).
- Turn markers and start markers are now hidden correctly and toggle appropriately according to the combat tracker and the tokens hidden state. If either are hidden then the markers are also hidden.

# 2.6.30
- Fixed a duplicate setting in the settings window
- Added human translated french localization to settings
- Added google translate language localizations for the turn announcements (en, fr, de, jp, ko)
- Fixed an issue with multipl markers showing at the same time
- Fixed an issue where settings would not apply properly
- General refactoring and similar stability fixes

# 2.6.24
- Fixed some variable mismatches in the settings variable

# 2.6.23
- Major code refactor: removed redundent hook calls and simplified logic for simpler debugging and maintenance 
- Fixed issue where start marker would create duplicates
- Made both the start marker and the turn marker both reflect the tokens hidden status
- Fixed the custom start marker so it now actually works
- Removed video preview, unsure what it was for.
- Added start marker preview window in settings
- Added functionality that applies settings immediately when saved (GM only)
- Fixed the settings screen and made some minor text changes

# 2.6.22
- Fixed an issue where marker tile wouldn't re-appear if the token visibility was toggeled back on during it's turn

# 2.6.21
- Fixed a bug where tokenless combatants threw an error and left the turn marker would stay on the previous token. Now the token marker dissappears when a tokenless combatent is taking a turn and reappears when the next combantent with a token takes a turn.

- Fixed an issue with rotation not stopping on pause and occasionally increaing speed due to bad variable assignments


# 2.6.20
- Rearrange repo for new workflow

# 2.6.9
- Fix console error when moving token outside of combat

# 2.6.8
- Test compatibility with Foundry v0.6.2
- Start marker if enabled will no longer show up until after a token has moved for the first time on it's turn
- Video files (webm, ogg, & mp4) should now properly display in the marker previewer in settings
- Added new informational window to be shown when module is updated
- Fix harmless error when setting custom image path for turn marker 
- Fix settings window not displaying logo

# 2.6.5
- Migrate repository from GitLab to GitHub
- Add Webpack to reduce overall script size

# 2.6.4
- Enable Japanese Language support
- Add option to disable Turn Marker
- Now properly removes the start marker from the canvas when combat ends
- Fix for webm token thumbnails not always displaying properly in turn announcements
- Fix for error when manually creating a combat from the combat tracker


# 2.6.3
- New optional feature: "Start Marker"
    - Places a static marker under the token when they start their turn to signify where they started
- German language support
- Korean language support
- Added file browsers to the settings window for image selection
- New setting to disable token image in turn announcements
- Added marker preview to settings window

# 2.6.2
- Moved global settings into their own window
- Add support for localization (translators desired!)

# 2.6.1
- Now properly integrates with Combat Utility Belt's 'Hide NPC Names' option
- Fix for multiple turn change messages when a combatant is removed from combat


# 2.6.0
- Now supports hex grids properly
- New feature: Setting to announce turn changes with a chat message

# 2.5.1
- Fix for error thrown when removing the last combatant from combat if combat has not started

# 2.5
- Updated for new tile structure in 0.5.6+

# 2.4.2
- Last release for 0.5.5-

# 2.4.1
- Ensure compatibility with 0.5.6

# 2.4
- Fix for marker misbehaving when token vision is disabled for a scene
- Fix for marker being visible when tokens are hidden

# 2.3
- Marker should now be hidden when the active combatant is hidden

# 2.2
- Fix for multiple markers being placed, but not updated when more than one GM is logged in
- Fix for error when changing image curing combat while player is connected

# 2.1
- Fix error when trying to change the marker image when no combat is active
- Fix error when moving a token outside of combat

# 2.0
- Change animation to be SIGNIFICANTLY smoother by using PIXI animations
- Remove "Animation Degrees" setting as it is no longer needed
- Marker should no longer hide behind other tiles on the canvas
- Each user can now define their own animation settings

# 1.0
- Initial Release