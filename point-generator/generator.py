import pycristoforo as pyc
import json
from shapely.geometry import shape, GeometryCollection

with open("area-polygon.json") as f:
  features = json.load(f)["features"]
la = GeometryCollection([shape(feature["geometry"]).buffer(0) for feature in features])
points = pyc.geoloc_generation(la, 1200, "LA")
pyc.geoloc_print(points, ',')
