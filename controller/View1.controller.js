sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "project7/model/formatter",
    "sap/ui/core/Fragment"
], function (Controller, Filter, FilterOperator, MessageToast, JSONModel, formatter, Fragment) {

    "use strict";

    return Controller.extend("project7.controller.View1", {

        formatter: formatter,

        onInit: function () {

            var oModel = this.getOwnerComponent().getModel();
            this.getView().setModel(oModel);
            // this.loadAnalytics();
            this.loadAnalytics("MONTH");

        },

        // loadAnalytics: async function () {

        //     var oModel = this.getOwnerComponent().getModel();
        //     var that = this;

        //     try {

        //         var oListBinding = oModel.bindList("/ZC_COMPLAINT");
        //         var aContexts = await oListBinding.requestContexts();
        //         var aData = aContexts.map(function (oContext) {
        //             return oContext.getObject();
        //         });

        //         var statusCount = {
        //             OPEN: 0,
        //             IN_PROGRESS: 0,
        //             RESOLVED: 0
        //         };

        //         aData.forEach(function (item) {
        //             if (statusCount[item.Status] !== undefined) {
        //                 statusCount[item.Status]++;
        //             }
        //         });

        //         var donutData = {
        //             data: [
        //                 { type: "OPEN", value: statusCount.OPEN },
        //                 { type: "IN_PROGRESS", value: statusCount.IN_PROGRESS },
        //                 { type: "RESOLVED", value: statusCount.RESOLVED }
        //             ]
        //         };

        //         var oDonutModel = new JSONModel(donutData);
        //         that.getView().setModel(oDonutModel, "donutModel");

        //         var monthMap = {
        //             Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        //             Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
        //         };

        //         aData.forEach(function (item) {

        //             if (!item.CreatedDate) return;
        //             var date = new Date(item.CreatedDate);
        //             var month = date.toLocaleString("default", { month: "short" });
        //             monthMap[month]++;

        //         });

        //         var monthlyData = {
        //             data: Object.keys(monthMap).map(function (m) {
        //                 return {
        //                     month: m,
        //                     sales: monthMap[m]
        //                 };
        //             })
        //         };
        //         var oSalesModel = new JSONModel(monthlyData);
        //         that.getView().setModel(oSalesModel, "salesModel");

        //     } catch (error) {
        //         console.error("Analytics Load Failed", error);
        //     }
        // },

        loadAnalytics: async function (sType) {

            var oModel = this.getOwnerComponent().getModel();
            var that = this;
            sType = sType || "MONTH";
            try {
                var oListBinding = oModel.bindList("/ZC_COMPLAINT");
                var aContexts = await oListBinding.requestContexts();
                var aData = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                /* ---------------- DONUT CHART ---------------- */

                var statusCount = {
                    OPEN: 0,
                    IN_PROGRESS: 0,
                    RESOLVED: 0
                };
                aData.forEach(function (item) {
                    if (statusCount[item.Status] !== undefined) {
                        statusCount[item.Status]++;
                    }
                });

                var donutData = {
                    data: [
                        { type: "OPEN", value: statusCount.OPEN },
                        { type: "IN_PROGRESS", value: statusCount.IN_PROGRESS },
                        { type: "RESOLVED", value: statusCount.RESOLVED }
                    ]
                };
                var oDonutModel = new sap.ui.model.json.JSONModel(donutData);
                that.getView().setModel(oDonutModel, "donutModel");


                /* ---------------- COLUMN CHART ---------------- */

                var timeMap = {};
                if (sType === "MONTH") {
                    timeMap = {
                        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
                        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
                    };
                }

                if (sType === "QUARTER") {
                    timeMap = {
                        "Jan-Mar": 0,
                        "Apr-Jun": 0,
                        "Jul-Sep": 0,
                        "Oct-Dec": 0
                    };
                }

                aData.forEach(function (item) {

                    if (!item.CreatedDate) return;
                    var date = new Date(item.CreatedDate);
                    var key = "";

                    switch (sType) {

                        case "DAY":
                            key = date.getDate(); 
                            break;

                        case "MONTH":
                            key = date.toLocaleString("default", { month: "short" });
                            break;

                        case "QUARTER":
                            var q = Math.floor(date.getMonth() / 3);

                            if (q === 0) key = "Jan-Mar";
                            if (q === 1) key = "Apr-Jun";
                            if (q === 2) key = "Jul-Sep";
                            if (q === 3) key = "Oct-Dec";

                            break;

                        case "YEAR":
                            key = date.getFullYear();
                            break;
                    }

                    if (!timeMap[key]) {
                        timeMap[key] = 0;
                    }

                    timeMap[key]++;
                });


                var chartData = {
                    data: Object.keys(timeMap).map(function (k) {
                        return {
                            time: k,
                            sales: timeMap[k]
                        };
                    })
                };

                var oSalesModel = new sap.ui.model.json.JSONModel(chartData);
                that.getView().setModel(oSalesModel, "salesModel");

            } catch (error) {
                console.error("Analytics Load Failed", error);
            }
        },
        onTimeChange: function (oEvent) {
            var sKey = oEvent.getSource().getSelectedKey();
            this.loadAnalytics(sKey);
        },
        onCreate: function () {

            var oView = this.getView();
            if (!this.oCreateDialog) {

                Fragment.load({
                    id: oView.getId(),
                    name: "project7.view.CreateComplaint",
                    controller: this
                }).then(function (oDialog) {

                    this.oCreateDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                    MessageToast.show("Complaint ID will be generated automatically after creation");

                }.bind(this));

            } else {

                this.oCreateDialog.open();
                MessageToast.show("Complaint ID will be generated automatically after creation");
            }
        },

        onCloseCreateDialog: function () {

            if (this.oCreateDialog) {
                this.oCreateDialog.close();
            }
        },


        onSubmitComplaint: function () {

            var sCustomerId = this.byId("idCustomerID2").getValue();
            var regex = /^CUST\d+$/;
            if (!regex.test(sCustomerId)) {
                MessageToast.show("Customer ID must start with CUST followed by numbers (Example: CUST123)");
                return;
            }

            var oTable = this.byId("complaintTable");
            var oBinding = oTable.getBinding("rows");
            var oContext = oBinding.create({

                CustomerId: this.byId("idCustomerID2").getValue(),
                ComplaintDesc: this.byId("idDescription2").getValue(),
                Status: this.byId("idStatus2").getSelectedKey()

            });

            oContext.created().then(function () {

                MessageToast.show("Data Created Successfully");
                this.clearCreateForm();
                this.byId("complaintTable").getBinding("rows").refresh();

            }.bind(this)).catch(function () {
                MessageToast.show("Creation Failed");

            }.bind(this));

            if (this.oCreateDialog) {
                this.oCreateDialog.close();
            }

        },

        onCustomerIdValidate: function (oEvent) {

            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var regex = /^CUST\d+$/;
            if (!regex.test(sValue)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Customer ID must start with CUST followed by numbers (Example: CUST123)");
            } else {
                oInput.setValueState("None");
            }
        },

        onSearch: function (oEvent) {

            var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue");
            var oBinding = this.byId("complaintTable").getBinding("rows");
            var aFilters = [];
            if (sQuery) {

                aFilters.push(new Filter({
                    filters: [
                        new Filter("ComplaintNo", FilterOperator.Contains, sQuery),
                        new Filter("CustomerId", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }
            oBinding.filter(aFilters);
        },


        onStatusFilter: function (oEvent) {

            var sKey = oEvent.getSource().getSelectedKey();
            var oBinding = this.byId("complaintTable").getBinding("rows");
            var aFilters = [];
            if (sKey !== "ALL") {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sKey));
            }
            oBinding.filter(aFilters);

        },

        onDateFilter: function (oEvent) {
            var oDate = oEvent.getSource().getDateValue();
            if (!oDate) {
                var oTable = this.byId("complaintTable");
                oTable.getBinding("rows").filter([]);
                return;
            }
            var sDate = oDate.getFullYear() + "-" +
                String(oDate.getMonth() + 1).padStart(2, '0') + "-" +
                String(oDate.getDate()).padStart(2, '0');
            var oTable = this.byId("complaintTable");
            var oBinding = oTable.getBinding("rows");
            var oFilter = new Filter("CreatedDate", FilterOperator.EQ, sDate);
            oBinding.filter([oFilter]);
        },


        onRowSelect: function (oEvent) {

            var oContext = oEvent.getSource().getBindingContext();
            if(!oContext) return;
            var sPath = oContext.getPath();
            this.getOwnerComponent().getRouter().navTo("RouteDetail",{
                contextPath: encodeURIComponent(sPath) 
            });
        },
        clearCreateForm: function () {

            this.byId("idComplaintID2").setValue("");
            this.byId("idCustomerID2").setValue("");
            this.byId("idDescription2").setValue("");
            this.byId("idStatus2").setSelectedKey("");

        },

        onOpenCustomerWizard: function () {

            var oView = this.getView();
            if (!this.oCustomerWizard) {
                Fragment.load({
                    id: oView.getId(),
                    name: "project7.view.CustomerWizard",
                    controller: this
                }).then(function (oDialog) {
                    this.oCustomerWizard = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this.oCustomerWizard.open();
            }
        },

        onCloseCustomerWizard: function () {
            if (this.oCustomerWizard) {
                this.oCustomerWizard.close();
            }
        },

        onCreateCustomer: function () {

            var sName = sap.ui.getCore().byId(this.getView().getId() + "--custName").getValue();
            var sEmail = sap.ui.getCore().byId(this.getView().getId() + "--custEmail").getValue();

            if (!sName || !sEmail) {
                MessageToast.show("Please fill required fields");
                return;
            }

            var sCustomerId = "CUST" + Math.floor(Math.random() * 10000);
            this.byId("idCustomerID2").setValue(sCustomerId);
            MessageToast.show("Customer Created Successfully: " + sCustomerId);
            this.oCustomerWizard.close();
        }
    });
});
