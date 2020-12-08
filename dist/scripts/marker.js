  /**
 * Abstract Class Marker.
 *
 * @class Marker
 */
export class Marker {

    constructor(scene_id, combat_id, token_id, tile_data) {
        this.scene_id = scene_id
        this.combat_id = combat_id
        this.token_id = token_id
        this.pendingDelete = false
        this.pendingUpdate = false
        this.pendingCreate = false
        this.tile_data = undefined
        if (tile_data){
            this.tile_data = tile_data

        }else{
            this.pendingCreate = true
        }
        if (this.constructor == Marker) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    setTokenId(tId){
        this.token_id = tId;
        this.tile_data.flags.token_id = tId;
    }

    setCombatId(sId){
        this.combat_id = sId;
        this.tile_data.flags.combat_id = sId;
    }
  
    create(){
        throw new Error("Method 'create()' must be implemented.");
    }

    update(tile_data){
        Object.keys(tile_data).forEach((key) => {
            this.tile_data[key]= tile_data[key]
        })
        this.pendingUpdate = true
    }
    
    move(){
        throw new Error("Method 'move()' must be implemented.");
    }

    shrink(){
        this.update({
            width: 0,
            height: 0})
    }

    hide(state){
        this.update({
            hidden:state
        })
    }

    getTokenInstance(){
        let tokens = game.scenes.get(this.scene_id).data.tokens
        let selected;
        for(let i =0 ; i< tokens.length; i++){
            if(tokens[i]._id === this.token_id){
                selected = tokens[i]
            }
        }
        return selected
    }

    delete(){
        this.pendingDelete=true
    }


    toString(){
        return this.scene_id + ' ' + this.token_id + ' ' + this.tile
    }

    

    getImageDimensions(token, ratio) {
        let newWidth = 0;
        let newHeight = 0;
        let scene  = game.scenes.get(this.scene_id)

        switch (scene.data.gridType) {
            case 2: case 3: // Hex Rows
                newWidth = newHeight = token.height * ratio;
                break;
            case 4: case 5: // Hex Columns
                newWidth = newHeight = token.width * ratio;
                break;
            default: // Gridless and Square
                newWidth = token.width * ratio;
                newHeight = token.height * ratio;
                break;
        }

        return { w: newWidth * scene.data.grid, h: newHeight * scene.data.grid};
    }

    getImageLocation(token, ratio) {
        let newX = 0;
        let newY = 0;
        let scene  = game.scenes.get(this.scene_id)
        switch (scene.data.gridType) {
            case 2: case 3: // Hex Rows
                newX = token.x - ((((ratio - 1) * token.width)/2) * scene.data.grid);
                newY = token.y - ((((ratio - 1) * token.height)/2) * scene.data.grid);
                break;
            case 4: case 5: // Hex Columns
                newX = token.x - ((((ratio - 1) * token.width)/2) * scene.data.grid);
                newY = token.y - ((((ratio - 1) * token.height)/2) * scene.data.grid);
                break;
            default: // Gridless and Square
                newX = token.x - ((((ratio - 1) * token.width)/2) * scene.data.grid);
                newY = token.y - ((((ratio - 1) * token.height)/2) * scene.data.grid);
                break;
        }
        return { x: newX, y: newY };
    }
}