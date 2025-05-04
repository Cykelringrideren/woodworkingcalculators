function BinPack(width, height, kerf) {
    this.width  = width;
    this.height = height;
    this.kerf   = kerf;
    this.free   = [{x:0,y:0,w:width,h:height}];
    this.used   = [];
  }
  BinPack.prototype.insert = function (w, h, data) {
    for (let i=0;i<this.free.length;i++){
      const space=this.free[i];
      if (w<=space.w && h<=space.h){
        const node={x:space.x,y:space.y,w,h,data};
        this.used.push(node);
        const right ={x:space.x+w+this.kerf,y:space.y,
                      w:space.w-w-this.kerf,h:h};
        const bottom={x:space.x,y:space.y+h+this.kerf,
                      w:space.w,h:space.h-h-this.kerf};
        this.free.splice(i,1);
        if(right.w>0&&right.h>0) this.free.push(right);
        if(bottom.w>0&&bottom.h>0) this.free.push(bottom);
        return node;
      }
    }
    return null; 
  };
  