class Box{
  constructor(id ,x, y, size, color, selectedColor){
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.selectedColor = selectedColor;
    this.data = "";
    this.selected = false;
  }

  isInside(x, y) {
    if(((x >= this.x) && (x <= this.x + this.size)) && ((y >= this.y) && (y <= this.y + this.size))){
      return true;
    }else{
      return false;
    }
  }

  draw(boxId){
    if(this.selected){
      fill(this.selectedColor);
    }else{
      fill(this.color);
    }
    rect(this.x, this.y, this.size);
    
    // Display box ID in the centre of a box
    fill((this.color[0]+180)%360,this.color[1],this.color[2]);
    textSize(24);
    textAlign(CENTER,CENTER);
    if(boxId===true){
      text(this.id, this.x + (this.size/2), this.y + (this.size/2));
    }else{
      text(this.data, this.x + (this.size/2), this.y + (this.size/2));
    }
  }
}

class BoxGrid{
  constructor(gridSize, cellSize, spaceBetweenCells, cellColor, selectedCellColor, x, y){
    this.gridSize=gridSize;
    this.cellSize=cellSize;
    this.spaceBetweenCells=spaceBetweenCells;
    this.cellColor=cellColor;
    this.selectedCellColor=selectedCellColor;
    this.x=x;
    this.y=y;
    this.boxGrid=[];

    for (let row = 0; row < gridSize; row++) {
      for (let column = 0; column < gridSize; column++) {      
        this.boxGrid.push(new Box([row, column], 
                          x + (((column==0? 0 : spaceBetweenCells + cellSize)) * column),
                          y + (((row==0? 0 : spaceBetweenCells + cellSize)) * row) - cellSize + cellSize,
                          cellSize,cellColor, selectedCellColor));
      }
    }
  }

  draw(boxId){
    for (let index = 0; index < this.boxGrid.length; index++) {
      const box = this.boxGrid[index];
      box.draw(boxId);
    }
  }

  drawLinesBetweenBoxes(boxPerLine){
    //box per line means how many boxes are between lines
    stroke(0,0,0);
    strokeWeight(this.spaceBetweenCells/2);

    for (let cell = 0; cell < this.gridSize; cell++) {
      if(cell != 0 && cell%boxPerLine == 0){
        line(this.x + (cell * (this.spaceBetweenCells + this.cellSize)) - (this.spaceBetweenCells / 2), this.x,
           this.x + (cell * (this.spaceBetweenCells + this.cellSize)) - (this.spaceBetweenCells / 2), this.x + (this.gridSize * (this.spaceBetweenCells + this.cellSize)) - (this.spaceBetweenCells));
        line(this.y, this.y + (cell * (this.spaceBetweenCells + this.cellSize)) - (this.spaceBetweenCells / 2),
            this.y + (this.gridSize * (this.spaceBetweenCells + this.cellSize)) - (this.spaceBetweenCells), this.y + (cell * (this.spaceBetweenCells + this.cellSize)) - (this.spaceBetweenCells / 2));
      }
    }

    noStroke();
  }

  selectBox(x, y){
    for (let index = 0; index < this.boxGrid.length; index++) {
      const box = this.boxGrid[index];
      if(box.isInside(x, y)){
        box.selected = true;
      }else{
        box.selected = false;
      }
    }
  }

  insertDataIntoSelectedBox(data, allowedData){
    if(allowedData.indexOf(data)!=-1){
      for (let index = 0; index < this.boxGrid.length; index++) {
        const box = this.boxGrid[index];
        if(box.selected){
          box.data = data;
        }
      }
    }
  }

  deleteDataFromSelectedBox(){
    for (let index = 0; index < this.boxGrid.length; index++) {
      const box = this.boxGrid[index];
      if(box.selected){
        box.data = "";
      }
    }
  }

  deleteAllData(){
    for (let index = 0; index < this.boxGrid.length; index++) {
      const box = this.boxGrid[index];
      box.data = "";
    }
  }
}


let mouseHeight = 16;
let mouseIndent = 4;
let mouseWidth = 7;
let mouseColor = [105,95,75];
let grid = new BoxGrid(9, 50, 6, [250,75,100], [250,65,60], 50, 50);
let defaultSudoku = [["","","",3,8,1,9,5,7],
          [5,1,"","",9,"","","",""],
          ["","","",5,4,7,"",6,""],
          ["","","","","","","","",8],
          [7,"","","","",4,6,"",""],
          [8,9,4,"",3,"","","",2],
          ["","","",7,5,3,"",2,6],
          [6,7,8,9,1,2,5,"",3],
          ["",5,"","","","","",1,""]];

function setup() {
  createCanvas(600, 600);
  colorMode(HSB);
  frameRate(60);
  noStroke();
}

function draw() {
  background(345,15,100);
  grid.draw(false);
  grid.drawLinesBetweenBoxes(3);

  if(mouseIsPressed){
    grid.selectBox(mouseX, mouseY);
  }
  
  drawMouse();
}

function drawMouse(){
  fill(mouseColor);
  quad(mouseX,mouseY, mouseX+mouseWidth,mouseY+mouseHeight, mouseX,mouseY+(mouseHeight-mouseIndent), mouseX-mouseWidth,mouseY+mouseHeight);

}

async function keyPressed(){
  grid.insertDataIntoSelectedBox(key,["1","2","3","4","5","6","7","8","9"]);
  switch (key) {
    case "Backspace":
      grid.deleteDataFromSelectedBox();
      break;
    case "Enter":
      let unsolved = getSudokuFromGrid();
      await solveSudoku(unsolved).then((solved)=>putSudokuInGrid(solved));
      break;
    case "Alt":
    case "AltGraph":
      grid.deleteAllData();
      break;
    case "Control":
      putSudokuInGrid(defaultSudoku);
      break;
    default:
      break;
  }

}

async function solveSudoku(sudoku){
  // precheck sudoku for user error before solving
  if(!checkSudoku(sudoku)){
    let errorSudoku = [ ["E","R","R","O","R","","","",""],
                        ["","","","","","","","",""],
                        ["w","r","o","n","g","","","",""],
                        ["i","n","p","u","t","","","",""],
                        ["","","","","","","","",""],
                        ["p","r","e","s","s","","","",""],
                        ["a","l","t","","","","","",""],
                        ["","","","","","","","",""],
                        ["","","","","","","","",""]];

    return errorSudoku;
  }

  // sends the problem to php
  const response = await fetch("solve.php",{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({sudoku})
  });

  const solved = await response.json();

  return solved["sudoku"];
}

function putSudokuInGrid(sudoku){
  for (let row = 0; row < sudoku.length; row++) {
    for (let column = 0; column < sudoku.length; column++) {
      for (let index = 0; index < grid.boxGrid.length; index++) {
        const box = grid.boxGrid[index];
        if(box.id[0] == row && box.id[1] == column){
          box.data = sudoku[row][column];
        }
      }
    }    
  }
}

function getSudokuFromGrid(){
  let sudoku =[[0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0],
               [0,0,0,0,0,0,0,0,0]];

  for (let index = 0; index < grid.boxGrid.length; index++) {
    const box = grid.boxGrid[index];
    sudoku[box.id[0]][box.id[1]] = box.data > 0 ? box.data : 0;
  }

  return sudoku;
}

// checks if sudoku board has illegal configurations
function checkSudoku(sudoku){
  function checkForDuplicatesArray(arr){
    let seenValues = [];
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if(seenValues.indexOf(element) != -1 && element != 0){
        return true;
      }
      seenValues.push(element);
    }
    return false;
  }

  // check for duplicates in rows and columns
  for (let i = 0; i < sudoku.length; i++) {
    let row = [];
    let column = [];
    for (let j = 0; j < sudoku.length; j++) {
      row.push(sudoku[i][j]);
      column.push(sudoku[j][i]);
    }
    if(checkForDuplicatesArray(row) || checkForDuplicatesArray(column)){
      return false;
    }
  }

  // check for subsquares
  let subsquares = [[[],[],[]],
                    [[],[],[]],
                    [[],[],[]]];

  for (let row = 0; row < sudoku.length; row++) {
    for (let column = 0; column < sudoku.length; column++) {
      subsquares[Math.trunc(row/3)][Math.trunc(column/3)].push(sudoku[row][column]);
    }
  }
  
  for (let row = 0; row < subsquares.length; row++) {
    for (let column = 0; column < subsquares.length; column++) {
      if(checkForDuplicatesArray(subsquares[row][column])){
        return false;
      }
    }
  }

  return true;
}