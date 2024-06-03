let red_time=document.querySelector("#red_timer");
let blue_time=document.querySelector("#blue_timer");
let min=2,sec=0;
let count=0;
let blue_minutes=min,blue_seconds=sec,red_minutes=min,red_seconds=sec;
let red_timeout_id,blue_timeout_id;
let player_turn=document.getElementById("player_turn");
let ricochet_button=document.querySelector("#ricochet_turn");
var GAME_OVER=false,current_piece, current_player = "blue";
let bullet=document.querySelector("#bullet");
var path = [], a = 0;
const BULLET_SPEED = 150;
let bullet_direction = "v-";
//blue_pieces 
const blue_tank = '<div class="blue_pieces" id="tank"><img src="delta task piece img/bluetank.png" id="bluetank"></img></div>';
const blue_cannon = '<div class="blue_pieces" id="cannon"><img src="delta task piece img/bluecano.png" id="bluecannon"></img></div>';
const blue_ricochet = '<div class="blue_pieces" id="ricochet" style="rotate: 0deg;"><img src="delta task piece img/bluerico.png" id="bluerico"></img></div>';
const blue_semiricochet = '<div class="blue_pieces" id="semi_ricochet" style="rotate: 0deg;"><img src="delta task piece img/bluesemirico.png" id="bluesemirico"></img></div>';
const blue_titan = '<div class="blue_pieces" id="titan"><img src="delta task piece img/bluetitan.png" id="bluetitan"></img></div>';

//red_pieces
const red_tank = '<div class="red_pieces" id="tank"><img src="delta task piece img/redtank.png" id="redtank"></img></div>';
const red_cannon = '<div class="red_pieces" id="cannon"><img src="delta task piece img/redcano.png" id="redcannon"></img></div>';
const red_ricochet = '<div class="red_pieces" id="ricochet" style="rotate: 0deg;"><img src="delta task piece img/redrico.png" id="redrico"></img></div>';
const red_semiricochet = '<div class="red_pieces" id="semi_ricochet" style="rotate: 0deg;"><img src="delta task piece img/redsemirico.png" id="redsemirico"></img></div>';
const red_titan = '<div class="red_pieces" id="titan"><img src="delta task piece img/redtitan.png" id="redtitan"></img></div>';
//starting pieces


const start_pieces = [
    '', blue_cannon, '', '', '', '', '', '',
    '', blue_ricochet, '', blue_ricochet, blue_semiricochet, '', '', '',
    blue_tank, '', '', '', blue_titan, '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    red_titan, '', '', '', red_tank, '', '', '',
    '', red_ricochet, '', red_ricochet, red_semiricochet, '', '', '',
    '', red_cannon, '', '', '', '', '', ''
];

const piecePosition = {
    blue: {
        tank: 17,
        titan: 30,
        cannon: 2,
        ricochet: 19,
        semiRicochet: 13
    },

    red: {
        tank: 36,
        titan: 41,
        cannon: 58,
        ricochet: 50,
        semiRicochet: 44
    }
}
//creating places for the pieces
start_pieces.forEach((start_piece,idx) => {
    if(start_piece!=''){
        let id=(idx+1).toString();
        let div=document.getElementById(id);
        div.innerHTML=start_piece;
    }
});

let all_squares=document.querySelectorAll(".square");

addSquareEventListener();
bluetimer();
//adding event listener for the squares
function addSquareEventListener(){
    //initialising squares which are clickable
    all_squares.forEach((square) => {
        square.firstChild? square.setAttribute("clickable", true) : square.setAttribute("clickable", false);
        //removing previous event listeners
        square.removeEventListener("click", showPossibleMoves);
        //setting new event listeners from in game position
        if(square.getAttribute('clickable') === 'true' && square.firstChild.className==(current_player+"_pieces")){  
            square.addEventListener("click", showPossibleMoves);
        }
    });
    player_turn.innerHTML = `${current_player}'s turn`.toUpperCase(); //displaying who's turn
    player_turn.style.color = `${current_player}`;
    
}

// function for displaying the possible moves
function showPossibleMoves(e){
    current_piece = e.target;

    //getting clicked square if user clicks image of piece, changing initial target
    if(current_piece.className=="red_pieces" || current_piece.className=="blue_pieces"){
        current_piece=current_piece.parentElement;
    }
    else if(current_piece.tagName=="IMG")current_piece=current_piece.parentElement.parentElement;

    // removing every movePiece eventListener from the boxes
    all_squares.forEach(square => {
        square.style.backgroundColor="gold";
        square.removeEventListener("click",movePiece);
    });
    const row = Number(current_piece.getAttribute("row"));
    const col = Number(current_piece.getAttribute("col"));
    //storing the possibles boxes a piece can be in an array
    if(current_piece.firstChild.id !== "cannon"){
        var possibleSquares = [ [row, col+1], [row, col-1], [row+1, col-1], [row+1, col], [row+1, col+1], [row-1, col-1], [row-1, col], [row-1, col+1] ];
        if(current_piece.firstChild.id === "ricochet" || current_piece.firstChild.id=="semi_ricochet"){
            ricochet_button.style.visibility = "visible";
        }
        else ricochet_button.style.visibility = "hidden";
        
    }
    else{ 
        var possibleSquares = [ [row, col+1], [row, col-1] ];
    }
    //assigning eventListener to all the higlighted pieces
    possibleSquares.forEach( arr => {
        let r = arr[0];
        let c = arr[1];
        if ( r<=8 && r>0 && c<=8 && c>0){
            let possibleSquaresIndex = ((r-1)*8 + c) - 1;
            let possibility=document.getElementById((possibleSquaresIndex+1).toString());
            possibility.style.backgroundColor="lightgreen";
            possibility.addEventListener("click", movePiece);
        }
    });
    
    //turning ricochet and semi_ricochet
    if(current_piece.firstChild.id === "ricochet"){
        ricochet_button.children[0].onclick = () => {turnRicochet();}
        ricochet_button.children[1].onclick = () =>{turnRicochet();}
    }
    else if(current_piece.firstChild.id === "semi_ricochet"){
        ricochet_button.children[0].onclick = () => {turnSemiRicochet(ricochet_button.children[0].id);}
        ricochet_button.children[1].onclick = () =>{turnSemiRicochet(ricochet_button.children[1].id);}
    }
    
}

//function to move pieces
function movePiece(e){
    possibleSquaresIndex = e.target.getAttribute("id");      // getting the index of the clicked box
    console.log(current_piece.firstChild);
    // appending the piece to the clicked box and updating the clickable attribute
    all_squares[possibleSquaresIndex-1].prepend(current_piece.firstChild);
    current_piece.innerHTML='';
    current_piece.setAttribute("clickable", false);
    count++;
    all_squares[possibleSquaresIndex-1].setAttribute("clickable", true);
    // removing the green class and eventlisteners from all the squares
    all_squares.forEach(square => {
        square.style.backgroundColor="gold";
        square.removeEventListener("click", movePiece);
    });
    console.log(`Moved ${current_piece.classList} ${current_piece.id} to square-id ${possibleSquaresIndex}. Move count: ${count}`); // displaying the move
    piecePosition[current_player][current_piece.id] = Number(possibleSquaresIndex);

    shoot();
    current_player = (current_player === "blue")? "red": "blue";
    bullet_direction= (bullet_direction=="v-")? "v-" :"v+";

    // // alternating timer between the players
    if(current_player === "red" && !GAME_OVER){
        clearTimeout(blue_timeout_id);
        setTimeout(redtimer,path.length*BULLET_SPEED);
    }
    else if(current_player === "blue" && !GAME_OVER){
        clearTimeout(red_timeout_id);
        setTimeout(bluetimer, path.length*BULLET_SPEED);
    }
    GAME_OVER = false;

    all_squares.forEach( square => square.removeEventListener("click", showPossibleMoves) ); // avoids the player to select a
    setTimeout(addSquareEventListener, path.length*BULLET_SPEED);                     // piece while the bullet is moving
    ricochet_button.style.visibility = "hidden";
}

function ricochet_reflection(ricochet_position){
    if(bullet_direction=="v-"){
        if(all_squares[ricochet_position].firstChild.style.rotate=="0deg"){
            bullet_direction="h-";
            turn_left(ricochet_position);
        }
        else{
            bullet_direction="h+";
            turn_right(ricochet_position);
        }
    }
    else if(bullet_direction=="v+"){
        if(all_squares[ricochet_position].firstChild.style.rotate=="0deg"){
            bullet_direction="h+";
            turn_right(ricochet_position);
        }
        else{
            bullet_direction="h-";
            turn_left(ricochet_position);
        }
    }
    else if(bullet_direction=="h-"){
        if(all_squares[ricochet_position].firstChild.style.rotate=="0deg"){
            bullet_direction="v-";
            turn_down(ricochet_position);
        }
        else{
            bullet_direction="v+";
            turn_up(ricochet_position);
        }
    }
    else if(bullet_direction=="h+"){
        if(all_squares[ricochet_position].firstChild.style.rotate=="0deg"){
            bullet_direction="v+";
            turn_up(ricochet_position);
        }
        else{
            bullet_direction="v-";
            turn_down(ricochet_position);
        }
    }
}
function semiricochet_reflection(semiricochet_position){
    var angle = Number(all_squares[semiricochet_position].firstChild.style.rotate.slice(0,all_squares[semiricochet_position].firstChild.style.rotate.length-3));
    //if semirico turns left, angle becomes negative, hence converting that to positive angles
    if(angle<0)angle+=360;
    angle=angle.toString()+"deg";
    //0 and 270 for v-
    //0 and 90   for h-
    //90 and 180    for v+
    //180 and  270     for h+
    // path.push(semiricochet_position);
    if(bullet_direction == "h+"){
        if(angle == "180deg"){
            bullet_direction="v-"
            turn_down(semiricochet_position);
        }
        else if(angle == "270deg"){
            bullet_direction="v+";
            turn_up(semiricochet_position);
        } 
    }
    else if(bullet_direction == "h-"){
        if(angle == "0deg"){
            bullet_direction="v+"
            turn_up(semiricochet_position);
        }
        else if(angle == "90deg"){
            bullet_direction="v-";
            turn_down(semiricochet_position);
        } 
    }
    else if(bullet_direction == "v+"){
        if(angle == "90deg"){
            bullet_direction="h+"
            turn_right(semiricochet_position);
        }
        else if(angle == "180deg"){
            bullet_direction="h-";
            turn_left(semiricochet_position);
        } 
    }
    else if(bullet_direction == "v-"){
        if(angle == "0deg"){
            bullet_direction="h+"
            turn_right(semiricochet_position);
        }
        else if(angle == "270deg"){
            bullet_direction="h-";
            turn_left(semiricochet_position);
        } 
    }
}
function turnRicochet(){
    if(current_piece.firstChild.style.rotate != '90deg'){current_piece.firstChild.style.rotate = `90deg`;}
    else current_piece.firstChild.style.rotate = `0deg`;
    all_squares.forEach(square => {
        square.style.backgroundColor="gold";
        square.removeEventListener("click", movePiece);
    });

    shoot();
    current_player = (current_player === "blue")? "red": "blue";

    addSquareEventListener();
    ricochet_button.style.visibility = "hidden";
    return;
}

//turns the semiRicochet
function turnSemiRicochet(rotate){
    let angle = Number(current_piece.firstChild.style.rotate.slice(0, (current_piece.firstChild.style.rotate.length-3)));
    
    if(rotate === "right") angle += 90;
    else angle -= 90;

    current_piece.firstChild.style.rotate = `${angle}deg`;

    all_squares.forEach(square => {
        square.style.backgroundColor="gold";
        square.removeEventListener("click", movePiece);
    });
    shoot();
    current_player = (current_player === "blue")? "red": "blue";
    ricochet_button.style.visibility = "hidden";
    addSquareEventListener();
    return;
}

function shoot(){
    let cannon_sq;
    if(current_player=="red"){
        cannon_sq=document.getElementsByClassName("red_pieces").cannon.parentElement;
        bullet_direction="v+";
    }
    else{
        bullet_direction="v-";
        cannon_sq=document.getElementsByClassName("blue_pieces").cannon.parentElement;
    }
    // let hit=false;
    let r=cannon_sq.getAttribute("row");
    let c=cannon_sq.getAttribute("col");
    path=[];
    let hit=false;
    let break_idx;
    //first vertical path
    if(bullet_direction=="v-"){
        for(let i=r;i<=8;i++){
            if(i!=r && (all_squares[(8*(i-1)+(c*1))-1]).firstChild){
                hit=true;
                break_idx=(8*(i-1)+(c*1))-1;
                break; 
            }
            else path.push((8*(i-1)+(c*1))-1);
        }
    }
    else{
        for(let i=r;i>=1;i--){
            if(i!=r && (all_squares[(8*(i-1)+(c*1))-1]).firstChild){
                hit=true;
                break_idx=(8*(i-1)+(c*1))-1;
                break; 
            }
            else path.push((8*(i-1)+(c*1))-1);
        }
    }
    if(hit){
        if(all_squares[break_idx].firstChild.id=="tank")return;
        else if(all_squares[break_idx].firstChild.id=="ricochet")ricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="semi_ricochet")semiricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="titan"){
            gameOver(all_squares[break_idx].firstChild.className);
            return;
        }
    }
    console.log(path);
    move_bullet();
}
function remove_bullet(square,bullet){
    bullet.style.visibility="hidden";
    square.removeChild(bullet);
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function move_bullet(){
    let s=path.length;    
    for(let i=0;i<s;i++){ 
        //creating a bullet
        let bullet=document.createElement("div");
        bullet.innerHTML="<img src=bullet.png id=bullet></img>";
        bullet.style.visibility="visible";

        //appending bullet to the squares which are there in path 
        all_squares[path[i]].append(bullet);
        console.log(all_squares[path[i]]);
        // //Set a timeout to hide the bullet after 1 second
        setTimeout(()=>{
            remove_bullet(all_squares[path[i]],bullet);
        },150);
        await delay(150);
    }
}
function turn_up(current_position){
    let r=Math.floor(current_position/8) +1;
    let c=(current_position%8)+1;
    let break_idx;
    let hit=false;
    for(let i=r;i>=1;i--){
        if(i!=r && all_squares[(8*(i-1)+c*1 )-1].firstChild){
            break_idx= (8*(i-1)+c*1 )-1;
            hit=true;
            break;
        }
        else path.push((8*(i-1)+c*1 )-1);
    }
    if(hit){
        if(all_squares[break_idx].firstChild.id=="tank")return;
        else if(all_squares[break_idx].firstChild.id=="ricochet")ricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="semi_ricochet")semiricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="titan" && current_player+"_pieces"!=all_squares[break_idx].firstChild.className){
            gameOver(all_squares[break_idx].firstChild.className);
            return;
        }
    }
}
function turn_down(current_position){
    let r=Math.floor(current_position/8) +1;
    let c=(current_position%8)+1;
    let break_idx;
    let hit=false;
    for(let i=r;i<=8;i++){
        if(i!=r && all_squares[(8*(i-1)+c*1 )-1].firstChild){
            break_idx= (8*(i-1)+c*1 )-1;
            hit=true;
            break;
        }
        else path.push((8*(i-1)+c*1 )-1);
    }
    if(hit){
        if(all_squares[break_idx].firstChild.id=="tank")return;
        else if(all_squares[break_idx].firstChild.id=="ricochet")ricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="semi_ricochet")semiricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="titan" && current_player+"_pieces"!=all_squares[break_idx].firstChild.className){
            gameOver(all_squares[break_idx].firstChild.className);
            return;
        }
    }
}
function turn_right(current_position){
    let r=Math.floor(current_position/8) +1;
    let c=(current_position%8)+1;
    let break_idx;
    let hit=false;
    for(let i=c;i<=8;i++){
        if(i!=c && all_squares[(8*(r-1)+i*1 )-1].firstChild){
            break_idx= (8*(r-1)+i*1 )-1;
            hit=true;
            break;
        }
        else path.push((8*(r-1)+i*1 )-1);
    }
    console.log(path);
    if(hit){

        if(all_squares[break_idx].firstChild.id=="tank")return;
        else if(all_squares[break_idx].firstChild.id=="ricochet")ricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="semi_ricochet")semiricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="titan" && current_player+"_pieces"!=all_squares[break_idx].firstChild.className){
            gameOver(all_squares[break_idx].firstChild.className);
            return;
        }
    }
}
function turn_left(current_position){
    let r=Math.floor(current_position/8) +1;
    let c=(current_position%8)+1;
    let break_idx;
    let hit=false;
    for(let i=c;i>=1;i--){
        if(i!=c && all_squares[(8*(r-1)+i*1 )-1].firstChild){
            break_idx= (8*(r-1)+i*1 )-1;
            hit=true;
            break;
        }
        else path.push((8*(r-1)+i*1 )-1);
    }
    if(hit){
        if(all_squares[break_idx].firstChild.id=="tank")return;
        else if(all_squares[break_idx].firstChild.id=="ricochet")ricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="semi_ricochet")semiricochet_reflection(break_idx);
        else if(all_squares[break_idx].firstChild.id=="titan" && current_player+"_pieces"!=all_squares[break_idx].firstChild.className){
            gameOver(all_squares[break_idx].firstChild.className);
            return;
        }
    }
}
//gameOver function
function gameOver(titanClassName){
    current_player = "blue";
    if(titanClassName.includes("blue")) window.alert("Red Won");
    else if(titanClassName.includes("red")) window.alert("Blue Won");

   red_sec = sec, blue_sec = sec, red_min = min, blue_min = min;
    
   red_sec =red_sec.toString().padStart(2, 0);
    red_min = red_min.toString().padStart(2, 0);
    redTime.textContent = `Red Timer: ${red_min}:${redSeconds}`;
   red_sec = Number(redSeconds);
    red_min = Number(red_min);

    blue_sec = blue_sec.toString().padStart(2, '0');
    blue_min = blue_min.toString().padStart(2, '0');
    blueTime.textContent = `Blue Timer: ${blue_min}:${blue_sec}`;
    blue_sec = Number(blue_sec);
    blue_min = Number(blue_min);

}
function redtimer(){
    if(current_player=="blue")return;
    if(!GAME_OVER && red_minutes==0 && red_seconds==0){
        clearTimeout(red_timeout_id);
        GAME_OVER=true;
        current_player="blue";
        
    }
    if(red_seconds)red_seconds--;
    else if(red_seconds==0){
        red_seconds=59;
        red_minutes--;
    }
    red_seconds = red_seconds.toString().padStart(2, '0');
    red_minutes = red_minutes.toString().padStart(2, '0');
    red_time.textContent= `RED ${red_minutes}:${red_seconds}`;
    red_seconds = Number(red_seconds);
    red_minutes = Number(red_minutes);
    red_timeout_id = setTimeout(redtimer, 1000 );
}
function bluetimer(){
    if(current_player=="red")return;
    if(!GAME_OVER && blue_minutes==0 && blue_seconds==0){
        clearTimeout(blue_timeout_id);
        GAME_OVER=true;
        current_player="red";
    }
    if(blue_seconds)blue_seconds--;
    else if(blue_seconds==0){
        blue_seconds=59;
        blue_minutes--;
    }
    blue_seconds = blue_seconds.toString().padStart(2, '0');
    blue_minutes = blue_minutes.toString().padStart(2, '0');
    blue_time.textContent= `BLUE ${blue_minutes}:${blue_seconds}`;
    blue_seconds = Number(blue_seconds);
    blue_minutes = Number(blue_minutes);
    blue_timeout_id = setTimeout(bluetimer, 1000 );
}