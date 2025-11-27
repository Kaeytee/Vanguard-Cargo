"use client";
import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";

import img1 from "@/assets/hero/1.png";
import img2 from "@/assets/hero/2.png";
import img3 from "@/assets/hero/3.png";
import img4 from "@/assets/hero/4.png";
import img5 from "@/assets/hero/5.png";
import img6 from "@/assets/hero/6.png";
import img7 from "@/assets/hero/7.png";
import img8 from "@/assets/hero/8.png";
import img9 from "@/assets/hero/9.png";
import img10 from "@/assets/hero/10.png";
import img11 from "@/assets/hero/11.png";
import img12 from "@/assets/hero/12.png";

export default function Hero() {
  return <HeroParallax products={products} />;
}
export const products = [
  {
    title: "Reliable Cargo Trucking",
    link: "/services",
    thumbnail: img3,
  },
  {
    title: "Secure Package Delivery",
    link: "/services",
    thumbnail: img2,
  },
  {
    title: "Fast Shipping",
    link: "/services",
    thumbnail: img1,
  },
  {
    title: "Doorstep Delivery",
    link: "/services",
    thumbnail: img4,
  },
  {
    title: "Professional Handling",
    link: "/services",
    thumbnail: img5,
  },
  {
    title: "Global Logistics",
    link: "/services",
    thumbnail: img6,
  },
  {
    title: "Express Air Freight",
    link: "/services",
    thumbnail: img7,
  },
  {
    title: "Warehousing Solutions",
    link: "/services",
    thumbnail: img8,
  },
  {
    title: "Vanguard in Ghana",
    link: "/services",
    thumbnail: img9,
  },
  {
    title: "Tema Port Operations",
    link: "/services",
    thumbnail: img10,
  },
  {
    title: "Port Logistics",
    link: "/services",
    thumbnail: img11,
  },
  {
    title: "Sea Freight Services",
    link: "/services",
    thumbnail: img12,
  },
  {
    title: "Customs Clearing",
    link: "/services",
    thumbnail: img1,
  },
  {
    title: "Package Consolidation",
    link: "/services",
    thumbnail: img2,
  },
  {
    title: "International Shipping",
    link: "/services",
    thumbnail: img3,
  },
];
