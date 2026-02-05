import React from 'react';

function PlaceSearch({ 
  placeQuery, 
  setPlaceQuery, 
  handlePlaceSearch, 
  handleCurrentLocation, 
  searchStatus 
}) {
  return (
    <section className="place-search">
      <div className="place-search__row">
        <input 
          type="search" 
          className="input-search"
          placeholder="住所、駅、施設名、郵便番号など" 
          value={placeQuery}
          onChange={(e) => setPlaceQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
        />
        <div className="place-search__btns">
          <button className="btn btn-sub" onClick={handlePlaceSearch}>目的地の周辺を検索</button>
          <button className="btn btn-sub" onClick={handleCurrentLocation}>📍 現在地に戻す</button>
        </div>
      </div>
      <p className="place-search__status">{searchStatus}</p>
    </section>
  );
}

export default PlaceSearch;