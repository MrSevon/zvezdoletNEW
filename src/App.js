import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import spaceship from './img/spaceship.png';
import meteor from './img/meteor.png';

function App() {
const spaceshipRef = useRef(null);
const gameContainerRef = useRef(null);

const [spaceshipX, setSpaceshipX] = useState(180);
const [meteors, setMeteors] = useState([]);
const [score, setScore] = useState(0);
const [gameOver, setGameOver] = useState(false);
const [gameStarted, setGameStarted] = useState(false);

const spaceshipSpeed = 5;
const meteorSpeed = 3;
const meteorSpawnInterval = 1500;

const [leftKeyPressed, setLeftKeyPressed] = useState(false);
const [rightKeyPressed, setRightKeyPressed] = useState(false);


useEffect(() => {
  const handleKeyDown = (event) => {
    if (!gameOver && gameStarted) {
      if (event.key === 'ArrowLeft') {
        setLeftKeyPressed(true);
      } else if (event.key === 'ArrowRight') {
        setRightKeyPressed(true);
      }
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === 'ArrowLeft') {
      setLeftKeyPressed(false);
    } else if (event.key === 'ArrowRight') {
      setRightKeyPressed(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, [gameOver, gameStarted]);

useEffect(() => {
  let animationFrameId;

  const moveSpaceship = () => {
    if (leftKeyPressed && spaceshipX > 0) {
      setSpaceshipX((prevX) => prevX - spaceshipSpeed);
    }
    if (rightKeyPressed && spaceshipX < gameContainerRef.current.clientWidth - spaceshipRef.current.clientWidth) {
      setSpaceshipX((prevX) => prevX + spaceshipSpeed);
    }
    animationFrameId = requestAnimationFrame(moveSpaceship);
  };
  if (gameStarted && !gameOver) {
    animationFrameId = requestAnimationFrame(moveSpaceship);
  }
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}, [leftKeyPressed, rightKeyPressed, spaceshipX, gameStarted, gameOver]); 


useEffect(() => {
  let animationFrameId;

  const gameLoop = () => {
    if (gameStarted && !gameOver) {
      moveMeteors();
      checkCollisions();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

  if (gameStarted && !gameOver) {
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}, [gameStarted, gameOver, meteorSpeed]);


const moveMeteors = () => {
  setMeteors((prevMeteors) => {
    return prevMeteors.map((meteor) => ({
      ...meteor,
      y: meteor.y + meteorSpeed
    })).filter((meteor) => meteor.y < gameContainerRef.current.clientHeight);
  });
};


const [meteorsCount, setMeteorsCount] = useState(1); 
useEffect(() => {
  if (score > 0 && score % 10 === 0) { 
    setMeteorsCount(prevCount => prevCount + 1); 
  }
}, [score]);


useEffect(() => {
  let meteorGenerationLoop;

  if (gameStarted && !gameOver) {
    meteorGenerationLoop = setInterval(() => {
      for (let i = 0; i < meteorsCount; i++) {  
        const meteorX = getRandomInt(0, gameContainerRef.current.clientWidth - 50);
        setMeteors((prevMeteors) => [
          ...prevMeteors,
          {
            x: meteorX,
            y: -50,
          },
        ]);
      }
    }, meteorSpawnInterval); 
  }

  return () => {
    clearInterval(meteorGenerationLoop);
  };
}, [gameStarted, gameOver, meteorsCount]); 


const checkCollisions = () => {
  if (!spaceshipRef.current) return;

  const spaceshipRect = spaceshipRef.current.getBoundingClientRect();
  const meteorElements = document.getElementsByClassName('meteor'); 

  for (let i = 0; i < meteorElements.length; i++) {
    const meteorRect = meteorElements[i].getBoundingClientRect();

    if (checkCollision(spaceshipRect, meteorRect)) {
      finishGame();
      return; 
    }
  }
};

const checkCollision = (rect1, rect2) => {
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
};

const finishGame = () => {
  setGameOver(true);
  setLeftKeyPressed(false); 
  setRightKeyPressed(false); 
};


useEffect(() => {
  let speedIncreaseInterval;

  if (gameStarted && !gameOver) {
    speedIncreaseInterval = setInterval(() => {
      setMeteors((prevMeteors) =>
        prevMeteors.map((meteor) => ({
          ...meteor,
          y: meteor.y + 0.1,
        }))
      );
    }, 3000); 
  }

  return () => {
    clearInterval(speedIncreaseInterval);
  };
}, [gameStarted, gameOver]);


useEffect(() => {
  let scoreInterval;

  if (gameStarted && !gameOver) {
    scoreInterval = setInterval(() => {
      setScore((prevScore) => prevScore + 1);
    }, 1000);
  }

  return () => clearInterval(scoreInterval);
}, [gameStarted, gameOver]);

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const startGame = () => {
  setGameStarted(true);
  setGameOver(false);
  setScore(0);
  setMeteors([]);
  setSpaceshipX(180);
};

return (
  <div className="game-container" ref={gameContainerRef}>
    <div className="spaceship" ref={spaceshipRef} style={{ left: spaceshipX }} />
    {meteors.map((meteor, index) => (
      <div key={index} className="meteor" style={{ left: meteor.x, top: meteor.y }} />
    ))}
    <div className="score" style={{ color: 'red' }}>Score: {score}</div>
    {gameOver && <div className="game-over">Game Over</div>}
    {!gameStarted && <button className="start-button" onClick={startGame}>Start</button>}
  </div>
);
}

export default App;