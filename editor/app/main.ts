import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import Editor = require("esri/widgets/Editor");

import GroupByFunction = __esri.GroupByFunction;

// Create a map from the referenced web map item id
const webmap = new WebMap({
  portalItem: {
    id: "2e2ccb2c1cb14cf69631547e0c724bd7"
  }
});

const view = new MapView({
  container: "viewDiv",
  map: webmap,
  popup: {
    autoOpenEnabled: false //disable popups
  }
});

// Create a custom group to separate the different areas of crime
// This function takes an object containing a feature layer and feature template
const groupBySeverity: GroupByFunction = ({ template }) => {
  let groupHeading: string;

  switch (template.name) {
    case "Criminal Homicide":
    case "Rape":
    case "Robbery":
    case "Aggravated Assault":
      groupHeading = "Violent Crime";
      break;

    case "Arson":
    case "Burglary":
    case "Larceny":
    case "Motor Vehicle Theft":
      groupHeading = "Property Crime";
      break;

    default:
      groupHeading = "Quality of Life";
  }

  return groupHeading;
};

// Create the Editor
const editor = new Editor({
  view: view,
  // Override the default template behavior of the Editor widget
  supportingWidgetDefaults: {
    featureTemplates: {
      groupBy: groupBySeverity
    }
  }
});

view.ui.add(editor, "top-right");
