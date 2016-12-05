var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var uuid=require('uuid');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var tablero=[
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0],
]
var Game= require('./game');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'));
 // send our index.html file to the user for the home page
 app.get('/', function(req, res) {

     console.log("hello world");
     	res.sendFile(path.join(__dirname + '/index.html'));
 });


 function actualizarTablero(board,move,player){
   for(var i=6; i--;i>=0){
   if(board[i][move]==0){
    board[i][move]=player;
    break;
   }
  }
  return [board,i];
 }

 function empate(board){
   if(board[0][0] != 0 && board[0][1] != 0 && board[0][2] != 0 && board[0][3] != 0 && board[0][4] != 0 && board[0][5] != 0 && board[0][6] != 0)
   return true;
   else return false;
 }


app.put('/juego',function(req,res){
  var id=req.body.id;
  var move=req.body.move;
  var idPlayer=req.body.idPlayer;
  var player;
  var fila;
  var valido=0;
  Game.find( { $or:[ {'player1':idPlayer}, {'player2':idPlayer} ]},
  function(err,game){

    if(idPlayer==game[0].player1) player=1;
    else if(idPlayer==game[0].player2) player=2;

    if(!err){
    game[0].turn=!game[0].turn;
    game[0].lastMove=move;



    if(game[0].board[0][move]==0){

      console.log("Jugador "+player+" Suelta ficha en columna "+move);

      var retorno=actualizarTablero(game[0].board,move,player);
      game[0].board=retorno[0];
      fila=retorno[1];

   if(diagonal(player, game[0].board) || horizontal (game[0].board, fila, player) || vertical (move, player, game[0].board)){

        if(player==1) game[0].status=2;
        else if(player==2) game[0].status=3;
        console.log(game[0].board);

        if(game[0].status==2) console.log("Jugador 1 gana el juego");
          else console.log("Jugador 2 gana el juego");

      }else{

            if(empate(game[0].board)){
               game[0].status=4;
               console.log("Empate");
             }
   }


  } else {
      valido=1;
      if(player==1) game[0].status=3;
      else if(player==2) game[0].status=2;
      console.log("mov invalido");
    }


    game[0].markModified('board');
    game[0].date=new Date();


    game[0].save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log(game[0].board);
      }
    });

    }

  })
var data={
  valido: valido
}
  res.send(data);

})




 app.get('/juego/:id', function(req, res) {
     var id=req.params.id;
     var status=0;
     var turn=false;
     var lastMove;
     var fecha=new Date();
     Game.find( { $or:[ {'player1':id}, {'player2':id} ]},
     function(err,game){

       status=game[0].status;

       if(!err){
         if(game[0].player2!=''){
          // console.log("juego listo");
        //   status=1;
           turn=game[0].turn;
          if(game[0].status==1){
           if(((fecha-game[0].date)/1000) > 10){
             if(id==game[0].player1) status=2;
             else if(id==game[0].player2) status=3;
           }
         }
         }else{
           console.log("juego no listo");
           game[0].date=fecha;
           game[0].save(function (err) {
             if (err) {
               console.log(err);
             } else {
               console.log('time update');
             }
           });
        //   status=0;
         }
         lastMove=game[0].lastMove;

       }

     }).then(function (game){
       var data={
         status:status,
         turn:turn,
         lastMove:lastMove
       }
       res.send(data);


     })


 });

var cont=0;
var flag=false;
app.post('/juego',function(req,res){
  var id = uuid.v4();
  var idJuego;
  Game.count({}, function( err, count){
    cont=count;
  }).then(function (){

    if(cont==0){

    var juego = new Game({
      player1:id,
      player2:'',
      board: tablero,
      turn:0,
      status:0,
      lastMove:-1
    });

    juego.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('meow1');
      }
    });

    }

  }).then(function (){

    Game.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, game) {
      var player;

          if(game.player1 && game.player2!=''){
            player=1;
            idJuego=game._id;
            var juego = new Game({
              player1:id,
              player2:'',
              board: tablero,
              turn:0,
              status:0,
              lastMove:-1
            });

            juego.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log('nuevo juego');
              }
            });
          }
          else{
            if(game.player2=='' && cont!=0){
              player=2;
            game.player2=id;
            game.status=1;
            game.lastMove=-1;
            console.log(game.player2);
            game.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log('juego listo');
              }
            });
          }

        }

        var data={
          id: id,
          player:player,
          idJuego:idJuego
        }

         res.send(data);
    });
  })







})


// start the server
app.listen(8080);
function horizontal (tablero, fila, player){
  var cont=1;


  for(var i = 0; i < 6; i++){

    if(tablero[fila][i+1] == player && tablero[fila][i] == player){
        cont++;

      }
    else{
      cont=1;
    }
    if(cont == 4) return true;



  }
   return false;
}


function vertical (col, idJ, tablero)
{
    cont = 1;
    for(var i=0; i <= 4; i++){

        if(tablero[i][col] == idJ  && tablero[i+1][col] == idJ )
        {
            cont++;
        }
        else cont = 1;

        if( cont == 4 ) return true;

    }
    return false;
}



function diagonal(player, board){

    for (var i=3; i<6; i++){
        for (var j=0; j<4; j++){
            if (board[i][j] == player && board[i-1][j+1] == player && board[i-2][j+2] == player && board[i-3][j+3] == player)
                return true;
        }
    }

    // descendingDiagonalCheck

    for (var i=3; i<6; i++){
        for (var j=3; j<7; j++){
            if (board[i][j] == player && board[i-1][j-1] == player && board[i-2][j-2] == player && board[i-3][j-3] == player)
                return true;
        }
    }

    return false;
}
