import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import TilesBoard from '../components/TilesBoard';
import HandTiles from '../components/HandTiles';
import { generateBasicLevel, generateTestLevel } from '../utils/levelGenerator';
import { Preferences } from '@capacitor/preferences';
import './Game.css';

type GameProps = { loadSave: boolean };

const Game: React.FC<GameProps> = ({ loadSave = false }) => {
  const tempAbilityButtons = [0, 1, 2];

  const router = useIonRouter();
  const [level, setlevel] = useState<number>(0);
  const [tilesInBoard, setTilesOnBoard] = useState<string[][][]>([]);
  const [tilesInHand, setTilesInHand] = useState<string[]>([]);
  const [removeTileId, setRemoveTileId] = useState<string>('');
  const [justAddedtile, setJustAddedTile] = useState<boolean>(false);
  const [allowPointer, setAllowPointer] = useState<boolean>(true);

  useEffect(() => {
    handleLoad();
  }, []);

  async function handleLoad() {
    if (loadSave) {
      // load save data
      const levelValue = (await Preferences.get({ key: 'level' }))?.value;
      if (levelValue) setlevel(await JSON.parse(levelValue));
      // setTilesOnBoard()
      const tilesInBoardValue = (await Preferences.get({ key: 'tilesInBoard' }))
        ?.value;
      if (tilesInBoardValue)
        setTilesOnBoard(await JSON.parse(tilesInBoardValue));
      // setTilesInHand()
      const tilesInHandValue = (await Preferences.get({ key: 'tilesInHand' }))
        ?.value;
      if (tilesInHandValue) setTilesInHand(await JSON.parse(tilesInHandValue));
      /* TODO load abilities used */
    } else {
      // new game
      setlevel(0);
      setTilesInHand([]);
      setTilesOnBoard(generateTestLevel(0));
      /* TODO set abilities used */
    }
  }

  function navigateToHome() {
    handleSave();
    router.goBack();
  }

  function handleSave() {
    console.log('save', tilesInBoard);
    Preferences.set({
      key: 'saveExists',
      value: JSON.stringify(true),
    });
    Preferences.set({
      key: 'level',
      value: JSON.stringify(level),
    });
    Preferences.set({
      key: 'tilesInBoard',
      value: JSON.stringify(tilesInBoard),
    });
    Preferences.set({
      key: 'tilesInHand',
      value: JSON.stringify(tilesInHand),
    });
    /* TODO save abilities used */
  }

  useEffect(() => {
    setTimeout(() => {
      checkThreeOfTheSame();
    }, 500);
  }, [tilesInHand]);

  function checkThreeOfTheSame() {
    tilesInHand.forEach((tileId) => {
      if (tilesInHand.filter((t) => t === tileId).length === 3) {
        removeTilesFromHand(tileId);
      }
    });
  }

  function addTileToHand(tile: string) {
    if (tilesInHand.length < 7) {
      setTilesInHand((prev) => [...prev, tile]);
      setJustAddedTile(true);
      setAllowPointer(false);
      setTimeout(() => {
        setJustAddedTile(false);
      }, 50);
      setTimeout(() => {
        setAllowPointer(true);
      }, 500);
    } else throw new Error("Can't add more than 7 tiles to a row");
  }

  function removeTilesFromHand(tileId: string) {
    // fade tiles out
    setRemoveTileId(tileId);
    setAllowPointer(false);
    // then remove
    setTimeout(() => {
      setTilesInHand((prev) => prev.filter((t) => t !== tileId));
      setRemoveTileId('');
      setAllowPointer(true);
    }, 500);
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="translucent">
          <IonButtons className="ion-padding" slot="end">
            <IonButton onClick={() => navigateToHome()}>Back</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div
          className={`game-content${!allowPointer ? ' pointer-disabled' : ''}`}
        >
          <div>Level {level}</div>
          <TilesBoard
            tiles={tilesInBoard}
            setTiles={setTilesOnBoard}
            addTileToHand={addTileToHand}
          />
          <HandTiles
            removeTileId={removeTileId}
            tilesInHand={tilesInHand}
            justAddedtile={justAddedtile}
          />
          <div className="abilities">
            {tempAbilityButtons.map((tile) => (
              <div className="ability-button" key={tile}>
                {tile}
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Game;
