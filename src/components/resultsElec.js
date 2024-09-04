import React, { useState, useEffect } from "react";
import '../App.css';
import lod from '../lodinggif.gif';


const ElectionResults = () => {
    const [data, setData] = useState(null);
    const [selectedIsland, setSelectedIsland] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [reverseNames, setReverseNames] = useState(false);


    useEffect(() => {
        setLoading(true); 
        fetch("/resultsElection.json")
          .then((response) => response.json())
          .then((jsonData) => {
            setTimeout(() => {
              setData(jsonData);
              setLoading(false); 
            }, 2000); 
          })
          .catch((error) => {
            console.error("Error fetching JSON:", error);
            setLoading(false); 
          });
      }, []);
  
    //#region dynamic dropdown function
    const handleIslandChange = (e) => {
      setSelectedIsland(e.target.value);
      setSelectedRegion("");
      setSelectedProvince("");
      setSelectedCity("");
    };

    const handleRegionChange = (e) => {
      setSelectedRegion(e.target.value);
      setSelectedProvince("");
      setSelectedCity("");
    };

    const handleProvinceChange = (e) => {
      setSelectedProvince(e.target.value);
      setSelectedCity("");
    };

    const handleCityChange = (e) => {
      setSelectedCity(e.target.value);
    };
//#endregion

//#region get results from json based on selection from dropdown, and sort them based on values

    const filteredRegions = selectedIsland
      ? data.regions.filter((region) => region.island === selectedIsland)
      : [];

    const filteredProvinces = selectedRegion
      ? filteredRegions
          .filter((region) => region.region === selectedRegion)
          .flatMap((region) => region.provinces)
      : [];

    const filteredCities = selectedProvince
      ? filteredProvinces.filter((province) => province.province === selectedProvince)
      : [];
//#region get the sum of all results per region
    const summofVotesofAllRegion = (regions) => {
      const sumofAllResult = {};
      regions.forEach((region) => {
        region.provinces.forEach((province) => {
          Object.entries(province.results.president).forEach(([candidate, votes]) => {
            sumofAllResult[candidate] = (sumofAllResult[candidate] || 0) + votes;
          });
        });
      });

      const sortedResults = Object.entries(sumofAllResult).sort((a, b) => b[1] - a[1]);
  
      return sortedResults;
    };
//#endregion

    const getProvinceResults = (province) => {
      if (!province){
        return null;
      }
         
      const results = province.results.president;
      const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);
      return sortedResults;
    };
//#endregion  
    const formatName = (name) => {
        return name
          .replace(/_/g, " ")    
          .replace(/\b\w/g, char => char.toUpperCase());  
      };
    
      
      const formatVotes = (votes) => {
        return votes.toLocaleString();  
      };
    

    const displayResults = () => {
      if (selectedRegion === "All") {
        
        const sumofAllResult = summofVotesofAllRegion(filteredRegions);
        return (
          <div className="resDiv">
            <h2>Aggregated Results for All Regions in {selectedIsland}</h2>
            <ol>
              {sumofAllResult.map(([candidate, votes]) => (
                <li id="ress" key={candidate}>
                  {formatName(candidate)}: {formatVotes(votes)} votes
                </li>
              ))}
            </ol>
            <button onClick={() => alert("Button clicked!")}>
                    Reverse String
                </button>
          </div>
        );
      } else if (selectedProvince && selectedCity) {
        const province = filteredProvinces.find((p) => p.province === selectedProvince);
        const provinceResults = getProvinceResults(province);
        return (
          <div className="resDiv">
            <h2>Results for {selectedProvince}, {selectedCity}</h2>
            <ol className="">
              {provinceResults.map(([candidate, votes]) => (
                <li key={candidate}>
                  {formatName(candidate)}: {formatVotes(votes)} votes
                </li>
              ))}
            </ol>
            <button onClick={() => alert("Button clicked!")}>
            Reverse String
                </button>
          </div>
        );
      }
  
      return null;
    };
  
    if (!data) {
      return <div>Loading...
        <img src={lod}/>
      </div>;
    }
  
    return (
      <div className="electionsPane">
        <h1 className="heroh1">Election Results</h1>
        <div className="childElectionsPane">
        <label>Island:</label>
        <select value={selectedIsland} onChange={handleIslandChange}>
          <option value="">Select Island</option>
          <option value="Luzon">Luzon</option>
          <option value="Visayas">Visayas</option>
          <option value="Mindanao">Mindanao</option>
        </select>
  
        <label>Region:</label>
        <select
          value={selectedRegion}
          onChange={handleRegionChange}
          disabled={!selectedIsland}
        >
          <option value="">Select Region</option>
          <option value="All">All</option>
          {filteredRegions.map((region) => (
            <option key={region.region} value={region.region}>
              {region.region}
            </option>
          ))}
        </select>
  
        <label>Province:</label>
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          disabled={!selectedRegion || selectedRegion === "All"}
        >
          <option value="">Select Province</option>
          {filteredProvinces.map((province) => (
            <option key={province.province} value={province.province}>
              {province.province}
            </option>
          ))}
        </select>

        <label>City:</label>
        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedProvince}
        >
          <option value="">Select City</option>
          {filteredCities.length > 0 && (
            <>
              <option value={filteredCities[0].city.capital_city}>
                {filteredCities[0].city.capital_city}
              </option>
              <option value={filteredCities[0].city.biggest_city}>
                {filteredCities[0].city.biggest_city}
              </option>
            </>
          )}
        </select>
        </div>
        

        {displayResults()}
      </div>
    );
  };
  
  export default ElectionResults;