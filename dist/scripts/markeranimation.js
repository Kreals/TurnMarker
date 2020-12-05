import { Settings } from './settings.js';


export class MarkerAnimation {

    static initAnim() {
        console.log('init animation')
        let animation = this.animate.bind();
        if(Settings.getShouldAnimate() && Settings.getTurnMarkerEnabled()) {
            this.start(animation)
        }
        return animation
    }

    static animate(dt) {
        let tiles = canvas.tiles.placeables.filter(t => t.data.flags.turnMarker == true);
        for(let i=0; i< tiles.length; i++){
            if (tiles[i] && tiles[i].data.img) {
                let delta = Settings.getInterval() / 10000;
                //TODO: apply modulus to rotation increase. Seems infinte atm might error if left too long.
                try {
                    tiles[i].tile.img.rotation += (delta * dt);
                } catch (err) {
                    // skip lost frames if the tile is being updated by the server
                }
            }
        }
    }

    static start(animation) {
        console.log('start animation')
        if (!game.paused) {
            canvas.app.ticker.remove(animation);
            canvas.app.ticker.add(animation);
        }
    }

    static stop(animation) {
        console.log('stopping animation')
        canvas.app.ticker.remove(animation);
    }

    static togglePause(isPaused, animation){
        if (Settings.getShouldAnimate() && Settings.getTurnMarkerEnabled()) {
            if (isPaused) {  
                this.stop(animation);
            } else {
                this.start(animation);
            }
        }
    }
}