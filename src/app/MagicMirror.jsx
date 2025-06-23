'use client';

import {useEffect, useState, useMemo, useRef} from 'react';

export default function MemoPath({difficulty, startSignal, setEndSignal, setLevel, setXp, xpGain}){
    const difficultyConfigs={
        "easy": {
            "blocks": 5,
            "r": 5,
            "c": 5,
            "deltaTime": 0.3,
            "guessingTime": 0.8,
        },
        "medium": {
            "blocks": 8,
            "r": 7,
            "c": 8,
            "deltaTime": 0.4,
            "guessingTime": 0.9,
        },
        "hard": {
            "blocks": 10,
            "r": 9,
            "c": 10,
            "deltaTime": 0.4,
            "guessingTime": 1.1,
        },
        "insane": {
            "blocks": 11,
            "r": 11,
            "c": 12,
            "deltaTime": 0.4,
            "guessingTime": 1.1,
        },
    };

    const getFullConfig = (difficulty) => {
        console.log("Difficulty:", difficulty, "Config:", difficultyConfigs);
        const h = 450;
        const r = difficultyConfigs[difficulty].r;
        const c = difficultyConfigs[difficulty].c;
        const margin = 4;
        const tileSize = (h - r * (margin-1)) / r;

        return {
            ...difficultyConfigs[difficulty],
            tileSize: tileSize,
            margin: margin,
            deltaTime: difficultyConfigs[difficulty].deltaTime,
            fullTime: (difficultyConfigs[difficulty].blocks * difficultyConfigs[difficulty].deltaTime)*1000 + 1000,
            delay:300,
            guessingTime: (difficultyConfigs[difficulty].blocks * difficultyConfigs[difficulty].guessingTime)*1000 + 1000,  
        }
    }

    const [currentDifficultyConfig, setCurrentDifficultyConfig] = useState(getFullConfig(difficulty));
    const [boardState, setBoardState] = useState([]);
    const [expectedBoardState, setExpectedBoardState] = useState([]);
    useEffect(() => {
        setCurrentDifficultyConfig(getFullConfig(difficulty));
        setBoardState(Array.from({ length: difficultyConfigs[difficulty].r }, () => Array(difficultyConfigs[difficulty].c).fill(0)));
        setExpectedBoardState(Array.from({ length: difficultyConfigs[difficulty].r }, () => Array(difficultyConfigs[difficulty].c).fill(0)));
        setStage(0);
    }, [difficulty]);



    // =====================================================================================================================================
    // =====================================================================================================================================
    // =====================================================================================================================================

    const [victoryEffect, setVictoryEffect] = useState(false);
    useEffect(() => {
        if (victoryEffect){
            const audio = new Audio('/victory.mp3');
            audio.play();
            setTimeout(() => {
                setVictoryEffect(false);
            }, 3000);
        }
    }, [victoryEffect]);


    // =====================================================================================================================================
    // =====================================================================================================================================
    // =====================================================================================================================================

    const [progressBar, setProgressBar] = useState(0);
    const progressBarRef = useRef(null);

    useEffect(() => {
        if (progressBar >= 0 && progressBarRef.current) {
            const el = progressBarRef.current;

            el.style.transition = "none";
            el.style.width = `1000px`;

            void el.offsetWidth;

            el.style.transition = `width ${progressBar}ms linear`;
            el.style.width = `0px`;

            setTimeout(() => {
                setProgressBar(0);
            }, progressBar);
        }
    }, [progressBar]);



    // =====================================================================================================================================
    // =====================================================================================================================================
    // =====================================================================================================================================






    function delayms(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const [stage, setStage] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [boardEditable, setBoardEditable] = useState(false);

    async function startGame() {
        await new Promise(resolve => setTimeout(resolve, 300));

        const boardSize = [currentDifficultyConfig.r, currentDifficultyConfig.c];
        const blocks = currentDifficultyConfig.blocks;
        const deltaTime = currentDifficultyConfig.deltaTime;
        const guessingTime = currentDifficultyConfig.guessingTime;
        const fullTime = currentDifficultyConfig.fullTime;
        const bufferPeriod = 3000;
        const delay = currentDifficultyConfig.delay;

        for(let i = 0; i < bufferPeriod / 100; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setCountdown((prev) => prev - 0.1);
        }

        setStage(2);

        setProgressBar(fullTime + delay - 50);

        setTimeout(async () => {
            const newBoardState = Array.from({ length: boardSize[0] }, () => Array(boardSize[1]).fill(0));
            const numbers = Array.from({ length: boardSize[0] * boardSize[1] }, (_, i) => i);
            // const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);
            const shuffledNumbers = numbers;
            for (let i = 0; i < 100; i++) {
                const randomIndex1 = Math.floor(Math.random() * shuffledNumbers.length);
                const randomIndex2 = Math.floor(Math.random() * shuffledNumbers.length);
                [shuffledNumbers[randomIndex1], shuffledNumbers[randomIndex2]] = [shuffledNumbers[randomIndex2], shuffledNumbers[randomIndex1]];
            }
            console.log("Shuffled Numbers:", shuffledNumbers);

            const expectedBoardState = Array.from({ length: boardSize[0] }, () => Array(boardSize[1]).fill(2));

            for (let i = 0; i < blocks; i++) {
                const row = Math.floor(shuffledNumbers[i] / boardSize[1]);
                const col = shuffledNumbers[i] % boardSize[1];
                console.log(`Placing block ${i + 1} at (${row}, ${col})`);
                newBoardState[row][col] = 1;
                expectedBoardState[row][col] = 3;
            }
            const rand = Math.floor(Math.random() * 4) + 1; 
            const audio = new Audio(`/place${rand}.ogg`);
            audio.play();
            setBoardState((prev) => [...newBoardState.map(row => [...row])]);
            setExpectedBoardState(expectedBoardState);

            setTimeout(async () => {
                setBoardEditable(true);
                setBoardState((prev) => {
                    return prev.map(row => row.map(col => 2));
                });
                setStage(3);

                setProgressBar(delay + guessingTime - 50);

                setTimeout(async () => {
                    setStage(4);
                    setBoardEditable((prev) => false);
                }, delay + guessingTime);
            }, fullTime);

        }, delay);


    }

    useEffect(() => {
        if (stage === 0) {
            setCountdown(3);
            setBoardState(Array.from({ length: currentDifficultyConfig.r }, () => Array(currentDifficultyConfig.c).fill(0)));
            setExpectedBoardState(Array.from({ length: currentDifficultyConfig.r }, () => Array(currentDifficultyConfig.c).fill(0)));
            setBoardEditable(false);
            
            return;
        }

        else if (stage === 1) {
            startSignal();
            startGame();
            const audio = new Audio('/begin.ogg');
            audio.play();
        }

        else if (stage === 4) {
            setBoardEditable(false);

            const expectedTiles = expectedBoardState;
            const givenTiles = boardState;

            let isCorrect = true;
            for (let i = 0; i < expectedTiles.length; i++) {
                for (let j = 0; j < expectedTiles[i].length; j++) {
                    if (expectedTiles[i][j] !== givenTiles[i][j]) {
                        isCorrect = false;
                        break;
                    }
                }
            }

            // if (isCorrect) {
            //     alert("Congratulations! You completed the Magic Mirror game!");
            // } else {
            //     alert("Sorry, you made some mistakes. Please try again.");
            // }
            if (isCorrect) {
                setVictoryEffect(true);
            } else {
                const audio = new Audio('/defeat.mp3');
                audio.play();
            }

            setEndSignal(isCorrect);
            setStage(5);
        }

        else if (stage === 5) {

            const newBoardState = [...boardState];

            for (let i = 0; i < newBoardState.length; i++) {
                for (let j = 0; j < newBoardState[i].length; j++) {
                    if (newBoardState[i][j] === 3 && expectedBoardState[i][j] === 3) {
                        newBoardState[i][j] = 3; // Correctly guessed tile
                    } else if (newBoardState[i][j] === 3 && expectedBoardState[i][j] === 2) {
                        newBoardState[i][j] = 4; // Incorrectly guessed tile
                    } else if (newBoardState[i][j] === 2 && expectedBoardState[i][j] === 3) {
                        newBoardState[i][j] = 1; // Missed tile
                    } else {
                        newBoardState[i][j] = 0; // Unchanged tile
                    }
                }
            }

            setBoardState((prev) => newBoardState);
        }

    }, [stage]);

    const blockColors = useMemo(() => {
        return {
            0: '#f0f0f0', // Unchanged tile
            1: '#26CE4A', // Given tile
            2: '#f0f0f0', // Editable tile
            3: '#2493D9', // Guessed tile
            4: '#C22020', // Incorrectly guessed tile
        };
    }, [boardState]);

    return (
        <div className='w-[1200px] h-[600px] bg-[#ffffff] rounded-[8px] shadow-[0_0_5.2px_3px_#121212] relative'>
            <div className='absolute bottom-[-20px] left-0 w-full h-[40px] flex items-center justify-center z-[80]'>
                <div className='bg-[#005D14] rounded-[4px] w-[200px] h-[40px] flex items-center justify-center text-[#f7f7f7] text-[16px] font-bold cursor-pointer'
                    onClick={() => {
                        if (stage === 0) {
                            setStage(1);
                        }
                        else if (stage === 5) {
                            setStage(0);
                        }
                    }}
                >
                    <div>
                        {stage === 0 ? 'Start Game' : stage === 5 ? 'Play Again' : 'In Progress...'}
                    </div>
                </div>
            </div>
            <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col z-[70]'>
                {boardState.map((row, rowIndex) => (
                    <div key={rowIndex} className='flex' style={{
                        gap: `${currentDifficultyConfig.margin}px`,
                        marginBottom: `${currentDifficultyConfig.margin}px`,
                    }}>
                        {row.map((col, colIndex) => (
                            <div key={colIndex} style={{
                                width: `${currentDifficultyConfig.tileSize}px`,
                                height: `${currentDifficultyConfig.tileSize}px`,
                                backgroundColor: blockColors[col] || '#f0f0f0',
                            }}
                            className='rounded-[4px] flex items-center justify-center'
                            id={`tile-${rowIndex}-${colIndex}`}
                            onClick={() => {
                                if (boardEditable && stage === 3) {
                                    const newBoardState = [...boardState];
                                    newBoardState[rowIndex][colIndex] = newBoardState[rowIndex][colIndex] === 2 ? 3 : 2;
                                    setBoardState(newBoardState);

                                    const rand = Math.floor(Math.random() * 4) + 1; 
                                    const audio = new Audio(`/block${rand}.ogg`);
                                    audio.play();
                                }
                            }}
                            >
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            { stage === 1 && 
                <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center z-[75] bg-[#ffffff]'>
                    <div className='text-[24px] font-bold text-[#121212]'>
                        Starting in {countdown.toFixed(1)}
                    </div>
                </div>
            }
            {
                victoryEffect &&
                <div className='absolute top-0 left-0 w-full h-full flex items-start justify-center z-[40]'>
                    <img src='/confetti.gif' alt='Victory!' 
                        className='w-full h-full object-cover'
                    />
                </div>
            }
            <div className='absolute bottom-[25px] left-0 w-full  rounded[2px] z-[50] block'
                style={
                    progressBar == 0 ? {
                        display: 'none',
                    } : {
                        display: 'block',
                    }
                }>
                <div className='bg-[#f0f0f0] h-[5px] w-[1000px] mx-auto relative flex justify-start'>
                    <div className='bg-[#027E1C] w-[10px] h-full' ref={progressBarRef} ></div>
                </div>
            </div>
        </div>
    )
}