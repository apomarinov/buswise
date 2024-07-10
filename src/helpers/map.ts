const screenToLatLng = (
  point: google.maps.Point,
  map: google.maps.Map,
): google.maps.LatLng => {
  const projection = map.getProjection()!;
  const bounds = map.getBounds()!;

  const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
  const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());

  const scale = Math.pow(2, map.getZoom());

  const worldPoint = new google.maps.Point(
    point.x / scale + bottomLeft.x,
    point.y / scale + topRight.y,
  );

  return projection.fromPointToLatLng(worldPoint);
};

const domNodeToLatLng = (
  map: google.maps.Map,
  node: Element,
  offsetX: number,
  offsetY: number,
): google.maps.LatLng => {
  const rect = node.getBoundingClientRect();
  return screenToLatLng(
    new google.maps.Point(
      rect.x + rect.width / 2 - offsetX,
      rect.y + rect.height / 2 - offsetY,
    ),
    map,
  );
};

const domNodesToGeoPolygon = (
  map,
  nodes: Element[],
  offsetX: number,
  offsetY: number,
): GeoJSON.Polygon => {
  const polygon: GeoJSON.Polygon = {
    type: "Polygon",
    coordinates: [[]],
  };
  for (let i = 0; i < nodes.length; i++) {
    const lassoRect = nodes[i]!;
    const latLng = domNodeToLatLng(map, lassoRect, offsetX, offsetY);
    if (i === 0) {
      polygon.coordinates[0]!.push(
        [latLng.lng(), latLng.lat()],
        [latLng.lng(), latLng.lat()],
      );
    } else {
      polygon.coordinates[0]!.splice(polygon.coordinates[0]!.length - 1, 0, [
        latLng.lng(),
        latLng.lat(),
      ]);
    }
  }
  return polygon;
};

const exports = {
  domNodesToGeoPolygon,
};

export default exports;
