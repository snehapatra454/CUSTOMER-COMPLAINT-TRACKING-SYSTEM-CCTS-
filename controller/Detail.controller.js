sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {

"use strict";

return Controller.extend("project7.controller.Detail", {

onInit: function () {

    var oRouter = this.getOwnerComponent().getRouter();
    oRouter.getRoute("RouteDetail")
        .attachPatternMatched(this.onObjectMatched, this);

},

onObjectMatched: function (oEvent) {

    var sPath = decodeURIComponent(
        oEvent.getParameter("arguments").contextPath
    );
    this.getView().bindElement({
        path: sPath
    });

},

onUpdateStatus: function () {

    var oContext = this.getView().getBindingContext();
    if (!oContext) {
        MessageToast.show("No complaint selected");
        return;
    }
    var sStatus = this.byId("idStatus1").getSelectedKey();
    var sResolution = this.byId("idResolutionNote").getValue();
    if (sStatus === "RESOLVED" && !sResolution) {
        MessageToast.show("Resolution Note required for RESOLVED");
        return;
    }
    oContext.setProperty("Status", sStatus);
    oContext.setProperty("ResolutionNote", sResolution);
    var oModel = this.getOwnerComponent().getModel();

    oModel.submitBatch("$auto")
        .then(function () {
            MessageToast.show("Status Updated Successfully");
        })
        .catch(function () {
            MessageToast.show("Update Failed");
        });

},
onActivateDraft: function () {

    var oView = this.getView();
    var oContext = oView.getBindingContext();

    if (!oContext) {
        sap.m.MessageToast.show("No complaint selected");
        return;
    }

    var sComplaintNo = this.byId("idComplaintID1").getValue();
    var sStatus = this.byId("idStatus1").getSelectedKey();
    var sResolution = this.byId("idResolutionNote").getValue();

    if (sStatus === "RESOLVED" && !sResolution) {
        sap.m.MessageToast.show("Resolution Note required for RESOLVED status");
        return;
    }

    var oModel = this.getOwnerComponent().getModel();
    var that = this;
    var oListBinding = oModel.bindList("/ZC_COMPLAINT");

    oListBinding.requestContexts().then(function (aContexts) {

        var aData = aContexts.map(function (oCtx) {
            return oCtx.getObject();
        });

        var bDuplicate = aData.some(function (item) {
            return item.ComplaintNo === sComplaintNo && item.IsActiveEntity === true;
        });

        if (bDuplicate) {
            sap.m.MessageToast.show("Complaint ID already exists. Activation not allowed.");
            return;
        }

        oContext.setProperty("Status", sStatus);
        oContext.setProperty("ResolutionNote", sResolution);

        var oAction = oModel.bindContext(
            oContext.getPath() +
            "/com.sap.gateway.srvd.zui_complaint_srv.v0001.Activate(...)"
        );

        oAction.invoke()
            .then(function () {
                sap.m.MessageToast.show("Complaint activated successfully");
                oModel.refresh();
            })
            .catch(function () {
                sap.m.MessageToast.show("Activation failed");
            });
    });
},

onDelete: function () {

    var oContext = this.getView().getBindingContext();
    var oRouter = this.getOwnerComponent().getRouter();

    if (!oContext) {
        MessageToast.show("No record available");
        return;
    }

    MessageBox.confirm("Do you want to delete this complaint?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        onClose: function (oAction) {

            if (oAction !== MessageBox.Action.YES) {
                return;
            }

            var oData = oContext.getObject();
            var oModel = oContext.getModel();
            if (oData.IsActiveEntity === true) {

                oContext.delete("$auto")
                    .then(function () {
                        MessageToast.show("Complaint deleted successfully");
                        oModel.refresh();
                        oRouter.navTo("RouteView1");

                    })
                    .catch(function (oError) {
                        console.error(oError);
                        MessageToast.show("Delete failed");
                    });
            }
            else {
                var oDiscard = oModel.bindContext(
                    oContext.getPath() +
                    "/com.sap.gateway.srvd.zui_complaint_srv.v0001.Discard(...)"
                );
                oDiscard.invoke()
                    .then(function () {
                        MessageToast.show("Draft discarded");
                        oModel.refresh();
                        oRouter.navTo("RouteView1");

                    })
                    .catch(function () {
                        MessageToast.show("Discard failed");
                    });
            }
        }
    });
}
});
});
