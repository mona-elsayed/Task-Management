// src/components/Countdown.jsx
import React, { useState, useEffect } from "react";

const Countdown = ({ dueDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(dueDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Minutes: Math.floor((difference / 1000 / 60) % 60),
        Seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = null;
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  const timerComponents = [];

  if (!timeLeft) {
    return (
      <div className="border border-red-400 bg-red-100 text-red-500 rounded p-4 mt-4">
        Overdue
      </div>
    );
  }

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) return;

    timerComponents.push(
      <span key={interval} className="mr-2">
        {timeLeft[interval]} {interval}
      </span>
    );
  });

  return (
    <div className="border border-blue-400 bg-blue-100 text-blue-700 rounded p-4 mt-4">
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};

export default Countdown;
