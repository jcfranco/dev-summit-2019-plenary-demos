import Search = require("esri/widgets/Search");
import FeatureLayer = require("esri/layers/FeatureLayer");
import FeatureForm = require("esri/widgets/FeatureForm");
import FieldConfig = require("esri/widgets/FeatureForm/FieldConfig");
import FieldGroupConfig = require("esri/widgets/FeatureForm/FieldGroupConfig");
import Graphic = require("esri/Graphic");
import Point = require("esri/geometry/Point");
import FeatureLayerApplyEditsEdits = __esri.FeatureLayerApplyEditsEdits;

// Create feature layer
const featureLayer = new FeatureLayer({
  portalItem: {
    id: "bcb1080113db4731a2285c45b9c26d7c" // Bicycle thefts
  },
  outFields: ["*"]
});

// Create default dummy feature params
const defaultParam = {
  addFeatures: [
    new Graphic({
      geometry: new Point({
        x: 0,
        y: 0
      }),
      attributes: {
        VictimofTheft: "2",
        WasBikeLocked: "2"
      }
    })
  ]
};

// Create search widget
const search = new Search({
  popupEnabled: false,
  container: "searchDiv"
});
// Hide error icon in search-complete event
search.on("search-complete", () => {
  document.getElementById("err").className = "material-icons customError hidden";
});

// Add a new feature form with grouped fields
const form = new FeatureForm({
  container: "featureFormDiv",
  groupDisplay: "sequential", // only display one group at a time
  layer: featureLayer,
  fieldConfig: createFieldConfig()
});

function createFieldConfig() {
  const victimTheft = new FieldConfig({
    name: "VictimofTheft",
    label: "Have you been the victim of a bike theft?"
  });

  return [victimTheft, createGeneralBikeTheftInfoGroup(), createPoliceInfoGroup()];
}

function createGeneralBikeTheftInfoGroup() {
  const replaceBike = new FieldConfig({
    name: "ReplaceStolenBike",
    label: "Did you replace your stolen bike?"
  });

  const wasBikeLocked = new FieldConfig({
    name: "WasBikeLocked",
    label: "Was bike locked when stolen?"
  });

  const whereLocked = new FieldConfig({
    name: "WhatwasitLockesto",
    label: "What was it locked to?",
    visibilityExpression: "$feature.WasBikeLocked == 1"
  });

  const generalBikeTheftInfoGroup = new FieldGroupConfig({
    label: "General bike theft information",
    description: "Applicable if you have been a victim of bike theft",
    visibilityExpression: "$feature.VictimofTheft == 1",
    fieldConfig: [replaceBike, wasBikeLocked, whereLocked]
  });

  return generalBikeTheftInfoGroup;
}

function createPoliceInfoGroup() {
  const reportPolice = new FieldConfig({
    name: "ReporttoGuards",
    label: "Did you report the stolen bike to the police?"
  });

  const recoverBike = new FieldConfig({
    name: "RecoverStolenBike",
    label: "Did they recover the stolen bike?",
    visibilityExpression: "$feature.ReporttoGuards == 1"
  });

  const policeInfoGroup = new FieldGroupConfig({
    label: "Police information",
    description: "General information on reporting to police",
    visibilityExpression: "$feature.VictimofTheft == 1",
    fieldConfig: [reportPolice, recoverBike]
  });

  return policeInfoGroup;
}

// Listen to the feature form's submit event.
let editFeature: Graphic;

form.on("submit", () => {
  // Check that the search has results
  if (search.results === null || search.results[0].results.length === 0) {
    document.getElementById("err").className = "material-icons customError visible";
    return;
  }

  if (editFeature) {
    // Set geometry
    editFeature.geometry = search.results[0].results[0].feature.geometry;
    // Grab updated attributes from the form.
    const updated = form.getValues();

    // The updated values to feature attributes
    Object.keys(updated).forEach(function(name) {
      editFeature.attributes[name] = updated[name];
    });
    // Loop through updated attributes and assign

    // Setup the applyEdits parameter with updates.
    const edits = {
      updateFeatures: [editFeature]
    };
    applyAttributeUpdates(edits);
  }
});

// Create dummy feature on start-up
createNewFeature(defaultParam);

// Submit form on click event
document.getElementById("addEntry").onclick = () => {
  form.submit();
};

// Query feature layer and set form feature
function selectFeature(objectId: number) {
  // query feature from the server
  featureLayer
    .queryFeatures({
      objectIds: [objectId],
      outFields: ["*"],
      returnGeometry: false
    })
    .then(function(results) {
      if (results.features.length > 0) {
        // display the attributes of selected feature in the form
        form.feature = editFeature = results.features[0];
      }
    });
}

// Call FeatureLayer.applyEdits() with specified params.
function applyAttributeUpdates(params: FeatureLayerApplyEditsEdits) {
  document.getElementById("addEntry").style.cursor = "progress";
  featureLayer
    .applyEdits(params)
    .then(function(editsResult) {
      // Get the objectId of the newly added feature.
      // Call selectFeature function to highlight the new feature.
      if (editsResult.updateFeatureResults.length > 0) {
        // Clear search
        search.clear();
        // Create new dummy feature
        createNewFeature(defaultParam);
      }
      document.getElementById("addEntry").style.cursor = "pointer";

      // Show success banner
      document.getElementById("bannerDiv").className = "successBanner visible";
      // Hide banner after 3 seconds
      setTimeout(() => {
        document.getElementById("bannerDiv").className = "successBanner hidden";
      }, 3000);
    })
    .catch(function(error) {
      console.log("===============================================");
      console.error("[ applyEdits ] FAILURE: ", error.code, error.name, error.message);
      console.log("error = ", error);
      document.getElementById("addEntry").style.cursor = "pointer";
    });
}

// Creates a new dummy feature
function createNewFeature(params: FeatureLayerApplyEditsEdits) {
  featureLayer.applyEdits(params).then((result) => {
    if (result.addFeatureResults.length === 1) {
      selectFeature(result.addFeatureResults[0].objectId);
    }
  });
}
