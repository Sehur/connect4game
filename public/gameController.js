angular.module('app', [])

  .controller('gameController', function($http,$interval,$scope) {

    var id;
    var idJuego;
    var tablero=[
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
    ]
    var fila;



    $http({
      method: 'POST',
      url: '/juego'

}).then(function successCallback(response) {
    checkGame(response);
 }, function errorCallback(response) {
   // called asynchronously if an error occurs
   // or server returns response with an error status.
 });


function checkGame(response){
var id=response.data.id;
var player=response.data.player;
var idJuego=response.data.idJuego;
if(player==1) document.getElementById("player").innerHTML = "morado";
else document.getElementById("player").innerHTML = "rosa";
var interval= setInterval(function(){
  $http({
    method: 'GET',
    url: '/juego/'+id
}).then(function successCallback(response) {
    console.log(response);
    console.log(player);
    if(player==1 && !response.data.turn || player==2 && response.data.turn)
        movimiento(player,response.data.status, response.data.lastMove,idJuego,id,interval);
    else{
      if(response.data.status==2 && player==1|| response.data.status==3 && player==2){
        clearInterval(interval);
        alert("ganaste");
      }
      if(response.data.status==2 && player==2|| response.data.status==3 && player==1){
        clearInterval(interval);
        alert("perdiste");
      }
      if(response.data.status==4){
        clearInterval(interval);
        alert("empate");
      }
  }

}, function errorCallback(response) {
 // called asynchronously if an error occurs
 // or server returns response with an error status.

 console.log(response);
});
}, 2000);
}

function movimiento(player,status, lastMove,idJuego,idPlayer,interval){
  console.log(status);

  if(lastMove != -1){
    if(player==1){
    var array=actualizarTablero(tablero,lastMove,2);
    tablero=array[0];
    fila=array[1];
    pintaFicha(lastMove, fila, 2)
  }else{
    var array=actualizarTablero(tablero,lastMove,1);
    tablero=array[0];
    fila=array[1];
    pintaFicha(lastMove, fila, 1)
  }
  }
  if (status==0){
    console.log("game not ready");
  }
  if(status==1){
    var move=Math.floor((Math.random()*7));
    var data={
      id: idJuego,
      move: move,
      idPlayer: idPlayer
    }
    $http({
      method: 'PUT',
      url: '/juego',
      data: data
  }).then(function successCallback(response) {
      console.log(response);
      if(response.valido==1){
        clearInterval(interval);
        alert("perdiste");
      }else{
        array=actualizarTablero(tablero,move,player);
        tablero=array[0];
        fila=array[1];
        pintaFicha(move, fila, player)
      }
      console.log(tablero);
  }, function errorCallback(response) {
   // called asynchronously if an error occurs
   // or server returns response with an error status.

   console.log(response);
  });
}
  if(status==2){
    if(player==1){
    clearInterval(interval);
    alert("ganaste");
  }else{
    clearInterval(interval);
    alert("perdiste");
  }
  }

  if(status==3){
    if(player==1){
      clearInterval(interval);
      alert("perdiste");
    }else{
      clearInterval(interval);
      alert("ganaste");
    }


  }
  if(status==4){
    clearInterval(interval);
  alert("empate");
  }
}



function actualizarTablero(board,move,player){
  for(var i=6; i--;i>=0){
  if(board[i][move]==0){
   board[i][move]=player;
   break;
  }
 }
 return [board,i];
}

var boxsize = 50; //Circle diameter
var indist = 3;   // distance between circles
var buff = 10;
var width = (boxsize + indist) * 7 + 2 * buff; //7 circles horizontal
var height = (boxsize + indist) * 6 + 2 * buff;

window.onload = function() {
    canvas = document.getElementById("myCanvas");

    canvas.setAttribute("width", "" + width);
    canvas.setAttribute("height", "" + height);

    context = canvas.getContext("2d");
    drawBoardBool = false;
    drawBoard();






}

function drawBoard() {


    context.clearRect(0, 0, width, height);

    size = canvas.height - 2*buff;
    radius =  (size - 6*indist)/12.0;


    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 6; j++) {


            context.beginPath();
            context.arc( i * (boxsize+indist)+buff+radius, j*(boxsize+indist)+buff+radius, radius, 0, 2*Math.PI);
            context.strokeStyle = "gray";
            context.stroke();
            context.fillStyle = "white";
            context.fill();

        }
    }



}

function pintaFicha(col, fila, player) {

    size = canvas.height - 2*buff;
    radius =  (size - 6*indist)/12.0;

    if(player == 1){

            context.beginPath();
            context.arc( col * (boxsize+indist)+buff+radius, fila * (boxsize+indist) +buff+radius, radius, 0, 2*Math.PI);
            context.fillStyle = "purple";
            context.fill();
          }

		else
			{
				if(player == 2){

            context.beginPath();
            context.arc( col * (boxsize+indist)+buff+radius, fila * (boxsize+indist) +buff+radius, radius, 0, 2*Math.PI);
            context.fillStyle = "pink";
            context.fill();
        }
    }

}



});
