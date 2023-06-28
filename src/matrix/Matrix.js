import React, {useEffect, useState} from 'react';
import './Matrix.css';
import useWindowDimensions          from '../utilities/useWindowDimensions';

function Matrix() {

  const {height, width} = useWindowDimensions();
  const [rows, setRows] = useState(Math.floor(width / 16));
  const [columns, setColumns] = useState(Math.floor(height / 16));

  useEffect(() => {
    setRows(Math.floor(width / 16));
    setColumns(Math.floor(height / 16));
  }, [height, width]);
  const createGrid = () => {
    const grid_temp = Array.from(Array(rows), () => new Array(columns));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        let dead = Math.round(Math.random());
        grid_temp[i][j] =
            <div key={`${i}-${j}`} className={`cell ${dead ? 'dead' : ''}`}/>;
      }
    }
    return grid_temp;

  };
  const matrix = React.useMemo(() => createGrid(), [rows, columns]);

  return (
      <div className={'grid'}>{matrix ?? ''}</div>
  );
}

export default Matrix;