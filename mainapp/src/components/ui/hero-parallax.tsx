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
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

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
      className: "text-gray-800",
    },
    {
      text: "in",
      className: "text-gray-800",
    },
    {
      text: "the",
      className: "text-gray-800",
    },
    {
      text: "US.",
      className: "text-gray-800",
    },
    {
      text: "Ship",
      className: "text-red-600",
    },
    {
      text: "to",
      className: "text-red-600",
    },
    {
      text: "Ghana.",
      className: "text-red-600",
    },
  ];

  return (
    <div className="max-w-7xl relative mx-auto py-8 md:py-40 px-4 w-full left-0 top-0 z-50">
      {/* Left-aligned TypewriterEffect */}
      <div className="flex flex-col items-start">
        <TypewriterEffectSmooth 
          words={words} 
          className="justify-start"
          cursorClassName="bg-red-600"
        />
      </div>
      
      <p className="max-w-2xl text-base md:text-xl mt-4 md:mt-8 text-gray-700 font-medium">
        Your trusted partner for fast, affordable, and secure shipping from the US to Ghana.
        Get your free US address today and start shopping from your favorite brands.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-8 items-start">
        <div className="w-full sm:w-64">
          <GoogleAuthButton buttonText="Get Started" />
        </div>
        <Link to="/services" className="w-full sm:w-64">
          <button className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700 hover:shadow-md">
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
