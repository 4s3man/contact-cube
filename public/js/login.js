var user=document.getElementById("login"),
    pass = document.getElementById("passwd"),
    login = document.getElementById("log"),
    logout = document.getElementById("logout");
login.addEventListener("click",(e)=>{
var obj = {
    user:user.value,
    passwd:pass.value
  };
xhrPost(obj,"/login",function () {
  alert(this.responseText);
  build(1);

});
$(e.target).blur();
user.value="";
pass.value="";
},false);
logout.addEventListener("click",function () {
  xhrPost({},"/logout",()=>{
    location.reload();
  });
},false);
