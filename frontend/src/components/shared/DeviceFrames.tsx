'use client';

import React from 'react';
import styled from 'styled-components';

interface DeviceFrameProps {
  children: React.ReactNode;
  disableScale?: boolean;
}

/**
 * ScaleWrapper adapts desktop/responsive layouts into miniature dimensions inside the devices
 */
const ScaleWrapper = ({ children, scale }: { children: React.ReactNode; scale: number }) => {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-[#F6F6F6]">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${100 / scale}%`,
          minHeight: `${100 / scale}%`,
          display: 'block',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const PhoneFrame = ({ children, disableScale = false }: DeviceFrameProps) => {
  return (
    <StyledPhoneWrapper>
      <div className="card">
        <div className="btn1" />
        <div className="btn2" />
        <div className="btn3" />
        <div className="btn4" />
        <div className="card-int">
          {disableScale ? (
            <div className="w-full h-full bg-[#F6F6F6] rounded-[23px] overflow-hidden relative">
              {children}
            </div>
          ) : (
            <ScaleWrapper scale={0.38}>
              {children}
            </ScaleWrapper>
          )}
        </div>
        <div className="top">
          <div className="camera">
            <div className="int" />
          </div>
          <div className="speaker" />
        </div>
      </div>
    </StyledPhoneWrapper>
  );
};

export const LaptopFrame = ({ children, disableScale = false }: DeviceFrameProps) => {
  return (
    <StyledLaptopWrapper>
      <div className="laptop">
        <div className="screen">
          <div className="header" />
          <div className="screen-content">
            {disableScale ? (
              <div className="w-full h-full bg-[#F6F6F6] rounded-lg overflow-hidden relative">
                {children}
              </div>
            ) : (
              <ScaleWrapper scale={0.62}>
                {children}
              </ScaleWrapper>
            )}
          </div>
        </div>
        <div className="keyboard" />
      </div>
    </StyledLaptopWrapper>
  );
};

const StyledPhoneWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;

  .card {
    width: 270px;
    height: 520px;
    background: black;
    border-radius: 35px;
    border: 2px solid rgb(40, 40, 40);
    padding: 7px;
    position: relative;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.25);
  }

  .card-int {
    background: #F6F6F6;
    height: 100%;
    border-radius: 25px;
    transition: all 0.6s ease-out;
    overflow: hidden;
  }

  .top {
    position: absolute;
    top: 0px;
    right: 50%;
    transform: translate(50%, 0%);
    width: 35%;
    height: 18px;
    background-color: black;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    z-index: 10;
  }

  .speaker {
    position: absolute;
    top: 2px;
    right: 50%;
    transform: translate(50%, 0%);
    width: 40%;
    height: 2px;
    border-radius: 2px;
    background-color: rgb(20, 20, 20);
  }

  .camera {
    position: absolute;
    top: 6px;
    right: 84%;
    transform: translate(50%, 0%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.048);
  }

  .int {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
    background-color: rgba(0, 0, 255, 0.212);
  }

  .btn1, .btn2, .btn3, .btn4 {
    position: absolute;
    width: 2px;
  }

  .btn1, .btn2, .btn3 {
    height: 45px;
    top: 30%;
    right: -4px;
    background-image: linear-gradient(to right, #111111, #222222, #333333, #464646, #595959);
  }

  .btn2, .btn3 {
    transform: scale(-1);
    left: -4px;
  }

  .btn2, .btn3 {
    transform: scale(-1);
    height: 30px;
  }

  .btn2 {
    top: 26%
  }

  .btn3 {
    top: 36%
  }
`;

const StyledLaptopWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;

  .laptop {
    transform: scale(0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .screen {
    border-radius: 20px;
    box-shadow: inset 0 0 0 2px #c8cacb, inset 0 0 0 10px #000;
    height: 320px;
    width: 520px;
    margin: 0 auto;
    padding: 9px 9px 23px 9px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    background-image: linear-gradient(
      15deg,
      #3f51b1 0%,
      #5a55ae 13%,
      #7b5fac 25%,
      #8f6aae 38%,
      #a86aa4 50%,
      #cc6b8e 62%,
      #f18271 75%,
      #f3a469 87%,
      #f7c978 100%
    );
    transform-style: preserve-3d;
    transform: perspective(1000px) rotateX(0deg);
    overflow: hidden;
  }

  .screen-content {
    flex: 1;
    background: #F6F6F6;
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: relative;
  }

  .screen::before {
    content: "";
    width: 520px;
    height: 12px;
    position: absolute;
    background: linear-gradient(#979899, transparent);
    top: -3px;
    transform: rotateX(90deg);
    border-radius: 5px 5px;
    left: 0;
  }

  .header {
    width: 100px;
    height: 12px;
    position: absolute;
    background-color: #000;
    top: 10px;
    left: 50%;
    transform: translate(-50%, -0%);
    border-radius: 0 0 6px 6px;
    z-index: 10;
  }

  .screen::after {
    background: linear-gradient(to bottom, #272727, #0d0d0d);
    border-radius: 0 0 20px 20px;
    bottom: 2px;
    content: "";
    height: 24px;
    left: 2px;
    position: absolute;
    width: 516px;
    pointer-events: none;
  }

  .keyboard {
    background: radial-gradient(circle at center, #e2e3e4 85%, #a9abac 100%);
    border: solid #a0a3a7;
    border-radius: 2px 2px 12px 12px;
    border-width: 1px 2px 0 2px;
    box-shadow: inset 0 -2px 8px 0 #6c7074;
    height: 24px;
    margin-top: -10px;
    position: relative;
    width: 620px;
    z-index: 9;
  }

  .keyboard::after {
    background: #e2e3e4;
    border-radius: 0 0 10px 10px;
    box-shadow: inset 0 0 4px 2px #babdbf;
    content: "";
    height: 10px;
    left: 50%;
    margin-left: -60px;
    position: absolute;
    top: 0;
    width: 120px;
  }

  .keyboard::before {
    background: 0 0;
    border-radius: 0 0 3px 3px;
    bottom: -2px;
    box-shadow: -270px 0 #272727, 250px 0 #272727;
    content: "";
    height: 2px;
    left: 50%;
    margin-left: -10px;
    position: absolute;
    width: 40px;
  }
`;
