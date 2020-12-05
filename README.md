# Turn Marker
**Turn Marker** is a module for [Foundry VTT](https://foundryvtt.com/ "Foundry VTT") that adds an image under a token who is currently active in the combat tracker. This is completely system agnostic, and fully customizable to fit right into your game.

![GitHub release (latest by date)](https://img.shields.io/github/v/release/Kreals/TurnMarker?style=flat-square)


## Installation
~~It's always better and easier to install modules through the in app browser. Just search for "Turn Marker"~~
this fork of the module is not yet in the normal foundry package manager so you will have to install it manually.

To install this module manually:
1. Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2. Click "Install Module"
3. In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/Kreals/TurnMarker/main/dist/module.json`
4. Click 'Install' and wait for installation to complete
5. Don't forget to enable the module in game using the "Manage Module" button

## Usage
The turn marker will move to the active token on their turn, and move with them as they move:
![example](/examples/example.webm)

### Settings
#### Image ratio
The image ratio is related to the size of the token. 1 will be the same size as the active token, 2 will be double the size, etc.
#### Animate Marker
If enabled, the marker will use a rotational animation as defined by "Animation Speed" and "Animation Degrees".
#### Animation Speed
Defines in milliseconds how often the animation should apply a rotation. The lower the number the faster the animation.
#### Animation Degrees
Defines in degrees how much the marker should rotate on each tick.
#### Marker Image
Select from a number of included images provided by the Foundry Community:

Marker images by [Rin](https://foundryvtt.com/community/rin)

|Runes of the Cultist |Runes of Regeneration |Runes of the Cosmos |Runes of Earthly Dust |
|--|--|--|--|
|<img src="dist/assets/cultist.png" width="150" />|<img src="dist/assets/regeneration.png" width="150" />|<img src="dist/assets/cosmos.png" width="150" />|<img src="dist/assets/earthlydust.png" width="150" />|

|Runes of Reality |Runes of Incendium |Runes of the Believer |Runes of the Mad Mage |
|--|--|--|--|
|<img src="dist/assets/reality.png" width="150" />|<img src="dist/assets/incendium.png" width="150" />|<img src="dist/assets/believer.png" width="150" />|<img src="dist/assets/madmage.png" width="150" />|

|Runes of the Blue Sky |Runes of the Universe |Runes of Prosperity |
|--|--|--|
|<img src="dist/assets/bluesky.png" width="150" />|<img src="dist/assets/universe.png" width="150" />|<img src="dist/assets/prosperity.png" width="150" />|

#### Custom Image Path
Sets the path to an image to be used instead of the included images

#### Announce Turns
If enabled, a chat message will be sent when the turn in combat changes (unless the combatant is hidden in the combat tracker).

## Compatibility
Most recently tested on [Foundry VTT](https://foundryvtt.com/ "Foundry VTT") version 0.7.8.

## Feedback
Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/Kreals/TurnMarker/issues "Issue Tracker")

## Support Development
Want to help improve the module? Send a pull request

## Licensing
**Turn Marker** is a module for [Foundry VTT](https://foundryvtt.com/ "Foundry VTT") initially made by Jeremiah Altepeter and is currently maintained by Kreals. It is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

This work is licensed under Foundry Virtual Tabletop [EULA - Limited License Agreement for module development v 0.1.6](https://foundryvtt.com/article/license/).

The previous work can be found at [Brunhine's github repository](https://github.com/Brunhine/TurnMarker) 

The included images are created by [Rin](https://foundryvtt.com/community/rin) (rin#0002 on Discord)
