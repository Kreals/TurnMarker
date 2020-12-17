import { Settings } from './settings.js';
import { Main } from './main.js';


/*  issues
    -turnmarker doesnt get placed when rerolling the last initiative on a token which is then subsequently selected as the 
        next (first?) token in the turn order after combat is started.. pain in the arse. Need to do something with update 
        combatant call to capture this event >.<
    - when animation setting is toggled the non-gm clients dont respect the setting until refresh
    -TODO - look into adding tokenMagic FX
*/

CONFIG.debug.hooks = false
let turnmarkerMain;

Hooks.on('init', async () => {
    game.turnmarker = game.turnmarker || {};
    Settings.registerSettings();
    turnmarkerMain = new Main()
    turnmarkerMain.init()
    game.turnmarker = turnmarkerMain
})

Hooks.on('ready', () => {
    turnmarkerMain.praiseTheLordAndPassTheAmmunition()
});

Hooks.on('tmSettingsChanged', async (d) => {
    turnmarkerMain.applySettings(d)
});


Hooks.on('deleteCombatant', async (combat, combatant, update) => {
    let tmarkers = turnmarkerMain.tms.getTurnMarkers(combatant._id)
    let smarkers = turnmarkerMain.tms.getStartMarkers(combatant._id)
    turnmarkerMain.tms.deleteFromList(tmarkers)
    turnmarkerMain.tms.deleteFromList(smarkers)
})

Hooks.on('updateCombatant', async (combat, combatant, update) => {
    turnmarkerMain.handleUpdateCombatent(combat, combatant, update)
})

Hooks.on('updateCombat', async (combat, update) => {
    turnmarkerMain.processNextTurn(combat, update)
})

Hooks.on('createTile', (scene, tile) => {
    turnmarkerMain.startAnimations()
});

Hooks.on('deleteTile', async (scene, tile) => {
    turnmarkerMain.deleteLinkedMarkers(tile)
})

Hooks.on('deleteCombat', async (combat) => {
    turnmarkerMain.deleteCombatMarkers(combat)
    turnmarkerMain.clearTracker(combat)
});

Hooks.on('updateToken', (scene, updateToken, updateData) => {
    turnmarkerMain.processInterTurn(updateToken, updateData)
});

Hooks.on('pauseGame', (isPaused) => {
    turnmarkerMain.handlePause(isPaused)
});