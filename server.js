var http = require('http'); //Wbudowany modół http dostarcza funkcje dotyczące serwera i klienta
var fs = require('fs');  //file system funkcje do pracy na systemie plików też wbudowane
var mysql = require('mysql');
var path = require('path'); // wbudowany modół dostarcza funkcje przeznaczone do pracy ze ścieżkami dostępu systemu plików
var mime = require('mime-types'); //dodatkowy modół mime zapewnia możliwość utalenia typi mime na podstawie rozszerzenia pliku
var cache = {}; // obiekt cache do przechowywania buforowanych plików

var con = mysql.createConnection({
  host:'localhost',
  user:'admin',
  password:'admin'
});

con.connect(function(err){
  if(err) throw err;
  con.query("use bd_project",function(err,result){
    if(err)throw err;
    console.log("Połączono");
  });
});

//funkcja generująca błąd 404 jeśli żądany plik nie isntenieje
function send404(response){
    response.writeHead(404,{'Content-type':'text/plain'});
    response.write('Błąd 404:plik nie został znaleziony');
    response.end();
}
//prygotowuje nagłówki http i wysyła zawartość pliku
function sendFile(response,filePath,fileContents){
    response.writeHead(
        200,
        {'content-type':mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}
//udostępnia pliki statyczne
function serwerStatic(response,cache,absPath){
    if(cache[absPath]){//sprawdź czy plik jest pbuforowany w pamięci
        sendFile(response,absPath,cache[absPath]); //udostępnianie pliku z pamięci
    }else{
        fs.exists(absPath,function(exists){//sprawdź czy plik istnieje
           if(exists){
                fs.readFile(absPath, function(err, data){//odczyt pliku z dyski
                   if(err){
                       send404(response);//jeśli nie dało się go odczytać wyślij error
                   }else{
                       cache[absPath]=data;
                       sendFile(response,absPath,data);//jeśli sie dało wyślij zawartość pliku
                   }
                });
           }else{
               send404(response);//jeśli nie istnieje wyślij error 404
           }
        });
    }
}
//TWORZENIE SERVERA HTTP
var server = http.createServer(function(request, response){
   var filePath = false;
    if(request.url=='/'){
        filePath = 'public/index.html';
    }
    else{
        filePath = 'public'+ request.url;
    }
    var absPath = './' + filePath;
    serwerStatic(response, cache, absPath);
});
//uruchamianie servera
server.listen(3000,function(){
    console.log("Server nasłuchuje na porcie 3000");
})
//dołącz funkcje z modułu
// var chatServer=require('./lib/chat_server');//zmienna która przybiera wszystko spod require, definiując listen poprzedza export.
// chatServer.listen(server);//distarcza funkcje z powyżej
