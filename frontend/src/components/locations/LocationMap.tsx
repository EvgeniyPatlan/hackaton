"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Динамічно імпортуємо компонент карти з відключеним SSR
const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="bg-gray-100 rounded-lg" style={{ height: "600px" }} />
});

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  overallRating: number;
}

interface LocationMapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function LocationMap(props: LocationMapProps) {
  return <MapWithNoSSR {...props} />;
}