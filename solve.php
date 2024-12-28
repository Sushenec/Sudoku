<?php 

$request_body = file_get_contents("php://input");
$data = json_decode($request_body,true);

$sudoku = $data["sudoku"] ?? [];

solveSudoku($sudoku,0,0);

header("Content-Type: application/json");
echo json_encode(["sudoku" => $sudoku]);

function canPlace($number, $row, $column, $sudoku){
    for ($n=0; $n < 9; $n++) { 
        if($sudoku[$row][$n] == $number  || $sudoku[$n][$column] == $number){
            return false;
        }    
    }

    for ($_row=0; $_row < 9; $_row++) { 
        for ($_column=0; $_column < 9; $_column++) { 
            if((bcdiv(($_row/3),1,0) == bcdiv(($row/3),1,0)) && (bcdiv(($_column/3),1,0) == bcdiv(($column/3),1,0))){                
                if($sudoku[$_row][$_column] == $number){
                    return false;
                }
            }
        }
    }

    return true;
}

function solveSudoku(&$sudoku, $_row, $_column){
    if($_row == 8 && $_column == 9){
        return true;
    }

    if($_column == 9 ){
        $_row++;
        $_column = 0;
    }

    if($sudoku[$_row][$_column] != 0){
        return solveSudoku($sudoku, $_row, $_column + 1);
    }

    for ($number=1; $number <= 9; $number++) { 
        if(canPlace($number,$_row,$_column,$sudoku)){
            $sudoku[$_row][$_column] = $number;
            if(solveSudoku($sudoku,$_row,$_column + 1)){
                return true;
            }
            $sudoku[$_row][$_column] = 0;
        }
    }
}

?>