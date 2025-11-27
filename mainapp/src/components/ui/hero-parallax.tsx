"use client";
import React from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row  mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  const words = [
    {
      text: "Shop",
      className: "text-black dark:text-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
    {
      text: "in",
      className: "text-black dark:text-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
    {
      text: "the",
      className: "text-black dark:text-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
    {
      text: "US.",
      className: "text-black dark:text-black text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
    {
      text: "Ship",
      className: "text-red-600 dark:text-red-600 text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
    {
      text: "to",
      className: "text-red-600 dark:text-red-600 text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
    {
      text: "Ghana.",
      className: "text-red-600 dark:text-red-600 text-4xl sm:text-6xl md:text-8xl lg:text-9xl",
    },
  ];
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0 z-50">
      <TypewriterEffect words={words} />
      <p className="max-w-2xl text-2xl md:text-3xl mt-8 text-gray-700 dark:text-neutral-200 font-medium bg-white/50 dark:bg-black/50 backdrop-blur-sm p-4 rounded-lg">
        Your trusted partner for fast, affordable, and secure shipping from the US to Ghana.
        Get your free US address today and start shopping from your favorite brands.
      </p>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-8 items-center md:items-start">
        <div className="w-full md:w-64">
          <GoogleAuthButton buttonText="Login with Google" />
        </div>
        <Link to="/services">
          <button className="w-40 h-12 rounded-xl bg-white text-black border border-black text-sm font-bold shadow-lg hover:bg-gray-50 transition-colors">
            Learn More
          </button>
        </Link>
      </div>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative shrink-0"
    >
      <a
        href={product.link}
        className="block group-hover/product:shadow-2xl "
      >
        <img
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};
