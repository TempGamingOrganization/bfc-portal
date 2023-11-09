import React, { useContext, useState } from "react";

import firePit from "assets/buildings/fire_pit.png";
import npc from "assets/npcs/cook.gif";
import doing from "assets/npcs/cook_doing.gif";
import shadow from "assets/npcs/shadow.png";

import classNames from "classnames";
import { FirePitModal } from "./FirePitModal";
import { CookableName } from "features/game/types/consumables";
import { ITEM_DETAILS } from "features/game/types/images";
import { CraftingMachineChildProps } from "../WithCraftingMachine";
import { BuildingProps } from "../Building";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { BuildingImageWrapper } from "../BuildingImageWrapper";
import { setImageWidth } from "lib/images";
import { Context } from "features/game/GameProvider";
import { useActor } from "@xstate/react";
import { bakeryAudio } from "lib/utils/sfx";

type Props = BuildingProps & Partial<CraftingMachineChildProps>;

export const FirePit: React.FC<Props> = ({
  buildingId,
  crafting,
  idle,
  ready,
  name,
  craftingService,
  isBuilt,
  onRemove,
}) => {
  const [showModal, setShowModal] = useState(false);

  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const handleCook = (item: CookableName) => {
    craftingService?.send({
      type: "CRAFT",
      event: "recipe.cooked",
      item,
      buildingId,
    });
  };

  const handleCollect = () => {
    if (!name) return;

    craftingService?.send({
      type: "COLLECT",
      item: name,
      event: "recipe.collected",
    });
  };

  const handleClick = () => {
    if (onRemove) {
      onRemove();
      return;
    }

    if (isBuilt) {
      // Add future on click actions here
      if (idle || crafting) {
        bakeryAudio.play();
        setShowModal(true);
        return;
      }

      if (ready) {
        handleCollect();
        return;
      }
    }
  };

  return (
    <>
      <BuildingImageWrapper name="Fire Pit" onClick={handleClick} ready={ready}>
        <img
          src={firePit}
          className={classNames("absolute bottom-0 pointer-events-none", {
            "opacity-100": !crafting,
            "opacity-80": crafting,
          })}
          style={{
            width: `${PIXEL_SCALE * 47}px`,
            height: `${PIXEL_SCALE * 33}px`,
          }}
        />
        {(crafting || ready) && name && (
          <img
            src={ITEM_DETAILS[name].image}
            className={classNames("absolute z-30 pointer-events-none", {
              "img-highlight-heavy": ready,
            })}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (
                !img ||
                !img.complete ||
                !img.naturalWidth ||
                !img.naturalHeight
              ) {
                return;
              }

              const left = Math.floor(24 - img.naturalWidth / 2);
              img.style.left = `${PIXEL_SCALE * left}px`;
              setImageWidth(img);
            }}
            style={{
              opacity: 0,
              bottom: `${PIXEL_SCALE * 6}px`,
            }}
          />
        )}
        <img
          src={shadow}
          className="absolute pointer-events-none"
          style={{
            width: `${PIXEL_SCALE * 15}px`,
            top: `${PIXEL_SCALE * 14}px`,
            left: `${PIXEL_SCALE * 11}px`,
          }}
        />
        {crafting ? (
          <img
            src={doing}
            className="absolute pointer-events-none"
            style={{
              width: `${PIXEL_SCALE * 16}px`,
              top: `${PIXEL_SCALE * 2}px`,
              left: `${PIXEL_SCALE * 13}px`,
            }}
          />
        ) : (
          <img
            src={npc}
            className="absolute pointer-events-none"
            style={{
              width: `${PIXEL_SCALE * 14}px`,
              top: `${PIXEL_SCALE * 2}px`,
              left: `${PIXEL_SCALE * 11}px`,
            }}
          />
        )}
      </BuildingImageWrapper>

      <FirePitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCook={handleCook}
        crafting={!!crafting}
        itemInProgress={name}
        craftingService={craftingService}
      />
    </>
  );
};
