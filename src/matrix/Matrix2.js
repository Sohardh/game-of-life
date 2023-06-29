/*
* The following code snippets are taken from https://dev.to/toluagboola/build-the-game-of-life-with-react-and-typescript-5e0d
*
* */
import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import './Matrix2.css';
import useWindowDimensions
  from '../utilities/useWindowDimensions';
import useInterval from '../utilities/useInterval';

const positions = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];
const randomTiles = (numRows,numCols) => {

  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
        Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))); // returns a live cell 70% of the time
  }
  return rows;
};

function Matrix() {
  const {height, width} = useWindowDimensions();

  const numRows = (Math.floor(width / 16));
  const numCols = (Math.floor(height / 16));
  console.log(numRows,numCols);

  const [grid, setGrid] = useState(() => randomTiles(numRows,numCols));
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback((grid) => {
    if (!runningRef.current) {
      return;
    }

    let gridCopy = JSON.parse(JSON.stringify(grid));
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        let neighbors = 0;

        positions.forEach(([x, y]) => {
          const newI = i + x;
          const newJ = j + y;

          if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
            neighbors += grid[newI][newJ];
          }
        });

        if (neighbors < 2 || neighbors > 3) {
          gridCopy[i][j] = 0;
        } else if (grid[i][j] === 0 && neighbors === 3) {
          gridCopy[i][j] = 1;
        }
      }
    }

    setGrid(gridCopy);
  }, []);
  useInterval(() => {
    runSimulation(grid);
  }, 500);
  return (
      <>
        <div className={'grid'} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols*2}, 16px)`,
          // width: 'fit-content',
          // margin: '0 auto',
          overflow:'hidden',
          position:'relative'
        }}>
          {grid.map((rows, i) =>
              rows.map((col, k) => (
                  <div
                      className={  grid[i][k] ? 'cell dead' : 'cell'}
                      key={`${i}-${k}`}
                      onClick={() => {
                        let newGrid = JSON.parse(JSON.stringify(grid));
                        newGrid[i][k] = grid[i][k] ? 0 : 1;
                        setGrid(newGrid);
                      }}

                  />
              )),
          )}
          <button
               className={'btn2'}
              onClick={() => {
                setRunning(!running);
                if (!running) {
                  runningRef.current = true;
                }
                setInterval(() => {
                  runSimulation(grid);
                }, 1000);
              }}
          >
            {running ? 'Stop' : 'Start'}
          </button>
        </div>

      </>
  );

}

export default Matrix;