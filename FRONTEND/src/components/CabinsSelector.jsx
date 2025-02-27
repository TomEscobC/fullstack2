import React from "react";

const CabinsSelector = ({ selectedCabins, setSelectedCabins }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        <input
          type="radio"
          value="Couple"
          checked={selectedCabins === "Couple"}
          onChange={() => setSelectedCabins("Couple")}
        />
        Couple
      </label>
      <label>
        <input
          type="radio"
          value="Familiar"
          checked={selectedCabins === "Familiar"}
          onChange={() => setSelectedCabins("Familiar")}
        />
        Familiar
      </label>
    </div>
  );
};

export default CabinsSelector;