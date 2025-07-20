import React, { useState } from "react";

import { stepsGif } from "./static";

import { IAdBlocker } from "../types";

const Modal1: React.FC<{
  title: string;
  description: string;
  btn1Title: string;
  btn2Title: string;
  onChangeModal: () => void;
  onDisabledAdblocker: () => void;
}> = ({
  title,
  description,
  btn1Title,
  btn2Title,
  onChangeModal,
  onDisabledAdblocker,
}) => {
  return (
    <div className="modal">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="modal-buttons">
        <button className="secondary-btn" onClick={onChangeModal}>
          {btn1Title}
        </button>
        <button className="primary-btn" onClick={onDisabledAdblocker}>
          {btn2Title}
        </button>
      </div>
    </div>
  );
};

const Modal2: React.FC<{
  howToTitle: string;
  howToSteps: Array<{ title: string; description: string }>;
  onChangeModal: () => void;
}> = ({ howToTitle, howToSteps, onChangeModal }) => {
  return (
    <div className="modal modal2">
      <h2>{howToTitle}</h2>
      <img
        src={stepsGif}
        alt="steps gif"
        width="100%"
        height="auto"
        style={{ aspectRatio: "1/1", borderRadius: "20px" }}
        draggable={false}
      />
      <div className="modal-step">
        {howToSteps?.map((hts, i) => {
          return (
            <div className="step" key={i}>
              <div className="step-content">
                <div className="step-title">{hts.title}</div>
                <div className="step-desc">{hts.description}</div>
              </div>
            </div>
          );
        })}

        <div className="modal-buttons">
          <button className="primary-btn" onClick={onChangeModal}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdblockerModal: React.FC<
  IAdBlocker & { onDisabledAdblocker: () => void }
> = ({ config, onDisabledAdblocker }) => {
  const [isFirst, setIsFirst] = useState(true);

  return (
    <div className="rad-modal">
      {isFirst && (
        <Modal1
          title={config.title}
          description={config.description}
          btn1Title={config.btn1Title}
          btn2Title={config.btn2Title}
          onChangeModal={() => setIsFirst(false)}
          onDisabledAdblocker={() => onDisabledAdblocker()}
        />
      )}
      {!isFirst && (
        <Modal2
          howToTitle={config.howToTitle}
          howToSteps={config.howToSteps}
          onChangeModal={() => setIsFirst(true)}
        />
      )}
    </div>
  );
};
