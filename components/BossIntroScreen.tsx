import React from 'react';

const BossIntroScreen: React.FC = () => {
  return (
    <div className="text-center flex flex-col justify-center items-center h-full">
      <h2 className="font-hangman text-red-500 text-7xl md:text-8xl text-shadow-custom mb-4 animate-pulse-red">
        Warning!
      </h2>
      <div className="overflow-hidden">
        <p className="text-3xl text-white animate-slide-in-bottom">
          A Boss is Approaching!
        </p>
      </div>
      <div className="overflow-hidden">
        <p className="text-xl text-indigo-300 mt-2 animate-slide-in-bottom" style={{ animationDelay: '0.6s' }}>
          Prepare for a timed challenge.
        </p>
      </div>
    </div>
  );
};

export default BossIntroScreen;
