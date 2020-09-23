import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Coordinate } from 'ol/coordinate';
import LineString from 'ol/geom/LineString';
import { Circle, Stroke, Style, Fill, Icon, Text } from 'ol/style';
import Arrow from '../../img/arrow.png';
import Arrow1 from '../../img/arrow1.png';

interface SingleData {
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export const processDataES = (data: SingleData[]) => {
  data.reverse();
  const perDeviceRoute: { [key: string]: [number, number][] } = {};
  const perDeviceTime: { [key: string]: number[] } = {};
  const perDeviceFloor: { [key: string]: number[] } = {};
  data.map(datum => {
    (perDeviceRoute[datum.predictions_id] = perDeviceRoute[datum.predictions_id] || []).push([
      datum.longitude,
      datum.latitude,
    ]);
    (perDeviceTime[datum.predictions_id] = perDeviceTime[datum.predictions_id] || []).push(datum.timestamp);
    (perDeviceFloor[datum.predictions_id] = perDeviceFloor[datum.predictions_id] || []).push(datum.level);
  });

  const perDeviceTime_array = Object.keys(perDeviceTime).map(id => ({
    id,
    duration: perDeviceTime[id].slice(-1)[0] - perDeviceTime[id][0],
  }));

  perDeviceTime_array.sort((a, b) => {
    if (a.duration > b.duration) return -1;
    if (a.duration < b.duration) return 1;
    return 0;
  });


  return {
    perDeviceRoute,
    perDeviceTime,
    perDeviceFloor,
    selectList: perDeviceTime_array.map(elm => elm.id),
  };
};

export const createLine = (routeData: Coordinate[], iterRoute: number, floorData: number[]) => {
  let color = 'rgba(73,168,222)';
  let pic = Arrow;

  if (floorData[iterRoute] < 0) {
    color = 'rgba(255,176,0)';
  }

  if (floorData[iterRoute + 1] < 0) {
    pic = Arrow1;
  }

  const dx = routeData[iterRoute + 1][0] - routeData[iterRoute][0];
  const dy = routeData[iterRoute + 1][1] - routeData[iterRoute][1];
  const rotation = Math.atan2(dy, dx);
  const lineFeature = new Feature(
    new LineString([routeData[iterRoute], routeData[iterRoute + 1]]).transform('EPSG:4326', 'EPSG:3857')
  );

  lineFeature.setStyle([
    new Style({
      stroke: new Stroke({
        color: color,
        width: 2,
      }),
    }),
    new Style({
      geometry: new Point(routeData[iterRoute + 1]).transform('EPSG:4326', 'EPSG:3857'),
      image: new Icon({
        src: pic,
        anchor: [0.75, 0.5],
        rotateWithView: true,
        rotation: -rotation,
      }),
    }),
  ]);
  return lineFeature;
};

export const createLineWithLabel = (
  routeData: Coordinate[],
  timeData: number[],
  iterRoute: number,
  floorData: number[]
) => {
  let color = 'rgba(73,168,222)';
  let pic = Arrow;

  if (floorData[iterRoute] < 0) {
    color = 'rgba(255,176,0)';
  }

  if (floorData[iterRoute + 1] < 0) {
    pic = Arrow1;
  }

  const dx = routeData[iterRoute + 1][0] - routeData[iterRoute][0];
  const dy = routeData[iterRoute + 1][1] - routeData[iterRoute][1];
  const rotation = Math.atan2(dy, dx);
  const lineFeature = new Feature<LineString>(
    new LineString([routeData[iterRoute], routeData[iterRoute + 1]]).transform('EPSG:4326', 'EPSG:3857')
  );

  lineFeature.setStyle([
    new Style({
      stroke: new Stroke({
        color: color,
        width: 2,
      }),
      text: new Text({
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
        font: '18px Calibri,sans-serif',
        text: `${timeData[iterRoute + 1] - timeData[iterRoute]}s`,
      }),
    }),
    new Style({
      geometry: new Point(routeData[iterRoute + 1]).transform('EPSG:4326', 'EPSG:3857'),
      image: new Icon({
        src: pic,
        anchor: [0.75, 0.5],
        rotateWithView: true,
        rotation: -rotation,
      }),
    }),
  ]);
  return lineFeature;
};

export const createPoint = (routeData: Coordinate[], iterRoute: number, floorData: number[]) => {
  let color = 'rgba(73,168,222,0.6)';

  if (floorData[iterRoute] < 0) {
    color = 'rgba(255,176,0,0.6)';
  }

  const pointFeature = new Feature<Point>(new Point(routeData[iterRoute]).transform('EPSG:4326', 'EPSG:3857'));
  pointFeature.setStyle(
    new Style({
      image: new Circle({
        radius: 3,
        fill: new Fill({ color: color }),
      }),
    })
  );
  return pointFeature;
};
