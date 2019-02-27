require([
  "esri/widgets/Search",
  "esri/layers/FeatureLayer",
  "esri/widgets/FeatureForm",
  "esri/widgets/FeatureForm/FieldConfig",
  "esri/widgets/FeatureForm/FieldGroupConfig",
  "esri/Graphic",
  "esri/geometry/Point",
  "dojo/domReady!"
], function(Search, FeatureLayer, FeatureForm, FieldConfig, FieldGroupConfig, Graphic, Point) {
  // Create feature layer
  const featureLayer = new FeatureLayer({
    portalItem: {
      id: "bcb1080113db4731a2285c45b9c26d7c" // Bicycle thefts
    },
    outFields: ["*"]
  });

  // Create default dummy feature params
  let defaultParam = {
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
  let search = new Search({
    popupEnabled: false,
    container: "searchDiv"
  });
  // Hide error icon in search-complete event
  search.on("search-complete", () => {
    document.getElementById("err").className = "material-icons customError hidden";
  });

  // Add a new feature form with grouped fields
  let form = new FeatureForm({
    container: "featureFormDiv",
    groupDisplay: "sequential", // only display one group at a time
    layer: featureLayer,
    fieldConfig: createFieldConfig()
  });

  function createFieldConfig() {
    let victimTheft = new FieldConfig({
      name: "VictimofTheft",
      label: "Have you been the victim of a bike theft?"
    });

    return [victimTheft, createGeneralBikeTheftInfoGroup(), createPoliceInfoGroup()];
  }

  function createGeneralBikeTheftInfoGroup() {
    let replaceBike = new FieldConfig({
      name: "ReplaceStolenBike",
      label: "Did you replace your stolen bike?"
    });

    let wasBikeLocked = new FieldConfig({
      name: "WasBikeLocked",
      label: "Was bike locked when stolen?"
    });

    let whereLocked = new FieldConfig({
      name: "WhatwasitLockesto",
      label: "What was it locked to?",
      visibilityExpression: "$feature.WasBikeLocked == 1"
    });

    let generalBikeTheftInfoGroup = new FieldGroupConfig({
      label: "General bike theft information",
      description: "Applicable if you have been a victim of bike theft",
      visibilityExpression: "$feature.VictimofTheft == 1",
      fieldConfig: [replaceBike, wasBikeLocked, whereLocked]
    });

    return generalBikeTheftInfoGroup;
  }

  function createPoliceInfoGroup() {
    let reportPolice = new FieldConfig({
      name: "ReporttoGuards",
      label: "Did you report the stolen bike to the police?"
    });

    let recoverBike = new FieldConfig({
      name: "RecoverStolenBike",
      label: "Did they recover the stolen bike?",
      visibilityExpression: "$feature.ReporttoGuards == 1"
    });

    let policeInfoGroup = new FieldGroupConfig({
      label: "Police information",
      description: "General information on reporting to police",
      visibilityExpression: "$feature.VictimofTheft == 1",
      fieldConfig: [reportPolice, recoverBike]
    });

    return policeInfoGroup;
  }

  // Listen to the feature form's submit event.
  let editFeature;
  form.on("submit", () => {
    // Check that the search has results
    if (search.results === null || search.results[0].results.length === 0) {
      document.getElementById("err").className = "material-icons customError visible";
      return;
    }

    if (editFeature) {
      // Set geometry
      editFeature.geometry = search.results.length === 1 ? search.results[0].results[0].feature.geometry : view.center;
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
  function selectFeature(objectId) {
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
  function applyAttributeUpdates(params) {
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
  function createNewFeature(params) {
    featureLayer.applyEdits(params).then((result) => {
      if (result.addFeatureResults.length === 1) {
        selectFeature(result.addFeatureResults[0].objectId);
      }
    });
  }
});
