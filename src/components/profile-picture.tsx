"use client";
import { clsx } from "clsx";
import Image from "next/image";
import React from "react";

import profilePictureDani from "../images/dani.png";
import profilePictureLove from "../images/love.png";

export const ProfilePicture = () => {
  const [clickCount, setClickCount] = React.useState(0);
  const [showLove, setShowLove] = React.useState(false);

  const defaultClassName = [
    "not-prose",
    "motion-safe:animation-fade-in",
    "float-left",
    "mb-0",
    "h-auto",
    "w-auto",
    "aspect-[1/1]",
    "object-cover",
    "object-center",
    "shadow-lg",
    "[clip-path:circle(70%_at_20%_30%)]",
    "[shape-outside:circle(70%_at_20%_30%)]",
    "sm:mr-4",
    "md:mr-6",
    "md:[clip-path:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]",
    "md:[shape-outside:polygon(0%_0%,100%_0%,75%_100%,0%_100%)]",
    "lg:aspect-[1/2]",
    "transition-opacity",
    "duration-500",
  ];
  const classNameLove = clsx(defaultClassName, ["print:hidden"], {
    "opacity-0": showLove,
    "opacity-100": !showLove,
    flex: showLove,
    hidden: !showLove,
  });
  const classNameDani = clsx(defaultClassName, {
    "opacity-0": !showLove,
    "opacity-100": showLove,
    flex: !showLove,
    hidden: showLove,
  });

  React.useEffect(() => {
    if (clickCount === 8) {
      setShowLove(!showLove);
      setClickCount(0);
    }

    const timer = window.setTimeout(() => {
      if (clickCount > 0 && clickCount < 8) {
        setClickCount(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [clickCount, showLove]);

  const handleClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  return (
    <>
      <Image
        className={classNameDani}
        src={profilePictureDani}
        alt="Profile picture of Daniël Terwiel"
        width={256}
        height={256}
        onClick={handleClick}
      />
      <Image
        className={classNameLove}
        src={profilePictureLove}
        alt="Profile picture of Daniël Terwiel and girlfriend"
        width={256}
        height={256}
        onClick={handleClick}
      />
    </>
  );
};
