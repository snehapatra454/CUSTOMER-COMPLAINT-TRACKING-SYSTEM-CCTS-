sap.ui.define([], function () {
    "use strict";

    return {
        isResolvedEnabled: function(sStatus) {
            return sStatus === "RESOLVED";
        },

statusColor: function(status){
    if(status === "OPEN"){
        return "Error";      // Red
    }
    if(status === "IN_PROGRESS"){
        return "Warning";    // Orange
    }
    if(status === "RESOLVED"){
        return "Success";    // Green
    }
}
    };
});