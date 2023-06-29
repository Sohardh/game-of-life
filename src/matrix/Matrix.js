import React, {cloneElement, useEffect, useRef, useState} from 'react';
import './Matrix.css';
import useWindowDimensions
                                                          from '../utilities/useWindowDimensions';

const MAX_BLACKS = 1;

const getNeighbours = (i, j, maxI, maxJ) => {
  //     [2][]
  //     [5][3]
  return [
    {row: Math.max(i - 1, 0), col: j},
    {row: Math.min(i + 1, maxI), col: j},
    {row: i, col: Math.max(j - 1, 0)},
    {row: i, col: Math.min(j + 1, maxJ)},
    {row: Math.max(i - 1, 0), col: Math.max(j - 1, 0)},
    {row: Math.min(i + 1, maxI), col: Math.min(j + 1, maxJ)},
    {row: Math.min(i + 1, maxI), col: Math.max(j - 1, 0)},
    {row: Math.max(i - 1, 0), col: Math.min(j + 1, maxJ)}];
};

function isDead(cell) {
  return cell?.props?.className?.includes('dead');
}

function Matrix() {
  const itemsRef = useRef([]);

  const {height, width} = useWindowDimensions();
  const [rows, setRows] = useState(Math.floor(width / 16));
  const [columns, setColumns] = useState(Math.floor(height / 16));
  const [matrix, setMatrix] = useState([[]]);
  const [timeOuts, setTimeOuts] = useState([]);

  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);

  useEffect(() => {
    itemsRef.current = Array.from({length: rows},
        () => Array(columns).fill(null));

    createGrid();
  }, [rows, columns]);

  const createGrid = () => {
    const grid_temp = Array.from(Array(rows), () => new Array(columns));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {

        grid_temp[i][j] = <div key={`${i}-${j}`}
                               ref={el => itemsRef.current[i][j] = el}
                               className={'cell'}/>;

      }
    }

    let black_count = 0;
    while (++black_count <= MAX_BLACKS) {
      let deadX = Math.floor(Math.random() * grid_temp.length - 1);
      let deadY = Math.floor(Math.random() * grid_temp.length - 1);

      let neighbours = getNeighbours(deadX, deadY, rows, columns);
      // 2,5,3
      neighbours.filter(n => n.row !== -1 && n.col !== -1).
          forEach((neighbour, ind) => {
            grid_temp[neighbour.row][neighbour.col] =
                <div key={`${deadX}-${deadY}-${JSON.stringify(neighbour)}`}
                     ref={el => itemsRef.current[neighbour.row][neighbour.col] = el}
                     className={'cell dead'}/>;
            console.log(neighbour);
          });

    }

    setMatrix(grid_temp);
  };

  const checker = (randomCellRow, randomCellCol) => {

    if (!runningRef.current) {
      return;
    }

    if (randomCellCol === 0 || randomCellRow === 0) {
      let row = (Math.floor(Math.random() * rows));
      let col = (Math.floor(Math.random() * columns));
      checker(row, col);
      return;
    }

    if (randomCellCol === rows - 1 || randomCellRow === columns - 1) {
      let row = (Math.floor(Math.random() * rows));
      let col = (Math.floor(Math.random() * columns));
      checker(row, col);
      return;
    }

    let cell = matrix[randomCellRow][randomCellCol];
    const tm = setTimeout(() => {

      // Any dead cell with three live neighbours becomes a live cell.
      const neighbours = getNeighbours(randomCellRow, randomCellCol,
          rows - 1, columns - 1);
      const span = itemsRef.current[randomCellRow][randomCellCol];
      let earlier_class = '';
      if (span) {
        earlier_class = span.className;
        span.className = 'cell red';
      }

      if (isDead(cell)) {

        let count = 0;
        neighbours.forEach(neighbour => {
          const n_cell = matrix[neighbour.row][neighbour.col];
          if (!isDead(n_cell)) {
            count++;
          }
        });
        if (count >= 3) {
          earlier_class = 'cell';
        }
      } else {

        //   Any live cell with two or three live neighbours survives.
        let count = 0;
        neighbours.forEach(neighbour => {
          const n_cell = matrix[neighbour.row][neighbour.col];
          if (!isDead(n_cell)) {
            count++;
          }
        });
        if (count < 2 || count > 3) {
          // All other live cells die in the next generation. Similarly, all other dead cells stay dead.
          earlier_class = 'cell dead';
        }

      }
      if (span) {
        span.className = earlier_class;
      }
      // for (const neighbour of neighbours) {
      //   if (neighbour.row !== randomCellRow || neighbour.col !==
      //       randomCellCol) {
      //       checker(neighbour.row, neighbour.row);
      //   }
      // }

      let x = -1;

      while (x === -1) {
        x = Math.floor(Math.random() * neighbours.length - 1);
      }
      console.log(x, neighbours[x]);

      checker(neighbours[x].row, neighbours[x].col);
      while (x === -1) {
        x = Math.floor(Math.random() * neighbours.length - 1);
      }
      checker(neighbours[x].row, neighbours[x].col);

      // let row = (Math.floor(Math.random() * rows));
      // let col = (Math.floor(Math.random() * columns));
      // checker(row, col);
    }, 10);
    setTimeOuts(prev => [...prev, tm]);

  };

  useEffect(() => {
    if (matrix && running) {
      let row = (Math.floor(Math.random() * rows));
      let col = (Math.floor(Math.random() * columns));
      runningRef.current = true;
      checker(row, col);
    }
    runningRef.current = running;
    if (!running) {
      timeOuts.forEach(timeout => clearInterval(timeout));
    }
    return () => {
      timeOuts.forEach(timeout => clearInterval(timeout));
    };

  }, [running]);

  return (
      <>

        <div className={'grid1'} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns }, 16px)`,
          width: 'fit-content',
          margin: '0 auto',
          position: 'relative',

        }}>
          {/*  {matrix?.map((row, i) => row?.map(((col, j) => {*/}

          {/*    return (<div key={`${i}-${j}-${col}`}*/}
          {/*                 className={col}/>*/}
          {/*    );*/}
          {/*  })))}*/}
          {matrix}
          <button className={'btn'} onClick={() => {
            setRunning(prev => !prev);
          }}>{running ? 'Stop' : 'Start'}
          </button>
        </div>
      </>
  )
      ;
}

export default Matrix;