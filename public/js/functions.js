var ins={},p=0;
$(".ustaw input").each(function (ind) {
      ins[$(".ustaw input")[ind].id] = {
      obiekt : $(".ustaw input")[ind],
      button : $(".ustaw button")[ind]
    };
});
function leftShowHide() {
  let d=$("#dane");
  d.html()=="Dane"?d.html("Powrót"):d.html("Dane");
  $('.next').toggleClass('hidden');
  $('.ustaw').toggleClass('hidden');
}
$("#dane").click(function () {
  leftShowHide();
  $(this).blur();
});
ins.naglowek.button.addEventListener("click",(e)=>{
  let ob = {x:cursor.x,y:cursor.y,current:cursor.current};
  xhrPost({naglowek:ins.naglowek.obiekt.value,side:ob.current},"/naglowekSciany",al);
  $(e.target).blur();
  ins.naglowek.obiekt.value="";
  updateHeaders(ob);
});
ins.nazwaPola.button.addEventListener("click",(e)=>{
  let ob = {naglowek:ins.nazwaPola.obiekt.value,x:cursor.x,y:cursor.y,current:cursor.current};
  xhrPost(ob,"/nazwaPola",function (data) {
    if(this.responseText==""){
      ins.nazwaPola.obiekt.value="";
      updateHeaders(ob);
      isName();
    }
    else alert(this.responseText);
  });
  leftShowHide();
  build();
  $(e.target).blur();
});
$('#funkcjeSave')[0].addEventListener("click",(e)=>{
  var form = {};
  $('#area input').each(function () {
    var name = $(this)[0].name;
    form[name]=$(this)[0].value;
  });
  form.side = cursor.current;
  form.x=cursor.x;
  form.y=cursor.y;
  xhrPost(form,"/osoba",function () {
    let res = this.responseText;
    if(res!="ok"){
      alert(res);
    }
    else{
      leftShowHide();
      $('#area input').each(function () {
        $(this)[0].value="";
      });
    }
  });
  updateDisplay();
});
$("#delete").click(function(){
  var ob={x:cursor.x,y:cursor.y,side:cursor.current};
  xhrPost(ob,"/delete",function(){
  });
  cursor.view[ob.y][ob.x].innerHTML="☻";
  updateHeaders(ob);
  updateDisplay();
  isName();
  ($('.next').hasClass('hidden'))?$('.ustaw').attr('class','ustaw'):$('.next').addClass('hidden');
  $(this).blur();
});
