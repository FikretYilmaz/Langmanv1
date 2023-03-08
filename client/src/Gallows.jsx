import React,{useEffect,useRef} from 'react'
import styled from 'styled-components'

const GallowsCanvas = styled.canvas`
    padding: 10px;
`

const Gallows = ({badGuesses}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.fillRect(0, 290, 200, 10); // base line
        ctx.fillRect(20, 0, 10, 300); // vertical line
        ctx.fillRect(20, 0, 100, 10); // top line
        ctx.fillRect(120, 0, 10, 40); // top hook
        if (badGuesses >= 1) {
          // head
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(125, 75, 30, 0, 2 * Math.PI);
          ctx.stroke();
        }
        if (badGuesses >= 2) {
          // torso
          ctx.fillRect(120, 110, 10, 80);
        }
        ctx.lineWidth = 6.7;
        if (badGuesses >= 3) {
          // arm 1
          ctx.beginPath();
          ctx.moveTo(120, 126);
          ctx.quadraticCurveTo(90, 160, 60, 125);
          ctx.stroke();
        }
        if (badGuesses >= 4) {
          // arm 2
          ctx.beginPath();
          ctx.moveTo(130, 126);
          ctx.quadraticCurveTo(160, 160, 190, 135);
          ctx.stroke();
        }
        if (badGuesses >= 5) {
          // leg 1
          ctx.beginPath();
          ctx.moveTo(120, 190);
          ctx.quadraticCurveTo(80, 220, 70, 270);
          ctx.stroke();
        }
        if (badGuesses >= 6) {
          // leg 2
          ctx.beginPath();
          ctx.moveTo(130, 190);
          ctx.quadraticCurveTo(130, 220, 183, 260);
          ctx.stroke();
        }
      }, [badGuesses]);
    
      return <GallowsCanvas ref={canvasRef} width={200} height={300} />;
    }

export default Gallows