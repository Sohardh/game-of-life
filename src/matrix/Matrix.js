import React, {cloneElement, useEffect, useRef, useState} from 'react';
import './Matrix.css';
import useWindowDimensions
                                                          from '../utilities/useWindowDimensions';

const MAX_BLACKS = 1;

function randomIntFromInterval(min, max) { // min and max included
  return (Math.random() * (max - min + 1) + min);
}

const getNeighbours = (i, j, maxI, maxJ) => {
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

function getRandomIndex(array) {
  return Math.floor(Math.random() * array.length - 1);
}

function getOneOrZero() {
  return (Math.random() >= 0.6) ? 1 : 0;
}

const highPopURL = process.env.PUBLIC_URL + '/pop-high.mp3';

const lowPopURL = process.env.PUBLIC_URL + '/pop-low.mp3';

function Matrix() {
  const itemsRef = useRef([]);

  const {height, width} = useWindowDimensions();
  const [rows, setRows] = useState(Math.floor(height / 18));
  const [columns, setColumns] = useState(Math.floor(width / 18));
  const [matrix, setMatrix] = useState([[]]);
  const [timeOuts, setTimeOuts] = useState([]);

  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  const [randomStart, setRandomStart] = useState();
  const lowPop = new Audio(highPopURL);
  const highPop = new Audio(lowPopURL);
  lowPop.volume = 0.05;
  highPop.volume = 0.05;

  function setRC(r, clm) {
    document.documentElement.style.setProperty('--columns', clm);
    document.documentElement.style.setProperty('--rows', r);
  }

  useEffect(() => {
    itemsRef.current = Array.from({length: rows},
        () => Array(columns).fill(null));

    setRC(rows, columns);
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
      let randomIndex = Math.floor(Math.random() * grid_temp.length - 1);
      let deadX = randomIndex;
      let deadY = randomIndex;

      let neighbours = getNeighbours(deadX, deadY, rows, columns);
      let filtered_nb = neighbours.filter(n => n.row !== -1 && n.col !== -1);
      filtered_nb.forEach((neighbour, ind) => {
        let oneOrZero = getOneOrZero();
        let candRow = neighbour.row + oneOrZero;
        oneOrZero = getOneOrZero();
        let candCol = neighbour.col + oneOrZero;
        grid_temp[candRow][candCol] =
            <div key={`${deadX}-${deadY}-${JSON.stringify(neighbour)}`}
                 ref={el => itemsRef.current[candRow][candCol] = el}
                 className={'cell dead'}/>;
      });

      setRandomStart(
          neighbours[Math.floor(Math.random() * filtered_nb.length - 1)]);
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
    const tm = setTimeout(async () => {

      // Any dead cell with three live neighbours becomes a live cell.
      const neighbours = getNeighbours(randomCellRow, randomCellCol,
          rows - 1, columns - 1);
      const span = itemsRef.current[randomCellRow][randomCellCol];
      let earlier_class = '';
      if (span) {
        earlier_class = span.className;
        span.className = 'cell';
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
          highPop.mozPreservesPitch = false;
          highPop.playbackRate = randomIntFromInterval(0.25, 4.0);
          await highPop.play();

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
          lowPop.mozPreservesPitch = false;
          lowPop.playbackRate = randomIntFromInterval(0.25, 4.0);
          await lowPop.play();

        }

      }
      if (span) {
        span.className = earlier_class;
      }
      let x = -1;

      while (x === -1) {
        x = Math.floor(Math.random() * neighbours.length - 1);
      }

      checker(neighbours[x].row, neighbours[x].col);

      while (x === -1) {
        x = Math.floor(Math.random() * neighbours.length - 1);
      }
      // checker(neighbours[x].row, neighbours[x].col);
      // let row = (Math.floor(Math.random() * rows));
      // let col = (Math.floor(Math.random() * columns));
      // checker(row, col);
    }, 200);
    setTimeOuts(prev => [...prev, tm]);

  };

  useEffect(() => {
    if (matrix && running && randomStart) {
      // let row = (Math.floor(Math.random() * rows));
      // let col = (Math.floor(Math.random() * columns));
      runningRef.current = true;
      checker(randomStart.row, randomStart.col);
    }
    runningRef.current = running;
    if (!running) {
      timeOuts.forEach(timeout => clearInterval(timeout));
      highPop.pause();
      lowPop.pause();
    }
    return async () => {
      timeOuts.forEach(timeout => clearInterval(timeout));
      await highPop.pause();
      await lowPop.pause();
    };

  }, [running, randomStart]);

  return (
      <>

        <div className={'grid1'}>
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