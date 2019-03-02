define(["require", "exports", "esri/WebMap", "esri/views/MapView", "esri/widgets/Editor"], function (require, exports, WebMap, MapView, Editor) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // Create a map from the referenced web map item id
    var webmap = new WebMap({
        portalItem: {
            id: "e10fb3fab173489f83382624a81538aa"
        }
    });
    var view = new MapView({
        container: "viewDiv",
        map: webmap,
        popup: {
            autoOpenEnabled: false //disable popups
        }
    });
    // Create the Editor
    var editor = new Editor({ view: view });
    view.ui.add(editor, "top-right");
});
