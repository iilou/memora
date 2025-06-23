'use client';

import Image from "next/image";
import { use, useEffect, useState } from "react";
import MagicMirror from "./MagicMirror";
import MemoPath from "./MemoPath";

export default function Home() {

  // const level = 60;

  const [config, setConfig] = useState(
    {
      "game": "Magic Mirror",
      "difficulty": "medium",
    }
  );

  const configOptions =
    {
      "game": ["Magic Mirror", "MemoPath"],
      "difficulty": ["easy", "medium", "hard", "insane"],
    }

  const indexOptions = {
    0: "Magic Mirror|easy",
    1: "Magic Mirror|medium",
    2: "Magic Mirror|hard",
    3: "Magic Mirror|insane",
    4: "MemoPath|easy",
    5: "MemoPath|medium",
    6: "MemoPath|hard",
    7: "MemoPath|insane",
  }

  const xpGain = {
    "Magic Mirror": {
      "easy": 3,
      "medium": 20,
      "hard": 400,
      "insane": 2400,
    },
    "MemoPath": {
      "easy": 5,
      "medium": 20,
      "hard": 400,
      "insane": 2400,
    },
  }

  const levelReq = {
    "Magic Mirror": {
      "easy": 0,
      "medium": 0,
      "hard": 30,
      "insane": 70,
    },
    "MemoPath": {
      "easy": 0,
      "medium": 0,
      "hard": 30,
      "insane": 70,
    },
  }

  const [executionLock, setExecutionLock] = useState(false);

  const alterOptions = (option, value) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [option]: value,
    }));
  }


  // const [xp, setXp] = useState(localStorage.getItem("xpxpxpxpxpasdfdf") ? JSON.parse(localStorage.getItem("xpxpxpxpxpasdfdf")).xp : 0);
  const [xp, setXp] = useState(0);
  const [curXp, setCurXp] = useState(0);
  const [level, setLevel] = useState(1);

  const xpTable = [3,6,10,15,21,27,34,43,52,62,74,87,101,117,135,154,176,201,228,258,291,328,370,416,467,523,587,657,735,823,920,1029,1150,1286,1437,1606,1795,2006,2242,2505,2801,3131,3501,3915,4379,4898,5480,6132,6862,7681,8599,9627,10781,12074,13525,15151,16976,19022,21317,23892,26781,30022,33658,37737,42315,47451,53215,59683,66941,75085,84226,94484,105996,118916,133416,149690,167955,188454,211462,237285,266268,298799,335310,376291,422289,473916,531864,596906,669910,751853,843828,947063,1062939,1193002,1338990,1502854,1686783,1893232,2124962,2385067];
  

  const xpToLevel = (xp) => {
    if (xp < 0) return 0;
    let culm = 0;
    for (let i = 0; i < xpTable.length; i++) {
      culm += xpTable[i];
      if (xp < culm) {
        return [i+1, culm - xpTable[i], xp - (culm - xpTable[i])]; // Return level, xp needed for next level, and current xp in this level
      }
    }
    return xpTable.length; // If xp is greater than the last level's xp, return the max level
  };

  useEffect(() => {
    const [newLevel, xpNeeded, curXpInLevel] = xpToLevel(xp);
    setLevel(newLevel);
    setCurXp(curXpInLevel);
    localStorage.setItem("xpxpxpxpxpasdfdf", JSON.stringify({xp: xp}));
  }, [xp]);

  // useEffect(() => {

  //   const xpTable = [];
  //   let xp = 0;
  //   for (let level = 1; level <= 100; level++) {
  //       let expToLevel = Math.floor(level + 10 * Math.pow(2, level / 6));
  //       xp += expToLevel;
  //       xpTable.push(Math.floor(xp / 4));
  //   }

  //   console.log(xpTable);
  // }, []);

  const fillQuests = (currentQuests) => {
    const num_list = Array.from({ length: 8 }, (_, i) => i);
    for (let quest in currentQuests) {
      // if its been 24 hours
      if (currentQuests[quest].given && (Date.now() - currentQuests[quest].given) > 24 * 60 * 60 * 1000) {
        delete currentQuests[quest];
      } else {
        num_list.splice(num_list.indexOf(currentQuests[quest].id), 1);
      }
    }
    for (let i = 0; i < 100; i++) {
      // shuffle the num_list
      const i1 = Math.floor(Math.random() * num_list.length);
      const i2 = Math.floor(Math.random() * num_list.length);
      const temp = num_list[i1];
      num_list[i1] = num_list[i2];
      num_list[i2] = temp;
    }

    for(let i = 0; i < 6-Object.keys(currentQuests).length; i++) {
      if (num_list.length === 0) break;
      const id = num_list.pop();
      const [game, difficulty] = indexOptions[id].split("|");
      currentQuests[`quest-${id}`] = {
        id: id,
        game: game,
        difficulty: difficulty,
        given: Date.now(),
      };
    }
    return currentQuests;
  }

  // const [quests, setQuests] = useState(fillQuests(localStorage.getItem("questsafwefwefwefwef") ? JSON.parse(localStorage.getItem("questsafwefwefwefwef")) : {}));
  const [quests, setQuests] = useState({});
  useEffect(() => {
    if (Object.keys(quests).length >= 5) return; 
    const newQuests = fillQuests(quests);
    setQuests({...newQuests});
    localStorage.setItem("questsafwefwefwefwef", JSON.stringify(newQuests));
  }, [quests]);

  const popupRef = useState(null);
  const [popupText, setPopupText] = useState("QUEST COMPLETED");


  useEffect(() => {
    setQuests((prev) => fillQuests(localStorage.getItem("questsafwefwefwefwef") ? JSON.parse(localStorage.getItem("questsafwefwefwefwef")) : {}));
    setXp((prev) => localStorage.getItem("xpxpxpxpxpasdfdf") ? JSON.parse(localStorage.getItem("xpxpxpxpxpasdfdf")).xp : 0);
  }, []);


  return (
    <div className="font-[family-name:var(--font-geist-sans)] bg-[#F5FFF7]  h-fit  flex flex-col">
      <div className='fixed top-0 left-0 right-0 h-[52px] z-[200] bg-[#027E1C] flex justify-center'>
        <div className='text-[24px] font-black text-[#f7f7f7] px-[14px] h-full flex justify-center items-center'>
          <div>
            MEMORA
          </div>
        </div>
        <div className='h-[2px] w-[calc(80%_-_110px_-_370px)]'>
        </div>
        <div className='flex w-fit justify-center items-center h-full'>
          <div className='text-[20px] font-black text-[#f7f7f7] w-[110px] h-full flex justify-center items-center'>
            <div>
              LEVEL {level}
            </div>
          </div>
          <div className='text-[20px] font-black text-[#f7f7f7] w-[370px] h-full flex justify-center items-center'>
            <div className='flex items-center gap-[10px]'>
              <span className='font-bold'>{curXp.toLocaleString()} / {xpTable[level-1].toLocaleString()}</span> <span className='font-bold text-[16px] text-[#d7d7d7]'>({(curXp/xpTable[level-1] * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
      <div className='w-[2px] h-[54px]'>
      </div>
      <div className='w-full h-[2px] relative flex justify-center items-center z-[100]'>
        <div className='w-[210px] h-[40px]  text-[#f7f7f7] text-[20px] font-bold translate-y-[240px] translate-x-[-605px] group'>
          <div className='w-full h-full flex flex-col justify-center items-center bg-[#1C1C1C] rounded-[4px]'
            style={{
              backgroundColor: Object.keys(quests).some((questKey) => quests[questKey].game === config.game && quests[questKey].difficulty === config.difficulty) ? '#005D14' : '#1C1C1C',
            }}
          >
            Quests
          </div>
          <div className='absolute bottom-[-604px] left-0 w-[300px] h-[604px] bg-[#ffffff] flex-col items-center justify-start hidden group-hover:flex rounded-[4px] shadow-[0_0_0_1px_#121212] pt-[10px]'>
            {Object.keys(quests).map((questKey) => {
              const quest = quests[questKey];
              return (
                <div key={questKey} className='w-[280px] h-[108px] bg-[#f0f0f0] rounded-[4px] shadow-[0_0_0_1px_#121212] flex flex-col items-start justify-center mb-[10px] cursor-pointer text-[#b6f3wfewfc3] '
                  style={{
                    backgroundColor: quest.game === config.game && quest.difficulty === config.difficulty ? '#b6f3c3' : '#f0f0f0',
                  }}
                  onClick={() => {
                    if (executionLock) return;
                    alterOptions("game", quest.game);
                    alterOptions("difficulty", quest.difficulty);
                  }}
                >
                  <div className='w-full h-[24px] text-[16px] font-bold text-[#121212] flex justify-center items-center'>
                    {quest.game} - {quest.difficulty.toUpperCase()}
                  </div>
                  <div className='w-full text-[12px] font-medium text-[#454545] text-center flex flex-col justify-center items-start h-[50px]'>
                    
                    <div className='w-full'>

                    (+{xpGain[quest.game][quest.difficulty] * 1.5} XP)
                    </div>
                    <div className='mt-[14px] w-full'>
                    Complete one {quest.difficulty} difficulty on {quest.game}.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <div className='w-[700px] mx-auto h-fit py-[13px] text-[32px] font-black text-[#121212] text-center mt-[80px] shadow-[0_0_0_1px_#121212] rounded-[4px]'>
        {config.game.toUpperCase()} - {config.difficulty.toUpperCase()}
      </div>
      <div className="w-full h-fit flex flex-col items-center justify-center mt-[20px] gap-[6px]">
        <div className='w-full flex justify-center items-center gap-[20px]'>
          {configOptions.game.map((game) => (
            <div key={game} className='flex justify-center items-center w-[160px] h-[32px] bg-[#54835e] rounded-[4px] text-[#f7f7f7] text-[14px] font-bold cursor-default
              hover:shadow-[3px_3px_0_0px_#97b69e6b] transition-all duration-100
              active:shadow-[1px_1px_0_0px_#97b69e6b]
            '
              style={{
                userSelect: executionLock ? 'none' : 'auto',
                pointerEvents: executionLock ? 'none' : 'auto',
                backgroundColor: config.game === game ? '#54835e' : '#97b69edd',
              }}
              onClick={() => {
                if (!executionLock) {
                  alterOptions("game", game);
                }
              }}
            >
              <div>
                {game}
              </div>
            </div>
          ))}
        </div>
        <div className='w-full flex justify-center items-center gap-[6px]'>
          {configOptions["difficulty"].map((difficulty, index) => (
            <div key={index} className='flex justify-center items-center w-[110px] h-[24px] bg-[#97b69edd] rounded-[4px] text-[#f7f7f7] text-[14px] font-bold cursor-default
              hover:shadow-[3px_3px_0_0px_#97b69e6b] transition-all duration-100
              active:shadow-[1px_1px_0_0px_#97b69e6b]
            '
              style={{
                userSelect: executionLock ? 'none' : 'auto',
                pointerEvents: executionLock ? 'none' : 'auto',
                backgroundColor: config.difficulty === difficulty ? '#54835edd' : '#97b69ebb',
              }}
              onClick={() => {
                if (!executionLock) {
                  alterOptions("difficulty", difficulty);
                }
              }}
            >
              <div>
                {difficulty.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='w-full flex justify-center items-center mt-[50px] mb-[150px]'>
        {/* <MemoPath
          difficulty={config.difficulty}
          startSignal={() => {
            setExecutionLock((prev) => true);
          }}
          setEndSignal={(success) => {
            if (success) {
              setXp((prev) => prev + xpGain[config.game][config.difficulty]);
            }
            setExecutionLock((prev) => false);
          }}
          setLevel={() => {}}
          setXp={() => {}}
          xpGain={xpGain}
        /> */}
        {config.game === "Magic Mirror" ? (
          <MagicMirror
            difficulty={config.difficulty}
            startSignal={() => {
              setExecutionLock(true);
            }}
            setEndSignal={(success) => {
              if (success) {

                const questID = Object.keys(quests).find(key => quests[key].game === config.game && quests[key].difficulty === config.difficulty);
                const isQuest = questID !== undefined;
                setXp((prev) => prev + xpGain[config.game][config.difficulty] * (isQuest ? 1.5 : 1));
                if (isQuest) {
                  if (popupRef.current) {
                    popupRef.current.style.display = 'flex';
                  }
                  // popupText.current = "QUEST COMPLETED " + xpGain[config.game][config.difficulty] * 1.5 + " XP GAINED";
                  setPopupText("QUEST COMPLETED " + xpGain[config.game][config.difficulty] * 1.5 + " XP GAINED");
                  setTimeout(() => {
                    if (popupRef.current) {
                      popupRef.current.style.display = 'none';
                    }
                  }, 2000);

                  const newQuests = { ...quests };
                  delete newQuests[questID];
                  setQuests({ ...newQuests });
                }
              }
              setExecutionLock(false);
            }}
          />
        ) : (
          <MemoPath
            difficulty={config.difficulty}
            startSignal={() => {
              setExecutionLock(true);
            }}
            setEndSignal={(success) => {
              if (success) {

                const questID = Object.keys(quests).find(key => quests[key].game === config.game && quests[key].difficulty === config.difficulty);
                const isQuest = questID !== undefined;
                setXp((prev) => prev + xpGain[config.game][config.difficulty] * (isQuest ? 1.5 : 1));
                if (isQuest) {
                  if (popupRef.current) {
                    popupRef.current.style.display = 'flex';
                  }
                  // popupText.current = "QUEST COMPLETED " + xpGain[config.game][config.difficulty] * 1.5 + " XP GAINED";
                  setPopupText("QUEST COMPLETED " + xpGain[config.game][config.difficulty] * 1.5 + " XP GAINED");
                  setTimeout(() => {
                    if (popupRef.current) {
                      popupRef.current.style.display = 'none';
                    }
                  }, 2000);

                  const newQuests = { ...quests };
                  delete newQuests[questID];
                  setQuests({ ...newQuests });
                }
              }
              setExecutionLock(false);
            }}
          />
        )}
      </div>
      <div className='w-[400px] h-[70px] bg-[#70e96c] rounded-[4px] fixed bottom-[20px] right-[20px] hidden justify-center items-center cursor-pointer text-[#f7f7f7] text-[20px] font-black shadow-[3px_3px_0_0px_#12121244]'
        onClick={(e) => {
          //remove this element
          e.target.style.display = 'none';
        }}
        ref={popupRef}
      >
        {popupText}
      </div>
    </div>
  );
}
