sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("project7.controller.Login", {

        onInit: function () {

            // Load remembered user
            var savedUser = localStorage.getItem("rememberUser");

            if (savedUser) {
                this.byId("usernameInput").setValue(savedUser);
                this.byId("rememberCheck").setSelected(true);
            }

        },

        onLoginPress: function () {

            var sUser = this.byId("usernameInput").getValue();
            var sPass = this.byId("passwordInput").getValue();
            var bRemember = this.byId("rememberCheck").getSelected();

            if (!sUser || !sPass) {
                MessageToast.show("Enter username and password");
                return;
            }

            // Remember me logic
            if (bRemember) {
                localStorage.setItem("rememberUser", sUser);
            } else {
                localStorage.removeItem("rememberUser");
            }

            MessageToast.show("Login Successful");

            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },

        onForgotPassword: function () {

            MessageBox.information(
                "Please contact the system administrator to reset your password."
            );

        }

    });

});