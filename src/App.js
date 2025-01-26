import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import data from "./dinamo_transfers.json"; // Convert your CSV to JSON for easy use

const App = () => {
  const [selectedSeason, setSelectedSeason] = useState("23/24");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filter data for the selected season
    const seasonData = data.filter((row) => row.Season === selectedSeason);
    setFilteredData(seasonData);
  }, [selectedSeason]);

  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
  };

  const createTransferMap = () => {
    const fromMarkers = filteredData.map((row) => ({
      lat: row["Latitude From"],
      lon: row["Longitude From"],
      text: `${row.name}<br>Season: ${row.Season}<br>Market Value: ${row["Market Value"]}<br>Fee: ${row.Fee}<br>From: ${row["Club From"]}`,
    }));

    const toMarkers = filteredData.map((row) => ({
      lat: row["Latitude To"],
      lon: row["Longitude To"],
      text: `${row.name}<br>Season: ${row.Season}<br>Market Value: ${row["Market Value"]}<br>Fee: ${row.Fee}<br>To: ${row["Club To"]}`,
    }));

    const transferLines = filteredData.map((row) => ({
      lat: [row["Latitude From"], row["Latitude To"]],
      lon: [row["Longitude From"], row["Longitude To"]],
    }));

    return (
        <Plot
            data={[
                ...fromMarkers.map((marker) => ({
                    type: "scattergeo",
                    lat: [marker.lat],
                    lon: [marker.lon],
                    mode: "markers",
                    marker: { size: 10, color: "blue" },
                    text: marker.text,
                    showlegend: false,
                })),
                ...toMarkers.map((marker) => ({
                    type: "scattergeo",
                    lat: [marker.lat],
                    lon: [marker.lon],
                    mode: "markers",
                    marker: { size: 10, color: "red" },
                    text: marker.text,
                    showlegend: false,
                })),
                ...transferLines.map((line) => ({
                    type: "scattergeo",
                    lat: line.lat,
                    lon: line.lon,
                    mode: "lines",
                    line: { width: 2, color: "blue" },
                    opacity: 0.5,
                    showlegend: false,
                })),
            ]}
            layout={{
                geo: {
                    projection: { type: "orthographic", scale: 3 },
                    showland: true,
                    showcountries: true,
                    showocean: true,
                    landcolor: "rgb(250, 250, 250)", // Land color
                    lakecolor: "rgb(169, 169, 169)",
                    oceancolor: "rgb(147,226,255)",// Ocean (lake) color (grey)
                    center: { lat: 45.8131, lon: 15.978 },
                    bgcolor: "rgb(230, 230, 230)",
                },
                width: 1000,
                height: 800,
            }}
        />

    );
  };

  const createFeeBySeasonChart = () => {
      const seasonFees = data.reduce((acc, row) => {
          acc[row.Season] = (acc[row.Season] || 0) + row.Fee;
          return acc;
      }, {});

      const seasons = Object.keys(seasonFees).sort((a, b) => a.localeCompare(b));
      const fees = seasons.map((season) => seasonFees[season]);

    return (
        <Plot
            data={[
              {
                x: seasons,
                y: fees,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{
              title: "Total Transfer Fees by Season",
              xaxis: { title: "Season" },
              yaxis: { title: "Total Fees (€)" },
                height: 350,
            }}
        />
    );
  };

  const createIncomingOutgoingChart = () => {
      const seasonCounts = data.reduce(
          (acc, row) => {
              if (row["Club To"] === "Dinamo Zagreb") acc[row.Season].incoming++;
              if (row["Club From"] === "Dinamo Zagreb") acc[row.Season].outgoing++;
              return acc;
          },
          Object.fromEntries(data.map((row) => [row.Season, { incoming: 0, outgoing: 0 }]))
      );

      const seasons = Object.keys(seasonCounts).sort((a, b) => a.localeCompare(b));
      const incoming = seasons.map((season) => seasonCounts[season].incoming);
      const outgoing = seasons.map((season) => seasonCounts[season].outgoing);

    return (
        <Plot
            data={[
              {
                x: seasons,
                y: incoming,
                type: "bar",
                name: "Incoming Transfers",
                marker: { color: "green" },
              },
              {
                x: seasons,
                y: outgoing,
                type: "bar",
                name: "Outgoing Transfers",
                marker: { color: "red" },
              },
            ]}
            layout={{
              title: "Incoming and Outgoing Transfers by Season",
              barmode: "group",
              xaxis: { title: "Season" },
              yaxis: { title: "Number of Transfers" },
                height: 350,
            }}
        />
    );
  };

  return (
      <div style={{fontFamily: "Arial, sans-serif", padding: "20px"}}>
          {/* Dropdown placed above map and charts, to the right */}
          <div style={{marginBottom: "20px", display: "flex", justifyContent: "flex-end"}}>

          </div>

          {/* Flex container for map and charts */}
          <div style={{display: "flex", gap: "20px", alignItems: "center"}}>
              {/* Map container with 70% width */}
              <div style={{flex: "0 0 60%", height: '100%'}}>
                  <div
                      style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "20px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                          position: "relative", // To ensure it stays in focus
                      }}
                  >
                      {createTransferMap()}
                  </div>
              </div>

              {/* Charts container with 30% width, stacked vertically */}
              <div
                  style={{
                      flex: "0 0 35%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                      justifyContent: "space-between",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "20px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",// To evenly distribute charts' height
                  }}
              >
                  <div style={{display: "flex", justifyContent: "flex-end"}}>
                      <select
                          id="season-select"
                          value={selectedSeason}
                          onChange={handleSeasonChange}
                          style={{
                              padding: "8px 12px",
                              fontSize: "16px",
                              borderRadius: "5px",
                              backgroundColor: "#f9f9f9",
                          }}
                      >
                          {Array.from(new Set(data.map((row) => row.Season)))
                              .sort((a, b) => b.localeCompare(a))
                              .map((season) => (
                                  <option key={season} value={season}>
                                      {season}
                                  </option>
                              ))}
                      </select>
                  </div>
                  <div
                      style={{
                          flex: "1", // Makes charts take equal height
                      }}
                  >
                      {createFeeBySeasonChart()}
                  </div>
                  <div
                      style={{
                          flex: "1", // Makes charts take equal height
                      }}
                  >
                      {createIncomingOutgoingChart()}
                  </div>
              </div>
          </div>
      </div>
  );
};

export default App;
