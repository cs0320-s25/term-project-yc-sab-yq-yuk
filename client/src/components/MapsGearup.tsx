import { useState } from "react";
import EventMap from "./EventMap";

enum Section {
  MAP_DEMO = "MAP_DEMO"
}

export default function MapsGearup() {
  const [section, setSection] = useState<Section>(Section.MAP_DEMO);

  return (
    <div className="maps-gearup-container">
      <div className="content">
        <EventMap />
      </div>
    </div>
  );
}