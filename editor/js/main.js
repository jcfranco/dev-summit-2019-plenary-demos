let view;
require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Editor",
  "dojo/domReady!"
], function (
  WebMap,
  MapView,
  Editor
) {

  // Create a map frm the referenced webmap item id
  let webmap = new WebMap({
    portalItem: {
      id: "2e2ccb2c1cb14cf69631547e0c724bd7"
    }
  });

  let view = new MapView({
    container: "viewDiv",
    map: webmap
  });

  view.when(function () {
    view.popup.autoOpenEnabled = false; //disable popups

    // Create a custom group to separate the different areas of crime
    // This function takes an object containing a feature layer and featuretemplate
    function customGroup({
      template
    }) {
      let groupHeading;
      switch (template.name) {
        case "Criminal Homicide":
        case "Rape":
        case "Robbery":
        case "Aggravated Assault":
          groupHeading = "Violent Crime";
          break;
        case "Arson":
        case "Burlary":
        case "Larceny":
        case "Motor Vehicle Theft":
          groupHeading = "Property Crime";
          break;
        default:
          groupHeading = "Quality of Life";
      }
      return groupHeading;
    }

    // Create the Editor
    let editor = new Editor({
      view: view,
      // Override the default template behavior of the Editor widget
      supportingWidgetDefaults: {
        featureTemplates: {
          groupBy: customGroup
        }
      }
    });

    view.ui.add(editor, "top-right");

    let intervalId = setInterval(() => {
      let backButton = document.querySelector(".esri-editor__back-button");
      if (backButton) {
        backButton.style.display = "none";
      }
    }, 500);
  });
});