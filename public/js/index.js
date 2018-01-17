/*
CUSTOM FUNCTIONS
*/
function isName() {
  var ob = {x:cursor.x,y:cursor.y,current:cursor.current};
  xhrPost(ob,"/isName",function () {
    let s = JSON.parse(this.response);
    (s[0])?$('#dane').removeClass('hidden'):$('#dane').addClass('hidden');
  });
}
function cleanDisplay() {
  $('.disp p').each(function () {
      $(this).html(this.className+" :");
  });
}
function updateDisplay() {
  var ob = {x:cursor.x,y:cursor.y,current:cursor.current};
  cleanDisplay();
  xhrPost(ob,"/updateDisplay",function() {
    let parsed = JSON.parse(this.response);
    if(parsed[0]!=undefined){
      for (var i in parsed[0]) {
        (parsed[0][i]!=null)?$('.'+i+'').html(i+"  :  "+parsed[0][i]):$('.'+i+'').html(i+":");
        }
      }
  });
}
function inputIsFocused(){
  let is=0;
  $('input').each(function () {
    if($(this).is(":focus")){
      is=1;
      return false;
    }
  });
  return is;
}
function build(s=false) {
  xhrPost({},"/build",(data)=>{
    res=JSON.parse(data.target.response);
    for(var i in res){
      pole=res[i]
      var view = getView(pole.sciana_nazwa);
      $(view[pole.pole_y][pole.pole_x]).html(pole.nazwa_pola);
    }
    if(s)$(".form-wrapper input").each(function () {
      $(this).toggleClass("hidden");
    });
    let ob = {x:cursor.x,y:cursor.y,current:cursor.current};
    updateHeaders(ob);
    updateDisplay();
    isName();
  });
}
window.addEventListener("load",()=>{
  build(1)
});
function updateHeaders(obj) {
  xhrPost(obj,"/updateHeaders",function () {
    var parsed = JSON.parse(this.response);
    if (parsed[0]==undefined) {
      $('#hpole').html('puste');
    }
    else{
      $('#hnaglowek').html(parsed[0].naglowek);
      $('#hpole').html(parsed[0].nazwaPola);
    }
  });
}
function al(data) {
  alert(this.responseText);
}
function log(data) {
  // document.getElementsByClassName('header')[0].innerHTML=resp.text;
  console.log(JSON.parse(this.response));
}
function setH1(content) {
  document.getElementsByClassName("header")[0].innerHTML=content;
}
function xhrPost(obj,url,h) {
  var req = new XMLHttpRequest();
  req.open("POST",url);
  req.setRequestHeader("content-type","application/json");
  req.addEventListener("load",h,false);
  req.send(JSON.stringify(obj));
}
function deselect(){
  $(".selected").removeClass("selected");
}
function cleanCube(){
  $(".cube").attr('class','cube');
}
function getView(view){
  var icube = $('.'+view+'>.inner-cube'),
  exp = [
    [icube[0],icube[1],icube[2]],
    [icube[3],icube[4],icube[5]],
    [icube[6],icube[7],icube[8]]
  ];
  return exp;
}
function rotateBackViewX(){
  if(cursor.directionRow[cursor.sx]=="back"){
    cursor.view[0].reverse();
    cursor.view[1].reverse();
    cursor.view[2].reverse();
    cursor.view.reverse();
  }
}
/*
END FUNCTIONS
*/
/*
VARIABLES
*/
var rX=0,rY=0,
cursor = {
  x:1,
  y:1,
  sy:0,
  sx:0,
  current:"front",
  directionColumn : ["front","top","back","bottom"],
  directionRow : ["front","left","back","right"],
  view : getView("front"),
  moveErr : function (side) {
    var wall = $('.'+this.current);
    wall.removeClass('move-err-'+side);
    wall.addClass('move-err-'+side);
    setTimeout(()=>{wall.removeClass('move-err-'+side);},500);
  },
  moveUp : function(){
    if(this.current=="right"||this.current=="left"){
      if(this.view[this.y-1])this.y--;
      else this.moveErr('up');
    }
    else{
        this.y--;
    }
    if(!this.view[this.y]){
      this.sy<3?this.sy++:this.sy=0;
      this.view=getView(this.directionColumn[this.sy]);
      this.current=this.directionColumn[this.sy];
      this.y=2;
      $(".cube").css("transform","rotateX("+(rY-=90)+"deg)");
    }
    deselect();
    $(this.view[this.y][this.x]).addClass("selected");
  },
  moveDown : function(){
    if(this.current=="right"||this.current=="left"){
      if(this.view[this.y+1])this.y++;
      else this.moveErr('down');
    }
    else{
        this.y++;
    }
    if(!this.view[this.y]){
      this.sy>0?this.sy--:this.sy=3;
      this.view=getView(this.directionColumn[this.sy]);
      this.current=this.directionColumn[this.sy];
      this.y=0;
      $(".cube").css("transform","rotateX("+(rY+=90)+"deg)");
    }
    deselect();
    $(this.view[this.y][this.x]).addClass("selected");
  },
  moveLeft : function(){
    if((this.current=="top"||this.current=="bottom")){
      if(this.view[this.x-1])this.x--;
      else this.moveErr('left');
    }
    else{
        this.x--;
    }
    if(!this.view[this.x]){
      this.sx<3?this.sx++:this.sx=0;
      this.view=getView(this.directionRow[this.sx]);
      this.current=this.directionRow[this.sx];
      this.x=2;
      if(this.current=="back") $(".cube").css("transform","rotateY("+(rX+=90)+"deg) rotateZ(180deg)");
      else $(".cube").css("transform","rotateY("+(rX+=90)+"deg)");
    }
    deselect();
  $(this.view[this.y][this.x]).addClass("selected");
  },
  moveRight : function(){
    if((this.current=="top"||this.current=="bottom")){
      if(this.view[this.x+1])this.x++;
      else this.moveErr('right');
    }
    else{
        this.x++;
    }
    if(!this.view[this.x]){
      this.sx>0?this.sx--:this.sx=3;
      this.view=getView(this.directionRow[this.sx]);
      this.current=this.directionRow[this.sx];
      this.x=0;
      if(this.current=="back") $(".cube").css("transform","rotateY("+(rX-=90)+"deg) rotateZ(180deg)");
      else $(".cube").css("transform","rotateY("+(rX-=90)+"deg)");
    }
    deselect();
    $(this.view[this.y][this.x]).addClass("selected");
  }
};
/*
END VARIABLES
*/
//selectfirs
$(cursor.view[cursor.y][cursor.x]).addClass("selected");
updateHeaders({x:cursor.x,y:cursor.y,current:cursor.current});
updateDisplay();
isName();
//NAVIGATION
function menuWalker(e){
  let coor;
  switch (e.key) {
    case "ArrowUp":
        cursor.moveUp();
        coor={x:cursor.x,y:cursor.y,current:cursor.current};
        updateHeaders(coor);
        updateDisplay();
        isName();
        break;
      case "ArrowDown":
        cursor.moveDown();
        coor={x:cursor.x,y:cursor.y,current:cursor.current};
        updateHeaders(coor);
        updateDisplay();
        isName();
        break;
      case "ArrowLeft":
        cursor.moveLeft();
        coor={x:cursor.x,y:cursor.y,current:cursor.current};
        updateHeaders(coor);
        updateDisplay();
        isName();
        break;
      case "ArrowRight":
        cursor.moveRight()
        coor={x:cursor.x,y:cursor.y,current:cursor.current};
        updateHeaders(coor);
        updateDisplay();
        isName();
        break;
      case "Enter":
        xhrPost(coor,"/chose",log);
        coor={x:cursor.x,y:cursor.y,current:cursor.current};
        updateHeaders(coor);
        updateDisplay();
        isName();
        break;
  }
}
//key capture
document.addEventListener('keypress',function(e){
  if(!inputIsFocused())menuWalker(e);
});
