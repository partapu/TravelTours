/* eslint-disable*/

console.log('Hello from the client side');

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicHJlZXRoYW1wYXJ0YXB1IiwiYSI6ImNrdnhhZXhnYjAzZTIydm5vOG9zdzZyaW4ifQ.oKj2jJKWFI6VLmtBFQPXlQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/preethampartapu/ckvxaqf9b5q3p14qnzrmw0xxh',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 10,
    //   interactive: false,
  });

  const bound = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popop
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);

    //Extends map bound to include current location
    bound.extend(loc.coordinates);
  });

  map.fitBounds(bound, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
