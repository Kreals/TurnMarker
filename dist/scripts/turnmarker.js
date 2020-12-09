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
    Settings.registerSettings();
    turnmarkerMain = new Main()
    turnmarkerMain.init()
})

Hooks.on('ready', () => {
    turnmarkerMain.praiseTheLordAndPassTheAmmunition()
});

Hooks.on('tmSettingsChanged', async (d) => {
    turnmarkerMain.applySettings(d)
});


Hooks.on('deleteCombatant', async (combat, combatant, update) => {
    console.log(combat, combatant, update)
    if(combat.combatants.length===1){
        turnmarkerMain.deleteCombatMarkers(combat)
    }
})

Hooks.on('updateCombatant', async (combat, combatant, update) => {
    turnmarkerMain.handlePreUpdateCombatent(combat, combatant, update)
})

Hooks.on('updateCombat', async (combat, update) => {
    turnmarkerMain.processNextTurn(combat, update)
})

Hooks.on('createTile', (scene, tile) => {
    turnmarkerMain.startAnimations()
});

Hooks.on('deleteTile', async (scene, tile) => {
    console.log(turnmarkerMain.tms.markerList)
    turnmarkerMain.deleteLinkedMarkers(tile)
    console.log(turnmarkerMain.tms.markerList)

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